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
        // 「続けて実行するとエラーになる」例は、同じ状態で実行して、掲載したエラー文と照合する。
        if (section.failing) await expect(db.exec(section.failing.code)).rejects.toThrow(section.failing.error);
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
      if (topic.practiceQuestionId) expect(questions.some((question) => question.id === topic.practiceQuestionId && question.category === topic.practiceCategory)).toBe(true);
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

    if (topic.slug === 'create-table') {
      it('reports the errors quoted in the mistakes', async () => {
        await expect(db.exec('CREATE TABLE products (\n  id integer,\n  name text,\n);')).rejects.toThrow('syntax error at or near ")"');
        await expect(db.exec('CREATE TABLE user (id integer);')).rejects.toThrow('syntax error at or near "user"');
        await expect(db.exec('CREATE TABLE order (id integer);')).rejects.toThrow('syntax error at or near "order"');
        await expect(db.exec('CREATE TABLE orders (id integer PRIMARY KEY, shop_id integer REFERENCES shops (id));')).rejects.toThrow('relation "shops" does not exist');
      });
      it('refuses to delete or drop a referenced parent, and cascades when asked', async () => {
        await db.exec('CREATE TABLE orders (id integer PRIMARY KEY, customer_id integer NOT NULL REFERENCES customers (id)); INSERT INTO orders VALUES (1, 1);');
        await expect(db.exec('DELETE FROM customers WHERE id = 1;')).rejects.toThrow('violates foreign key constraint');
        await expect(db.exec('DROP TABLE customers;')).rejects.toThrow('cannot drop table customers');
        await db.exec('DROP TABLE orders; CREATE TABLE orders (id integer PRIMARY KEY, customer_id integer NOT NULL REFERENCES customers (id) ON DELETE CASCADE); INSERT INTO orders VALUES (1, 1); DELETE FROM customers WHERE id = 1;');
        expect((await db.query('SELECT COUNT(*) FROM orders')).rows).toEqual([{ count: 0 }]);
      });
      it('does not carry constraints over with CREATE TABLE AS', async () => {
        await db.exec('CREATE TABLE customers_backup AS SELECT id, name FROM customers WHERE id >= 2;');
        expect((await db.query("SELECT is_nullable FROM information_schema.columns WHERE table_name = 'customers_backup'")).rows).toEqual([{ is_nullable: 'YES' }, { is_nullable: 'YES' }]);
        expect((await db.query("SELECT COUNT(*) FROM pg_constraint WHERE conrelid = 'customers_backup'::regclass AND contype IN ('p', 'u', 'f', 'c')")).rows).toEqual([{ count: 0 }]);
      });
      it('lets NULL pass a CHECK constraint and allows repeated NULLs under UNIQUE', async () => {
        await db.exec('CREATE TABLE t (price integer CHECK (price >= 0), code text UNIQUE); INSERT INTO t VALUES (NULL, NULL), (NULL, NULL);');
        expect((await db.query('SELECT COUNT(*) FROM t')).rows).toEqual([{ count: 2 }]);
      });
      it('rejects a direct value for a GENERATED ALWAYS identity column and names a custom constraint in the error', async () => {
        await db.exec('CREATE TABLE tickets (id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title text NOT NULL);');
        await expect(db.exec("INSERT INTO tickets (id, title) VALUES (5, 'x');")).rejects.toThrow('cannot insert a non-DEFAULT value into column "id"');
        await db.exec('CREATE TABLE products (id integer PRIMARY KEY, price integer NOT NULL CONSTRAINT price_not_negative CHECK (price >= 0));');
        await expect(db.exec('INSERT INTO products VALUES (1, -1);')).rejects.toThrow('"price_not_negative"');
        await expect(db.exec('DROP TABLE IF EXISTS no_such_table;')).resolves.toBeDefined();
      });
    }

    if (topic.slug === 'union') {
      it('plans UNION ALL as a plain append and merges NULL rows under UNION', async () => {
        const plan = await db.query<{ 'QUERY PLAN': string }>('EXPLAIN (COSTS OFF) SELECT * FROM morning_results UNION ALL SELECT * FROM evening_results');
        expect(plan.rows.map((row) => row['QUERY PLAN'].trim())).toEqual(['Append', '->  Seq Scan on morning_results', '->  Seq Scan on evening_results']);
        expect((await db.query('SELECT NULL::integer AS score UNION SELECT NULL')).rows).toEqual([{ score: null }]);
        expect((await db.query('SELECT NULL::integer AS score UNION ALL SELECT NULL')).rows).toHaveLength(2);
      });
    }

    if (topic.slug === 'case') {
      it('agrees between the nested CASE and the flat AND form, and nulls unmatched rows when UPDATE omits ELSE', async () => {
        const nested = await db.query("SELECT id, CASE WHEN department = '営業' THEN CASE WHEN salary >= 350000 THEN '営業・対象' ELSE '営業・対象外' END ELSE '営業以外' END AS label FROM employees ORDER BY id");
        const flat = await db.query("SELECT id, CASE WHEN department = '営業' AND salary >= 350000 THEN '営業・対象' WHEN department = '営業' THEN '営業・対象外' ELSE '営業以外' END AS label FROM employees ORDER BY id");
        expect(nested.rows).toEqual(flat.rows);
        expect((await db.query("SELECT CASE name WHEN '北%' THEN 1 ELSE 0 END AS matched FROM employees WHERE name = '北野'")).rows).toEqual([{ matched: 0 }]);
        await db.exec("BEGIN; UPDATE employees SET salary = CASE WHEN department = '営業' THEN salary + 10000 END;");
        expect((await db.query("SELECT COUNT(*) FROM employees WHERE department = '開発' AND salary IS NULL")).rows).toEqual([{ count: 2 }]);
        await db.exec('ROLLBACK;');
      });
    }

    if (topic.slug === 'distinct') {
      it('treats the parenthesized form like a plain column list and rejects DISTINCT in the middle of the list', async () => {
        expect((await db.query('SELECT DISTINCT (customer), item FROM orders')).rows).toHaveLength(5);
        await expect(db.exec('SELECT customer, DISTINCT item FROM orders')).rejects.toThrow('syntax error');
        expect((await db.query('SELECT customer FROM orders GROUP BY customer')).rows).toHaveLength(3);
      });
    }

    if (topic.slug === 'alter-table') {
      it('reports the errors quoted in the mistakes', async () => {
        await expect(db.exec('ALTER TABLE members MODIFY plan varchar(20);')).rejects.toThrow('syntax error at or near "MODIFY"');
        await expect(db.exec('ALTER TABLE members CHANGE name full_name text;')).rejects.toThrow('syntax error at or near "CHANGE"');
        await expect(db.exec('ALTER TABLE members ADD (phone text, kana text);')).rejects.toThrow('syntax error at or near "("');
        await expect(db.exec('ALTER TABLE members RENAME COLUMN name TO full_name, ADD COLUMN phone text;')).rejects.toThrow('syntax error at or near ","');
        await db.exec('ALTER TABLE members ADD COLUMN phone text, ADD COLUMN kana text;');
      });
      it('leaves the table unchanged when a type change or a combined statement fails', async () => {
        await expect(db.exec('ALTER TABLE members ALTER COLUMN plan TYPE integer USING plan::integer;')).rejects.toThrow('invalid input syntax for type integer: "free"');
        await expect(db.exec('ALTER TABLE members ALTER COLUMN plan TYPE varchar(3);')).rejects.toThrow('value too long');
        await expect(db.exec('ALTER TABLE members ADD COLUMN phone text, ALTER COLUMN email SET NOT NULL;')).rejects.toThrow('contains null values');
        expect((await db.query("SELECT column_name, character_maximum_length FROM information_schema.columns WHERE table_name = 'members' AND column_name IN ('plan', 'phone')")).rows).toEqual([{ column_name: 'plan', character_maximum_length: 10 }]);
      });
      it('drops NOT NULL and DEFAULT, and a column without a default becomes NULL again', async () => {
        await db.exec("ALTER TABLE members ALTER COLUMN plan SET NOT NULL, ALTER COLUMN plan SET DEFAULT 'free'; ALTER TABLE members ALTER COLUMN plan DROP NOT NULL, ALTER COLUMN plan DROP DEFAULT; INSERT INTO members (id, name) VALUES (4, '大和');");
        expect((await db.query('SELECT plan FROM members WHERE id = 4')).rows).toEqual([{ plan: null }]);
      });
      it('rejects a foreign key or unique constraint that existing rows violate, and adds a primary key', async () => {
        await db.exec("CREATE TABLE plans (code varchar(10) PRIMARY KEY); INSERT INTO plans VALUES ('free'), ('pro');");
        await expect(db.exec('ALTER TABLE members ADD CONSTRAINT members_plan_fkey FOREIGN KEY (plan) REFERENCES plans (code);')).rejects.toThrow('violates foreign key constraint "members_plan_fkey"');
        await db.exec("UPDATE members SET plan = 'free' WHERE id = 3;");
        await expect(db.exec('ALTER TABLE members ADD CONSTRAINT members_plan_key UNIQUE (plan);')).rejects.toThrow('could not create unique index');
        await db.exec('ALTER TABLE members DROP CONSTRAINT members_pkey; ALTER TABLE members ADD PRIMARY KEY (id);');
        expect((await db.query("SELECT conname FROM pg_constraint WHERE conrelid = 'members'::regclass")).rows).toEqual([{ conname: 'members_pkey' }]);
      });
      it('refuses to drop a column used by a view unless CASCADE is given, and drops its own constraint with it', async () => {
        await db.exec('CREATE VIEW member_plans AS SELECT id, plan FROM members; ALTER TABLE members ADD CONSTRAINT members_email_key UNIQUE (email);');
        await expect(db.exec('ALTER TABLE members DROP COLUMN plan;')).rejects.toThrow('cannot drop column plan of table members because other objects depend on it');
        await db.exec('ALTER TABLE members DROP COLUMN plan CASCADE; ALTER TABLE members DROP COLUMN email;');
        expect((await db.query("SELECT COUNT(*) FROM information_schema.views WHERE table_name = 'member_plans'")).rows).toEqual([{ count: 0 }]);
        expect((await db.query("SELECT conname FROM pg_constraint WHERE conrelid = 'members'::regclass")).rows).toEqual([{ conname: 'members_pkey' }]);
      });
      it('restores a dropped column on ROLLBACK and keeps an existing column with IF NOT EXISTS', async () => {
        await db.exec('BEGIN; ALTER TABLE members DROP COLUMN email; ROLLBACK;');
        expect((await db.query('SELECT email FROM members WHERE id = 1')).rows).toEqual([{ email: 'aoki@example.com' }]);
        await db.exec('ALTER TABLE members ADD COLUMN IF NOT EXISTS email integer;');
        expect((await db.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'email'")).rows).toEqual([{ data_type: 'text' }]);
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
