import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { dateTimeParsers } from '../lib/dateTimeParsers';
import { PGlite } from '@electric-sql/pglite';
import { sqlTopics } from './sqlTopics';
import { questions } from '../questions/catalog';
import { guideFixtures } from './__fixtures__/sqlGuideData';
import { extraDmlSlugs, extraTopicSlugs } from '../lib/categories';
import { extraSqlTopics } from './advancedSqlTopics';

// INSERT・UPDATE・DELETEは表を書き換えるため、各テストの前に元の状態へ戻す。
const dmlSlugs = ['insert', 'update', 'delete', ...extraDmlSlugs];
const extraSlugs = new Set([...extraTopicSlugs, ...extraSqlTopics.map((topic) => topic.slug)]);
const unordered = (rows: string[][]) => rows.map((row) => JSON.stringify(row)).sort();
const displayValue = (value: unknown, type: number) => {
  if (value === null) return 'NULL';
  // 配列はPostgreSQLの表記（{a,b}）、json・jsonbはJSON文字列で表示する。
  if (Array.isArray(value)) return `{${value.map((item) => (item === null ? 'NULL' : String(item))).join(',')}}`;
  if (typeof value === 'object' && !(value instanceof Date)) return JSON.stringify(value);
  // Numeric aggregates may include insignificant fractional zeros in PostgreSQL.
  if (type === 1700) return String(value).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  return String(value);
};

for (const topic of sqlTopics.filter((topic) => topic.slug !== 'select')) {
  describe(`${topic.label} guide examples`, () => {
    let db: PGlite;
    beforeAll(async () => {
      db = await PGlite.create('memory://', { parsers: dateTimeParsers });
      await db.exec(guideFixtures[topic.slug].setup);
    });
    afterAll(async () => { await db.close(); });
    beforeEach(async () => {
      if (!dmlSlugs.includes(topic.slug)) return;
      await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      await db.exec(guideFixtures[topic.slug].setup);
    });

    it('shows the complete source tables used by its examples', async () => {
      const sources = guideFixtures[topic.slug].sources;
      expect(topic.sampleTables).toHaveLength(sources.length);
      for (const [index, source] of sources.entries()) {
        const result = await db.query<Record<string, unknown>>(source);
        const rows = result.rows.map((row) => result.fields.map((field) => displayValue(row[field.name], field.dataTypeID)));
        expect(rows).toEqual(topic.sampleTables![index].rows);
        expect(result.fields).toHaveLength(topic.sampleTables![index].headers.length);
      }
    });

    it('executes the basic syntax on the displayed tables', async () => {
      const result = await db.exec(topic.syntax);
      expect(result).toHaveLength(1);
      if (!dmlSlugs.includes(topic.slug)) expect(result[0].rows.length).toBeGreaterThan(0);
    });

    for (const section of topic.sections) {
      it(`${section.heading}: matches the displayed columns and rows`, async () => {
        expect(section.resultTable).toBeDefined();
        // DML節は更新文のあとに確認用SELECTを続けるため、最後の結果を表示と比べる。
        const result = dmlSlugs.includes(topic.slug) ? (await db.exec(section.code)).at(-1)! : await db.query<Record<string, unknown>>(section.code);
        expect(result.fields.map((field) => field.name)).toEqual(section.resultTable!.headers);
        const rows = (result.rows as Record<string, unknown>[]).map((row) => result.fields.map((field) => displayValue(row[field.name], field.dataTypeID)));
        if (['where', 'like', 'group-by', 'having', 'subquery', 'case', 'coalesce', 'with', 'date-filter', 'string-functions', 'exists', 'intersect-except'].includes(topic.slug) || ((['union', 'date-trunc'].includes(topic.slug) || extraSlugs.has(topic.slug)) && !section.code.includes('ORDER BY'))) {
          expect(unordered(rows)).toEqual(unordered(section.resultTable!.rows));
        } else {
          expect(rows).toEqual(section.resultTable!.rows);
        }
      });
    }

    for (const extra of [...topic.notes, ...topic.mistakes]) {
      if (!extra.code) continue;
      it(`${extra.title}: executes its example`, async () => {
        const result = await db.exec(extra.code!);
        expect(result.length).toBeGreaterThan(0);
      });
    }

    it('links to existing guides and exercises', () => {
      for (const slug of topic.related) expect(sqlTopics.some((related) => related.slug === slug)).toBe(true);
      if (topic.practiceCategory) expect(questions.some((question) => question.category === topic.practiceCategory)).toBe(true);
    });

    if (topic.slug === 'intersect-except') {
      it('subtracts duplicate counts in the reverse direction, including NULL', async () => {
        expect((await db.query('SELECT * FROM online_purchases EXCEPT ALL SELECT * FROM store_purchases ORDER BY customer_id NULLS LAST')).rows)
          .toEqual([{ customer_id: 4 }, { customer_id: null }]);
      });
      it('compares complete rows instead of matching only one column', async () => {
        const result = await db.query("SELECT 1 AS customer_id, '店舗' AS channel INTERSECT SELECT 1, '通販'");
        expect(result.rows).toEqual([]);
      });
      it('evaluates INTERSECT before UNION unless parentheses change the grouping', async () => {
        const ungrouped = await db.query('SELECT * FROM store_purchases UNION SELECT * FROM online_purchases INTERSECT SELECT * FROM online_purchases WHERE customer_id = 4');
        const grouped = await db.query('(SELECT * FROM store_purchases UNION SELECT * FROM online_purchases) INTERSECT SELECT * FROM online_purchases WHERE customer_id = 4');
        expect(ungrouped.rows).toHaveLength(5);
        expect(grouped.rows).toEqual([{ customer_id: 4 }]);
      });
    }

    if (topic.slug === 'exists') {
      it('returns false for an empty subquery, but true for an aggregate row', async () => {
        const result = await db.query('SELECT EXISTS (SELECT NULL FROM orders WHERE customer_id = 3) AS empty, EXISTS (SELECT COUNT(*) FROM orders WHERE customer_id = 3) AS aggregate');
        expect(result.rows).toEqual([{ empty: false, aggregate: true }]);
      });
      it('ignores the selected value when a matching row exists', async () => {
        expect((await db.query('SELECT EXISTS (SELECT NULL FROM orders WHERE customer_id = 1)')).rows)
          .toEqual([{ exists: true }]);
      });
      it('returns each customer once despite multiple matching orders', async () => {
        const joined = await db.query('SELECT customers.id FROM customers JOIN orders ON orders.customer_id = customers.id');
        const exists = await db.query('SELECT customers.id FROM customers WHERE EXISTS (SELECT 1 FROM orders WHERE orders.customer_id = customers.id)');
        expect(joined.rows).toHaveLength(5);
        expect(exists.rows).toHaveLength(3);
        expect(new Set(exists.rows.map((row) => (row as { id: number }).id)).size).toBe(3);
      });
      it('distinguishes no paid orders from no orders at all', async () => {
        expect((await db.query("SELECT id FROM customers WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.customer_id = customers.id AND status = 'paid') ORDER BY id")).rows)
          .toEqual([{ id: 2 }, { id: 3 }]);
      });
      it('demonstrates NOT IN rejecting the unmatched customer when candidates contain NULL', async () => {
        expect((await db.query('SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM orders)')).rows).toEqual([]);
        expect((await db.query('SELECT id FROM customers WHERE NOT EXISTS (SELECT 1 FROM orders WHERE orders.customer_id = customers.id)')).rows)
          .toEqual([{ id: 3 }]);
      });
    }

    if (topic.slug === 'string-functions') {
      it('keeps CONCAT empty output distinct from a NULL operator result', async () => {
        const result = await db.query('SELECT last_name || first_name, CONCAT(last_name, first_name) FROM registrations WHERE id = 5');
        expect(result.rows).toEqual([{ '?column?': null, concat: '' }]);
      });
      it('keeps internal spaces and does not trim tabs or full-width spaces by default', async () => {
        const result = await db.query("SELECT TRIM(' A B ') AS internal, TRIM(CHR(9) || 'A' || CHR(9)) AS tabs, TRIM('　A　') AS full_width");
        expect(result.rows).toEqual([{ internal: 'A B', tabs: '\tA\t', full_width: '　A　' }]);
      });
      it('counts substring positions as characters for Japanese text', async () => {
        expect((await db.query("SELECT SUBSTRING(product_code FROM 2 FOR 2) FROM registrations WHERE id = 4")).rows)
          .toEqual([{ substring: '用品' }]);
      });
      it('skips NULL but keeps empty strings when adding name separators', async () => {
        expect((await db.query("SELECT CONCAT_WS(' ', last_name, first_name) FROM registrations WHERE id IN (2, 3, 5) ORDER BY id")).rows)
          .toEqual([{ concat_ws: '北野' }, { concat_ws: '中央 ' }, { concat_ws: '' }]);
      });
    }

    if (topic.slug === 'date-trunc') {
      it('converts DATE explicitly and keeps different years separate', async () => {
        const result = await db.query("SELECT DATE_TRUNC('month', DATE '2025-09-10'::timestamp) AS previous_year, DATE_TRUNC('month', DATE '2026-09-30'::timestamp) AS current_year");
        expect(result.rows).toEqual([{ previous_year: '2025-09-01 00:00:00', current_year: '2026-09-01 00:00:00' }]);
      });
      it('does not invent a zero-valued month without input orders', async () => {
        const result = await db.query("SELECT DATE_TRUNC('month', ordered_at) FROM orders GROUP BY DATE_TRUNC('month', ordered_at) HAVING DATE_TRUNC('month', ordered_at) = TIMESTAMP '2026-10-01 00:00:00'");
        expect(result.rows).toEqual([]);
      });
    }

    if (topic.slug === 'coalesce') {
      it('returns NULL when all fallback candidates are NULL', async () => {
        expect((await db.query('SELECT COALESCE(nickname, name) FROM employees WHERE id = 4')).rows)
          .toEqual([{ coalesce: null }]);
      });
      it('replaces an all-NULL aggregate with zero', async () => {
        expect((await db.query('SELECT COALESCE(AVG(bonus), 0) FROM employees WHERE bonus IS NULL')).rows)
          .toEqual([{ coalesce: '0' }]);
      });
      it('distinguishes inner and outer defaults on empty input', async () => {
        expect((await db.query('SELECT AVG(COALESCE(bonus, 0)) AS inner_average, COALESCE(AVG(bonus), 0) AS outer_average FROM employees WHERE false')).rows)
          .toEqual([{ inner_average: null, outer_average: '0' }]);
      });
    }

    if (topic.slug === 'like') {
      it('distinguishes case, underscore escaping and missing wildcards', async () => {
        expect((await db.query("SELECT id FROM products WHERE code LIKE 'pen-%'")).rows).toEqual([{ id: 5 }]);
        expect((await db.query("SELECT id FROM products WHERE code LIKE 'SALE_10' ORDER BY id")).rows).toEqual([{ id: 6 }, { id: 7 }]);
        expect((await db.query("SELECT id FROM products WHERE name LIKE 'ボールペン'")).rows).toEqual([]);
        expect((await db.query("SELECT id FROM products WHERE name LIKE 'ペン'")).rows).toEqual([]);
        expect((await db.query("SELECT id FROM products WHERE name LIKE 'ペン%'")).rows).toEqual([]);
        expect((await db.query("SELECT id FROM products WHERE code LIKE 'NOTE-_'")).rows).toEqual([]);
      });
      it('counts one Japanese character per underscore and supports a custom ESCAPE character', async () => {
        expect((await db.query("SELECT id FROM products WHERE name LIKE 'ノート__' ORDER BY id")).rows).toEqual([{ id: 3 }, { id: 4 }]);
        expect((await db.query("SELECT id FROM products WHERE code LIKE 'SALE!_10' ESCAPE '!'")).rows).toEqual([{ id: 6 }]);
      });
      it('returns NULL, not true or false, when LIKE or NOT LIKE is applied to NULL', async () => {
        expect((await db.query("SELECT (NULL LIKE 'a%') IS NULL AS l, (NULL NOT LIKE 'a%') IS NULL AS n")).rows).toEqual([{ l: true, n: true }]);
      });
    }

    if (topic.slug === 'insert') {
      it('rejects a duplicate primary key and a mismatched value count', async () => {
        await expect(db.exec("INSERT INTO products (id, name, price) VALUES (3, '消しゴム', 80)")).rejects.toThrow();
        await expect(db.exec("INSERT INTO products (id, name, price) VALUES (4, '定規')")).rejects.toThrow();
        await expect(db.exec("INSERT INTO products (id, price) VALUES (4, 150)")).rejects.toThrow();
        expect((await db.query('SELECT COUNT(*) FROM products')).rows).toEqual([{ count: 3 }]);
      });
      it('accepts an INSERT without a column list in table order', async () => {
        await db.exec("INSERT INTO products VALUES (4, '定規', 150, 30)");
        expect((await db.query('SELECT stock FROM products WHERE id = 4')).rows).toEqual([{ stock: 30 }]);
      });
      it('skips the conflicting row with ON CONFLICT DO NOTHING', async () => {
        const result = await db.exec("INSERT INTO products (id, name, price, stock) VALUES (3, '消しゴム', 80, 0) ON CONFLICT (id) DO NOTHING");
        expect(result.at(-1)!.affectedRows).toBe(0);
      });
    }

    if (topic.slug === 'update') {
      it('reports the number of updated rows and does nothing when no row matches', async () => {
        expect((await db.exec('UPDATE products SET price = price + 10 WHERE stock > 0')).at(-1)!.affectedRows).toBe(3);
        expect((await db.exec('UPDATE products SET price = 1 WHERE id = 999')).at(-1)!.affectedRows).toBe(0);
      });
      it('sets every row when WHERE is omitted', async () => {
        await db.exec('UPDATE products SET stock = 0');
        expect((await db.query('SELECT COUNT(*) FROM products WHERE stock = 0')).rows).toEqual([{ count: 5 }]);
      });
      it('matches the grouped assignment with the separate one', async () => {
        await db.exec('UPDATE products SET (price, stock) = (250, 40) WHERE id = 1');
        expect((await db.query('SELECT price, stock FROM products WHERE id = 1')).rows).toEqual([{ price: 250, stock: 40 }]);
      });
    }

    if (topic.slug === 'delete') {
      it('deletes nothing when no row matches and everything when WHERE is omitted', async () => {
        expect((await db.exec('DELETE FROM products WHERE id = 999')).at(-1)!.affectedRows).toBe(0);
        await db.exec('DELETE FROM products');
        expect((await db.query('SELECT COUNT(*) FROM products')).rows).toEqual([{ count: 0 }]);
      });
      it('leaves the table definition in place after DELETE and TRUNCATE', async () => {
        await db.exec('TRUNCATE products');
        expect((await db.query('SELECT COUNT(*) FROM products')).rows).toEqual([{ count: 0 }]);
      });
      it('restores deleted rows after ROLLBACK', async () => {
        await db.exec('BEGIN; DELETE FROM products; ROLLBACK;');
        expect((await db.query('SELECT COUNT(*) FROM products')).rows).toEqual([{ count: 5 }]);
      });
    }

    if (topic.slug === 'having') {
      it('verifies the FAQ about HAVING without GROUP BY', async () => {
        expect((await db.query('SELECT COUNT(*) FROM employees HAVING COUNT(*) >= 5')).rows).toEqual([{ count: 5 }]);
        expect((await db.query('SELECT COUNT(*) FROM employees HAVING COUNT(*) >= 6')).rows).toEqual([]);
      });
    }
  });
}
