import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { dateTimeParsers } from '../lib/dateTimeParsers';
import { PGlite } from '@electric-sql/pglite';
import { questions } from './catalog';
import { gradeResult } from '../lib/grader';
import { extraTopicSlugs } from '../lib/categories';

// src/questions/topics/ に置いた追加カテゴリ（1カテゴリ6問以上、章末・まとめ問題つき）。
const extraCategories = [...new Set(questions.map((question) => question.category as string))].filter((category) => extraTopicSlugs.includes(category));
const extraQuestionCount = questions.filter((question) => extraCategories.includes(question.category)).length;

describe('question catalog', () => {
  let db: PGlite;
  beforeAll(async () => { db = await PGlite.create('memory://', { parsers: dateTimeParsers }); });
  afterAll(async () => { await db.close(); });

  it('contains 152 unique questions with the intended chapter sizes', () => {
    expect(questions).toHaveLength(152 + extraQuestionCount);
    expect(new Set(questions.map((question) => question.id)).size).toBe(152 + extraQuestionCount);
    for (const category of extraCategories) expect(questions.filter((question) => question.category === category).length, category).toBeGreaterThanOrEqual(6);
    for (const [category, count] of Object.entries({ select: 6, 'order-by': 6, where: 8, 'group-by': 12, having: 8, case: 9, coalesce: 10, with: 6, union: 6, 'date-filter': 6, 'date-trunc': 6, 'string-functions': 6, exists: 6, 'intersect-except': 6, like: 6, insert: 6, update: 6, delete: 6, join: 8, subquery: 8, 'window-functions': 11 })) {
      expect(questions.filter((question) => question.category === category), category).toHaveLength(count);
    }
  });

  it('ends each revised chapter with progressively harder reviews and explicit requirements', () => {
    for (const category of ['group-by', 'having', 'case', 'coalesce', 'join', 'subquery', 'with', 'union', 'date-filter', 'date-trunc', 'string-functions', 'exists', 'intersect-except', 'like', 'insert', 'update', 'delete', 'window-functions', ...extraCategories]) {
      const chapter = questions.filter((question) => question.category === category);
      const [review, cumulative] = chapter.slice(-2);
      expect(review.tags.at(-1)).toBe('chapter review');
      expect(cumulative.tags.at(-1)).toBe('cumulative review');
      expect(review.level).toBeGreaterThan(chapter[0].level);
      expect(cumulative.level).toBeGreaterThan(review.level);
      expect(review.requirements!.length).toBeGreaterThan(1);
      expect(cumulative.requirements!.length).toBeGreaterThan(1);
    }
  });

  const caseMistakes = [
    { id: 'case-01', label: 'excludes the exact threshold', change: (sql: string) => sql.replace('>= 350000', '> 350000') },
    { id: 'case-02', label: 'checks the lower threshold first', change: (sql: string) => sql.replace("WHEN salary >= 400000 THEN '高'\n    WHEN salary >= 350000 THEN '中'", "WHEN salary >= 350000 THEN '中'\n    WHEN salary >= 400000 THEN '高'") },
    { id: 'case-04', label: 'compares NULL with equals', change: (sql: string) => sql.replace('salary IS NULL', 'salary = NULL') },
    { id: 'case-07', label: 'counts both ones and zeros', change: (sql: string) => sql.replace('SUM(CASE', 'COUNT(CASE') },
    { id: 'case-07', label: 'removes the zero-count department', change: (sql: string) => sql.replace('GROUP BY department', 'WHERE salary >= 350000\nGROUP BY department') },
    { id: 'case-09', label: 'includes inactive employees', change: (sql: string) => sql.replace('WHERE active = true', '') },
  ];
  for (const mistake of caseMistakes) {
    it(`${mistake.id}: rejects a solution that ${mistake.label}`, async () => {
      const question = questions.find((question) => question.id === mistake.id)!;
      await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      await db.exec(question.setupSql);
      const sql = mistake.change(question.solutionSql);
      expect(sql).not.toBe(question.solutionSql);
      const result = (await db.exec(sql)).at(-1)!;
      const actual = { columns: result.fields.map((field) => field.name), rows: result.rows as Record<string, unknown>[] };
      expect(gradeResult(actual, question.expectedResult, question.grading).correct).toBe(false);
    });
  }

  const coalesceMistakes = [
    { id: 'coalesce-01', label: 'treats zero as missing', change: (sql: string) => sql.replace('bonus IS NULL', 'bonus = 0') },
    { id: 'coalesce-02', label: 'drops a known zero', change: (sql: string) => sql.replace('bonus IS NOT NULL', 'bonus > 0') },
    { id: 'coalesce-03', label: 'confuses empty strings and NULL', change: (sql: string) => sql.replace("nickname = ''", 'nickname IS NULL') },
    { id: 'coalesce-05', label: 'reverses fallback priority', change: (sql: string) => sql.replace('nickname, name', 'name, nickname') },
    { id: 'coalesce-05', label: 'replaces an empty string', change: (sql: string) => sql.replace('COALESCE(nickname,', "COALESCE(NULLIF(nickname, ''),") },
    { id: 'coalesce-07', label: 'averages before replacing NULL', change: (sql: string) => sql.replace('AVG(COALESCE(bonus, 0))', 'COALESCE(AVG(bonus), 0) AS avg') },
    { id: 'coalesce-10', label: 'drops missing salaries before averaging', change: (sql: string) => sql.replace(' OR salary IS NULL', '') },
  ];
  for (const mistake of coalesceMistakes) {
    it(`${mistake.id}: rejects a solution that ${mistake.label}`, async () => {
      const question = questions.find((question) => question.id === mistake.id)!;
      await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      await db.exec(question.setupSql);
      const sql = mistake.change(question.solutionSql);
      expect(sql).not.toBe(question.solutionSql);
      const result = (await db.exec(sql)).at(-1)!;
      const actual = { columns: result.fields.map((field) => field.name), rows: result.rows as Record<string, unknown>[] };
      expect(gradeResult(actual, question.expectedResult, question.grading).correct).toBe(false);
    });
  }

  const withMistakes = [
    { id: 'with-02', label: 'excludes the exact total threshold', change: (sql: string) => sql.replace('sum >= 650000', 'sum > 650000') },
    { id: 'with-04', label: 'aggregates the source instead of the previous CTE', change: (sql: string) => sql.replace('FROM known_salary', 'FROM employees') },
    { id: 'with-05', label: 'uses the wrong total threshold', change: (sql: string) => sql.replace('sum >= 700000', 'sum >= 650000') },
    { id: 'with-06', label: 'includes inactive employees', change: (sql: string) => sql.replace('WHERE active = true', '') },
    { id: 'with-06', label: 'reverses the total order', change: (sql: string) => sql.replace('sum DESC', 'sum ASC') },
  ];
  for (const mistake of withMistakes) {
    it(`${mistake.id}: rejects a solution that ${mistake.label}`, async () => {
      const question = questions.find((question) => question.id === mistake.id)!;
      await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      await db.exec(question.setupSql);
      const result = (await db.exec(mistake.change(question.solutionSql))).at(-1)!;
      const actual = { columns: result.fields.map((field) => field.name), rows: result.rows as Record<string, unknown>[] };
      expect(gradeResult(actual, question.expectedResult, question.grading).correct).toBe(false);
    });
  }

  const unionMistakes = [
    { id: 'union-01', label: 'removes duplicate measurements', change: (sql: string) => sql.replace('UNION ALL', 'UNION') },
    { id: 'union-02', label: 'keeps duplicate measurements', change: (sql: string) => sql.replace('UNION', 'UNION ALL') },
    { id: 'union-04', label: 'reverses the score order', change: (sql: string) => sql.replace('score DESC', 'score ASC') },
    { id: 'union-05', label: 'keeps duplicate combinations', change: (sql: string) => sql.replace('UNION', 'UNION ALL') },
    { id: 'union-06', label: 'merges distinct people with the same salary', change: (sql: string) => sql.replace('UNION ALL', 'UNION') },
    { id: 'union-06', label: 'includes inactive people from the second table', change: (sql: string) => sql.replace('FROM contractors\n  WHERE active = true', 'FROM contractors') },
  ];
  for (const mistake of unionMistakes) {
    it(`${mistake.id}: rejects a solution that ${mistake.label}`, async () => {
      const question = questions.find((question) => question.id === mistake.id)!;
      await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      await db.exec(question.setupSql);
      const result = (await db.exec(mistake.change(question.solutionSql))).at(-1)!;
      const actual = { columns: result.fields.map((field) => field.name), rows: result.rows as Record<string, unknown>[] };
      expect(gradeResult(actual, question.expectedResult, question.grading).correct).toBe(false);
    });
  }

  it('union-03: mismatched positions and column counts produce errors', async () => {
    const question = questions.find((question) => question.id === 'union-03')!;
    await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
    await db.exec(question.setupSql);
    await expect(db.exec(question.starterSql!)).rejects.toThrow();
    await expect(db.exec('SELECT score, name FROM morning_results UNION ALL SELECT score FROM evening_results')).rejects.toThrow();
  });

  const dateMistakes = [
    { id: 'date-filter-01', label: 'filters order dates instead of delivery dates', change: (sql: string) => sql.replace('delivery_on =', 'ordered_at =') },
    { id: 'date-filter-02', label: 'excludes the first delivery date', change: (sql: string) => sql.replace('delivery_on >=', 'delivery_on >') },
    { id: 'date-filter-03', label: 'selects only midnight', change: (sql: string) => sql.replace('ordered_at >=', 'ordered_at =') },
    { id: 'date-filter-04', label: 'includes the next month boundary', change: (sql: string) => sql.replace('ordered_at <', 'ordered_at <=') },
    { id: 'date-filter-04', label: 'drops the fractional last second', change: (sql: string) => sql.replace("ordered_at < TIMESTAMP '2026-10-01 00:00:00'", "ordered_at <= TIMESTAMP '2026-09-30 23:59:59'") },
    { id: 'date-filter-04', label: 'includes unknown order dates', change: (sql: string) => sql.replace("TIMESTAMP '2026-10-01 00:00:00';", "TIMESTAMP '2026-10-01 00:00:00' OR ordered_at IS NULL;") },
    { id: 'date-filter-05', label: 'keeps the incorrect initial date range', change: (_sql: string) => questions.find((q) => q.id === 'date-filter-05')!.starterSql! },
    { id: 'date-filter-06', label: 'excludes the first day of the period', change: (sql: string) => sql.replace('ordered_on >=', 'ordered_on >') },
    { id: 'date-filter-06', label: 'includes the next period', change: (sql: string) => sql.replace('ordered_on <', 'ordered_on <=') },
    { id: 'date-filter-06', label: 'includes cancelled orders', change: (sql: string) => sql.replace("    AND status = 'paid'", '') },
  ];
  for (const mistake of dateMistakes) {
    it(`${mistake.id}: rejects a solution that ${mistake.label}`, async () => {
      const question = questions.find((question) => question.id === mistake.id)!;
      await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      await db.exec(question.setupSql);
      const result = (await db.exec(mistake.change(question.solutionSql))).at(-1)!;
      const actual = { columns: result.fields.map((field) => field.name), rows: result.rows as Record<string, unknown>[] };
      expect(gradeResult(actual, question.expectedResult, question.grading).correct).toBe(false);
    });
  }

  const monthlyMistakes = [
    { id: 'date-trunc-01', label: 'truncates to days instead of months', change: (sql: string) => sql.replace("'month'", "'day'") },
    { id: 'date-trunc-02', label: 'merges the same month across years', change: (sql: string) => sql.replaceAll("DATE_TRUNC('month', ordered_at)", "MAKE_DATE(2000, EXTRACT(MONTH FROM ordered_at)::integer, 1)::timestamp").replace('::timestamp, COUNT(*)', '::timestamp AS date_trunc, COUNT(*)') },
    { id: 'date-trunc-03', label: 'counts orders instead of summing money', change: (sql: string) => sql.replace('SUM(amount)', 'COUNT(*) AS sum') },
    { id: 'date-trunc-04', label: 'includes the next period boundary', change: (sql: string) => sql.replace('ordered_at <', 'ordered_at <=') },
    { id: 'date-trunc-04', label: 'reverses chronological month order', change: (sql: string) => sql.replace("ORDER BY DATE_TRUNC('month', ordered_at);", "ORDER BY DATE_TRUNC('month', ordered_at) DESC;") },
    { id: 'date-trunc-05', label: 'groups by each original timestamp', change: (_sql: string) => questions.find((q) => q.id === 'date-trunc-05')!.starterSql! },
    { id: 'date-trunc-06', label: 'includes cancelled orders', change: (sql: string) => sql.replace("    AND status = 'paid'", '') },
    { id: 'date-trunc-06', label: 'excludes the first midnight', change: (sql: string) => sql.replace('ordered_at >=', 'ordered_at >') },
    { id: 'date-trunc-06', label: 'includes the next month midnight', change: (sql: string) => sql.replace('ordered_at <', 'ordered_at <=') },
    { id: 'date-trunc-06', label: 'drops a month exactly at the minimum total', change: (sql: string) => sql.replace('SUM(amount) >= 5000', 'SUM(amount) > 5000') },
  ];
  for (const mistake of monthlyMistakes) {
    it(`${mistake.id}: rejects a solution that ${mistake.label}`, async () => {
      const question = questions.find((question) => question.id === mistake.id)!;
      await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      await db.exec(question.setupSql);
      const result = (await db.exec(mistake.change(question.solutionSql))).at(-1)!;
      const actual = { columns: result.fields.map((field) => field.name), rows: result.rows as Record<string, unknown>[] };
      expect(gradeResult(actual, question.expectedResult, question.grading).correct).toBe(false);
    });
  }

  const stringMistakes = [
    { id: 'string-functions-01', label: 'treats CONCAT like nullable concatenation', change: (sql: string) => sql.replace('CONCAT(last_name, first_name)', '(last_name || first_name) AS concat') },
    { id: 'string-functions-02', label: 'starts the substring one character late', change: (sql: string) => sql.replace('FROM 1 FOR 2', 'FROM 2 FOR 2') },
    { id: 'string-functions-03', label: 'removes internal spaces as well', change: (sql: string) => sql.replace('TRIM(product_code)', "REPLACE(product_code, ' ', '') AS btrim") },
    { id: 'string-functions-04', label: 'removes only the first hyphen', change: (sql: string) => sql.replace("REPLACE(product_code, '-', '')", "REGEXP_REPLACE(product_code, '-', '') AS replace") },
    { id: 'string-functions-05', label: 'cuts the prefix before trimming', change: (sql: string) => sql.replace("REPLACE(TRIM(product_code), '-', '')", "REPLACE(product_code, '-', '')") },
    { id: 'string-functions-06', label: 'groups by the unprocessed name', change: (sql: string) => sql.replace("GROUP BY REPLACE(TRIM(customers.name), '-', '')", 'GROUP BY customers.name') },
    { id: 'string-functions-06', label: 'includes cancelled orders', change: (sql: string) => sql.replace("WHERE orders.status = 'paid'", '') },
  ];
  for (const mistake of stringMistakes) {
    it(`${mistake.id}: rejects a solution that ${mistake.label}`, async () => {
      const question = questions.find((question) => question.id === mistake.id)!;
      await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      await db.exec(question.setupSql);
      const result = (await db.exec(mistake.change(question.solutionSql))).at(-1)!;
      const actual = { columns: result.fields.map((field) => field.name), rows: result.rows as Record<string, unknown>[] };
      expect(gradeResult(actual, question.expectedResult, question.grading).correct).toBe(false);
    });
  }

  const existsMistakes = [
    { id: 'exists-02', label: 'omits the correlation condition', change: (sql: string) => sql.replace('  WHERE orders.customer_id = customers.id', '') },
    { id: 'exists-02', label: 'uses COUNT inside EXISTS', change: (sql: string) => sql.replace('SELECT 1', 'SELECT COUNT(*)') },
    { id: 'exists-03', label: 'accepts any order instead of a paid one', change: (sql: string) => sql.replace("    AND orders.status = 'paid'", '') },
    { id: 'exists-04', label: 'uses NOT IN with a NULL candidate', change: (_sql: string) => 'SELECT * FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);' },
    { id: 'exists-04', label: 'tests absence of paid orders instead of all orders', change: (sql: string) => sql.replace('orders.customer_id = customers.id', "orders.customer_id = customers.id AND orders.status = 'paid'") },
    { id: 'exists-05', label: 'overlooks a separate cancelled order', change: (_sql: string) => questions.find((q) => q.id === 'exists-05')!.starterSql! },
    { id: 'exists-06', label: 'drops the first midnight from the paid period', change: (sql: string) => sql.replace('orders.ordered_on >=', 'orders.ordered_on >') },
    { id: 'exists-06', label: 'includes a cancellation at the next period boundary', change: (sql: string) => sql.replace("orders.ordered_on < DATE '2026-03-01'", "orders.ordered_on <= DATE '2026-03-01'") },
    { id: 'exists-06', label: 'ignores February cancellations', change: (sql: string) => sql.replace("orders.ordered_on < DATE '2026-03-01'", "orders.ordered_on < DATE '2026-02-01'") },
    { id: 'exists-06', label: 'omits the outer region condition', change: (sql: string) => sql.replace("region = '東'\n  AND ", '') },
  ];
  for (const mistake of existsMistakes) {
    it(`${mistake.id}: rejects a solution that ${mistake.label}`, async () => {
      const question = questions.find((question) => question.id === mistake.id)!;
      await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      await db.exec(question.setupSql);
      const result = (await db.exec(mistake.change(question.solutionSql))).at(-1)!;
      const actual = { columns: result.fields.map((field) => field.name), rows: result.rows as Record<string, unknown>[] };
      expect(gradeResult(actual, question.expectedResult, question.grading).correct).toBe(false);
    });
  }

  const setOperationMistakes = [
    { id: 'intersect-except-01', label: 'combines rather than intersects the results', change: (sql: string) => sql.replace('INTERSECT', 'UNION') },
    { id: 'intersect-except-01', label: 'removes unknown IDs from the comparison', change: (sql: string) => sql.replace('FROM store_purchases', 'FROM store_purchases WHERE customer_id IS NOT NULL') },
    { id: 'intersect-except-02', label: 'reverses the difference direction', change: (sql: string) => sql.replace('store_purchases', 'comparison_temp').replace('online_purchases', 'store_purchases').replace('comparison_temp', 'online_purchases') },
    { id: 'intersect-except-03', label: 'removes duplicate common rows', change: (sql: string) => sql.replace('INTERSECT ALL', 'INTERSECT') },
    { id: 'intersect-except-04', label: 'removes matching values instead of subtracting their counts', change: (sql: string) => sql.replace('EXCEPT ALL', 'EXCEPT') },
    { id: 'intersect-except-05', label: 'reverses the requested order', change: (sql: string) => sql.replace('ORDER BY customer_id;', 'ORDER BY customer_id DESC;') },
    { id: 'intersect-except-06', label: 'keeps repeated common IDs and duplicates customers', change: (sql: string) => sql.replace('INTERSECT', 'INTERSECT ALL') },
    { id: 'intersect-except-06', label: 'includes cancelled purchases in January', change: (sql: string) => sql.replace("WHERE status = 'paid'", 'WHERE true') },
    { id: 'intersect-except-06', label: 'includes the March boundary in February', change: (sql: string) => sql.replace("ordered_on < DATE '2026-03-01'", "ordered_on <= DATE '2026-03-01'") },
  ];
  for (const mistake of setOperationMistakes) {
    it(`${mistake.id}: rejects a solution that ${mistake.label}`, async () => {
      const question = questions.find((question) => question.id === mistake.id)!;
      await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      await db.exec(question.setupSql);
      const result = (await db.exec(mistake.change(question.solutionSql))).at(-1)!;
      const actual = { columns: result.fields.map((field) => field.name), rows: result.rows as Record<string, unknown>[] };
      expect(gradeResult(actual, question.expectedResult, question.grading).correct).toBe(false);
    });
  }

  // INSERT・UPDATE・DELETEの問題はアプリと同じく、ユーザーSQLの実行後にstateQueryを実行した結果を採点する。
  async function runForGrading(question: (typeof questions)[number], sql: string) {
    await db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
    await db.exec(question.setupSql);
    const executed = (await db.exec(sql)).at(-1)!;
    const result = question.grading.mode === 'table-state' && question.grading.stateQuery
      ? (await db.exec(question.grading.stateQuery)).at(-1)!
      : executed;
    return { columns: result.fields.map((field) => field.name), rows: result.rows as Record<string, unknown>[] };
  }

  const dmlMistakes = [
    { id: 'like-01', label: 'omits the trailing wildcard', change: (sql: string) => sql.replace("'ボールペン%'", "'ボールペン'") },
    { id: 'like-02', label: 'matches only the prefix', change: (sql: string) => sql.replace("'%ペン%'", "'ペン%'") },
    { id: 'like-03', label: 'fixes the length at one character', change: (sql: string) => sql.replace("'NOTE-__'", "'NOTE-_'") },
    { id: 'like-04', label: 'does not escape the underscore', change: (sql: string) => sql.replace('SALE\\_10', 'SALE_10') },
    { id: 'like-05', label: 'uses case-sensitive LIKE', change: (sql: string) => sql.replace('ILIKE', 'LIKE') },
    { id: 'like-06', label: 'drops the parentheses around OR', change: (sql: string) => sql.replace("(name LIKE '%ペン%' OR name LIKE 'ノート%')", "name LIKE '%ペン%' OR name LIKE 'ノート%'") },
    { id: 'like-06', label: 'excludes the price boundary', change: (sql: string) => sql.replace('price >= 150', 'price > 150') },
    { id: 'insert-02', label: 'sets the stock explicitly', change: (sql: string) => sql.replace('(id, name, price)', '(id, name, price, stock)').replace('150)', '150, 30)') },
    { id: 'insert-04', label: 'loses the incoming stock values', change: (sql: string) => sql.replace('price, stock\nFROM', 'price, 0\nFROM') },
    { id: 'insert-05', label: 'uses the loose price threshold', change: (sql: string) => sql.replace('price >= 150', 'price >= 100') },
    { id: 'insert-06', label: 'ignores the stock condition', change: (sql: string) => sql.replace('  AND stock >= 1', '') },
    { id: 'update-01', label: 'updates a different row', change: (sql: string) => sql.replace('id = 2', 'id = 1') },
    { id: 'update-03', label: 'overwrites with a constant instead of subtracting', change: (sql: string) => sql.replace('stock - 1', '1') },
    { id: 'update-04', label: 'omits WHERE and updates every row', change: (sql: string) => sql.replace('WHERE stock = 0', '') },
    { id: 'update-05', label: 'uses AND instead of OR', change: (sql: string) => sql.replace(' OR ', ' AND ') },
    { id: 'update-06', label: 'uses the wrong discount ratio', change: (sql: string) => sql.replace('price * 9 / 10', 'price * 8 / 10') },
    { id: 'update-06', label: 'updates out-of-stock rows too', change: (sql: string) => sql.replace('WHERE stock >= 1', '') },
    { id: 'delete-01', label: 'omits WHERE and deletes every row', change: (sql: string) => sql.replace('WHERE id = 3', '') },
    { id: 'delete-03', label: 'uses AND instead of OR', change: (sql: string) => sql.replace(' OR ', ' AND ') },
    { id: 'delete-05', label: 'uses OR instead of AND', change: (sql: string) => sql.replace('\n  AND id IN', '\n  OR id IN') },
    { id: 'delete-06', label: 'deletes discontinued rows too', change: (sql: string) => sql.replace('NOT EXISTS', 'EXISTS') },
  ];
  for (const mistake of dmlMistakes) {
    it(`${mistake.id}: rejects a solution that ${mistake.label}`, async () => {
      const question = questions.find((question) => question.id === mistake.id)!;
      const sql = mistake.change(question.solutionSql);
      expect(sql).not.toBe(question.solutionSql);
      const actual = await runForGrading(question, sql);
      expect(gradeResult(actual, question.expectedResult, question.grading).correct).toBe(false);
    });
  }

  it('grades INSERT, UPDATE and DELETE questions by the table state after execution', () => {
    for (const category of ['insert', 'update', 'delete']) {
      for (const question of questions.filter((question) => question.category === category)) {
        expect(question.grading.mode, question.id).toBe('table-state');
        expect(question.grading.stateQuery, question.id).toBe('SELECT * FROM products ORDER BY id');
        expect(question.grading.compareRowOrder, question.id).toBe(true);
      }
    }
  });

  it('keeps the unchanged table from passing a table-state question', async () => {
    for (const question of questions.filter((question) => question.grading.mode === 'table-state')) {
      const actual = await runForGrading(question, 'SELECT 1');
      expect(gradeResult(actual, question.expectedResult, question.grading).correct, question.id).toBe(false);
    }
  });

  for (const question of questions) {
    it(`${question.id}: solution reaches expected result`, async () => {
      const actual = await runForGrading(question, question.solutionSql);
      const grade = gradeResult(actual, question.expectedResult, question.grading);
      expect(grade, grade.details).toMatchObject({ correct:true });
    });
  }
});
