export type Locale = 'ja' | 'en';

export type QuestionSource = { type: 'original' };

export type SqlCompatibility = {
  dialect: 'standard' | 'postgresql';
  postgres: true;
  mysql?: boolean;
  sqlite?: boolean;
  standardSql?: boolean;
  notes?: string;
};

export type ExpectedResult = {
  columns: string[];
  rows: Record<string, unknown>[];
};

export type Grading = {
  mode: 'result' | 'table-state';
  compareRowOrder: boolean;
  compareColumnOrder: boolean;
  numericTolerance: number;
  acceptableResults?: ExpectedResult[];
  stateQuery?: string;
};

export type QuestionCore = {
  id: string;
  slug: string;
  category: QuestionCategory;
  level: 1 | 2 | 3 | 4 | 5;
  setupSql: string;
  starterSql?: string;
  expectedResult: ExpectedResult;
  grading: Grading;
  tags: string[];
  compatibility: SqlCompatibility;
  source: QuestionSource;
};

export type QuestionTranslation = {
  title: string;
  description: string;
  requirements?: string[];
  hints: string[];
  explanation: string;
  solutionSql: string;
};

export type Question = QuestionCore & QuestionTranslation;

export type QuestionCategory =
  | 'select'
  | 'order-by'
  | 'where'
  | 'group-by'
  | 'having'
  | 'case'
  | 'coalesce'
  | 'join'
  | 'with'
  | 'union'
  | 'date-filter'
  | 'date-trunc'
  | 'string-functions'
  | 'exists'
  | 'intersect-except'
  | 'like'
  | 'insert'
  | 'update'
  | 'delete'
  | 'subquery'
  | 'window-functions'
  | 'self-join'
  | 'cross-join'
  | 'full-outer-join'
  | 'not-in'
  | 'any-all'
  | 'correlated-subquery'
  | 'limit-offset'
  | 'cast'
  | 'nullif'
  | 'is-distinct-from'
  | 'with-recursive'
  | 'rollup'
  | 'string-agg'
  | 'percentile-cont'
  | 'lag-lead'
  | 'window-frame'
  | 'ntile'
  | 'date-arithmetic'
  | 'generate-series'
  | 'regexp'
  | 'array'
  | 'jsonb'
  | 'insert-select'
  | 'update-from'
  | 'delete-using'
  | 'merge';

export type ProgressState = {
  version: 1;
  lastSqlByQuestion: Record<string, string>;
  solvedIds: string[];
  /** 問題ID → 初めて正解した日（端末のローカル日付 YYYY-MM-DD）。連続日数の計算に使う。 */
  solvedAt?: Record<string, string>;
  theme?: 'light' | 'dark' | 'system';
};
