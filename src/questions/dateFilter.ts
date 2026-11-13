import type { QuestionCore, QuestionTranslation } from '@/lib/types';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };
type Exercise = {
  slug: string; title: string; description: string; sql: string;
  columns: string[]; rows: unknown[][]; hint: string; explanation: string;
  setup?: string; starter?: string; ordered?: boolean;
  review?: 'chapter review' | 'cumulative review'; requirements?: string[];
};
const setup = "CREATE TABLE orders (id integer PRIMARY KEY, ordered_at timestamp without time zone, delivery_on date, amount integer);\nINSERT INTO orders VALUES\n  (1, '2026-08-31 23:59:59.999999', '2026-09-01', 1000),\n  (2, '2026-09-01 00:00:00', '2026-09-01', 2000),\n  (3, '2026-09-01 12:30:00', '2026-09-02', 3000),\n  (4, '2026-09-30 23:59:59.999999', '2026-09-30', 4000),\n  (5, '2026-10-01 00:00:00', '2026-10-01', 5000),\n  (6, NULL, NULL, 6000);";
const boundaryOrders = "\nINSERT INTO orders VALUES (108,1,'2026-01-01',4000,'paid'), (109,1,'2026-03-01',99999,'paid'), (110,1,'2026-02-28',90000,'cancelled');";

export function dateFilterEntries(previousCommerce: string): Entry[] {
  const exercises: Exercise[] = [
  {
    "slug": "date-equality",
    "title": "DATE・等値比較",
    "description": "配送予定日が2026年9月1日の注文を取得してください。全列を取得し、行順は問いません。",
    "sql": "SELECT *\nFROM orders\nWHERE delivery_on = DATE '2026-09-01';",
    "columns": [
      "id",
      "ordered_at",
      "delivery_on",
      "amount"
    ],
    "rows": [
      [
        1,
        "2026-08-31 23:59:59.999999",
        "2026-09-01",
        1000
      ],
      [
        2,
        "2026-09-01 00:00:00",
        "2026-09-01",
        2000
      ]
    ],
    "hint": "delivery_onは時刻を持たない日付なので、DATEリテラルとの等値で判定できます。",
    "explanation": "配送予定日が9月1日のID1と2が残ります。注文日時のordered_atではなく、配送予定日のdelivery_onを比較します。"
  },
  {
    "slug": "inclusive-date-range",
    "title": "DATE・以降と以前",
    "description": "配送予定日が2026年9月2日以降、9月30日以前の注文を取得してください。両端の日を含みます。全列を取得し、行順は問いません。",
    "sql": "SELECT *\nFROM orders\nWHERE delivery_on >= DATE '2026-09-02'\n  AND delivery_on <= DATE '2026-09-30';",
    "columns": [
      "id",
      "ordered_at",
      "delivery_on",
      "amount"
    ],
    "rows": [
      [
        3,
        "2026-09-01 12:30:00",
        "2026-09-02",
        3000
      ],
      [
        4,
        "2026-09-30 23:59:59.999999",
        "2026-09-30",
        4000
      ]
    ],
    "hint": ">=と<=をANDでつなぎます。",
    "explanation": "指定日ちょうどのID3と4を含みます。NULLの配送日は条件を満たさないため対象外です。"
  },
  {
    "slug": "single-day-range",
    "title": "TIMESTAMP・1日の範囲",
    "description": "2026年9月1日の0時から、その日が終わるまでに注文されたデータを取得してください。全列を取得し、行順は問いません。",
    "sql": "SELECT *\nFROM orders\nWHERE ordered_at >= TIMESTAMP '2026-09-01 00:00:00'\n  AND ordered_at < TIMESTAMP '2026-09-02 00:00:00';",
    "columns": [
      "id",
      "ordered_at",
      "delivery_on",
      "amount"
    ],
    "rows": [
      [
        2,
        "2026-09-01 00:00:00",
        "2026-09-01",
        2000
      ],
      [
        3,
        "2026-09-01 12:30:00",
        "2026-09-02",
        3000
      ]
    ],
    "hint": "当日0時以上、翌日0時未満にします。",
    "explanation": "0時ちょうどのID2と昼のID3が残ります。0時と等しい条件だけではID3を取得できません。"
  },
  {
    "slug": "single-month-range",
    "title": "TIMESTAMP・1か月の範囲",
    "description": "2026年9月中に注文されたデータを取得してください。9月1日0時は含み、10月1日0時は含みません。全列を取得し、行順は問いません。",
    "sql": "SELECT *\nFROM orders\nWHERE ordered_at >= TIMESTAMP '2026-09-01 00:00:00'\n  AND ordered_at < TIMESTAMP '2026-10-01 00:00:00';",
    "columns": [
      "id",
      "ordered_at",
      "delivery_on",
      "amount"
    ],
    "rows": [
      [
        2,
        "2026-09-01 00:00:00",
        "2026-09-01",
        2000
      ],
      [
        3,
        "2026-09-01 12:30:00",
        "2026-09-02",
        3000
      ],
      [
        4,
        "2026-09-30 23:59:59.999999",
        "2026-09-30",
        4000
      ]
    ],
    "hint": "月初以上、翌月初未満で1か月を表します。",
    "explanation": "ID2・3・4の3件です。9月30日23:59:59.999999のID4は対象、10月1日0時のID5は対象外です。"
  },
  {
    "slug": "chapter-review-order-delivery",
    "title": "章末問題：注文日時の期間・配送日の比較",
    "description": "2026年9月中に注文され、配送予定日が9月2日以降の注文を取得してください。全列を取得し、行順は問いません。初期SQLの注文日時の期間指定を修正してください。",
    "sql": "SELECT *\nFROM orders\nWHERE ordered_at >= TIMESTAMP '2026-09-01 00:00:00'\n  AND ordered_at < TIMESTAMP '2026-10-01 00:00:00'\n  AND delivery_on >= DATE '2026-09-02';",
    "columns": [
      "id",
      "ordered_at",
      "delivery_on",
      "amount"
    ],
    "rows": [
      [
        3,
        "2026-09-01 12:30:00",
        "2026-09-02",
        3000
      ],
      [
        4,
        "2026-09-30 23:59:59.999999",
        "2026-09-30",
        4000
      ]
    ],
    "hint": "注文日時は翌月初未満、配送予定日は指定日以上です。",
    "explanation": "ID3と4が残ります。月初・月末を含む期間を作ったうえで、配送予定日が9月1日のID2を除きます。",
    "review": "chapter review",
    "starter": "SELECT *\nFROM orders\nWHERE ordered_at BETWEEN TIMESTAMP '2026-09-01 00:00:00'\n  AND TIMESTAMP '2026-09-30 00:00:00'\n  AND delivery_on >= DATE '2026-09-02';",
    "requirements": [
      "注文日時が9月初以上、10月初未満の注文を選ぶ",
      "月末の秒以下の時刻を取りこぼさない",
      "配送予定日が9月2日以降の注文を選ぶ"
    ]
  },
  {
    "slug": "cumulative-review-paid-period",
    "title": "まとめ問題：日付・WHERE・WITH・JOIN・GROUP BY・HAVING・ORDER BY",
    "description": "2026年1月1日から2月末までの支払済み（statusがpaid）の注文をCTEにまとめてください。顧客と結合し、期間内の顧客別注文件数と金額合計を求めます。合計18000円以上の顧客を、合計の降順、同額なら顧客名の昇順に表示してください。出力は顧客名、COUNT(*)、SUM(金額)の順で、別名は付けません。",
    "sql": "WITH period_orders AS (\n  SELECT *\n  FROM orders\n  WHERE ordered_on >= DATE '2026-01-01'\n    AND ordered_on < DATE '2026-03-01'\n    AND status = 'paid'\n)\nSELECT customers.name, COUNT(*), SUM(period_orders.amount)\nFROM customers\nINNER JOIN period_orders ON customers.id = period_orders.customer_id\nGROUP BY customers.name\nHAVING SUM(period_orders.amount) >= 18000\nORDER BY SUM(period_orders.amount) DESC, customers.name;",
    "columns": [
      "name",
      "count",
      "sum"
    ],
    "rows": [
      [
        "北野物産",
        1,
        25000
      ],
      [
        "青木商店",
        3,
        24000
      ],
      [
        "中央商事",
        1,
        18000
      ]
    ],
    "hint": "期間は1月1日以上、3月1日未満です。支払済みの条件も集計前に指定します。",
    "explanation": "青木商店は1月1日の4000円を含めて3件24000円です。3月1日の99999円と2月28日のcancelled注文は除きます。北野物産25000円、中央商事18000円も残り、合計の降順に並びます。",
    "review": "cumulative review",
    "ordered": true,
    "requirements": [
      "1月1日を含み、3月1日を含まない期間にする",
      "支払済みの注文だけを集計する",
      "顧客別件数と合計を求め、18000円以上に絞る",
      "合計の降順、顧客名の昇順で表示する"
    ]
  }
];
  return exercises.map((exercise, index) => ({
    core: {
      id: `date-filter-${String(index + 1).padStart(2, '0')}`, slug: exercise.slug, category: 'date-filter',
      level: exercise.review === 'cumulative review' ? 4 : exercise.review ? 3 : 2,
      setupSql: exercise.review === 'cumulative review' ? previousCommerce + boundaryOrders : setup, starterSql: exercise.starter ?? (exercise.review === 'cumulative review' ? 'WITH period_orders AS (\n  -- 期間と支払状態で絞り込んでください\n)\nSELECT\n  -- 顧客別に集計してください\n' : 'SELECT *\nFROM orders\nWHERE ;'),
      expectedResult: { columns: exercise.columns, rows: exercise.rows.map((row) => Object.fromEntries(exercise.columns.map((column, i) => [column, row[i]]))) },
      grading: { mode: 'result', compareRowOrder: exercise.ordered ?? false, compareColumnOrder: true, numericTolerance: 0 },
      compatibility: { dialect: 'postgresql', postgres: true, notes: 'PostgreSQLで実行・検証しています。' },
      source: { type: 'original' }, tags: ['DATE', 'TIMESTAMP', exercise.title, ...(exercise.review ? [exercise.review] : [])],
    },
    translations: { ja: { title: exercise.title, description: exercise.description, solutionSql: exercise.sql,
      hints: [exercise.hint], explanation: exercise.explanation, ...(exercise.requirements ? { requirements: exercise.requirements } : {}) } },
  }));
}

export { setup as dateFilterSetup };
