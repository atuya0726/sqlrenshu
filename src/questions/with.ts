import type { QuestionCore, QuestionTranslation } from '@/lib/types';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };
type Exercise = {
  slug: string; title: string; description: string; sql: string;
  columns: string[]; rows: unknown[][]; hint: string; explanation: string;
  setup?: string; starter?: string; ordered?: boolean;
  review?: 'chapter review' | 'cumulative review'; requirements?: string[];
};
const setup = "CREATE TABLE employees (id integer PRIMARY KEY, name text, department text, salary integer);\nINSERT INTO employees VALUES\n  (1, '青木', '営業', 300000), (2, '北野', '開発', 400000),\n  (3, '中央', '営業', 350000), (4, '大和', '開発', 400000),\n  (5, '恵比寿', 'サポート', NULL);";

export function withEntries(previousEmployees: string): Entry[] {
  const exercises: Exercise[] = [
  {
    "slug": "basic-cte",
    "title": "WITH・AS",
    "description": "employeesの全行・全列をemployee_listというCTEにまとめ、そのCTEから全行・全列を取得してください。行順は問いません。",
    "sql": "WITH employee_list AS (\n  SELECT *\n  FROM employees\n)\nSELECT *\nFROM employee_list;",
    "columns": [
      "id",
      "name",
      "department",
      "salary"
    ],
    "rows": [
      [
        1,
        "青木",
        "営業",
        300000
      ],
      [
        2,
        "北野",
        "開発",
        400000
      ],
      [
        3,
        "中央",
        "営業",
        350000
      ],
      [
        4,
        "大和",
        "開発",
        400000
      ],
      [
        5,
        "恵比寿",
        "サポート",
        null
      ]
    ],
    "hint": "WITH employee_list AS (...)の後ろに、その名前をFROMで参照するSELECTを続けます。",
    "explanation": "CTEには元の5行・4列が入ります。CTEを定義するだけで終わらず、最後のSELECTで結果を取り出します。"
  },
  {
    "slug": "aggregate-filter",
    "title": "WITH・集計結果のWHERE",
    "description": "部署別の給与合計をdepartment_totalsというCTEで求め、合計650000円以上の部署を取得してください。department、SUM(salary)の順で集計し、別名は付けず、外側では全列を取得します。行順は問いません。",
    "sql": "WITH department_totals AS (\n  SELECT department, SUM(salary)\n  FROM employees\n  GROUP BY department\n)\nSELECT *\nFROM department_totals\nWHERE sum >= 650000;",
    "columns": [
      "department",
      "sum"
    ],
    "rows": [
      [
        "営業",
        650000
      ],
      [
        "開発",
        800000
      ]
    ],
    "hint": "CTEが返すSUM(salary)の列名はsumです。外側のWHEREから参照できます。",
    "explanation": "営業の合計は650000円、開発は800000円です。個人のsalaryを650000円以上に絞ると、部署合計を比較することになりません。"
  },
  {
    "slug": "multiple-cte",
    "title": "複数のCTE",
    "description": "営業の全社員をsales_staff、開発の全社員をdevelopment_staffという2つのCTEにまとめてください。開発の平均月給より月給が低い営業社員の全列を取得します。行順は問いません。",
    "sql": "WITH sales_staff AS (\n  SELECT *\n  FROM employees\n  WHERE department = '営業'\n), development_staff AS (\n  SELECT *\n  FROM employees\n  WHERE department = '開発'\n)\nSELECT *\nFROM sales_staff\nWHERE salary < (SELECT AVG(salary) FROM development_staff);",
    "columns": [
      "id",
      "name",
      "department",
      "salary"
    ],
    "rows": [
      [
        1,
        "青木",
        "営業",
        300000
      ],
      [
        3,
        "中央",
        "営業",
        350000
      ]
    ],
    "hint": "CTE同士をカンマで区切り、最後のSELECTでsales_staffとdevelopment_staffを参照します。",
    "explanation": "開発の平均月給は400000円です。営業の青木さん300000円、中央さん350000円の両方が平均未満なので残ります。"
  },
  {
    "slug": "chained-cte",
    "title": "前のCTEの参照",
    "description": "給与入力済みの全社員をknown_salaryというCTEにまとめ、次のdepartment_totalsでknown_salaryを部署別に集計してください。department、SUM(salary)の順に別名なしで求め、最後は全列を取得します。行順は問いません。",
    "sql": "WITH known_salary AS (\n  SELECT *\n  FROM employees\n  WHERE salary IS NOT NULL\n), department_totals AS (\n  SELECT department, SUM(salary)\n  FROM known_salary\n  GROUP BY department\n)\nSELECT *\nFROM department_totals;",
    "columns": [
      "department",
      "sum"
    ],
    "rows": [
      [
        "営業",
        650000
      ],
      [
        "開発",
        800000
      ]
    ],
    "hint": "2つ目のCTEのFROMにはemployeesではなくknown_salaryを書きます。",
    "explanation": "給与未入力の恵比寿さんを最初のCTEで除くため、サポートのグループ自体ができません。元のemployeesを直接集計するとサポート・NULLの行も返ります。"
  },
  {
    "slug": "chapter-review-known-totals",
    "title": "章末問題：複数CTE・集計結果のWHERE",
    "review": "chapter review",
    "description": "給与入力済みの社員をknown_salary、そこから求めた部署別の給与合計をdepartment_totalsにまとめてください。合計700000円以上の部署だけを取得します。集計はdepartment、SUM(salary)の順で別名なしとし、最後は全列を取得します。初期SQLを修正してください。行順は問いません。",
    "starter": "WITH known_salary AS (\n  SELECT *\n  FROM employees\n  WHERE salary IS NOT NULL\n), department_totals AS (\n  SELECT department, SUM(salary)\n  FROM employees\n  GROUP BY department\n)\nSELECT *\nFROM department_totals\nWHERE sum >= 650000;",
    "sql": "WITH known_salary AS (\n  SELECT *\n  FROM employees\n  WHERE salary IS NOT NULL\n), department_totals AS (\n  SELECT department, SUM(salary)\n  FROM known_salary\n  GROUP BY department\n)\nSELECT *\nFROM department_totals\nWHERE sum >= 700000;",
    "columns": [
      "department",
      "sum"
    ],
    "rows": [
      [
        "開発",
        800000
      ]
    ],
    "hint": "2つ目のCTEの参照元と、最後の合計条件を確認します。",
    "explanation": "known_salaryを参照して集計した後、外側のWHEREで合計700000円以上に絞ります。営業650000円は対象外で、開発800000円だけが残ります。",
    "requirements": [
      "給与入力済みの社員を最初のCTEにまとめる",
      "前のCTEから部署別給与合計を求める",
      "集計結果を700000円以上に絞る"
    ]
  },
  {
    "slug": "cumulative-review-active-totals",
    "title": "まとめ問題：WITH・WHERE・GROUP BY・ORDER BY",
    "review": "cumulative review",
    "ordered": true,
    "description": "在籍中（activeがtrue）の社員をactive_staffというCTEにまとめ、次のdepartment_totalsで部署ごとの人数と給与合計を求めてください。人数が1人以上かつ合計500000円以上の部署を、合計の降順、同額なら部署名の昇順で表示します。出力はdepartment、COUNT(*)、SUM(salary)の順で、別名は付けません。",
    "sql": "WITH active_staff AS (\n  SELECT *\n  FROM employees\n  WHERE active = true\n), department_totals AS (\n  SELECT department, COUNT(*), SUM(salary)\n  FROM active_staff\n  GROUP BY department\n)\nSELECT *\nFROM department_totals\nWHERE count >= 1 AND sum >= 500000\nORDER BY sum DESC, department;",
    "columns": [
      "department",
      "count",
      "sum"
    ],
    "rows": [
      [
        "Engineering",
        2,
        1220000
      ],
      [
        "Sales",
        1,
        520000
      ]
    ],
    "hint": "集計前に在籍者を選び、部署別のCTEを作ってから絞り込みとORDER BYを書きます。",
    "explanation": "Engineeringは2人で1220000円、Salesは在籍中のAliceだけで520000円です。Supportは390000円なので対象外です。非在籍のChikaを含めるとSalesの人数と合計が変わります。",
    "requirements": [
      "在籍中の社員だけを集計対象にする",
      "前のCTEから部署別人数と給与合計を求める",
      "人数1人以上かつ合計500000円以上に絞る",
      "合計の降順、部署名の昇順に並べる"
    ]
  }
];
  return exercises.map((exercise, index) => ({
    core: {
      id: `with-${String(index + 1).padStart(2, '0')}`, slug: exercise.slug, category: 'with',
      level: exercise.review === 'cumulative review' ? 4 : exercise.review ? 3 : 2,
      setupSql: exercise.review === 'cumulative review' ? previousEmployees : setup, starterSql: exercise.starter ?? 'WITH\n  -- ガイドを参考にCTEと本体のSELECTを書いてください\n',
      expectedResult: { columns: exercise.columns, rows: exercise.rows.map((row) => Object.fromEntries(exercise.columns.map((column, i) => [column, row[i]]))) },
      grading: { mode: 'result', compareRowOrder: exercise.ordered ?? false, compareColumnOrder: true, numericTolerance: 0 },
      compatibility: { dialect: 'postgresql', postgres: true, notes: 'PostgreSQLで実行・検証しています。' },
      source: { type: 'original' }, tags: ['WITH', 'CTE', exercise.title, ...(exercise.review ? [exercise.review] : [])],
    },
    translations: { ja: { title: exercise.title, description: exercise.description, solutionSql: exercise.sql,
      hints: [exercise.hint], explanation: exercise.explanation, ...(exercise.requirements ? { requirements: exercise.requirements } : {}) } },
  }));
}
