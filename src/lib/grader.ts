import type { ExpectedResult, Grading } from './types';
import type { SqlResult } from './pglite';

export type GradeResult = {
  correct: boolean;
  message: string;
  details?: string;
};

function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'string' && /^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function equalValue(actual: unknown, expected: unknown, tolerance: number): boolean {
  const left = normalizeValue(actual);
  const right = normalizeValue(expected);
  if (typeof left === 'number' && typeof right === 'number') return Math.abs(left - right) <= tolerance;
  // 配列（PostgreSQLの配列型）とオブジェクト（json・jsonb）は中身で比べる。
  if (left !== null && right !== null && typeof left === 'object' && typeof right === 'object') return JSON.stringify(left) === JSON.stringify(right);
  return Object.is(left, right);
}

function rowKey(row: Record<string, unknown>, columns: string[]): string {
  return JSON.stringify(columns.map((column) => normalizeValue(row[column])));
}

function compare(actual: SqlResult, expected: ExpectedResult, grading: Grading): GradeResult {
  const actualColumns = actual.columns;
  const expectedColumns = expected.columns;
  const sameColumns = grading.compareColumnOrder
    ? actualColumns.length === expectedColumns.length && actualColumns.every((column, index) => column === expectedColumns[index])
    : actualColumns.length === expectedColumns.length && expectedColumns.every((column) => actualColumns.includes(column));
  if (!sameColumns) {
    return { correct: false, message: '列が期待結果と異なります。', details: `期待: ${expectedColumns.join(', ')} / 実際: ${actualColumns.join(', ') || '列なし'}` };
  }

  if (actual.rows.length !== expected.rows.length) {
    return { correct: false, message: '行数が期待結果と異なります。', details: `期待: ${expected.rows.length}行 / 実際: ${actual.rows.length}行` };
  }

  const columns = grading.compareColumnOrder ? expectedColumns : [...expectedColumns].sort();
  const actualRows = grading.compareRowOrder ? actual.rows : [...actual.rows].sort((a, b) => rowKey(a, columns).localeCompare(rowKey(b, columns)));
  const expectedRows = grading.compareRowOrder ? expected.rows : [...expected.rows].sort((a, b) => rowKey(a, columns).localeCompare(rowKey(b, columns)));

  for (let rowIndex = 0; rowIndex < expectedRows.length; rowIndex += 1) {
    for (const column of columns) {
      if (!equalValue(actualRows[rowIndex]?.[column], expectedRows[rowIndex]?.[column], grading.numericTolerance)) {
        return { correct: false, message: '値または行順が期待結果と異なります。', details: `${rowIndex + 1}行目「${column}」を確認してください。` };
      }
    }
  }
  return { correct: true, message: '正解です！期待する結果になりました。' };
}

export function gradeResult(actual: SqlResult, expected: ExpectedResult, grading: Grading): GradeResult {
  const candidates = [expected, ...(grading.acceptableResults ?? [])];
  const results = candidates.map((candidate) => compare(actual, candidate, grading));
  return results.find((result) => result.correct) ?? results[0];
}
