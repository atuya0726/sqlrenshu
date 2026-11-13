import { dateTimeParsers } from './dateTimeParsers';
import { PGliteWorker } from '@electric-sql/pglite/worker';
import PGliteWorkerModule from '@/workers/pglite.worker?worker';

const INITIALIZATION_TIMEOUT_MS = 30_000;

function createDatabaseId(): string {
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  return `sqlrenshu-${suffix}`;
}

export type SqlResult = {
  columns: string[];
  rows: Record<string, unknown>[];
  affectedRows?: number;
};

export type TableColumn = {
  name: string;
};

export type TableSnapshot = {
  name: string;
  columns: TableColumn[];
};

export class QuestionDatabase {
  private db: PGliteWorker | null = null;
  private worker: Worker | null = null;
  private setupSql = '';
  private operationQueue: Promise<unknown> = Promise.resolve();
  private terminated = false;

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.operationQueue.then(operation, operation);
    this.operationQueue = result.then(() => undefined, () => undefined);
    return result;
  }

  private async resetDatabase(): Promise<void> {
    if (!this.db) throw new Error('データベースが初期化されていません。');
    // Keep teardown and fixture creation in one worker request so another reset
    // cannot create the same tables between these two phases.
    await this.db.exec(`DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
${this.setupSql}`);
  }

  async initialize(setupSql: string): Promise<void> {
    return this.enqueue(async () => {
      if (this.terminated) throw new Error('データベースは終了しています。');
      this.setupSql = setupSql;
      if (!this.db) {
        const worker = new PGliteWorkerModule();
        const db = new PGliteWorker(worker, { id: createDatabaseId() });
        this.worker = worker;
        this.db = db;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            db.waitReady,
            new Promise<never>((_, reject) => {
              timeoutId = setTimeout(
                () => reject(new Error('データベースの初期化がタイムアウトしました。')),
                INITIALIZATION_TIMEOUT_MS,
              );
            }),
          ]);
        } catch (error) {
          void db.close();
          worker.terminate();
          if (this.worker === worker) this.worker = null;
          if (this.db === db) this.db = null;
          throw error;
        } finally {
          if (timeoutId !== undefined) clearTimeout(timeoutId);
        }
        if (this.terminated) {
          void db.close();
          if (this.db === db) this.db = null;
          throw new Error('データベースは終了しています。');
        }
      }
      await this.resetDatabase();
    });
  }

  async reset(): Promise<void> {
    return this.enqueue(() => this.resetDatabase());
  }

  async execute(sql: string): Promise<SqlResult> {
    return this.enqueue(async () => {
      if (!this.db) throw new Error('データベースが初期化されていません。');
      const results = await this.db.exec(sql, { parsers: dateTimeParsers });
      const last = results.at(-1);
      if (!last) return { columns: [], rows: [] };
      const rows = (last.rows ?? []) as Record<string, unknown>[];
      const fields = 'fields' in last && Array.isArray(last.fields) ? last.fields : [];
      const columns = fields.length
        ? fields.map((field: { name: string }) => field.name)
        : rows[0]
          ? Object.keys(rows[0])
          : [];
      return { columns, rows, affectedRows: 'affectedRows' in last ? Number(last.affectedRows) : undefined };
    });
  }

  async inspectTables(): Promise<TableSnapshot[]> {
    return this.enqueue(async () => {
      if (!this.db) throw new Error('データベースが初期化されていません。');
      const columnResult = await this.db.query<{
        table_name: string;
        column_name: string;
      }>(`
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `);
      const tableNames = [...new Set(columnResult.rows.map((column) => column.table_name))];

      return tableNames.map((tableName) => {
        return {
          name: tableName,
          columns: columnResult.rows
            .filter((column) => column.table_name === tableName)
            .map((column) => ({ name: column.column_name })),
        };
      });
    });
  }

  terminate(): void {
    if (this.terminated) return;
    this.terminated = true;
    const db = this.db;
    const worker = this.worker;
    this.db = null;
    this.worker = null;
    void db?.close();
    worker?.terminate();
  }
}

export function readablePostgresError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  return raw
    .replace(/^error:\s*/i, '')
    .replace(/\n\s*at\s.+/gs, '')
    .trim();
}
