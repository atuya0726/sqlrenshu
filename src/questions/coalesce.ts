import type { QuestionCore, QuestionTranslation } from '@/lib/types';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };
type Exercise = {
  slug: string; title: string; description: string; sql: string;
  columns: string[]; rows: unknown[][]; hint: string; explanation: string;
  setup?: string; starter?: string; ordered?: boolean;
  review?: 'chapter review' | 'cumulative review'; requirements?: string[];
};
const setup = `
CREATE TABLE employees (id integer PRIMARY KEY, name text, nickname text, bonus integer);
INSERT INTO employees VALUES
  (1, '青木', 'アオ', 120), (2, '北野', NULL, 0),
  (3, '中央', '', NULL), (4, NULL, NULL, 240),
  (5, '恵比寿', 'エビ', NULL);`;
const columns = ['id', 'name', 'nickname', 'bonus'];
const rows = [
  [1, '青木', 'アオ', 120], [2, '北野', null, 0],
  [3, '中央', '', null], [4, null, null, 240], [5, '恵比寿', 'エビ', null],
];

export function coalesceEntries(previousCaseEmployees: string): Entry[] {
  const exercises: Exercise[] = [
    {
      slug: 'is-null', title: 'IS NULL',
      description: '賞与（bonus）が未入力の社員を取得してください。0万円と入力済みの社員は含めません。全列を取得し、行順は問いません。',
      sql: 'SELECT *\nFROM employees\nWHERE bonus IS NULL;', columns, rows: [rows[2], rows[4]],
      hint: '未入力かどうかはIS NULLで判定します。',
      explanation: '中央さんと恵比寿さんのbonusはNULLです。北野さんは数値の0が入力されているので対象外です。',
    },
    {
      slug: 'is-not-null', title: 'IS NOT NULL',
      description: '賞与（bonus）が入力済みの社員を取得してください。0万円も入力済みとして含めます。全列を取得し、行順は問いません。',
      sql: 'SELECT *\nFROM employees\nWHERE bonus IS NOT NULL;', columns, rows: [rows[0], rows[1], rows[3]],
      hint: '0より大きいかではなく、NULLでないかを確認します。',
      explanation: '120万円、0万円、240万円の3人です。bonus > 0では0万円の北野さんが消えてしまいます。',
    },
    {
      slug: 'empty-string', title: '空文字とNULL',
      description: '表示名（nickname）が空文字の社員を取得してください。nicknameがNULLの社員は含めません。全列を取得し、行順は問いません。',
      sql: "SELECT *\nFROM employees\nWHERE nickname = '';", columns, rows: [rows[2]],
      hint: '空文字はシングルクォート2つで表します。',
      explanation: '中央さんのnicknameは空文字です。PostgreSQLでは空文字とNULLは別なので、IS NULLでは別の社員が選ばれます。',
    },
    {
      slug: 'coalesce-default', title: 'COALESCEの既定値',
      description: '全社員の全列の末尾に、未入力の賞与だけを0にした値をCOALESCEで追加してください。入力済みの賞与はそのままにします。別名は付けず、行順は問いません。',
      sql: 'SELECT *, COALESCE(bonus, 0)\nFROM employees;',
      columns: [...columns, 'coalesce'], rows: rows.map((row, i) => [...row, [120, 0, 0, 240, 0][i]]),
      hint: '最初の候補がNULLなら、次の候補が使われます。',
      explanation: 'NULLだった2人の追加列が0になります。元のbonus列のNULLは変わりません。',
    },
    {
      slug: 'coalesce-priority', title: 'COALESCEの複数候補',
      description: '全社員の全列の末尾に表示する名前を追加してください。nickname、name、「名前なし」の順で最初のNULLでない値をCOALESCEで選びます。空文字はそのまま採用します。別名は付けず、行順は問いません。',
      sql: "SELECT *, COALESCE(nickname, name, '名前なし')\nFROM employees;",
      columns: [...columns, 'coalesce'], rows: rows.map((row, i) => [...row, ['アオ', '北野', '', '名前なし', 'エビ'][i]]),
      hint: 'nicknameを最初に置き、すべて未入力の人のために最後に文字列を置きます。',
      explanation: '青木さんはnicknameを優先してアオ、北野さんは氏名、社員ID4は名前なしです。中央さんの空文字はNULLではないので氏名に置き換わりません。',
    },
    {
      slug: 'avg-ignore-null', title: 'AVGとNULL',
      description: '未入力の賞与を計算対象から除き、入力されている賞与の平均を1列で取得してください。0万円は計算に含めます。別名は付けません。',
      sql: 'SELECT AVG(bonus)\nFROM employees;', columns: ['avg'], rows: [[120]],
      hint: 'AVGはNULLを除いて平均を計算します。',
      explanation: '入力済みの120、0、240の3件を平均すると、360 ÷ 3で120万円です。',
    },
    {
      slug: 'avg-coalesce-inside', title: 'AVGの内側のCOALESCE',
      description: '未入力の賞与を0万円と見なす集計ルールで、全社員の賞与平均を1列で取得してください。AVGの内側でCOALESCEを使い、別名は付けません。',
      sql: 'SELECT AVG(COALESCE(bonus, 0))\nFROM employees;', columns: ['avg'], rows: [[72]],
      hint: '各社員のNULLを0にしてから平均します。',
      explanation: '120、0、0、240、0の5件となり、360 ÷ 5で72万円です。平均した後にNULLを補っても、この値にはなりません。',
    },
    {
      slug: 'coalesce-avg-outside', title: 'AVGの外側のCOALESCE',
      description: '未入力を除いた賞与平均を求め、平均結果そのものがNULLの場合だけ0を返してください。COALESCEの内側にAVGを書き、1列を別名なしで取得します。',
      sql: 'SELECT COALESCE(AVG(bonus), 0)\nFROM employees;', columns: ['coalesce'], rows: [[120]],
      hint: '先にAVGで平均を求め、その結果にCOALESCEを適用します。',
      explanation: 'この表では平均120万円が求まるため、0への補完は起こりません。全員未入力や0件の場合にだけ平均のNULLを0へ置き換えます。',
    },
    {
      slug: 'chapter-review-known-bonus', title: '章末問題：IS NOT NULL・COALESCE', review: 'chapter review',
      description: '賞与が入力済みの社員だけを取得し、全列の末尾にnickname、name、「名前なし」の優先順で選んだ名前を追加してください。0万円の社員も含めます。初期SQLを修正し、別名は付けず、行順は問いません。',
      starter: "SELECT *, COALESCE(name, nickname, '名前なし')\nFROM employees\nWHERE bonus <> NULL;",
      sql: "SELECT *, COALESCE(nickname, name, '名前なし')\nFROM employees\nWHERE bonus IS NOT NULL;",
      columns: [...columns, 'coalesce'], rows: [[...rows[0], 'アオ'], [...rows[1], '北野'], [...rows[3], '名前なし']],
      hint: 'NULLの判定方法と、名前の候補の順序を確認します。',
      explanation: '0万円の北野さんも残します。社員ID4は名前の候補が両方NULLなので、最後の名前なしが採用されます。',
      requirements: ['賞与がNULLの社員を除く', '賞与0万円の社員を含める', 'nickname、name、名前なしの順に表示値を選ぶ'],
    },
    {
      slug: 'cumulative-review-department-average', title: 'まとめ問題：WHERE・COALESCE・GROUP BY・ORDER BY', review: 'cumulative review', ordered: true,
      setup: previousCaseEmployees + "\nINSERT INTO employees VALUES (6, '富士', '営業', NULL);",
      description: '月給（salary）が350000円以上、または未入力の社員を集計対象にしてください。未入力を0円と見なした部署別の平均月給を、部署名の昇順で表示します。department、平均値の順に取得し、別名は付けません。',
      sql: 'SELECT department, AVG(COALESCE(salary, 0))\nFROM employees\nWHERE salary >= 350000 OR salary IS NULL\nGROUP BY department\nORDER BY department;',
      columns: ['department', 'avg'], rows: [['サポート', 0], ['営業', 175000], ['開発', 400000]],
      hint: 'WHEREでは未入力も残し、各行の給与をCOALESCEで0にしてからAVGを計算します。',
      explanation: '営業は中央さん350000円と富士さんの未入力を0とした2件で175000円です。サポートは0円、開発は400000円です。NULLをWHEREで落としたり、平均後に0を補ったりすると結果が変わります。',
      requirements: ['350000円以上または未入力の社員を対象にする', '各社員の未入力月給を0として平均に含める', '部署別に平均を求める', '部署名の昇順で表示する'],
    },
  ];
  return exercises.map((exercise, index) => ({
    core: {
      id: `coalesce-${String(index + 1).padStart(2, '0')}`, slug: exercise.slug, category: 'coalesce',
      level: exercise.review === 'cumulative review' ? 4 : exercise.review ? 3 : 2,
      setupSql: exercise.setup ?? setup, starterSql: exercise.starter ?? 'SELECT\n  -- ガイドを参考にSQLを書いてください\n',
      expectedResult: { columns: exercise.columns, rows: exercise.rows.map((row) => Object.fromEntries(exercise.columns.map((column, i) => [column, row[i]]))) },
      grading: { mode: 'result', compareRowOrder: exercise.ordered ?? false, compareColumnOrder: true, numericTolerance: 0 },
      compatibility: { dialect: 'postgresql', postgres: true, notes: 'PostgreSQLで実行・検証しています。' },
      source: { type: 'original' }, tags: ['NULL', 'COALESCE', exercise.title, ...(exercise.review ? [exercise.review] : [])],
    },
    translations: { ja: { title: exercise.title, description: exercise.description, solutionSql: exercise.sql,
      hints: [exercise.hint], explanation: exercise.explanation, ...(exercise.requirements ? { requirements: exercise.requirements } : {}) } },
  }));
}
