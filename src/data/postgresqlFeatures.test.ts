import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { dateTimeParsers } from '../lib/dateTimeParsers';
import { questions } from '../questions/catalog';
import { sqlTopics } from './sqlTopics';
import { postgresqlFeatures, type PgTable } from './postgresqlFeatures';

const displayValue = (value: unknown) => (value === null ? 'NULL' : String(value));

// 各例は、setupを流した直後の新しいDBで実行する。
async function withDb<T>(setup: string, fn: (db: PGlite) => Promise<T>): Promise<T> {
  const db = await PGlite.create('memory://', { parsers: dateTimeParsers });
  try {
    await db.exec(setup);
    return await fn(db);
  } finally {
    await db.close();
  }
}

// 複数文のうち、最後の文の結果を表の形にする。
async function lastResult(db: PGlite, sql: string): Promise<PgTable> {
  const results = await db.exec(sql);
  const last = results[results.length - 1];
  return {
    headers: last.fields.map((field) => field.name),
    rows: last.rows.map((row) => last.fields.map((field) => displayValue((row as Record<string, unknown>)[field.name]))),
  };
}

for (const feature of postgresqlFeatures) {
  describe(`${feature.label} page`, () => {
    it('has a title and description of a searchable length', () => {
      expect(feature.title).toContain(feature.label.replace(/ /g, ' '));
      expect(feature.description.length).toBeGreaterThanOrEqual(80);
      expect(feature.description.length).toBeLessThanOrEqual(150);
      expect(JSON.stringify(feature)).not.toContain('互換性メタデータ');
    });

    it('shows source tables that match the setup SQL', async () => {
      await withDb(feature.setup, async (db) => {
        for (const sample of feature.sampleTables) {
          const actual = await lastResult(db, sample.source);
          expect(actual.rows).toEqual(sample.rows);
          expect(actual.headers).toHaveLength(sample.headers.length);
        }
      });
    });

    for (const example of feature.examples) {
      it(`${example.heading}: matches the displayed result`, async () => {
        await withDb(feature.setup, async (db) => {
          expect(await lastResult(db, example.code)).toEqual(example.resultTable);
        });
      });
    }

    for (const mistake of feature.mistakes) {
      it(`${mistake.title}: behaves as described`, async () => {
        await withDb(feature.setup, async (db) => {
          if (mistake.error) await expect(db.exec(mistake.code)).rejects.toThrow(mistake.error);
          else await expect(db.exec(mistake.code)).resolves.toBeDefined();
        });
      });
    }

    for (const alternative of feature.alternatives) {
      if (!alternative.code) continue;
      it(`${alternative.heading}: matches the displayed result`, async () => {
        await withDb(feature.setup, async (db) => {
          const actual = await lastResult(db, alternative.code!);
          if (alternative.resultTable) expect(actual).toEqual(alternative.resultTable);
        });
      });
    }

    it('links to existing guides, exercises and official docs', () => {
      for (const slug of feature.related) expect(sqlTopics.some((topic) => topic.slug === slug)).toBe(true);
      for (const item of feature.practice) expect(questions.some((question) => question.category === item.category)).toBe(true);
      for (const reference of feature.references) expect(reference.url).toMatch(/^https:\/\/www\.postgresql\.org\/docs\/current\//);
      expect(feature.faqs.length).toBeGreaterThanOrEqual(2);
      expect(feature.examples.length).toBeGreaterThanOrEqual(2);
    });
  });
}

describe('claims made in the FAQ', () => {
  const byslug = (slug: string) => postgresqlFeatures.find((feature) => feature.slug === slug)!;

  it('DISTINCT ON treats NULL groups as one group', async () => {
    await withDb('CREATE TABLE t (g integer, v integer); INSERT INTO t VALUES (NULL, 1), (NULL, 2), (1, 3);', async (db) => {
      const result = await db.query('SELECT DISTINCT ON (g) g, v FROM t ORDER BY g, v DESC');
      expect(result.rows).toHaveLength(2);
    });
  });

  it('ON CONFLICT DO NOTHING works without a target, DO UPDATE needs one, and only changed rows are counted', async () => {
    await withDb(byslug('on-conflict').setup, async (db) => {
      const inserted = await db.query("INSERT INTO inventory VALUES ('A001','ノート',99),('A003','定規',5) ON CONFLICT DO NOTHING");
      expect(inserted.affectedRows).toBe(1);
      await expect(db.exec("INSERT INTO inventory VALUES ('A001','ノート',99) ON CONFLICT DO UPDATE SET qty = 1")).rejects.toThrow();
      const returned = await db.query("INSERT INTO inventory VALUES ('A001','ノート',99),('A004','x',1) ON CONFLICT DO NOTHING RETURNING sku");
      expect(returned.rows).toEqual([{ sku: 'A004' }]);
    });
  });

  it('LATERAL accepts the comma form', async () => {
    await withDb(byslug('lateral').setup, async (db) => {
      const result = await db.query('SELECT c.name, o.amount FROM customers c, LATERAL (SELECT amount FROM orders WHERE customer_id = c.id LIMIT 1) o');
      expect(result.rows).toHaveLength(2);
    });
  });
});
