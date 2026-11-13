import type { QuestionCore, QuestionTranslation } from '@/lib/types';
import { buildExerciseEntries, type Exercise } from './exerciseEntries';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };

const setup = "CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, price integer NOT NULL, stock integer NOT NULL DEFAULT 0);\nINSERT INTO products VALUES (1, 'ノート', 200, 50), (2, 'ペン', 120, 100), (3, '消しゴム', 80, 0), (4, '定規', 150, 30), (5, '付箋', 100, 0);\nCREATE TABLE discontinued (product_id integer PRIMARY KEY);\nINSERT INTO discontinued VALUES (2), (5);";
const stateQuery = "SELECT * FROM products ORDER BY id";

const exercises: Exercise[] = [
  {
    "slug": "single-row",
    "title": "DELETE・WHERE",
    "description": "productsからid 3（消しゴム）の行を削除してください。",
    "sql": "DELETE FROM products\nWHERE id = 3;",
    "hint": "DELETE FROMの後に表名、WHEREで削除する行を指定します。",
    "explanation": "消しゴムの1行だけが削除され、4行が残ります。実行後の表の内容が採点されます。",
    "starter": "DELETE FROM products\nWHERE ;",
    "columns": [
      "id",
      "name",
      "price",
      "stock"
    ],
    "rows": [
      [
        1,
        "ノート",
        200,
        50
      ],
      [
        2,
        "ペン",
        120,
        100
      ],
      [
        4,
        "定規",
        150,
        30
      ],
      [
        5,
        "付箋",
        100,
        0
      ]
    ]
  },
  {
    "slug": "multiple-rows",
    "title": "DELETE・複数行",
    "description": "productsのうち在庫が0の商品をすべて削除してください。",
    "sql": "DELETE FROM products\nWHERE stock = 0;",
    "hint": "WHEREには、複数行に合う条件を書きます。",
    "explanation": "消しゴムと付箋の2行が削除され、ノート、ペン、定規が残ります。",
    "starter": "DELETE FROM products\nWHERE ;",
    "columns": [
      "id",
      "name",
      "price",
      "stock"
    ],
    "rows": [
      [
        1,
        "ノート",
        200,
        50
      ],
      [
        2,
        "ペン",
        120,
        100
      ],
      [
        4,
        "定規",
        150,
        30
      ]
    ]
  },
  {
    "slug": "or-condition",
    "title": "DELETE・OR",
    "description": "productsのうち、在庫が0、または価格が200円以上の商品を削除してください。",
    "sql": "DELETE FROM products\nWHERE stock = 0 OR price >= 200;",
    "hint": "2つの条件をORでつなぎます。",
    "explanation": "ノート（200円）、消しゴムと付箋（在庫0）の3行が削除され、ペンと定規が残ります。ANDにすると該当行がなくなります。",
    "starter": "DELETE FROM products\nWHERE stock = 0 AND price >= 200;",
    "columns": [
      "id",
      "name",
      "price",
      "stock"
    ],
    "rows": [
      [
        2,
        "ペン",
        120,
        100
      ],
      [
        4,
        "定規",
        150,
        30
      ]
    ]
  },
  {
    "slug": "subquery-in",
    "title": "DELETE・サブクエリ",
    "description": "discontinuedに載っているidの商品を、productsから削除してください。",
    "sql": "DELETE FROM products\nWHERE id IN (SELECT product_id FROM discontinued);",
    "hint": "INの右側にSELECTを書き、販売終了のidを取り出します。",
    "explanation": "ペン（2）と付箋（5）が削除されます。discontinuedの表は変わりません。",
    "starter": "DELETE FROM products\nWHERE id IN ();",
    "columns": [
      "id",
      "name",
      "price",
      "stock"
    ],
    "rows": [
      [
        1,
        "ノート",
        200,
        50
      ],
      [
        3,
        "消しゴム",
        80,
        0
      ],
      [
        4,
        "定規",
        150,
        30
      ]
    ]
  },
  {
    "slug": "chapter-review-stock-discontinued",
    "title": "章末問題：DELETE・AND・サブクエリ",
    "description": "productsのうち、在庫が0で、かつdiscontinuedにidが載っている商品だけを削除してください。",
    "sql": "DELETE FROM products\nWHERE stock = 0\n  AND id IN (SELECT product_id FROM discontinued);",
    "hint": "在庫の条件とINの条件を、ANDでつなぎます。",
    "explanation": "付箋（在庫0、販売終了）だけが削除されます。消しゴムは在庫0でも販売終了ではなく、ペンは販売終了でも在庫があります。ORにすると3行が消えます。",
    "starter": "DELETE FROM products\nWHERE stock = 0\n  OR id IN (SELECT product_id FROM discontinued);",
    "review": "chapter review",
    "requirements": [
      "在庫0の条件を書く",
      "discontinuedに載っているidをサブクエリで指定する",
      "2つの条件を両方満たす行だけを削除する"
    ],
    "columns": [
      "id",
      "name",
      "price",
      "stock"
    ],
    "rows": [
      [
        1,
        "ノート",
        200,
        50
      ],
      [
        2,
        "ペン",
        120,
        100
      ],
      [
        3,
        "消しゴム",
        80,
        0
      ],
      [
        4,
        "定規",
        150,
        30
      ]
    ]
  },
  {
    "slug": "cumulative-review-not-exists",
    "title": "まとめ問題：DELETE・NOT EXISTS・WHERE",
    "description": "productsのうち、在庫が0で、かつdiscontinuedにidが載っていない商品を削除してください。販売終了していない在庫0の商品だけを整理する想定です。",
    "sql": "DELETE FROM products\nWHERE stock = 0\n  AND NOT EXISTS (\n    SELECT 1\n    FROM discontinued\n    WHERE discontinued.product_id = products.id\n  );",
    "hint": "在庫0の条件に、NOT EXISTSで対応する販売終了の行がないことを加えます。",
    "explanation": "消しゴムだけが削除されます。付箋は在庫0でも販売終了なので残ります。",
    "review": "cumulative review",
    "requirements": [
      "在庫0の行を対象にする",
      "discontinuedに対応するidがないことをNOT EXISTSで確認する",
      "両方を満たす行だけを削除する"
    ],
    "columns": [
      "id",
      "name",
      "price",
      "stock"
    ],
    "rows": [
      [
        1,
        "ノート",
        200,
        50
      ],
      [
        2,
        "ペン",
        120,
        100
      ],
      [
        4,
        "定規",
        150,
        30
      ],
      [
        5,
        "付箋",
        100,
        0
      ]
    ]
  }
];

export function deleteEntries(): Entry[] {
  return buildExerciseEntries({ category: 'delete', tags: ["DELETE"], setup, exercises, stateQuery });
}
