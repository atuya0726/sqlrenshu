import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { sqlTopicBySlug } from './sqlTopics';

const topic = sqlTopicBySlug.select;
// Preserve duplicate rows while ignoring the unspecified order of SELECT results.
const unordered = (rows: string[][]) => rows.map((row) => JSON.stringify(row)).sort();

describe('SELECT guide examples', () => {
  let db: PGlite;
  beforeAll(async () => {
    db = await PGlite.create('memory://');
    await db.exec(`
      CREATE TABLE employees (id integer PRIMARY KEY, name text, department text, salary integer);
      INSERT INTO employees VALUES
        (1, '青木', '営業', 300000),
        (2, '北野', '開発', 400000),
        (3, '中央', '営業', 350000);
    `);
  });
  afterAll(async () => { await db.close(); });

  it('shows the same source data used by the SQL examples', async () => {
    const result = await db.query<Record<string, unknown>>('SELECT * FROM employees ORDER BY id');
    expect(result.rows.map((row) => Object.values(row).map(String))).toEqual(topic.sampleTables![0].rows);
  });

  it('executes the basic syntax against the sample table', async () => {
    const result = await db.query(topic.syntax);
    expect(result.fields.map((field) => field.name)).toEqual(['name']);
    expect(result.rows).toHaveLength(3);
  });

  for (const section of topic.sections) {
    it(`${section.heading}: matches the displayed columns and rows`, async () => {
      const result = await db.query<Record<string, unknown>>(section.code);
      expect(result.fields.map((field) => field.name)).toEqual(section.resultTable!.headers);
      const actual = result.rows.map((row) => result.fields.map((field) => String(row[field.name])));
      expect(unordered(actual)).toEqual(unordered(section.resultTable!.rows));
    });
  }

  it('verifies the calculation without FROM', async () => {
    const result = await db.query(topic.notes[0].code!);
    expect(result.rows).toEqual([{ result: 3 }]);
  });

  it('verifies that DISTINCT compares the whole selected row', async () => {
    const result = await db.query('SELECT DISTINCT department, name FROM employees');
    expect(result.rows).toHaveLength(3);
  });
});
