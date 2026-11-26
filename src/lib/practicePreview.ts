import { PGlite } from '@electric-sql/pglite';
import type { Question } from './types';
import { dateTimeParsers } from './dateTimeParsers';
import { gradeResult } from './grader';
import { formatSqlValue } from './formatSqlValue';

const sampleLimit = 5;

async function readTables(db: PGlite) {
  const { rows: columns } = await db.query<{ relation: string; name: string; type: string }>(`
    SELECT c.relname AS relation, a.attname AS name, format_type(a.atttypid, a.atttypmod) AS type
    FROM pg_class c
    JOIN pg_attribute a ON a.attrelid = c.oid
    WHERE c.relnamespace = 'public'::regnamespace AND c.relkind IN ('r', 'p')
      AND a.attnum > 0 AND NOT a.attisdropped
    ORDER BY c.relname, a.attnum
  `);
  const tables = [];
  for (const name of new Set(columns.map((c) => c.relation))) {
    const identifier = '"' + name.replaceAll('"', '""') + '"';
    const { rows } = await db.query<Record<string, unknown>>(`SELECT * FROM public.${identifier} ORDER BY ctid`);
    const fields = columns.filter((c) => c.relation === name);
    tables.push({
      name, count: rows.length,
      headers: fields.map((c) => `${c.name} (${c.type})`),
      rows: rows.slice(0, sampleLimit).map((row) => fields.map((c) => formatSqlValue(row[c.name]))),
    });
  }
  return tables;
}

async function preview(db: PGlite, question: Question) {
  await db.exec('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  if (question.setupSql.trim()) await db.exec(question.setupSql);
  const tables = await readTables(db);
  const executions = await db.exec(question.solutionSql);
  const result = question.grading.mode === 'table-state' && question.grading.stateQuery
    ? await db.query(question.grading.stateQuery)
    : executions.at(-1);
  if (!result) throw new Error(`${question.id}: 模範解答の実行結果がありません`);
  const headers = result.fields.map((f) => f.name);
  const rows = result.rows as Record<string, unknown>[];
  const grade = gradeResult({ columns: headers, rows }, question.expectedResult, question.grading);
  if (!grade.correct) throw new Error(`${question.id}: ${grade.message} ${grade.details ?? ''}`);
  return { tables, expected: { headers, rows: rows.map((row) => headers.map((c) => formatSqlValue(row[c]))) } };
}

// ビルド用のDBを1つだけ起動し、問題ごとに初期状態へ戻して順に実行する。
export async function practicePaths(questions: Question[]) {
  const db = await PGlite.create('memory://', { parsers: dateTimeParsers });
  try {
    const paths = [];
    for (const question of questions) {
      paths.push({ params: { category: question.category, id: question.id }, props: { question, preview: await preview(db, question) } });
    }
    return paths;
  } finally {
    await db.close();
  }
}
