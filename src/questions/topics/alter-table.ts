import { buildExerciseEntries, type Exercise } from '../exerciseEntries';

// 採点は、変更後の表の定義（列名・型・NOT NULL・既定値・制約）をカタログから読んで比べる。create-table と同じ stateQuery。
const setup = "CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, price text, code varchar(5), memo text);\nINSERT INTO products VALUES (1, 'ノート', '200', 'N-001', NULL), (2, 'ペン', '120', 'P-001', '在庫少'), (3, '消しゴム', '80', 'E-001', NULL);";

const exercises: Exercise[] = [
  {
    "slug": "add-column",
    "title": "ADD COLUMN",
    "sql": "ALTER TABLE products\n  ADD COLUMN stock integer;",
    "starter": "ALTER TABLE products\n  ;",
    "hint": "ALTER TABLE 表名 ADD COLUMN 列名 データ型 の形で書きます。",
    "explanation": "ADD COLUMNで足した列は、表の最後に付きます。DEFAULTを付けていないので、すでにある3行のstockはNULLになります。制約も付けていないので、not_nullはfalseです。",
    "description": "商品の表 products には、id（主キー）、name、price（text）、code（varchar(5)）、memo の5列があり、3行が入っています。在庫数を入れる列 stock（integer）を追加してください。制約と既定値は付けません。採点は、変更後の表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.products')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
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
        "products",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "products",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "products",
        "price",
        "text",
        false,
        null,
        null
      ],
      [
        "products",
        "code",
        "character varying(5)",
        false,
        null,
        null
      ],
      [
        "products",
        "memo",
        "text",
        false,
        null,
        null
      ],
      [
        "products",
        "stock",
        "integer",
        false,
        null,
        null
      ]
    ]
  },
  {
    "slug": "add-column-not-null-default",
    "title": "ADD COLUMN・NOT NULL・DEFAULT",
    "sql": "ALTER TABLE products\n  ADD COLUMN is_active boolean NOT NULL DEFAULT true;",
    "starter": "ALTER TABLE products\n  ;",
    "hint": "行が入っている表にNOT NULLの列を足すときは、DEFAULTも一緒に付けます。データ型の後ろにNOT NULL DEFAULT trueと続けます。",
    "explanation": "DEFAULT trueを付けたので、すでにある3行のis_activeにはtrueが入り、NOT NULLに違反しません。DEFAULTを付けずにNOT NULLだけで追加すると、既存の行がNULLになるためエラーになります。",
    "description": "商品の表 products には、id（主キー）、name、price（text）、code（varchar(5)）、memo の5列があり、3行が入っています。販売中かどうかを表す列 is_active（boolean、NULL不可で、省略したときは true）を追加してください。採点は、変更後の表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.products')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
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
        "products",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "products",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "products",
        "price",
        "text",
        false,
        null,
        null
      ],
      [
        "products",
        "code",
        "character varying(5)",
        false,
        null,
        null
      ],
      [
        "products",
        "memo",
        "text",
        false,
        null,
        null
      ],
      [
        "products",
        "is_active",
        "boolean",
        true,
        "true",
        null
      ]
    ]
  },
  {
    "slug": "drop-column",
    "title": "DROP COLUMN",
    "sql": "ALTER TABLE products\n  DROP COLUMN memo;",
    "starter": "ALTER TABLE products\n  ;",
    "hint": "列の削除は ALTER TABLE 表名 DROP COLUMN 列名 です。",
    "explanation": "DROP COLUMNは、列の定義と、その列に入っていた値をまとめて削除します。ペンの行に入っていたmemoの値も消えます。ほかの4列は変わりません。",
    "description": "商品の表 products には、id（主キー）、name、price（text）、code（varchar(5)）、memo の5列があり、3行が入っています。使わなくなった列 memo を削除してください。採点は、変更後の表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.products')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
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
        "products",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "products",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "products",
        "price",
        "text",
        false,
        null,
        null
      ],
      [
        "products",
        "code",
        "character varying(5)",
        false,
        null,
        null
      ]
    ]
  },
  {
    "slug": "alter-column-type-length",
    "title": "ALTER COLUMN TYPE（桁数の変更）",
    "sql": "ALTER TABLE products\n  ALTER COLUMN code TYPE varchar(20);",
    "starter": "ALTER TABLE products\n  ;",
    "hint": "型や桁数の変更は ALTER COLUMN 列名 TYPE 新しい型 です。",
    "explanation": "varchar(5)からvarchar(20)へ上限を広げる変更は、入っている値がそのまま収まるので失敗しません。逆に狭めるときは、収まらない値が1つでもあるとエラーになります。",
    "description": "商品の表 products には、id（主キー）、name、price（text）、code（varchar(5)）、memo の5列があり、3行が入っています。商品コードの桁数が足りなくなったので、code を20文字まで入る varchar(20) に変更してください。採点は、変更後の表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.products')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
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
        "products",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "products",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "products",
        "price",
        "text",
        false,
        null,
        null
      ],
      [
        "products",
        "code",
        "character varying(20)",
        false,
        null,
        null
      ],
      [
        "products",
        "memo",
        "text",
        false,
        null,
        null
      ]
    ]
  },
  {
    "slug": "alter-column-type-using",
    "title": "ALTER COLUMN TYPE・USING",
    "sql": "ALTER TABLE products\n  ALTER COLUMN price TYPE integer\n  USING price::integer;",
    "starter": "ALTER TABLE products\n  ;",
    "hint": "textからintegerへは自動で変換されません。TYPE integerの後ろに、USING price::integerと変換の式を書きます。",
    "explanation": "USINGには、いまの値を新しい型へ変換する式を書きます。priceに入っている'200'・'120'・'80'はどれも整数に変換できるので、型を変えられます。USINGを書かないと「cannot be cast automatically」というエラーになります。",
    "description": "商品の表 products には、id（主キー）、name、price（text）、code（varchar(5)）、memo の5列があり、3行が入っています。price は文字列（text）で値段が入っています。計算に使えるように、price を integer に変更してください。採点は、変更後の表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.products')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
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
        "products",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "products",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "products",
        "price",
        "integer",
        false,
        null,
        null
      ],
      [
        "products",
        "code",
        "character varying(5)",
        false,
        null,
        null
      ],
      [
        "products",
        "memo",
        "text",
        false,
        null,
        null
      ]
    ]
  },
  {
    "slug": "rename-column",
    "title": "RENAME COLUMN",
    "sql": "ALTER TABLE products\n  RENAME COLUMN name TO product_name;",
    "starter": "ALTER TABLE products\n  ;",
    "hint": "列名の変更は RENAME COLUMN 古い名前 TO 新しい名前 です。",
    "explanation": "RENAME COLUMNで変わるのは名前だけです。データ型、NOT NULL、入っている値はそのまま残ります。変更後は、古い名前のnameでは参照できません。",
    "description": "商品の表 products には、id（主キー）、name、price（text）、code（varchar(5)）、memo の5列があり、3行が入っています。列 name の名前を product_name に変更してください。採点は、変更後の表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.products')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
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
        "products",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "products",
        "product_name",
        "text",
        true,
        null,
        null
      ],
      [
        "products",
        "price",
        "text",
        false,
        null,
        null
      ],
      [
        "products",
        "code",
        "character varying(5)",
        false,
        null,
        null
      ],
      [
        "products",
        "memo",
        "text",
        false,
        null,
        null
      ]
    ]
  },
  {
    "slug": "set-not-null-set-default",
    "title": "SET NOT NULL・SET DEFAULT",
    "sql": "ALTER TABLE products\n  ALTER COLUMN code SET NOT NULL;\n\nALTER TABLE products\n  ALTER COLUMN memo SET DEFAULT 'なし';",
    "starter": "ALTER TABLE products\n  ;\n\nALTER TABLE products\n  ;",
    "hint": "NOT NULLは ALTER COLUMN 列名 SET NOT NULL、既定値は ALTER COLUMN 列名 SET DEFAULT 値 で付けます。",
    "explanation": "codeは3行とも値が入っているので、SET NOT NULLを付けられます。SET DEFAULTは、これから追加する行にだけ効きます。すでにNULLが入っているノートと消しゴムのmemoは、NULLのまま変わりません。",
    "description": "商品の表 products には、id（主キー）、name、price（text）、code（varchar(5)）、memo の5列があり、3行が入っています。code に NOT NULL を付け、memo の既定値を 'なし' にしてください。採点は、変更後の表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.products')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
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
        "products",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "products",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "products",
        "price",
        "text",
        false,
        null,
        null
      ],
      [
        "products",
        "code",
        "character varying(5)",
        true,
        null,
        null
      ],
      [
        "products",
        "memo",
        "text",
        false,
        "'なし'::text",
        null
      ]
    ]
  },
  {
    "slug": "add-constraint-unique",
    "title": "ADD CONSTRAINT（UNIQUE）",
    "sql": "ALTER TABLE products\n  ADD CONSTRAINT products_code_key UNIQUE (code);",
    "starter": "ALTER TABLE products\n  ;",
    "hint": "ADD CONSTRAINT 制約名 UNIQUE (列名) の形で書きます。",
    "explanation": "制約を足すとき、すでにある行がすべて調べられます。codeの値はN-001・P-001・E-001で重複がないので、UNIQUEを付けられます。重複する行があった場合は、エラーになって制約は付きません。",
    "description": "商品の表 products には、id（主キー）、name、price（text）、code（varchar(5)）、memo の5列があり、3行が入っています。同じ商品コードを2回登録できないように、code に UNIQUE 制約を追加してください。制約の名前は自由です（例：products_code_key）。採点は、変更後の表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.products')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
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
        "products",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "products",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "products",
        "price",
        "text",
        false,
        null,
        null
      ],
      [
        "products",
        "code",
        "character varying(5)",
        false,
        null,
        "UNIQUE"
      ],
      [
        "products",
        "memo",
        "text",
        false,
        null,
        null
      ]
    ]
  },
  {
    "slug": "chapter-review-multiple-actions",
    "title": "章末問題：列の追加・削除・型変更を1文で",
    "review": "chapter review",
    "requirements": [
      "stockをNOT NULL、既定値0で追加する",
      "memoを削除する",
      "priceをUSINGでintegerに変える",
      "3つの変更をカンマで区切り、1つのALTER TABLEにまとめる"
    ],
    "sql": "ALTER TABLE products\n  ADD COLUMN stock integer NOT NULL DEFAULT 0,\n  DROP COLUMN memo,\n  ALTER COLUMN price TYPE integer USING price::integer;",
    "starter": "ALTER TABLE products\n  ;",
    "hint": "ADD COLUMN …, DROP COLUMN …, ALTER COLUMN … のように、変更をカンマで区切って並べます。",
    "explanation": "列の追加・削除・型の変更は、カンマで区切って1つのALTER TABLEに書けます。1つでも失敗すると、ほかの変更も行われません。追加したstockは、memoを削除しても表の最後に付きます。",
    "description": "商品の表 products には、id（主キー）、name、price（text）、code（varchar(5)）、memo の5列があり、3行が入っています。次の3つの変更を行ってください。在庫数の列 stock（integer、NULL不可で、省略したときは 0）を追加する。memo を削除する。price を integer に変更する。採点は、変更後の表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.products')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
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
        "products",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "products",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "products",
        "price",
        "integer",
        false,
        null,
        null
      ],
      [
        "products",
        "code",
        "character varying(5)",
        false,
        null,
        null
      ],
      [
        "products",
        "stock",
        "integer",
        true,
        "0",
        null
      ]
    ]
  },
  {
    "slug": "cumulative-review-create-and-alter",
    "title": "まとめ問題：CREATE TABLE・ALTER TABLE",
    "review": "cumulative review",
    "requirements": [
      "参照される側のcategoriesを、CREATE TABLEで先に作る",
      "categoriesのidを主キー、nameをNOT NULLにする",
      "productsにcategory_idを追加し、REFERENCESでcategoriesのidを参照する"
    ],
    "sql": "CREATE TABLE categories (\n  id integer PRIMARY KEY,\n  name text NOT NULL\n);\n\nALTER TABLE products\n  ADD COLUMN category_id integer REFERENCES categories (id);",
    "starter": "CREATE TABLE categories (\n  \n);\n\nALTER TABLE products\n  ;",
    "hint": "外部キーの参照先は先に存在している必要があるので、categoriesを先に作ります。ADD COLUMNでも、データ型の後ろにREFERENCES 表名 (列名)を書けます。",
    "explanation": "ADD COLUMNでは、CREATE TABLEの列の定義と同じように、データ型の後ろへ制約を書けます。追加したcategory_idは既存の3行でNULLになります。外部キーはNULLの行を調べないので、分類が決まっていない商品があっても追加できます。",
    "description": "商品の表 products には、id（主キー）、name、price（text）、code（varchar(5)）、memo の5列があり、3行が入っています。商品を分類できるようにします。分類の表 categories を作り、列は順に id（integer、主キー）、name（text、NULL不可）とします。次に、products に列 category_id（integer、categories の id にある値だけ）を追加してください。採点は、変更後の表の列名・データ型・NOT NULL・既定値・制約を表にして比べます。",
    "stateQuery": "SELECT c.relname AS table_name, a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS data_type, a.attnotnull AS not_null, pg_get_expr(d.adbin, d.adrelid) AS default_value, (SELECT string_agg(CASE con.contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'f' THEN 'REFERENCES ' || con.confrelid::regclass::text END, ', ' ORDER BY con.contype) FROM pg_constraint con WHERE con.conrelid = a.attrelid AND a.attnum = ANY (con.conkey)) AS constraints FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum WHERE a.attrelid IN (to_regclass('public.categories'), to_regclass('public.products')) AND a.attnum > 0 AND NOT a.attisdropped ORDER BY c.relname, a.attnum",
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
        "categories",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "categories",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "products",
        "id",
        "integer",
        true,
        null,
        "PRIMARY KEY"
      ],
      [
        "products",
        "name",
        "text",
        true,
        null,
        null
      ],
      [
        "products",
        "price",
        "text",
        false,
        null,
        null
      ],
      [
        "products",
        "code",
        "character varying(5)",
        false,
        null,
        null
      ],
      [
        "products",
        "memo",
        "text",
        false,
        null,
        null
      ],
      [
        "products",
        "category_id",
        "integer",
        false,
        null,
        "REFERENCES categories"
      ]
    ]
  }
];

export const entries = buildExerciseEntries({ category: 'alter-table', tags: ["alter-table", "ALTER TABLE"], setup, exercises });
