import type { QuestionCore, QuestionTranslation } from '@/lib/types';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };
type Exercise = {
  slug: string; title: string; description: string; sql: string;
  columns: string[]; rows: unknown[][]; hint: string; explanation: string;
  setup?: string; starter?: string; ordered?: boolean;
  review?: 'chapter review' | 'cumulative review'; requirements?: string[];
};
const setup = "CREATE TABLE customers (id integer PRIMARY KEY, name text NOT NULL);\nCREATE TABLE orders (id integer PRIMARY KEY, customer_id integer REFERENCES customers(id), amount integer, status text);\nINSERT INTO customers VALUES (1,'青木商店'),(2,'北野物産'),(3,'中央商事'),(4,'大和食品');\nINSERT INTO orders VALUES (101,1,12000,'paid'),(102,1,20000,'paid'),(103,2,8000,'cancelled'),(104,4,30000,'paid'),(105,4,9000,'cancelled'),(106,NULL,5000,'paid');";
const extraOrders = "\nINSERT INTO customers VALUES (6,'富士商店','東'),(7,'銀河商店','東');\nINSERT INTO orders VALUES (108,6,'2026-01-15',11000,'paid'), (109,6,'2026-02-01',7000,'cancelled'), (110,7,'2026-01-01',9000,'paid'), (111,7,'2026-03-01',12000,'cancelled'), (112,NULL,'2026-01-20',5000,'paid');";

export function existsEntries(previousCommerce: string): Entry[] {
  const exercises: Exercise[] = [
  {
    "slug": "existence-boolean",
    "title": "EXISTS",
    "description": "ordersに注文が1件でもあるかをEXISTSで確認し、真偽値を1行1列で取得してください。別名は付けません。",
    "sql": "SELECT EXISTS (\n  SELECT 1\n  FROM orders\n);",
    "columns": [
      "exists"
    ],
    "rows": [
      [
        true
      ]
    ],
    "hint": "SELECT EXISTS (...)で存在するかを1つの真偽値にできます。",
    "explanation": "注文が6件あるのでtrueです。件数6やSELECT 1の値1を返す問題ではありません。"
  },
  {
    "slug": "correlated-customers",
    "title": "EXISTS・相関条件",
    "description": "注文がある顧客の全列を取得してください。顧客ごとに対応する注文の有無を調べます。初期SQLに相関条件を追加し、行順は問いません。",
    "sql": "SELECT *\nFROM customers\nWHERE EXISTS (\n  SELECT 1\n  FROM orders\n  WHERE orders.customer_id = customers.id\n);",
    "columns": [
      "id",
      "name"
    ],
    "rows": [
      [
        1,
        "青木商店"
      ],
      [
        2,
        "北野物産"
      ],
      [
        4,
        "大和食品"
      ]
    ],
    "hint": "内側のWHEREで注文のcustomer_idと外側の顧客idを対応させます。",
    "explanation": "相関条件なしでは全顧客が残ってしまいます。対応させると未注文の中央商事が除かれ、注文2件の青木商店も顧客としては1行です。",
    "starter": "SELECT *\nFROM customers\nWHERE EXISTS (\n  SELECT 1\n  FROM orders\n);"
  },
  {
    "slug": "paid-order-exists",
    "title": "条件付きEXISTS",
    "description": "支払済み（statusがpaid）の注文が1件でもある顧客の全列を取得してください。取消注文が同時にある顧客も含めます。行順は問いません。",
    "sql": "SELECT *\nFROM customers\nWHERE EXISTS (\n  SELECT 1\n  FROM orders\n  WHERE orders.customer_id = customers.id\n    AND orders.status = 'paid'\n);",
    "columns": [
      "id",
      "name"
    ],
    "rows": [
      [
        1,
        "青木商店"
      ],
      [
        4,
        "大和食品"
      ]
    ],
    "hint": "相関条件とpaid条件を内側のWHEREでANDにつなぎます。",
    "explanation": "青木商店と大和食品が残ります。取消しかない北野物産は含めません。"
  },
  {
    "slug": "no-orders",
    "title": "NOT EXISTS",
    "description": "注文が1件もない顧客の全列をNOT EXISTSで取得してください。取消注文も注文として数えます。行順は問いません。",
    "sql": "SELECT *\nFROM customers\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM orders\n  WHERE orders.customer_id = customers.id\n);",
    "columns": [
      "id",
      "name"
    ],
    "rows": [
      [
        3,
        "中央商事"
      ]
    ],
    "hint": "支払状態を限定せず、顧客に対応する注文の不在を調べます。",
    "explanation": "未注文の中央商事だけが残ります。顧客IDがNULLの注文はどの顧客にも対応しません。"
  },
  {
    "slug": "chapter-review-paid-without-cancelled",
    "title": "章末問題：EXISTS・NOT EXISTS・支払状態",
    "description": "支払済み注文が存在し、取消注文は1件も存在しない顧客の全列を取得してください。初期SQLを修正します。行順は問いません。",
    "sql": "SELECT *\nFROM customers\nWHERE EXISTS (\n  SELECT 1\n  FROM orders\n  WHERE orders.customer_id = customers.id\n    AND orders.status = 'paid'\n)\nAND NOT EXISTS (\n  SELECT 1\n  FROM orders\n  WHERE orders.customer_id = customers.id\n    AND orders.status = 'cancelled'\n);",
    "columns": [
      "id",
      "name"
    ],
    "rows": [
      [
        1,
        "青木商店"
      ]
    ],
    "hint": "paidの存在とcancelledの不在は、別々のサブクエリで判定します。",
    "explanation": "大和食品には支払済みと取消が別の注文としてあるので除外します。未注文の中央商事もpaidの存在条件を満たしません。青木商店だけが残ります。",
    "starter": "SELECT *\nFROM customers\nWHERE EXISTS (\n  SELECT 1\n  FROM orders\n  WHERE orders.customer_id = customers.id\n    AND orders.status = 'paid' AND orders.status <> 'cancelled'\n);",
    "review": "chapter review",
    "requirements": [
      "顧客ごとにpaid注文があることを確認する",
      "同じ顧客にcancelled注文がないことを確認する",
      "両方の条件を満たす顧客だけを残す"
    ]
  },
  {
    "slug": "cumulative-review-region-period",
    "title": "まとめ問題：EXISTS・NOT EXISTS・WHERE・日付・ORDER BY",
    "description": "東地域の顧客のうち、2026年1月中に支払済み注文があり、1月から2月末までに取消注文がない顧客を取得してください。全列を取得し、顧客IDの昇順に表示します。期間外の取消は除外理由にしません。",
    "sql": "SELECT *\nFROM customers\nWHERE region = '東'\n  AND EXISTS (\n    SELECT 1 FROM orders\n    WHERE orders.customer_id = customers.id\n      AND orders.status = 'paid'\n      AND orders.ordered_on >= DATE '2026-01-01'\n      AND orders.ordered_on < DATE '2026-02-01'\n  )\n  AND NOT EXISTS (\n    SELECT 1 FROM orders\n    WHERE orders.customer_id = customers.id\n      AND orders.status = 'cancelled'\n      AND orders.ordered_on >= DATE '2026-01-01'\n      AND orders.ordered_on < DATE '2026-03-01'\n  )\nORDER BY id;",
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
        7,
        "銀河商店",
        "東"
      ]
    ],
    "hint": "支払済みの確認は1月初以上・2月初未満、取消の確認は1月初以上・3月初未満です。",
    "explanation": "青木商店と銀河商店が残ります。富士商店には2月1日の取消があるので除外します。銀河商店の3月1日の取消は対象期間外です。中央商事の支払済みは2月からなので1月の存在条件を満たしません。",
    "ordered": true,
    "review": "cumulative review",
    "requirements": [
      "東地域の顧客だけを対象にする",
      "1月中の支払済み注文を顧客ごとに確認する",
      "1〜2月の取消注文がないことを顧客ごとに確認する",
      "期間外の取消では除外せず、顧客IDの昇順に表示する"
    ]
  }
];
  return exercises.map((exercise, index) => ({
    core: {
      id: `exists-${String(index + 1).padStart(2, '0')}`, slug: exercise.slug, category: 'exists',
      level: exercise.review === 'cumulative review' ? 4 : exercise.review ? 3 : 2,
      setupSql: exercise.review === 'cumulative review' ? previousCommerce + extraOrders : setup, starterSql: exercise.starter ?? (index === 0 ? 'SELECT EXISTS (\n  -- 注文の存在を確認してください\n);' : 'SELECT *\nFROM customers\nWHERE ;'),
      expectedResult: { columns: exercise.columns, rows: exercise.rows.map((row) => Object.fromEntries(exercise.columns.map((column, i) => [column, row[i]]))) },
      grading: { mode: 'result', compareRowOrder: exercise.ordered ?? false, compareColumnOrder: true, numericTolerance: 0 },
      compatibility: { dialect: 'postgresql', postgres: true, notes: 'PostgreSQLで実行・検証しています。' },
      source: { type: 'original' }, tags: ['EXISTS', 'NOT EXISTS', exercise.title, ...(exercise.review ? [exercise.review] : [])],
    },
    translations: { ja: { title: exercise.title, description: exercise.description, solutionSql: exercise.sql,
      hints: [exercise.hint], explanation: exercise.explanation, ...(exercise.requirements ? { requirements: exercise.requirements } : {}) } },
  }));
}
