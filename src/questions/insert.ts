import type { QuestionCore, QuestionTranslation } from '@/lib/types';
import { buildExerciseEntries, type Exercise } from './exerciseEntries';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };

const setup = "CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, price integer NOT NULL, stock integer NOT NULL DEFAULT 0);\nINSERT INTO products VALUES (1, 'ノート', 200, 50), (2, 'ペン', 120, 100), (3, '消しゴム', 80, 0);\nCREATE TABLE arrivals (id integer PRIMARY KEY, name text NOT NULL, price integer NOT NULL, stock integer NOT NULL);\nINSERT INTO arrivals VALUES (3, '消しゴム', 80, 10), (4, '定規', 150, 30), (5, '付箋', 100, 0), (6, 'ホチキス', 400, 5);";
const stateQuery = "SELECT * FROM products ORDER BY id";

const exercises: Exercise[] = [
  {
    "slug": "single-row",
    "title": "INSERT・VALUES",
    "description": "productsに、id 4、名前「定規」、価格150、在庫30の商品を1行追加してください。",
    "sql": "INSERT INTO products (id, name, price, stock)\nVALUES (4, '定規', 150, 30);",
    "hint": "列名のリストと、同じ順番のVALUESを書きます。",
    "explanation": "実行後のproductsは4行になり、追加した行が末尾に入ります。実行後の表の内容が採点されます。",
    "starter": "INSERT INTO products (id, name, price, stock)\nVALUES ;",
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
    "slug": "default-column",
    "title": "INSERT・列の省略とDEFAULT",
    "description": "productsに、id 4、名前「定規」、価格150の商品を追加してください。在庫の列は指定せず、既定値に任せます。",
    "sql": "INSERT INTO products (id, name, price)\nVALUES (4, '定規', 150);",
    "hint": "列名のリストからstockを外します。",
    "explanation": "stockにはDEFAULTの0が入ります。列名リストにない列は、DEFAULT、なければNULLになります。",
    "starter": "INSERT INTO products (id, name, price)\nVALUES ;",
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
        0
      ]
    ]
  },
  {
    "slug": "multiple-rows",
    "title": "INSERT・複数行",
    "description": "productsに、id 4の「定規」（価格150、在庫30）と、id 5の「付箋」（価格100、在庫20）を、1つのINSERT文で追加してください。",
    "sql": "INSERT INTO products (id, name, price, stock)\nVALUES\n  (4, '定規', 150, 30),\n  (5, '付箋', 100, 20);",
    "hint": "VALUESの後に、カッコで囲んだ行をカンマで区切って並べます。",
    "explanation": "1つの文で2行が追加され、productsは5行になります。",
    "starter": "INSERT INTO products (id, name, price, stock)\nVALUES ;",
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
    "slug": "insert-select",
    "title": "INSERT SELECT",
    "description": "arrivalsのうちidが4以上の行を、全列そのままproductsに追加してください。",
    "sql": "INSERT INTO products (id, name, price, stock)\nSELECT id, name, price, stock\nFROM arrivals\nWHERE id >= 4;",
    "hint": "VALUESの代わりにSELECTを書き、WHEREで入荷予定の行を絞ります。",
    "explanation": "arrivalsのid 4、5、6の3行がproductsに追加されます。id 3はproductsにすでにあるので、条件で除いています。",
    "starter": "INSERT INTO products (id, name, price, stock)\nSELECT id, name, price, stock\nFROM arrivals;",
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
      ],
      [
        5,
        "付箋",
        100,
        0
      ],
      [
        6,
        "ホチキス",
        400,
        5
      ]
    ]
  },
  {
    "slug": "chapter-review-select-default",
    "title": "章末問題：INSERT SELECT・列の省略",
    "description": "arrivalsのうち価格が150円以上の行を、id・名前・価格だけをproductsへ追加してください。在庫は指定せず、既定値に任せます。",
    "sql": "INSERT INTO products (id, name, price)\nSELECT id, name, price\nFROM arrivals\nWHERE price >= 150;",
    "hint": "列名リストとSELECTの列をid、name、priceにそろえ、WHEREで価格を絞ります。",
    "explanation": "定規（150）とホチキス（400）の2行が追加され、在庫はどちらも0です。条件が価格100円以上だと付箋まで入ります。",
    "starter": "INSERT INTO products (id, name, price)\nSELECT id, name, price\nFROM arrivals\nWHERE price >= 100;",
    "review": "chapter review",
    "requirements": [
      "列名リストでid・name・priceだけを指定する",
      "arrivalsから価格150円以上の行を選ぶ",
      "stockは指定せず既定値の0にする"
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
        0
      ],
      [
        6,
        "ホチキス",
        400,
        0
      ]
    ]
  },
  {
    "slug": "cumulative-review-not-exists",
    "title": "まとめ問題：INSERT SELECT・NOT EXISTS・WHERE",
    "description": "arrivalsのうち、productsにまだ同じidがなく、かつ在庫が1以上の行を、全列そのままproductsへ追加してください。",
    "sql": "INSERT INTO products (id, name, price, stock)\nSELECT id, name, price, stock\nFROM arrivals\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM products\n  WHERE products.id = arrivals.id\n)\n  AND stock >= 1;",
    "hint": "NOT EXISTSで既存のidを除き、在庫の条件をANDでつなぎます。",
    "explanation": "id 3は既存なので除かれ、id 5は在庫0で除かれます。追加されるのは定規（4）とホチキス（6）です。",
    "review": "cumulative review",
    "requirements": [
      "productsに同じidがない行だけをNOT EXISTSで選ぶ",
      "在庫が1以上の条件を加える",
      "全列をproductsへ追加する"
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
      ],
      [
        6,
        "ホチキス",
        400,
        5
      ]
    ]
  }
];

export function insertEntries(): Entry[] {
  return buildExerciseEntries({ category: 'insert', tags: ["INSERT"], setup, exercises, stateQuery });
}
