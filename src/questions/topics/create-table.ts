import { buildExerciseEntries, type Exercise } from '../exerciseEntries';

// 採点は、作った表の定義（列名・型・NOT NULL・既定値・制約）をカタログから読んで比べる。stateQueryは問題ごとに対象の表が違う。
const setup = "CREATE TABLE customers (id integer PRIMARY KEY, name text NOT NULL);\nINSERT INTO customers VALUES (1, '青木商店'), (2, '北野物産'), (3, '中央商事');\nCREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, price integer NOT NULL);\nINSERT INTO products VALUES (10, 'ノート', 200), (20, 'ペン', 120);";

const exercises: Exercise[] = [
  {
    "slug": "create-table-basic",
    "title": "CREATE TABLE",
    "sql": "CREATE TABLE books (\n  id integer,\n  title text,\n  price integer\n);",
    "starter": "CREATE TABLE books (\n  \n);",
    "hint": "括弧の中に「列名 データ型」をカンマで区切って3つ並べます。最後の列の後ろにカンマは書きません。",
    "explanation": "CREATE TABLEの後ろに表名を書き、括弧の中に列名とデータ型を順に並べます。制約を付けていないので、3列ともNULLを入れられる列（not_nullがfalse）になります。",
    "description": "本を管理する表 books を作ってください。列は順に id（integer）、title（text）、price（integer）です。制約は付けません。採点は、作った表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.books')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
    "columns": [
      "table_name",
      "column_name",
      "data_type",
      "not_null",
      "default_value",
      "constraints"
    ],
    "rows": [
      [
        "books",
        "id",
        "integer",
        false,
        null,
        null
      ],
      [
        "books",
        "title",
        "text",
        false,
        null,
        null
      ],
      [
        "books",
        "price",
        "integer",
        false,
        null,
        null
      ]
    ]
  },
  {
    "slug": "primary-key-not-null",
    "title": "PRIMARY KEY・NOT NULL",
    "sql": "CREATE TABLE members (\n  id integer PRIMARY KEY,\n  name text NOT NULL,\n  email text\n);",
    "starter": "CREATE TABLE members (\n  \n);",
    "hint": "主キーにする列にはPRIMARY KEY、未入力を許さない列にはNOT NULLを、データ型の後ろに書きます。",
    "explanation": "idはPRIMARY KEYなので、重複もNULLも入れられません。結果でidのnot_nullがtrueになっているのは、主キーがNOT NULLを含むためです。emailは制約がないので、NULLを入れられます。",
    "description": "会員の表 members を作ってください。列は順に id（integer、主キー）、name（text、NULLを入れられない）、email（text、制約なし）です。採点は、作った表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.members')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
    "columns": [
      "table_name",
      "column_name",
      "data_type",
      "not_null",
      "default_value",
      "constraints"
    ],
    "rows": [
      [
        "members",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "members",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "members",
        "email",
        "text",
        false,
        null,
        null
      ]
    ]
  },
  {
    "slug": "unique-default",
    "title": "UNIQUE・DEFAULT",
    "sql": "CREATE TABLE accounts (\n  id integer PRIMARY KEY,\n  email text NOT NULL UNIQUE,\n  plan text NOT NULL DEFAULT 'free'\n);",
    "starter": "CREATE TABLE accounts (\n  \n);",
    "hint": "重複を防ぐ列にはUNIQUE、省略時の値はDEFAULT 'free'で指定します。1つの列に複数の制約を続けて書けます。",
    "explanation": "emailはNOT NULLとUNIQUEの両方を付けたので、未入力も重複も入りません。planはDEFAULT 'free'を付けたので、INSERTでplanを省くとfreeが入ります。結果のdefault_valueには、型を添えた 'free'::text と表示されます。",
    "description": "アカウントの表 accounts を作ってください。列は順に id（integer、主キー）、email（text、NULL不可で、ほかの行と重複できない）、plan（text、NULL不可で、省略したときは 'free' が入る）です。採点は、作った表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.accounts')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
    "columns": [
      "table_name",
      "column_name",
      "data_type",
      "not_null",
      "default_value",
      "constraints"
    ],
    "rows": [
      [
        "accounts",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "accounts",
        "email",
        "text",
        true,
        null,
        "UNIQUE"
      ],
      [
        "accounts",
        "plan",
        "text",
        true,
        "'free'::text",
        null
      ]
    ]
  },
  {
    "slug": "check-constraint",
    "title": "CHECK",
    "sql": "CREATE TABLE items (\n  id integer PRIMARY KEY,\n  name text NOT NULL,\n  price integer NOT NULL CHECK (price >= 0),\n  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0)\n);",
    "starter": "CREATE TABLE items (\n  \n);",
    "hint": "値の範囲はCHECK (条件)で書きます。stockはDEFAULT 0とCHECKの両方を付けます。",
    "explanation": "CHECK (price >= 0)を付けると、priceに負の数を入れるINSERTやUPDATEはエラーになります。stockは省略すると0が入り、0未満にはできません。CHECKは条件がNULLになる行を通すので、NOT NULLも一緒に付けています。",
    "description": "商品の表 items を作ってください。列は順に id（integer、主キー）、name（text、NULL不可）、price（integer、NULL不可で、0以上の値だけ）、stock（integer、NULL不可で、省略したときは 0、0以上の値だけ）です。採点は、作った表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.items')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
    "columns": [
      "table_name",
      "column_name",
      "data_type",
      "not_null",
      "default_value",
      "constraints"
    ],
    "rows": [
      [
        "items",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "items",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "items",
        "price",
        "integer",
        true,
        null,
        "CHECK"
      ],
      [
        "items",
        "stock",
        "integer",
        true,
        "0",
        "CHECK"
      ]
    ]
  },
  {
    "slug": "foreign-key",
    "title": "外部キー（REFERENCES）",
    "sql": "CREATE TABLE orders (\n  id integer PRIMARY KEY,\n  customer_id integer NOT NULL REFERENCES customers (id),\n  amount integer NOT NULL\n);",
    "starter": "CREATE TABLE orders (\n  \n);",
    "hint": "別の表にある値だけを許すには、列にREFERENCES 表名 (列名)を付けます。",
    "explanation": "customer_idにREFERENCES customers (id)を付けたので、customersにないidの注文は追加できません。customersのidは主キーなので、外部キーの参照先にできます。",
    "description": "注文の表 orders を作ってください。列は順に id（integer、主キー）、customer_id（integer、NULL不可で、customers の id にある値だけ）、amount（integer、NULL不可）です。採点は、作った表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.orders')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
    "columns": [
      "table_name",
      "column_name",
      "data_type",
      "not_null",
      "default_value",
      "constraints"
    ],
    "rows": [
      [
        "orders",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "orders",
        "customer_id",
        "integer",
        true,
        null,
        "REFERENCES customers"
      ],
      [
        "orders",
        "amount",
        "integer",
        true,
        null,
        null
      ]
    ]
  },
  {
    "slug": "data-types",
    "title": "データ型（varchar・date・numeric・boolean）",
    "sql": "CREATE TABLE events (\n  id integer PRIMARY KEY,\n  title varchar(50) NOT NULL,\n  held_on date NOT NULL,\n  fee numeric(8, 2),\n  is_public boolean NOT NULL DEFAULT true\n);",
    "starter": "CREATE TABLE events (\n  \n);",
    "hint": "文字数の上限はvarchar(50)、日付はdate、桁数を決めた数はnumeric(8, 2)、真偽はbooleanです。",
    "explanation": "varchar(50)は50文字を超える値を受け付けません。numeric(8, 2)は全体で8桁、そのうち小数部が2桁の正確な数です。is_publicはDEFAULT trueを付けたので、省略すると公開（true）になります。",
    "description": "イベントの表 events を作ってください。列は順に id（integer、主キー）、title（50文字までの文字列、NULL不可）、held_on（日付、NULL不可）、fee（全体8桁・小数2桁の数、制約なし）、is_public（真偽、NULL不可で、省略したときは true）です。採点は、作った表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.events')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
    "columns": [
      "table_name",
      "column_name",
      "data_type",
      "not_null",
      "default_value",
      "constraints"
    ],
    "rows": [
      [
        "events",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "events",
        "title",
        "character varying(50)",
        true,
        null,
        null
      ],
      [
        "events",
        "held_on",
        "date",
        true,
        null,
        null
      ],
      [
        "events",
        "fee",
        "numeric(8,2)",
        false,
        null,
        null
      ],
      [
        "events",
        "is_public",
        "boolean",
        true,
        "true",
        null
      ]
    ]
  },
  {
    "slug": "chapter-review-composite-key",
    "title": "章末問題：複合主キー・外部キー・DEFAULT",
    "review": "chapter review",
    "requirements": [
      "customer_idとproduct_idのそれぞれにREFERENCESを付ける",
      "2つの列の組み合わせを、表制約のPRIMARY KEYで主キーにする",
      "added_onの既定値をCURRENT_DATEにする"
    ],
    "sql": "CREATE TABLE favorites (\n  customer_id integer REFERENCES customers (id),\n  product_id integer REFERENCES products (id),\n  added_on date NOT NULL DEFAULT CURRENT_DATE,\n  PRIMARY KEY (customer_id, product_id)\n);",
    "starter": "CREATE TABLE favorites (\n  \n);",
    "hint": "複数の列の主キーは、列の定義のあとにPRIMARY KEY (列1, 列2)と書きます。今日の日付はCURRENT_DATEです。",
    "explanation": "主キーを2列の組み合わせにすると、同じ顧客が別の商品を登録することも、別の顧客が同じ商品を登録することもできますが、同じ組み合わせは1回だけになります。主キーの列はNULLを入れられないので、customer_idとproduct_idのnot_nullはtrueになります。",
    "description": "顧客のお気に入り商品を記録する表 favorites を作ってください。列は順に customer_id（integer、customers の id を参照）、product_id（integer、products の id を参照）、added_on（日付、NULL不可で、省略したときは今日の日付）です。同じ顧客が同じ商品を2回登録できないように、customer_id と product_id の組み合わせを主キーにします。採点は、作った表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.favorites')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
    "columns": [
      "table_name",
      "column_name",
      "data_type",
      "not_null",
      "default_value",
      "constraints"
    ],
    "rows": [
      [
        "favorites",
        "customer_id",
        "integer",
        true,
        null,
        "REFERENCES customers, PRIMARY KEY"
      ],
      [
        "favorites",
        "product_id",
        "integer",
        true,
        null,
        "REFERENCES products, PRIMARY KEY"
      ],
      [
        "favorites",
        "added_on",
        "date",
        true,
        "CURRENT_DATE",
        null
      ]
    ]
  },
  {
    "slug": "cumulative-review-order-tables",
    "title": "まとめ問題：注文と注文明細の2つの表",
    "review": "cumulative review",
    "requirements": [
      "参照される側のordersを先に、参照する側のorder_itemsを後に作る",
      "order_itemsの主キーを、order_idとproduct_idの組み合わせにする",
      "quantityにNOT NULLと、1以上のCHECKを付ける",
      "ordered_onの既定値をCURRENT_DATEにする"
    ],
    "sql": "CREATE TABLE orders (\n  id integer PRIMARY KEY,\n  customer_id integer NOT NULL REFERENCES customers (id),\n  ordered_on date NOT NULL DEFAULT CURRENT_DATE\n);\n\nCREATE TABLE order_items (\n  order_id integer REFERENCES orders (id),\n  product_id integer REFERENCES products (id),\n  quantity integer NOT NULL CHECK (quantity >= 1),\n  PRIMARY KEY (order_id, product_id)\n);",
    "starter": "CREATE TABLE orders (\n  \n);\n\nCREATE TABLE order_items (\n  \n);",
    "hint": "order_itemsはordersを参照するので、ordersを先に作ります。2つのCREATE TABLEをセミコロンで区切って続けて書きます。",
    "explanation": "外部キーは、参照先の表がすでにあるときだけ付けられます。そのためordersを先に作ります。order_itemsは、注文と商品の組み合わせを主キーにして、1つの注文に同じ商品の行が2つできないようにしています。quantityはCHECKで1以上に限っています。",
    "description": "注文の表 orders と、注文明細の表 order_items を作ってください。orders の列は順に id（integer、主キー）、customer_id（integer、NULL不可で、customers の id を参照）、ordered_on（日付、NULL不可で、省略したときは今日の日付）です。order_items の列は順に order_id（integer、orders の id を参照）、product_id（integer、products の id を参照）、quantity（integer、NULL不可で、1以上の値だけ）で、order_id と product_id の組み合わせを主キーにします。採点は、作った表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.order_items'), to_regclass('public.orders')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
    "columns": [
      "table_name",
      "column_name",
      "data_type",
      "not_null",
      "default_value",
      "constraints"
    ],
    "rows": [
      [
        "order_items",
        "order_id",
        "integer",
        true,
        null,
        "REFERENCES orders, PRIMARY KEY"
      ],
      [
        "order_items",
        "product_id",
        "integer",
        true,
        null,
        "REFERENCES products, PRIMARY KEY"
      ],
      [
        "order_items",
        "quantity",
        "integer",
        true,
        null,
        "CHECK"
      ],
      [
        "orders",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "orders",
        "customer_id",
        "integer",
        true,
        null,
        "REFERENCES customers"
      ],
      [
        "orders",
        "ordered_on",
        "date",
        true,
        "CURRENT_DATE",
        null
      ]
    ]
  }
];

export const entries = buildExerciseEntries({ category: 'create-table', tags: ["create-table", "CREATE TABLE"], setup, exercises });
