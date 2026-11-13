import type { QuestionCategory, QuestionCore, QuestionTranslation } from '@/lib/types';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };

export type Exercise = {
  slug: string; title: string; description: string; sql: string;
  columns: string[]; rows: unknown[][]; hint: string; explanation: string;
  starter?: string; ordered?: boolean;
  setup?: string;       // この問題だけ別の表を使うとき（まとめ問題など）
  stateQuery?: string;  // この問題だけ採点用のSELECTを変えるとき（更新系）
  level?: 1 | 2 | 3 | 4 | 5;
  review?: 'chapter review' | 'cumulative review'; requirements?: string[];
};

// stateQueryを渡すと「実行後のテーブルの状態」で採点する問題（INSERT・UPDATE・DELETE）になる。
export function buildExerciseEntries(options: {
  category: QuestionCategory; tags: string[]; setup: string; exercises: Exercise[]; stateQuery?: string;
}): Entry[] {
  const { category, tags, setup, exercises } = options;
  return exercises.map((exercise, index) => { const stateQuery = exercise.stateQuery ?? options.stateQuery; return {
    core: {
      id: `${category}-${String(index + 1).padStart(2, '0')}`, slug: exercise.slug, category,
      level: exercise.level ?? (exercise.review === 'cumulative review' ? 4 : exercise.review ? 3 : index === 0 ? 1 : 2),
      setupSql: exercise.setup ?? setup, starterSql: exercise.starter,
      expectedResult: { columns: exercise.columns, rows: exercise.rows.map((row) => Object.fromEntries(exercise.columns.map((column, i) => [column, row[i]]))) },
      grading: stateQuery
        ? { mode: 'table-state', stateQuery, compareRowOrder: true, compareColumnOrder: true, numericTolerance: 0 }
        : { mode: 'result', compareRowOrder: exercise.ordered ?? false, compareColumnOrder: true, numericTolerance: 0 },
      compatibility: { dialect: 'postgresql', postgres: true, notes: 'PostgreSQLで実行・検証しています。' },
      source: { type: 'original' }, tags: [...tags, exercise.title, ...(exercise.review ? [exercise.review] : [])],
    },
    translations: { ja: { title: exercise.title, description: exercise.description, solutionSql: exercise.sql,
      hints: [exercise.hint], explanation: exercise.explanation, ...(exercise.requirements ? { requirements: exercise.requirements } : {}) } },
  }; });
}
