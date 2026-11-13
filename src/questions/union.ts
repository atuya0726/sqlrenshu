import type { QuestionCore, QuestionTranslation } from '@/lib/types';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };
type Exercise = {
  slug: string; title: string; description: string; sql: string;
  columns: string[]; rows: unknown[][]; hint: string; explanation: string;
  setup?: string; starter?: string; ordered?: boolean;
  review?: 'chapter review' | 'cumulative review'; requirements?: string[];
};
const setup = "CREATE TABLE morning_results (name text, score integer);\nCREATE TABLE evening_results (name text, score integer);\nINSERT INTO morning_results VALUES ('青木', 10), ('北野', 20), ('青木', 10);\nINSERT INTO evening_results VALUES ('青木', 10), ('中央', 30), ('北野', 25);";
const contractorSetup = "\nCREATE TABLE contractors (id integer PRIMARY KEY, name text NOT NULL, department text NOT NULL, salary integer NOT NULL, active boolean NOT NULL);\nINSERT INTO contractors VALUES (6, 'Fumi', 'Sales', 520000, true), (7, 'Gaku', 'Engineering', 610000, true), (8, 'Haru', 'Support', 900000, false);";

export function unionEntries(previousEmployees: string): Entry[] {
  const exercises: Exercise[] = [
  {
    "slug": "union-all",
    "title": "UNION ALL",
    "description": "午前と午後の測定記録をUNION ALLでつなぎ、全列を取得してください。同じ内容の記録も別々の行としてすべて残します。行順は問いません。",
    "sql": "SELECT *\nFROM morning_results\nUNION ALL\nSELECT *\nFROM evening_results;",
    "columns": [
      "name",
      "score"
    ],
    "rows": [
      [
        "青木",
        10
      ],
      [
        "北野",
        20
      ],
      [
        "青木",
        10
      ],
      [
        "青木",
        10
      ],
      [
        "中央",
        30
      ],
      [
        "北野",
        25
      ]
    ],
    "hint": "2つのSELECTの間にUNION ALLを書きます。",
    "explanation": "午前3件と午後3件の計6件です。青木さん10点の3件もそのまま残ります。"
  },
  {
    "slug": "union-distinct",
    "title": "UNION",
    "description": "午前と午後の全列の記録をUNIONでつなぎ、名前と点数の両方が同じ行を1行にまとめてください。行順は問いません。",
    "sql": "SELECT *\nFROM morning_results\nUNION\nSELECT *\nFROM evening_results;",
    "columns": [
      "name",
      "score"
    ],
    "rows": [
      [
        "青木",
        10
      ],
      [
        "北野",
        20
      ],
      [
        "中央",
        30
      ],
      [
        "北野",
        25
      ]
    ],
    "hint": "重複を除く場合はALLを付けません。",
    "explanation": "青木さん10点は1行になります。北野さんの20点と25点は別の組み合わせなので両方残り、全体は4行です。"
  },
  {
    "slug": "aligned-columns",
    "title": "列数・型・並び順",
    "description": "午前と午後の記録を、点数、名前の順に列をそろえてUNION ALLでつないでください。同じ記録も残し、別名は付けません。初期SQLの列の並びを修正します。行順は問いません。",
    "sql": "SELECT score, name\nFROM morning_results\nUNION ALL\nSELECT score, name\nFROM evening_results;",
    "columns": [
      "score",
      "name"
    ],
    "rows": [
      [
        10,
        "青木"
      ],
      [
        20,
        "北野"
      ],
      [
        10,
        "青木"
      ],
      [
        10,
        "青木"
      ],
      [
        30,
        "中央"
      ],
      [
        25,
        "北野"
      ]
    ],
    "hint": "1列目同士、2列目同士が対応します。両方のSELECTの順を確認します。",
    "explanation": "両方をscore、nameの順にすることで数値同士、文字列同士が対応します。列の並びを変えても記録は6件のままです。",
    "starter": "SELECT score, name\nFROM morning_results\nUNION ALL\nSELECT name, score\nFROM evening_results;"
  },
  {
    "slug": "order-combined-results",
    "title": "UNION ALL・ORDER BY",
    "description": "午前と午後の記録をUNION ALLでつなぎ、全列を取得してください。重複を残した6件全体を点数の降順、同点なら名前の昇順に並べます。",
    "sql": "SELECT *\nFROM morning_results\nUNION ALL\nSELECT *\nFROM evening_results\nORDER BY score DESC, name;",
    "columns": [
      "name",
      "score"
    ],
    "rows": [
      [
        "中央",
        30
      ],
      [
        "北野",
        25
      ],
      [
        "北野",
        20
      ],
      [
        "青木",
        10
      ],
      [
        "青木",
        10
      ],
      [
        "青木",
        10
      ]
    ],
    "hint": "ORDER BYは2つ目のSELECTの後ろに1回だけ書きます。",
    "explanation": "午後の中央さん30点が先頭です。午前の行、午後の行という順ではなく、全体を点数で並べます。",
    "ordered": true
  },
  {
    "slug": "chapter-review-distinct-order",
    "title": "章末問題：列の対応・UNION・ORDER BY",
    "description": "点数、名前の順にそろえた午前・午後の記録をつなぎ、同じ点数・名前の組み合わせは1行にまとめてください。点数の降順、同点なら名前の昇順で表示します。別名は付けず、初期SQLを修正してください。",
    "sql": "SELECT score, name\nFROM morning_results\nUNION\nSELECT score, name\nFROM evening_results\nORDER BY score DESC, name;",
    "columns": [
      "score",
      "name"
    ],
    "rows": [
      [
        30,
        "中央"
      ],
      [
        25,
        "北野"
      ],
      [
        20,
        "北野"
      ],
      [
        10,
        "青木"
      ]
    ],
    "hint": "列の順序、ALLの有無、最後のORDER BYを確認します。",
    "explanation": "重複を除くので4行です。列は点数、名前の順に対応させ、記録全体を点数の降順に並べます。",
    "review": "chapter review",
    "ordered": true,
    "starter": "SELECT score, name\nFROM morning_results\nUNION ALL\nSELECT score, name\nFROM evening_results\nORDER BY score;",
    "requirements": [
      "両方のSELECTをscore、nameの順にそろえる",
      "全列が同じ重複行を1行にまとめる",
      "結果全体を点数の降順、名前の昇順に並べる"
    ]
  },
  {
    "slug": "cumulative-review-active-payroll",
    "title": "まとめ問題：UNION ALL・WITH・WHERE・GROUP BY・HAVING・ORDER BY",
    "description": "employeesとcontractorsの在籍中（activeがtrue）の人を、department、salaryの2列でUNION ALLを使ってCTEにまとめてください。同じ部署・給与の人もそれぞれ1人として数えます。部署別に人数と給与合計を求め、2人以上の部署を合計の降順、同額なら部署名の昇順で表示してください。出力はdepartment、COUNT(*)、SUM(salary)の順で、別名は付けません。",
    "sql": "WITH combined AS (\n  SELECT department, salary\n  FROM employees\n  WHERE active = true\n  UNION ALL\n  SELECT department, salary\n  FROM contractors\n  WHERE active = true\n)\nSELECT department, COUNT(*), SUM(salary)\nFROM combined\nGROUP BY department\nHAVING COUNT(*) >= 2\nORDER BY SUM(salary) DESC, department;",
    "columns": [
      "department",
      "count",
      "sum"
    ],
    "rows": [
      [
        "Engineering",
        3,
        1830000
      ],
      [
        "Sales",
        2,
        1040000
      ]
    ],
    "hint": "両方の表を在籍者に絞ってUNION ALLでつなぎ、CTEの結果を集計します。",
    "explanation": "Engineeringは給与610000円の3人、Salesは520000円の2人です。UNIONで同額をまとめると人数・合計が小さくなります。非在籍者を含めるとSalesやSupportの集計も変わります。",
    "review": "cumulative review",
    "ordered": true,
    "requirements": [
      "両方の表で在籍中の人だけを対象にする",
      "部署・給与が同じ別人も重複除去せず残す",
      "部署別人数と給与合計を求め、2人以上に絞る",
      "給与合計の降順、部署名の昇順に並べる"
    ]
  }
];
  return exercises.map((exercise, index) => ({
    core: {
      id: `union-${String(index + 1).padStart(2, '0')}`, slug: exercise.slug, category: 'union',
      level: exercise.review === 'cumulative review' ? 4 : exercise.review ? 3 : 2,
      setupSql: exercise.review === 'cumulative review' ? previousEmployees + contractorSetup : setup, starterSql: exercise.starter ?? (exercise.review === 'cumulative review' ? 'WITH combined AS (\n  -- 在籍者を2つの表から取り出してつなぎます\n)\nSELECT\n  -- 部署別に集計してください\nFROM combined\n' : 'SELECT *\nFROM morning_results\n-- ガイドを参考に2つの結果をつないでください\n'),
      expectedResult: { columns: exercise.columns, rows: exercise.rows.map((row) => Object.fromEntries(exercise.columns.map((column, i) => [column, row[i]]))) },
      grading: { mode: 'result', compareRowOrder: exercise.ordered ?? false, compareColumnOrder: true, numericTolerance: 0 },
      compatibility: { dialect: 'postgresql', postgres: true, notes: 'PostgreSQLで実行・検証しています。' },
      source: { type: 'original' }, tags: ['UNION', exercise.title, ...(exercise.review ? [exercise.review] : [])],
    },
    translations: { ja: { title: exercise.title, description: exercise.description, solutionSql: exercise.sql,
      hints: [exercise.hint], explanation: exercise.explanation, ...(exercise.requirements ? { requirements: exercise.requirements } : {}) } },
  }));
}
