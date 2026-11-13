import type { QuestionCore, QuestionTranslation } from '@/lib/types';
import { buildExerciseEntries, type Exercise } from './exerciseEntries';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };

const setup = "CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, price integer NOT NULL, stock integer NOT NULL DEFAULT 0);\nINSERT INTO products VALUES (1, 'ノート', 200, 50), (2, 'ペン', 120, 100), (3, '消しゴム', 80, 0), (4, '定規', 150, 30), (5, '付箋', 100, 0);";
const stateQuery = "SELECT * FROM products ORDER BY id";

const exercises: Exercise[] = [
  {
    "slug": "single-row",
    "title": "UPDATE・SET・WHERE",
    "description": "productsのid 2（ペン）の価格を130に更新してください。",
    "sql": "UPDATE products\nSET price = 130\nWHERE id = 2;",
    "hint": "SETで新しい値、WHEREで対象の行を指定します。",
    "explanation": "ペンの価格だけが130になり、ほかの4行は変わりません。実行後の表の内容が採点されます。",
    "starter": "UPDATE products\nSET \nWHERE ;",
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
        130,
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
    "slug": "multiple-columns",
    "title": "UPDATE・複数列",
    "description": "productsのid 1（ノート）の価格を250、在庫を40に、1つのUPDATE文で更新してください。",
    "sql": "UPDATE products\nSET price = 250, stock = 40\nWHERE id = 1;",
    "hint": "SETの中で、列の代入をカンマで区切ります。",
    "explanation": "ノートの価格と在庫が同時に変わります。",
    "starter": "UPDATE products\nSET price = 250\nWHERE id = 1;",
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
        250,
        40
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
    "slug": "calculated-value",
    "title": "UPDATE・計算で更新",
    "description": "productsのid 2（ペン）の在庫を、現在の値から1減らしてください。",
    "sql": "UPDATE products\nSET stock = stock - 1\nWHERE id = 2;",
    "hint": "右辺にstock列を使った式を書きます。",
    "explanation": "ペンの在庫が100から99になります。右辺のstockは更新前の値です。",
    "starter": "UPDATE products\nSET stock = 99\nWHERE id = 2;",
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
        99
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
    "title": "UPDATE・複数行",
    "description": "productsのうち在庫が0の商品について、在庫を20に更新してください。",
    "sql": "UPDATE products\nSET stock = 20\nWHERE stock = 0;",
    "hint": "WHEREには、複数行に合う条件を書きます。",
    "explanation": "消しゴムと付箋の2行が対象で、どちらも在庫が20になります。WHEREがないと全行が20になります。",
    "starter": "UPDATE products\nSET stock = 20;",
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
        20
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
        20
      ]
    ]
  },
  {
    "slug": "chapter-review-or-condition",
    "title": "章末問題：UPDATE・複数列・計算・OR",
    "description": "productsのうち、価格が150円以上、または在庫が0の商品について、価格を10円下げ、在庫を5増やしてください。",
    "sql": "UPDATE products\nSET price = price - 10, stock = stock + 5\nWHERE price >= 150 OR stock = 0;",
    "hint": "SETに2つの計算式をカンマで並べ、WHEREはORでつなぎます。",
    "explanation": "ノート、消しゴム、定規、付箋の4行が対象で、ペンだけが変わりません。ANDにすると該当行が0行になります。",
    "starter": "UPDATE products\nSET price = price - 10, stock = stock + 5\nWHERE price >= 150 AND stock = 0;",
    "review": "chapter review",
    "requirements": [
      "SETで価格と在庫を同時に書き換える",
      "それぞれ現在の値からの計算にする",
      "価格150円以上、または在庫0の行だけを対象にする"
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
        190,
        55
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
        70,
        5
      ],
      [
        4,
        "定規",
        140,
        35
      ],
      [
        5,
        "付箋",
        90,
        5
      ]
    ]
  },
  {
    "slug": "cumulative-review-case-where",
    "title": "まとめ問題：UPDATE・CASE・WHERE",
    "description": "productsのうち在庫が1以上の商品について、価格が100円以上のものだけ価格を9割（price * 9 / 10）にし、100円未満は価格を変えないでください。在庫が0の商品は更新しません。",
    "sql": "UPDATE products\nSET price = CASE\n  WHEN price >= 100 THEN price * 9 / 10\n  ELSE price\nEND\nWHERE stock >= 1;",
    "hint": "SETの右辺にCASEを使い、WHEREで在庫の条件を付けます。",
    "explanation": "ノートは180、ペンは108、定規は135になります。消しゴムと付箋は在庫0なので更新されません。WHEREがないと、100円の付箋まで90円になります。",
    "review": "cumulative review",
    "requirements": [
      "在庫1以上の行だけを対象にする",
      "CASEで価格100円以上だけを9割にする",
      "100円未満は元の価格のままにする"
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
        180,
        50
      ],
      [
        2,
        "ペン",
        108,
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
        135,
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

export function updateEntries(): Entry[] {
  return buildExerciseEntries({ category: 'update', tags: ["UPDATE"], setup, exercises, stateQuery });
}
