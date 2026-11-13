import { buildExerciseEntries, type Exercise } from '../exerciseEntries';

const setup = "CREATE TABLE orders (id integer PRIMARY KEY, customer text NOT NULL, amount integer NOT NULL, status text NOT NULL);\nINSERT INTO orders VALUES (1, '佐藤', 3000, 'paid'), (2, '鈴木', 1200, 'cancelled'), (3, '佐藤', 4500, 'paid'), (4, '田中', 800, 'paid'), (5, '鈴木', 2000, 'paid'), (6, '高橋', 1000, 'paid'), (7, '高橋', 2500, 'paid');\nCREATE TABLE order_archive (id integer PRIMARY KEY, customer text NOT NULL, amount integer NOT NULL, status text NOT NULL, archived_by text NOT NULL DEFAULT 'system');\nCREATE TABLE customer_sales (customer text PRIMARY KEY, total integer NOT NULL, order_count integer NOT NULL);\nCREATE TABLE customers (name text PRIMARY KEY);\nINSERT INTO customers VALUES ('佐藤'), ('田中');";

const exercises: Exercise[] = [
  {
    "slug": "copy-all",
    "title": "INSERT SELECT",
    "description": "ordersの全行を、id・customer・amount・statusの4列で order_archive にコピーしてください。",
    "sql": "INSERT INTO order_archive (id, customer, amount, status)\nSELECT id, customer, amount, status\nFROM orders;",
    "hint": "VALUESの代わりにSELECTを書き、列名リストと同じ順に列を並べます。",
    "explanation": "ordersの7行がすべてorder_archiveに入ります。archived_byは列名リストに無いので、既定値のsystemになります。",
    "starter": "INSERT INTO order_archive (id, customer, amount, status)\n",
    "columns": [
      "id",
      "customer",
      "amount",
      "status",
      "archived_by"
    ],
    "rows": [
      [
        1,
        "佐藤",
        3000,
        "paid",
        "system"
      ],
      [
        2,
        "鈴木",
        1200,
        "cancelled",
        "system"
      ],
      [
        3,
        "佐藤",
        4500,
        "paid",
        "system"
      ],
      [
        4,
        "田中",
        800,
        "paid",
        "system"
      ],
      [
        5,
        "鈴木",
        2000,
        "paid",
        "system"
      ],
      [
        6,
        "高橋",
        1000,
        "paid",
        "system"
      ],
      [
        7,
        "高橋",
        2500,
        "paid",
        "system"
      ]
    ]
  },
  {
    "slug": "columns-constant",
    "title": "INSERT SELECT・列の対応と定数",
    "description": "ordersの全行を order_archive にコピーしてください。ただし列名リストは (customer, id, amount, status, archived_by) の順にし、archived_by には全行「月次バッチ」を入れます。",
    "sql": "INSERT INTO order_archive (customer, id, amount, status, archived_by)\nSELECT customer, id, amount, status, '月次バッチ'\nFROM orders;",
    "hint": "列名リストの順にSELECTの列を並べ、最後に固定の文字列を書きます。",
    "explanation": "列は位置で対応するため、SELECTも customer, id, amount, status の順です。最後の列には定数の月次バッチが入り、既定値のsystemにはなりません。",
    "columns": [
      "id",
      "customer",
      "amount",
      "status",
      "archived_by"
    ],
    "rows": [
      [
        1,
        "佐藤",
        3000,
        "paid",
        "月次バッチ"
      ],
      [
        2,
        "鈴木",
        1200,
        "cancelled",
        "月次バッチ"
      ],
      [
        3,
        "佐藤",
        4500,
        "paid",
        "月次バッチ"
      ],
      [
        4,
        "田中",
        800,
        "paid",
        "月次バッチ"
      ],
      [
        5,
        "鈴木",
        2000,
        "paid",
        "月次バッチ"
      ],
      [
        6,
        "高橋",
        1000,
        "paid",
        "月次バッチ"
      ],
      [
        7,
        "高橋",
        2500,
        "paid",
        "月次バッチ"
      ]
    ]
  },
  {
    "slug": "where-filter",
    "title": "INSERT SELECT・WHERE",
    "description": "ordersのうち、支払済み（status が paid）で金額が1000円以上の注文だけを、id・customer・amount・statusの4列で order_archive に追加してください。",
    "sql": "INSERT INTO order_archive (id, customer, amount, status)\nSELECT id, customer, amount, status\nFROM orders\nWHERE status = 'paid'\n  AND amount >= 1000;",
    "hint": "SELECTにWHEREを付け、支払状態と金額の条件をANDでつなぎます。",
    "explanation": "支払済みで1000円以上なのはid 1・3・5・6・7です。id 6の1000円は境界値で含まれ、id 4（800円）と取消のid 2は入りません。",
    "columns": [
      "id",
      "customer",
      "amount",
      "status",
      "archived_by"
    ],
    "rows": [
      [
        1,
        "佐藤",
        3000,
        "paid",
        "system"
      ],
      [
        3,
        "佐藤",
        4500,
        "paid",
        "system"
      ],
      [
        5,
        "鈴木",
        2000,
        "paid",
        "system"
      ],
      [
        6,
        "高橋",
        1000,
        "paid",
        "system"
      ],
      [
        7,
        "高橋",
        2500,
        "paid",
        "system"
      ]
    ]
  },
  {
    "slug": "aggregate",
    "title": "INSERT SELECT・集計",
    "description": "支払済み（status が paid）の注文を顧客ごとに集計し、顧客名・合計金額・件数を customer_sales に追加してください。",
    "sql": "INSERT INTO customer_sales (customer, total, order_count)\nSELECT customer, SUM(amount), COUNT(*)\nFROM orders\nWHERE status = 'paid'\nGROUP BY customer;",
    "hint": "集計するSELECTをそのまま追加元にし、列名リストの順に顧客名・合計・件数を並べます。",
    "explanation": "支払済みだけで集計すると、佐藤は3000+4500で7500円2件、鈴木は2000円1件、高橋は1000+2500で3500円2件、田中は800円1件です。取消のid 2を含めると鈴木が3200円2件になってしまいます。",
    "stateQuery": "SELECT * FROM customer_sales ORDER BY total",
    "columns": [
      "customer",
      "total",
      "order_count"
    ],
    "rows": [
      [
        "田中",
        800,
        1
      ],
      [
        "鈴木",
        2000,
        1
      ],
      [
        "高橋",
        3500,
        2
      ],
      [
        "佐藤",
        7500,
        2
      ]
    ]
  },
  {
    "slug": "not-exists",
    "title": "INSERT SELECT・NOT EXISTS",
    "description": "ordersに登場する顧客のうち、まだ customers に登録されていない顧客の名前を customers に追加してください。同じ顧客が複数回注文していても1回だけ追加します。",
    "sql": "INSERT INTO customers (name)\nSELECT DISTINCT o.customer\nFROM orders AS o\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM customers AS c\n  WHERE c.name = o.customer\n);",
    "hint": "追加元で、customersに同じ名前の行が存在しないことをNOT EXISTSで確かめ、DISTINCTで重複を除きます。",
    "explanation": "登録済みは佐藤と田中なので、追加されるのは鈴木と高橋です。鈴木は2回、高橋も2回注文しているため、DISTINCTが無いと同じ名前を2回入れようとして主キー違反になり、何も追加されません。",
    "stateQuery": "SELECT * FROM customers ORDER BY name",
    "columns": [
      "name"
    ],
    "rows": [
      [
        "佐藤"
      ],
      [
        "田中"
      ],
      [
        "鈴木"
      ],
      [
        "高橋"
      ]
    ]
  },
  {
    "slug": "review-archive-new",
    "title": "章末問題：INSERT SELECT・WHERE・NOT EXISTS",
    "description": "order_archive には、取消を含むid 1と2の注文が保管済みです。ordersのうち、支払済み（status が paid）で、まだ order_archive にない注文を追加してください。追加する行の archived_by は「追加バッチ」にします。",
    "sql": "INSERT INTO order_archive (id, customer, amount, status, archived_by)\nSELECT o.id, o.customer, o.amount, o.status, '追加バッチ'\nFROM orders AS o\nWHERE o.status = 'paid'\n  AND NOT EXISTS (\n    SELECT 1\n    FROM order_archive AS a\n    WHERE a.id = o.id\n  );",
    "hint": "支払状態の条件と、保管済みでない条件を組み合わせ、SELECTの最後に固定の文字列を置きます。",
    "explanation": "id 1は保管済み、id 2は取消なので除かれ、id 3・4・5・6・7の5行がarchived_by「追加バッチ」で追加されます。NOT EXISTSが無いとid 1が主キー違反になり、WHEREの支払状態が無いと取消の扱いが変わります。",
    "starter": "INSERT INTO order_archive (id, customer, amount, status, archived_by)\nSELECT o.id, o.customer, o.amount, o.status, '追加バッチ'\nFROM orders AS o\nWHERE o.status = 'paid';",
    "setup": "CREATE TABLE orders (id integer PRIMARY KEY, customer text NOT NULL, amount integer NOT NULL, status text NOT NULL);\nINSERT INTO orders VALUES (1, '佐藤', 3000, 'paid'), (2, '鈴木', 1200, 'cancelled'), (3, '佐藤', 4500, 'paid'), (4, '田中', 800, 'paid'), (5, '鈴木', 2000, 'paid'), (6, '高橋', 1000, 'paid'), (7, '高橋', 2500, 'paid');\nCREATE TABLE order_archive (id integer PRIMARY KEY, customer text NOT NULL, amount integer NOT NULL, status text NOT NULL, archived_by text NOT NULL DEFAULT 'system');\nCREATE TABLE customer_sales (customer text PRIMARY KEY, total integer NOT NULL, order_count integer NOT NULL);\nCREATE TABLE customers (name text PRIMARY KEY);\nINSERT INTO customers VALUES ('佐藤'), ('田中');\nINSERT INTO order_archive VALUES (1, '佐藤', 3000, 'paid', 'system'), (2, '鈴木', 1200, 'cancelled', 'system');",
    "review": "chapter review",
    "requirements": [
      "INSERT … SELECTで、列名リストと同じ順にSELECTの列を並べる",
      "archived_byに固定の文字列を入れる",
      "支払済みの注文だけに絞る",
      "NOT EXISTSで保管済みのidを除く"
    ],
    "columns": [
      "id",
      "customer",
      "amount",
      "status",
      "archived_by"
    ],
    "rows": [
      [
        1,
        "佐藤",
        3000,
        "paid",
        "system"
      ],
      [
        2,
        "鈴木",
        1200,
        "cancelled",
        "system"
      ],
      [
        3,
        "佐藤",
        4500,
        "paid",
        "追加バッチ"
      ],
      [
        4,
        "田中",
        800,
        "paid",
        "追加バッチ"
      ],
      [
        5,
        "鈴木",
        2000,
        "paid",
        "追加バッチ"
      ],
      [
        6,
        "高橋",
        1000,
        "paid",
        "追加バッチ"
      ],
      [
        7,
        "高橋",
        2500,
        "paid",
        "追加バッチ"
      ]
    ]
  },
  {
    "slug": "cumulative-registered-sales",
    "title": "まとめ問題：INSERT SELECT・JOIN・WHERE・GROUP BY・HAVING",
    "description": "支払済み（status が paid）の注文を顧客ごとに集計し、合計金額が2000円以上の顧客を customer_sales に追加してください。追加するのは customers に登録されている顧客だけで、列は顧客名・合計金額・件数です。",
    "sql": "INSERT INTO customer_sales (customer, total, order_count)\nSELECT o.customer, SUM(o.amount), COUNT(*)\nFROM orders AS o\nINNER JOIN customers AS c\n  ON c.name = o.customer\nWHERE o.status = 'paid'\nGROUP BY o.customer\nHAVING SUM(o.amount) >= 2000;",
    "hint": "登録済みの顧客と結合してから、支払状態で絞って顧客ごとに集計し、合計の条件はHAVINGに書きます。",
    "explanation": "登録済みは佐藤・田中・鈴木で、高橋は未登録なので結合で除かれます。支払済みの合計は佐藤7500円、田中800円、鈴木2000円なので、2000円以上の佐藤と鈴木だけが入ります。鈴木は取消を除いて1件です。",
    "setup": "CREATE TABLE orders (id integer PRIMARY KEY, customer text NOT NULL, amount integer NOT NULL, status text NOT NULL);\nINSERT INTO orders VALUES (1, '佐藤', 3000, 'paid'), (2, '鈴木', 1200, 'cancelled'), (3, '佐藤', 4500, 'paid'), (4, '田中', 800, 'paid'), (5, '鈴木', 2000, 'paid'), (6, '高橋', 1000, 'paid'), (7, '高橋', 2500, 'paid');\nCREATE TABLE order_archive (id integer PRIMARY KEY, customer text NOT NULL, amount integer NOT NULL, status text NOT NULL, archived_by text NOT NULL DEFAULT 'system');\nCREATE TABLE customer_sales (customer text PRIMARY KEY, total integer NOT NULL, order_count integer NOT NULL);\nCREATE TABLE customers (name text PRIMARY KEY);\nINSERT INTO customers VALUES ('佐藤'), ('田中');\nINSERT INTO customers VALUES ('鈴木');",
    "stateQuery": "SELECT * FROM customer_sales ORDER BY total",
    "review": "cumulative review",
    "requirements": [
      "INNER JOINで登録済みの顧客に限る",
      "WHEREで支払済みに絞る",
      "GROUP BYで顧客ごとに集計する",
      "HAVINGで合計金額2000円以上に絞る"
    ],
    "columns": [
      "customer",
      "total",
      "order_count"
    ],
    "rows": [
      [
        "鈴木",
        2000,
        1
      ],
      [
        "佐藤",
        7500,
        2
      ]
    ]
  }
];

export const entries = buildExerciseEntries({ category: 'insert-select', tags: ["insert-select","INSERT"], setup, stateQuery: "SELECT * FROM order_archive ORDER BY id", exercises });
