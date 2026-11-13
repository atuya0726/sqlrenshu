import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { dateTimeParsers } from './dateTimeParsers';
import { gradeResult } from './grader';

describe('date and timestamp results', () => {
  let db: PGlite;
  beforeAll(async () => { db = await PGlite.create('memory://'); });
  afterAll(async () => { await db.close(); });

  it('preserves dates, midnight, microseconds and NULL with execution options', async () => {
    const [result] = await db.exec(`SELECT DATE '2026-09-30' AS day,
      TIMESTAMP '2026-09-01 00:00:00' AS midnight,
      TIMESTAMP '2026-09-30 23:59:59.999999' AS month_end,
      NULL::timestamp AS missing`, { parsers: dateTimeParsers });
    expect(result.rows).toEqual([{
      day: '2026-09-30', midnight: '2026-09-01 00:00:00',
      month_end: '2026-09-30 23:59:59.999999', missing: null,
    }]);
  });

  it('rejects an altered time on the same day, including a microsecond difference', async () => {
    const expected = { columns: ['ordered_at'], rows: [{ ordered_at: '2026-09-30 23:59:59.999999' }] };
    const grading = { mode: 'result' as const, compareRowOrder: false, compareColumnOrder: true, numericTolerance: 0 };
    for (const timestamp of ['2026-09-30 23:59:59.999999', '2026-09-30 00:00:00', '2026-09-30 23:59:59.999998']) {
      const [result] = await db.exec(`SELECT TIMESTAMP '${timestamp}' AS ordered_at`, { parsers: dateTimeParsers });
      const actual = { columns: result.fields.map((field) => field.name), rows: result.rows as Record<string, unknown>[] };
      expect(gradeResult(actual, expected, grading).correct).toBe(timestamp === expected.rows[0].ordered_at);
    }
  });
});
