import type { QuestionCore, QuestionTranslation } from '@/lib/types';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };
type Exercise = {
  slug: string; title: string; description: string; sql: string;
  columns: string[]; rows: unknown[][]; hint: string; explanation: string;
  setup?: string; starter?: string; ordered?: boolean;
  review?: 'chapter review' | 'cumulative review'; requirements?: string[];
};
const setup = "CREATE TABLE store_purchases (customer_id integer);\nCREATE TABLE online_purchases (customer_id integer);\nINSERT INTO store_purchases VALUES (1),(1),(1),(2),(3),(NULL);\nINSERT INTO online_purchases VALUES (1),(1),(4),(NULL),(NULL);";
const extraOrders = "\nINSERT INTO orders VALUES (108,3,'2026-01-31',18000,'paid'), (109,4,'2026-01-15',9000,'cancelled'), (110,4,'2026-02-01',10000,'paid'), (111,2,'2026-03-01',12000,'paid'), (112,NULL,'2026-01-10',5000,'paid'), (113,NULL,'2026-02-10',5000,'paid'), (114,1,'2026-01-31',6000,'paid'), (115,1,'2026-02-15',8000,'paid');";

export function intersectExceptEntries(previousCommerce: string): Entry[] {
  const exercises: Exercise[] = [
  {
    "slug": "common-rows",
    "title": "INTERSECT",
    "description": "店舗と通販の両方にある行をINTERSECTで取得してください。全列を比較し、重複は除きます。顧客ID未入力の行も比較対象に含めます。行順は問いません。",
    "sql": "SELECT *\nFROM store_purchases\nINTERSECT\nSELECT *\nFROM online_purchases;",
    "columns": [
      "customer_id"
    ],
    "rows": [
      [
        1
      ],
      [
        null
      ]
    ],
    "hint": "2つのSELECTの間にINTERSECTを書きます。",
    "explanation": "顧客1とNULLの2行です。顧客1が何件あってもALLなしでは1行になります。"
  },
  {
    "slug": "left-only-rows",
    "title": "EXCEPT",
    "description": "店舗の結果にだけある行をEXCEPTで取得してください。店舗を左、通販を右にして全列を比較し、重複は除きます。未入力の行も比較対象に含めます。行順は問いません。",
    "sql": "SELECT *\nFROM store_purchases\nEXCEPT\nSELECT *\nFROM online_purchases;",
    "columns": [
      "customer_id"
    ],
    "rows": [
      [
        2
      ],
      [
        3
      ]
    ],
    "hint": "どちらの結果からどちらを除くのかを確認します。",
    "explanation": "店舗だけの顧客2と3です。通販だけの顧客4を返す問題ではありません。"
  },
  {
    "slug": "common-row-counts",
    "title": "INTERSECT ALL",
    "description": "店舗と通販の全列をINTERSECT ALLで比較してください。同じ行について、両側の少ない方の件数だけ出力します。未入力の行も含め、行順は問いません。",
    "sql": "SELECT *\nFROM store_purchases\nINTERSECT ALL\nSELECT *\nFROM online_purchases;",
    "columns": [
      "customer_id"
    ],
    "rows": [
      [
        1
      ],
      [
        1
      ],
      [
        null
      ]
    ],
    "hint": "ALLを付けると共通する重複件数も残ります。",
    "explanation": "顧客1は3件と2件の小さい方で2行、NULLは1件と2件の小さい方で1行です。"
  },
  {
    "slug": "remaining-row-counts",
    "title": "EXCEPT ALL",
    "description": "店舗から通販の記録をEXCEPT ALLで差し引いてください。全列が同じ行について、店舗の件数から通販の件数を引いた正の残数だけ出力します。未入力の行も比較対象に含め、行順は問いません。",
    "sql": "SELECT *\nFROM store_purchases\nEXCEPT ALL\nSELECT *\nFROM online_purchases;",
    "columns": [
      "customer_id"
    ],
    "rows": [
      [
        1
      ],
      [
        2
      ],
      [
        3
      ]
    ],
    "hint": "店舗を左にし、重複件数を差し引くためALLを付けます。",
    "explanation": "顧客1は3 - 2で1行残ります。顧客2と3も各1行で、NULLの正の残数はありません。"
  },
  {
    "slug": "chapter-review-direction-counts",
    "title": "章末問題：EXCEPT ALL・比較方向・ORDER BY",
    "description": "店舗から通販の記録を1件ずつ差し引き、正の残数だけを取得してください。全列を比較し、顧客IDの昇順で表示します。初期SQLの比較方向と重複の扱いを修正してください。",
    "sql": "SELECT *\nFROM store_purchases\nEXCEPT ALL\nSELECT *\nFROM online_purchases\nORDER BY customer_id;",
    "columns": [
      "customer_id"
    ],
    "rows": [
      [
        1
      ],
      [
        2
      ],
      [
        3
      ]
    ],
    "hint": "店舗を左に戻し、EXCEPT ALLを使います。",
    "explanation": "顧客1・2・3が各1行です。左右を逆にすると顧客4とNULL、ALLを外すと顧客2・3だけになるので、両方を直します。",
    "review": "chapter review",
    "ordered": true,
    "starter": "SELECT *\nFROM online_purchases\nEXCEPT\nSELECT *\nFROM store_purchases\nORDER BY customer_id;",
    "requirements": [
      "店舗から通販を差し引く方向にする",
      "重複記録を1件ずつ差し引く",
      "残った行を顧客IDの昇順に並べる"
    ]
  },
  {
    "slug": "cumulative-review-repeat-customers",
    "title": "まとめ問題：INTERSECT・日付・WHERE・WITH・JOIN・ORDER BY",
    "description": "2026年1月と2月の両方に支払済み（statusがpaid）の注文がある顧客を、月ごとの顧客IDの結果をINTERSECTで比較して取得してください。共通するIDをCTEにまとめ、customersと結合して顧客の全列を1人1行で表示します。顧客IDの昇順に並べ、未入力の顧客IDはどの顧客にも結び付けません。",
    "sql": "WITH repeat_customers AS (\n  SELECT customer_id FROM orders\n  WHERE status = 'paid'\n    AND ordered_on >= DATE '2026-01-01'\n    AND ordered_on < DATE '2026-02-01'\n  INTERSECT\n  SELECT customer_id FROM orders\n  WHERE status = 'paid'\n    AND ordered_on >= DATE '2026-02-01'\n    AND ordered_on < DATE '2026-03-01'\n)\nSELECT customers.*\nFROM customers\nINNER JOIN repeat_customers ON repeat_customers.customer_id = customers.id\nORDER BY customers.id;",
    "columns": [
      "id",
      "name",
      "region"
    ],
    "rows": [
      [
        1,
        "青木商店",
        "東"
      ],
      [
        3,
        "中央商事",
        "東"
      ]
    ],
    "hint": "月ごとに開始以上・翌月初未満で絞り、支払済み条件を両方に付けます。",
    "explanation": "青木商店と中央商事は1月・2月の両方に支払済み注文があります。大和食品は1月が取消だけなので入りません。北野物産の3月1日の支払済みは2月に含めません。NULLの共通行は顧客との結合に一致しません。",
    "review": "cumulative review",
    "ordered": true,
    "requirements": [
      "両方の月で支払済み注文だけを対象にする",
      "1月と2月の顧客IDの共通行をCTEで求める",
      "顧客表の全列を1人1行で表示する",
      "月の境界を正しく指定し、顧客IDの昇順に並べる"
    ]
  }
];
  return exercises.map((exercise, index) => ({
    core: {
      id: `intersect-except-${String(index + 1).padStart(2, '0')}`, slug: exercise.slug, category: 'intersect-except',
      level: exercise.review === 'cumulative review' ? 4 : exercise.review ? 3 : 2,
      setupSql: exercise.review === 'cumulative review' ? previousCommerce + extraOrders : setup, starterSql: exercise.starter ?? (exercise.review === 'cumulative review' ? 'WITH repeat_customers AS (\n  -- 月ごとの結果を比較してください\n)\nSELECT customers.*\nFROM customers\n' : 'SELECT *\nFROM store_purchases\n-- ガイドを参考に通販の結果と比較してください\n'),
      expectedResult: { columns: exercise.columns, rows: exercise.rows.map((row) => Object.fromEntries(exercise.columns.map((column, i) => [column, row[i]]))) },
      grading: { mode: 'result', compareRowOrder: exercise.ordered ?? false, compareColumnOrder: true, numericTolerance: 0 },
      compatibility: { dialect: 'postgresql', postgres: true, notes: 'PostgreSQLで実行・検証しています。' },
      source: { type: 'original' }, tags: ['INTERSECT', 'EXCEPT', exercise.title, ...(exercise.review ? [exercise.review] : [])],
    },
    translations: { ja: { title: exercise.title, description: exercise.description, solutionSql: exercise.sql,
      hints: [exercise.hint], explanation: exercise.explanation, ...(exercise.requirements ? { requirements: exercise.requirements } : {}) } },
  }));
}
