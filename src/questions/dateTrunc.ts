import { dateFilterSetup } from './dateFilter';
import type { QuestionCore, QuestionTranslation } from '@/lib/types';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };
type Exercise = {
  slug: string; title: string; description: string; sql: string;
  columns: string[]; rows: unknown[][]; hint: string; explanation: string;
  setup?: string; starter?: string; ordered?: boolean;
  review?: 'chapter review' | 'cumulative review'; requirements?: string[];
};
const setup = "CREATE TABLE orders (id integer PRIMARY KEY, ordered_at timestamp without time zone, amount integer);\nINSERT INTO orders VALUES\n  (1, '2025-09-10 10:00:00', 1000),\n  (2, '2026-09-01 00:00:00', 2000),\n  (3, '2026-09-30 23:59:59.999999', 3000),\n  (4, '2026-11-01 00:00:00', 4000),\n  (5, '2026-11-20 12:00:00', 5000),\n  (6, '2026-12-01 00:00:00', 6000);";
const extraOrders = "\nALTER TABLE orders ADD COLUMN status text NOT NULL DEFAULT 'paid';\nUPDATE orders SET status = 'cancelled' WHERE id = 3;\nINSERT INTO orders VALUES (7, '2026-11-01 00:00:00', '2026-11-01', 10000, 'paid'), (8, '2026-09-15 10:00:00', '2026-09-16', 90000, 'cancelled');";

export function dateTruncEntries(): Entry[] {
  const exercises: Exercise[] = [
  {
    "slug": "month-start",
    "title": "DATE_TRUNC・月初",
    "description": "全注文の全列の末尾に、注文日時を月初0時にそろえた値をDATE_TRUNCで追加してください。別名は付けず、行順は問いません。",
    "sql": "SELECT *, DATE_TRUNC('month', ordered_at)\nFROM orders;",
    "columns": [
      "id",
      "ordered_at",
      "amount",
      "date_trunc"
    ],
    "rows": [
      [
        1,
        "2025-09-10 10:00:00",
        1000,
        "2025-09-01 00:00:00"
      ],
      [
        2,
        "2026-09-01 00:00:00",
        2000,
        "2026-09-01 00:00:00"
      ],
      [
        3,
        "2026-09-30 23:59:59.999999",
        3000,
        "2026-09-01 00:00:00"
      ],
      [
        4,
        "2026-11-01 00:00:00",
        4000,
        "2026-11-01 00:00:00"
      ],
      [
        5,
        "2026-11-20 12:00:00",
        5000,
        "2026-11-01 00:00:00"
      ],
      [
        6,
        "2026-12-01 00:00:00",
        6000,
        "2026-12-01 00:00:00"
      ]
    ],
    "hint": "第1引数を'month'、第2引数を注文日時にします。",
    "explanation": "2026年9月の2件は同じ2026-09-01 00:00:00になります。2025年9月は別の月初で、元の注文日時は変わりません。"
  },
  {
    "slug": "monthly-count",
    "title": "DATE_TRUNC・GROUP BY・COUNT",
    "description": "月別の注文件数を求めてください。月初の日時、COUNT(*)の順に取得し、別名は付けません。行順は問いません。",
    "sql": "SELECT DATE_TRUNC('month', ordered_at), COUNT(*)\nFROM orders\nGROUP BY DATE_TRUNC('month', ordered_at);",
    "columns": [
      "date_trunc",
      "count"
    ],
    "rows": [
      [
        "2025-09-01 00:00:00",
        1
      ],
      [
        "2026-09-01 00:00:00",
        2
      ],
      [
        "2026-11-01 00:00:00",
        2
      ],
      [
        "2026-12-01 00:00:00",
        1
      ]
    ],
    "hint": "SELECTとGROUP BYで同じ月初の式を使います。",
    "explanation": "2026年9月と11月は各2件です。異なる年の9月は同じグループにしません。"
  },
  {
    "slug": "monthly-sum",
    "title": "DATE_TRUNC・GROUP BY・SUM",
    "description": "月別の注文金額合計を求めてください。月初の日時、SUM(amount)の順に取得し、別名は付けません。行順は問いません。",
    "sql": "SELECT DATE_TRUNC('month', ordered_at), SUM(amount)\nFROM orders\nGROUP BY DATE_TRUNC('month', ordered_at);",
    "columns": [
      "date_trunc",
      "sum"
    ],
    "rows": [
      [
        "2025-09-01 00:00:00",
        1000
      ],
      [
        "2026-09-01 00:00:00",
        5000
      ],
      [
        "2026-11-01 00:00:00",
        9000
      ],
      [
        "2026-12-01 00:00:00",
        6000
      ]
    ],
    "hint": "金額の合計にはSUMを使い、グループの単位は月初の式にします。",
    "explanation": "2026年9月は5000円、11月は9000円です。件数ではなく金額を合計します。"
  },
  {
    "slug": "period-monthly-sum",
    "title": "期間指定・月別集計・ORDER BY",
    "description": "2026年9月から11月までの注文を月別に集計し、月初の日時、金額合計の順に取得してください。月の昇順に表示し、別名は付けません。注文がない月の行は作りません。",
    "sql": "SELECT DATE_TRUNC('month', ordered_at), SUM(amount)\nFROM orders\nWHERE ordered_at >= TIMESTAMP '2026-09-01 00:00:00'\n  AND ordered_at < TIMESTAMP '2026-12-01 00:00:00'\nGROUP BY DATE_TRUNC('month', ordered_at)\nORDER BY DATE_TRUNC('month', ordered_at);",
    "columns": [
      "date_trunc",
      "sum"
    ],
    "rows": [
      [
        "2026-09-01 00:00:00",
        5000
      ],
      [
        "2026-11-01 00:00:00",
        9000
      ]
    ],
    "hint": "WHEREは9月初以上、12月初未満です。集計後に月初で並べます。",
    "explanation": "2025年9月と12月1日は対象外です。10月は注文がないため出力されず、9月・11月の2行になります。",
    "ordered": true
  },
  {
    "slug": "chapter-review-count-sum",
    "title": "章末問題：月別件数・金額合計・HAVING",
    "description": "全注文を月別に集計し、注文が2件以上の月だけ表示してください。月初の日時、COUNT(*)、SUM(amount)の順に取得し、月の昇順に並べます。別名は付けず、初期SQLの集計単位を修正してください。",
    "sql": "SELECT DATE_TRUNC('month', ordered_at), COUNT(*), SUM(amount)\nFROM orders\nGROUP BY DATE_TRUNC('month', ordered_at)\nHAVING COUNT(*) >= 2\nORDER BY DATE_TRUNC('month', ordered_at);",
    "columns": [
      "date_trunc",
      "count",
      "sum"
    ],
    "rows": [
      [
        "2026-09-01 00:00:00",
        2,
        5000
      ],
      [
        "2026-11-01 00:00:00",
        2,
        9000
      ]
    ],
    "hint": "元の注文日時ではなく、月初にそろえた式でグループ化します。",
    "explanation": "2026年9月と11月だけが各2件で残ります。元の日時でまとめると全グループが1件となり、2件以上の条件を満たしません。",
    "ordered": true,
    "review": "chapter review",
    "starter": "SELECT DATE_TRUNC('month', ordered_at), COUNT(*), SUM(amount)\nFROM orders\nGROUP BY ordered_at\nHAVING COUNT(*) >= 2\nORDER BY DATE_TRUNC('month', ordered_at);",
    "requirements": [
      "DATE_TRUNCで月別にグループ化する",
      "月別件数と金額合計を求める",
      "2件以上の月だけを月の昇順で表示する"
    ]
  },
  {
    "slug": "cumulative-review-paid-months",
    "title": "まとめ問題：日付・WHERE・WITH・DATE_TRUNC・GROUP BY・HAVING・ORDER BY",
    "description": "2026年9月から10月までの支払済み（statusがpaid）の注文をCTEにまとめてください。月別に件数と金額合計を求め、合計5000円以上の月を月の昇順で表示します。出力は月初の日時、COUNT(*)、SUM(amount)の順で、別名は付けません。注文日時未入力の行は対象外です。",
    "sql": "WITH period_orders AS (\n  SELECT *\n  FROM orders\n  WHERE ordered_at >= TIMESTAMP '2026-09-01 00:00:00'\n    AND ordered_at < TIMESTAMP '2026-11-01 00:00:00'\n    AND status = 'paid'\n)\nSELECT DATE_TRUNC('month', ordered_at), COUNT(*), SUM(amount)\nFROM period_orders\nGROUP BY DATE_TRUNC('month', ordered_at)\nHAVING SUM(amount) >= 5000\nORDER BY DATE_TRUNC('month', ordered_at);",
    "columns": [
      "date_trunc",
      "count",
      "sum"
    ],
    "rows": [
      [
        "2026-09-01 00:00:00",
        2,
        6000
      ],
      [
        "2026-10-01 00:00:00",
        1,
        5000
      ]
    ],
    "hint": "支払状態と元の注文日時の期間を先に選び、CTEの結果を月別に集計します。",
    "explanation": "9月はID2・4で2件6000円、10月はID5で1件5000円です。取消のID3・8と11月初のID7、期間外のID1、日時NULLのID6は対象外です。",
    "review": "cumulative review",
    "ordered": true,
    "requirements": [
      "9月初以上、11月初未満の支払済み注文だけを対象にする",
      "月末の秒以下の時刻を取りこぼさない",
      "月別の件数と合計を求め、5000円以上の月を残す",
      "月初の日時の昇順に並べる"
    ]
  }
];
  return exercises.map((exercise, index) => ({
    core: {
      id: `date-trunc-${String(index + 1).padStart(2, '0')}`, slug: exercise.slug, category: 'date-trunc',
      level: exercise.review === 'cumulative review' ? 4 : exercise.review ? 3 : 2,
      setupSql: exercise.review === 'cumulative review' ? dateFilterSetup + extraOrders : setup, starterSql: exercise.starter ?? (exercise.review === 'cumulative review' ? 'WITH period_orders AS (\n  -- 期間内の支払済み注文を選んでください\n)\nSELECT\n  -- 月別に集計してください\nFROM period_orders\n' : 'SELECT\n  -- ガイドを参考にSQLを書いてください\nFROM orders;'),
      expectedResult: { columns: exercise.columns, rows: exercise.rows.map((row) => Object.fromEntries(exercise.columns.map((column, i) => [column, row[i]]))) },
      grading: { mode: 'result', compareRowOrder: exercise.ordered ?? false, compareColumnOrder: true, numericTolerance: 0 },
      compatibility: { dialect: 'postgresql', postgres: true, notes: 'PostgreSQLで実行・検証しています。' },
      source: { type: 'original' }, tags: ['DATE_TRUNC', exercise.title, ...(exercise.review ? [exercise.review] : [])],
    },
    translations: { ja: { title: exercise.title, description: exercise.description, solutionSql: exercise.sql,
      hints: [exercise.hint], explanation: exercise.explanation, ...(exercise.requirements ? { requirements: exercise.requirements } : {}) } },
  }));
}
