import type { QuestionCore, QuestionTranslation } from '@/lib/types';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };
type Exercise = {
  slug: string;
  title: string;
  description: string;
  sql: string;
  columns: string[];
  rows: unknown[][];
  hint: string;
  explanation: string;
  setup?: string;
  starter?: string;
  review?: 'chapter review' | 'cumulative review';
  requirements?: string[];
  ordered?: boolean;
};

// A nullable salary and both exact thresholds distinguish common CASE mistakes.
export const caseEmployees = `
CREATE TABLE employees (id integer PRIMARY KEY, name text NOT NULL, department text NOT NULL, salary integer);
INSERT INTO employees VALUES
  (1, '青木', '営業', 300000), (2, '北野', '開発', 400000),
  (3, '中央', '営業', 350000), (4, '大和', '開発', 400000),
  (5, '恵比寿', 'サポート', NULL);`;
const employeeRows = [
  [1, '青木', '営業', 300000], [2, '北野', '開発', 400000],
  [3, '中央', '営業', 350000], [4, '大和', '開発', 400000],
  [5, '恵比寿', 'サポート', null],
];
const columns = ['id', 'name', 'department', 'salary', 'case'];
const withValues = (values: unknown[]) => employeeRows.map((row, index) => [...row, values[index]]);

export function caseEntries(previousEmployees: string): Entry[] {
  const exercises: Exercise[] = [
    {
      slug: 'when-then-else', title: 'CASE・WHEN・THEN・ELSE・END',
      description: '全社員の全列の末尾にCASEの判定を追加してください。月給350000円以上は「対象」、それ以外（未入力を含む）は「対象外」とします。別名は付けず、行順は問いません。',
      sql: "SELECT *,\n  CASE\n    WHEN salary >= 350000 THEN '対象'\n    ELSE '対象外'\n  END\nFROM employees;",
      columns, rows: withValues(['対象外', '対象', '対象', '対象', '対象外']),
      hint: 'WHENに比較条件、THENとELSEに返したい文字列を書き、ENDで閉じます。',
      explanation: '350000円ちょうども対象です。NULLとの比較はtrueにならないため、恵比寿さんはELSEの対象外になります。',
    },
    {
      slug: 'multiple-when', title: '複数のWHEN・判定順',
      description: '全列の末尾にCASEの判定を追加してください。月給400000円以上は「高」、350000円以上400000円未満は「中」、それ以外（未入力を含む）は「その他」とします。別名は付けず、行順は問いません。',
      sql: "SELECT *,\n  CASE\n    WHEN salary >= 400000 THEN '高'\n    WHEN salary >= 350000 THEN '中'\n    ELSE 'その他'\n  END\nFROM employees;",
      columns, rows: withValues(['その他', '高', '中', '高', 'その他']),
      hint: '複数の条件を満たす人がいるので、優先したい条件を先にします。',
      explanation: '40万円の人は35万円以上でもあります。先に40万円以上を判定すると高になり、35万円の中央さんだけが中になります。',
    },
    {
      slug: 'without-else', title: 'ELSEの省略',
      description: '全列の末尾にCASEの判定を追加してください。月給350000円以上にだけ「対象」を付け、ほかの社員の判定結果はNULLにします。ELSEは省略し、別名は付けず、行順は問いません。',
      sql: "SELECT *,\n  CASE\n    WHEN salary >= 350000 THEN '対象'\n  END\nFROM employees;",
      columns, rows: withValues([null, '対象', '対象', '対象', null]),
      hint: 'ELSEを省くと、どのWHENもtrueでない行のCASEの値はNULLになります。',
      explanation: '青木さんと恵比寿さんの判定はNULLです。WHEREで除外する問題ではないので、社員の5行は残します。',
    },
    {
      slug: 'is-null', title: 'CASE・IS NULL',
      description: '全列の末尾にCASEの判定を追加してください。月給がNULLなら「未入力」、それ以外なら「入力済み」とします。別名は付けず、行順は問いません。',
      sql: "SELECT *,\n  CASE\n    WHEN salary IS NULL THEN '未入力'\n    ELSE '入力済み'\n  END\nFROM employees;",
      columns, rows: withValues(['入力済み', '入力済み', '入力済み', '入力済み', '未入力']),
      hint: 'NULLかどうかは=ではなくIS NULLで判定します。',
      explanation: '未入力の恵比寿さんだけが未入力になります。CASE salary WHEN NULLという単純CASEでもNULLには一致しません。',
    },
    {
      slug: 'simple-case', title: '単純CASE',
      description: '全列の末尾に部署コードをCASEで追加してください。営業は「S」、開発は「D」、それ以外は「O」とします。CASE departmentの形を使い、別名は付けず、行順は問いません。',
      sql: "SELECT *,\n  CASE department\n    WHEN '営業' THEN 'S'\n    WHEN '開発' THEN 'D'\n    ELSE 'O'\n  END\nFROM employees;",
      columns, rows: withValues(['S', 'D', 'S', 'D', 'O']),
      hint: 'CASEの直後に比較する列、WHENの後ろに一致させたい値を書きます。',
      explanation: 'departmentの値と各WHENの文字列を比較します。元のdepartment列を書き換えるわけではありません。',
    },
    {
      slug: 'numeric-result', title: 'CASEで数値を返す',
      description: '全列の末尾にCASEで数値を追加してください。月給350000円以上は1、それ以外（未入力を含む）は0とします。別名は付けず、行順は問いません。',
      sql: 'SELECT *,\n  CASE\n    WHEN salary >= 350000 THEN 1\n    ELSE 0\n  END\nFROM employees;',
      columns, rows: withValues([0, 1, 1, 1, 0]),
      hint: '返す値を文字列ではなく数値の1・0にします。',
      explanation: '条件に合う3人は1、残りの2人は0です。この値を合計すると、条件に合う人数を数えられます。',
    },
    {
      slug: 'sum-case', title: 'SUM・CASE・GROUP BY',
      description: '部署ごとに月給350000円以上の人数をCASEの1と0をSUMで足して求めてください。department、集計値の順で取得し、対象者0人の部署も残します。別名は付けず、行順は問いません。',
      sql: 'SELECT department,\n  SUM(CASE\n    WHEN salary >= 350000 THEN 1\n    ELSE 0\n  END)\nFROM employees\nGROUP BY department;',
      columns: ['department', 'sum'], rows: [['営業', 1], ['開発', 2], ['サポート', 0]],
      hint: '対象外をWHEREで除外せず、CASEから0を返します。',
      explanation: '営業は0 + 1で1人、開発は1 + 1で2人です。サポートの行を残して0を足すため、対象者0人でも表示されます。',
    },
    {
      slug: 'chapter-review-null-and-order', title: '章末問題：CASE・複数条件・NULL', review: 'chapter review',
      description: '全列の末尾にCASEの判定を追加してください。月給未入力は「未入力」、400000円以上は「高」、350000円以上400000円未満は「中」、それ以外は「その他」とします。初期SQLの判定を修正してください。別名は付けず、行順は問いません。',
      starter: "SELECT *,\n  CASE\n    WHEN salary = NULL THEN '未入力'\n    WHEN salary >= 350000 THEN '中'\n    WHEN salary >= 400000 THEN '高'\n    ELSE 'その他'\n  END\nFROM employees;",
      sql: "SELECT *,\n  CASE\n    WHEN salary IS NULL THEN '未入力'\n    WHEN salary >= 400000 THEN '高'\n    WHEN salary >= 350000 THEN '中'\n    ELSE 'その他'\n  END\nFROM employees;",
      columns, rows: withValues(['その他', '高', '中', '高', '未入力']),
      requirements: ['元の社員5人をすべて残す', 'NULLを未入力にする', '400000円以上を高、350000円以上400000円未満を中にする', 'それ以外はその他にする'],
      hint: 'NULLの比較方法と、両方に一致する条件の順序を見直します。',
      explanation: 'IS NULLで未入力を分けます。給与の条件は高い境界から書くと、40万円の2人を中へ分類してしまう誤りを防げます。',
    },
    {
      slug: 'cumulative-review-conditional-payroll', title: 'まとめ問題：WHERE・CASE・GROUP BY・HAVING・ORDER BY', review: 'cumulative review', ordered: true,
      setup: previousEmployees + "\nINSERT INTO employees VALUES (6, 'Fumi', 'Sales', 700000, false), (7, 'Gen', 'Inactive', 800000, false);",
      description: '在籍中（active = true）の社員だけを対象に、月給500000円以上の人の給与合計を部署別に求めてください。CASEで対象外の給与を0にし、合計が0より大きい部署だけを部署名の昇順で表示します。department、集計値の順で取得し、別名は付けません。',
      sql: 'SELECT department,\n  SUM(CASE\n    WHEN salary >= 500000 THEN salary\n    ELSE 0\n  END)\nFROM employees\nWHERE active = true\nGROUP BY department\nHAVING SUM(CASE\n  WHEN salary >= 500000 THEN salary\n  ELSE 0\nEND) > 0\nORDER BY department;',
      columns: ['department', 'sum'], rows: [['Engineering', 1220000], ['Sales', 520000]],
      requirements: ['在籍中の社員だけを集計する', '月給500000円以上の給与を足し、対象外は0として扱う', '部署ごとの給与合計が0より大きい部署だけを残す', '部署名の昇順で表示する'],
      hint: 'WHEREで在籍状態、CASEで合計する値、GROUP BYで部署、HAVINGで合計の条件を指定します。',
      explanation: 'Engineeringは610000 + 610000で1220000円、SalesはAliceの520000円です。非在籍のFumi・Genは集計に入りません。在籍者はいても50万円以上の人がいないSupportは合計0になり、HAVINGで外れます。',
    },
  ];
  return exercises.map((exercise, index) => ({
    core: {
      id: `case-${String(index + 1).padStart(2, '0')}`, slug: exercise.slug, category: 'case',
      level: exercise.review === 'cumulative review' ? 4 : exercise.review ? 3 : 2,
      setupSql: exercise.setup ?? caseEmployees,
      starterSql: exercise.starter ?? 'SELECT\n  -- CASEを使ってSQLを書いてください\n',
      expectedResult: { columns: exercise.columns, rows: exercise.rows.map((row) => Object.fromEntries(exercise.columns.map((column, i) => [column, row[i]]))) },
      grading: { mode: 'result', compareRowOrder: exercise.ordered ?? false, compareColumnOrder: true, numericTolerance: 0 },
      compatibility: { dialect: 'postgresql', postgres: true, notes: 'PostgreSQLで実行・検証しています。' },
      source: { type: 'original' }, tags: ['CASE', exercise.title, ...(exercise.review ? [exercise.review] : [])],
    },
    translations: { ja: {
      title: exercise.title, description: exercise.description, solutionSql: exercise.sql,
      hints: [exercise.hint], explanation: exercise.explanation,
      ...(exercise.requirements ? { requirements: exercise.requirements } : {}),
    } },
  }));
}
