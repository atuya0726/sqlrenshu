import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  "setup": "CREATE TABLE customers (id integer PRIMARY KEY, name text NOT NULL);\nINSERT INTO customers VALUES (1, '青木商店'), (2, '北野物産'), (3, '中央商事');",
  "sources": [
    "SELECT * FROM customers ORDER BY id"
  ]
};

export const topic: SqlTopic = {
  "slug": "create-table",
  "label": "CREATE TABLE",
  "title": "SQLのCREATE TABLEとは？テーブル作成の書き方と主キー・外部キー・制約を解説",
  "description": "SQLのCREATE TABLEをPostgreSQLのSQLと実行結果で解説。データ型の選び方、PRIMARY KEY・NOT NULL・DEFAULT・UNIQUE・CHECK・外部キー、IF NOT EXISTS、CREATE TABLE AS SELECTを、制約違反のエラー例と演習で学べます。",
  "lead": "CREATE TABLEは、新しい表（テーブル）を作るSQLです。列の名前とデータ型を決め、主キーや外部キーなどの制約を付けて、入れてよい値の決まりを表に持たせます。小さな表を実際に作り、制約に違反するとどんなエラーになるかまで確かめましょう。",
  "sampleIntro": "customersは、すでに作ってある顧客の表です。idが主キーで、3件の顧客が入っています。このページの各節は、customersだけがある状態から始めて、新しい表を作ります。前の節で作った表は、次の節には残っていません。customersは、外部キー、IF NOT EXISTS、CREATE TABLE AS SELECTの節で使います。",
  "sampleTables": [
    {
      "caption": "customers：すでにある顧客の表（idが主キー）",
      "headers": [
        "id（顧客ID）",
        "name（顧客名）"
      ],
      "rows": [
        [
          "1",
          "青木商店"
        ],
        [
          "2",
          "北野物産"
        ],
        [
          "3",
          "中央商事"
        ]
      ]
    }
  ],
  "syntax": "CREATE TABLE products (\n  id integer,\n  name text,\n  price integer\n);",
  "sections": [
    {
      "heading": "CREATE TABLEで列名とデータ型を決めて表を作る",
      "body": "新しい表を作るときは、CREATE TABLEの後ろに表の名前を書き、括弧の中に「列名 データ型」をカンマで区切って並べます。下の例は、id・name・priceの3列を持つproductsを作ります。作った直後の表は0行なので、INSERTで2行を追加してからSELECTで確かめています。最後の列の後ろにはカンマを書きません。",
      "code": "CREATE TABLE products (\n  id integer,\n  name text,\n  price integer\n);\n\nINSERT INTO products (id, name, price)\nVALUES (1, 'ノート', 200), (2, 'ペン', 120);\n\nSELECT *\nFROM products\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "price"
        ],
        "rows": [
          [
            "1",
            "ノート",
            "200"
          ],
          [
            "2",
            "ペン",
            "120"
          ]
        ]
      }
    },
    {
      "heading": "よく使うデータ型を選ぶ（integer・text・varchar・numeric・date・boolean）",
      "body": "データ型は、その列に入れられる値の種類を決めます。整数はinteger、文字列はtextか文字数の上限を付けたvarchar(n)、金額のように小数を正確に扱う数はnumeric、日付はdate、はい・いいえはbooleanが基本です。下の例ではeventsを作り、information_schema.columnsで列名と型を確かめています。varchar(20)はcharacter varyingと表示されます。続けて、titleに20文字を超える文字列を入れようとするとエラーになります。",
      "table": {
        "headers": [
          "データ型",
          "入れる値",
          "値の例"
        ],
        "rows": [
          [
            "integer",
            "整数",
            "120"
          ],
          [
            "text",
            "長さを決めない文字列",
            "'ノート'"
          ],
          [
            "varchar(n)",
            "n文字までの文字列",
            "'A-001'"
          ],
          [
            "numeric(p, s)",
            "全体でp桁、小数部がs桁の正確な数",
            "1980.50"
          ],
          [
            "date",
            "日付",
            "'2026-11-21'"
          ],
          [
            "timestamp",
            "日付と時刻",
            "'2026-11-21 10:30:00'"
          ],
          [
            "boolean",
            "真偽（はい・いいえ）",
            "true"
          ]
        ]
      },
      "code": "CREATE TABLE events (\n  id integer,\n  title varchar(20),\n  held_on date,\n  fee numeric(8, 2),\n  is_public boolean\n);\n\nSELECT column_name, data_type\nFROM information_schema.columns\nWHERE table_name = 'events'\nORDER BY ordinal_position;",
      "failing": {
        "code": "INSERT INTO events (id, title)\nVALUES (1, 'SQLをはじめて学ぶ人のためのオンライン勉強会');",
        "error": "value too long for type character varying(20)"
      },
      "resultTable": {
        "headers": [
          "column_name",
          "data_type"
        ],
        "rows": [
          [
            "id",
            "integer"
          ],
          [
            "title",
            "character varying"
          ],
          [
            "held_on",
            "date"
          ],
          [
            "fee",
            "numeric"
          ],
          [
            "is_public",
            "boolean"
          ]
        ]
      }
    },
    {
      "heading": "PRIMARY KEYで行を1つに決める主キーを付ける",
      "body": "主キーは、表の中で行を1つに決めるための列です。列の定義にPRIMARY KEYを付けると、その列には同じ値を2回入れられず、NULLも入れられません。下の例ではidを主キーにして2行を追加しています。続けて、すでにあるid 1をもう一度追加しようとすると、重複のエラーになって行は増えません。",
      "code": "CREATE TABLE products (\n  id integer PRIMARY KEY,\n  name text,\n  price integer\n);\n\nINSERT INTO products (id, name, price)\nVALUES (1, 'ノート', 200), (2, 'ペン', 120);\n\nSELECT *\nFROM products\nORDER BY id;",
      "failing": {
        "code": "INSERT INTO products (id, name, price)\nVALUES (1, '消しゴム', 80);",
        "error": "duplicate key value violates unique constraint \"products_pkey\""
      },
      "resultTable": {
        "headers": [
          "id",
          "name",
          "price"
        ],
        "rows": [
          [
            "1",
            "ノート",
            "200"
          ],
          [
            "2",
            "ペン",
            "120"
          ]
        ]
      }
    },
    {
      "heading": "NOT NULLで未入力を防ぎ、DEFAULTで既定値を決める",
      "body": "NOT NULLを付けた列には、NULLを入れられません。DEFAULTを付けた列は、INSERTで値を省くとその既定値が入ります。DEFAULTのない列を省いた場合はNULLになります。下の例では、北野はplanを省いたので既定値のfreeが入り、noteは2人とも省いたのでNULLです。続けてnameを省いて追加すると、NOT NULLに違反してエラーになります。",
      "code": "CREATE TABLE members (\n  id integer PRIMARY KEY,\n  name text NOT NULL,\n  plan text NOT NULL DEFAULT 'free',\n  note text\n);\n\nINSERT INTO members (id, name, plan)\nVALUES (1, '青木', 'pro');\n\nINSERT INTO members (id, name)\nVALUES (2, '北野');\n\nSELECT *\nFROM members\nORDER BY id;",
      "failing": {
        "code": "INSERT INTO members (id)\nVALUES (3);",
        "error": "null value in column \"name\" of relation \"members\" violates not-null constraint"
      },
      "resultTable": {
        "headers": [
          "id",
          "name",
          "plan",
          "note"
        ],
        "rows": [
          [
            "1",
            "青木",
            "pro",
            "NULL"
          ],
          [
            "2",
            "北野",
            "free",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "UNIQUEで同じ値の重複を防ぐ",
      "body": "UNIQUEを付けた列には、ほかの行と同じ値を入れられません。メールアドレスや商品コードのように、主キーではないけれど重複しては困る列に付けます。主キーと違い、NOT NULLを付けなければNULLが入り、NULLの行が複数あっても重複とは見なされません。下の例ではemailがNULLの行が2つ入っています。続けて、登録済みのメールアドレスをもう一度追加するとエラーになります。",
      "code": "CREATE TABLE members (\n  id integer PRIMARY KEY,\n  name text NOT NULL,\n  email text UNIQUE\n);\n\nINSERT INTO members (id, name, email)\nVALUES\n  (1, '青木', 'aoki@example.com'),\n  (2, '北野', NULL),\n  (3, '中央', NULL);\n\nSELECT *\nFROM members\nORDER BY id;",
      "failing": {
        "code": "INSERT INTO members (id, name, email)\nVALUES (4, '大和', 'aoki@example.com');",
        "error": "duplicate key value violates unique constraint \"members_email_key\""
      },
      "resultTable": {
        "headers": [
          "id",
          "name",
          "email"
        ],
        "rows": [
          [
            "1",
            "青木",
            "aoki@example.com"
          ],
          [
            "2",
            "北野",
            "NULL"
          ],
          [
            "3",
            "中央",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "CHECKで入れられる値の範囲を決める",
      "body": "CHECKは、括弧の中の条件を満たす値だけを受け付ける制約です。下の例では、priceに「0以上」という条件を付けています。続けてpriceに-100を入れようとすると、条件を満たさないのでエラーになります。CHECKは、条件の結果がNULLになる行も通します。NULLを防ぎたい列には、この例のようにNOT NULLも付けます。",
      "code": "CREATE TABLE products (\n  id integer PRIMARY KEY,\n  name text NOT NULL,\n  price integer NOT NULL CHECK (price >= 0)\n);\n\nINSERT INTO products (id, name, price)\nVALUES (1, 'ノート', 200), (2, '試供品', 0);\n\nSELECT *\nFROM products\nORDER BY id;",
      "failing": {
        "code": "INSERT INTO products (id, name, price)\nVALUES (3, '消しゴム', -100);",
        "error": "new row for relation \"products\" violates check constraint \"products_price_check\""
      },
      "resultTable": {
        "headers": [
          "id",
          "name",
          "price"
        ],
        "rows": [
          [
            "1",
            "ノート",
            "200"
          ],
          [
            "2",
            "試供品",
            "0"
          ]
        ]
      }
    },
    {
      "heading": "REFERENCESで外部キーを付け、別の表にある値だけを許す",
      "body": "外部キーは、「この列の値は、別の表のこの列に存在しなければならない」という制約です。下の例のordersでは、customer_idにREFERENCES customers (id)を付け、customersにいる顧客の注文だけを登録できるようにしています。customersのidは1・2・3なので、顧客1と3の注文は追加できます。続けて、存在しない顧客99の注文を追加しようとするとエラーになります。参照される側の列は、主キーかUNIQUEである必要があります。",
      "code": "CREATE TABLE orders (\n  id integer PRIMARY KEY,\n  customer_id integer NOT NULL REFERENCES customers (id),\n  amount integer NOT NULL\n);\n\nINSERT INTO orders (id, customer_id, amount)\nVALUES (1, 1, 5000), (2, 3, 12000);\n\nSELECT *\nFROM orders\nORDER BY id;",
      "failing": {
        "code": "INSERT INTO orders (id, customer_id, amount)\nVALUES (3, 99, 800);",
        "error": "insert or update on table \"orders\" violates foreign key constraint \"orders_customer_id_fkey\""
      },
      "resultTable": {
        "headers": [
          "id",
          "customer_id",
          "amount"
        ],
        "rows": [
          [
            "1",
            "1",
            "5000"
          ],
          [
            "2",
            "3",
            "12000"
          ]
        ]
      }
    },
    {
      "heading": "複数の列を組み合わせた主キーは、列の定義のあとに書く",
      "body": "1つの列だけでは行を決められないときは、複数の列の組み合わせを主キーにします。列の定義をすべて書いたあとに、PRIMARY KEY (列1, 列2)と書きます。下の例は、どの注文にどの商品が何個入っているかを表す表で、注文番号と商品番号の組み合わせが主キーです。注文1は商品10と商品20の両方を持てます。続けて、注文1・商品10の行をもう1つ追加しようとすると、重複のエラーになります。",
      "code": "CREATE TABLE order_items (\n  order_id integer,\n  product_id integer,\n  quantity integer NOT NULL,\n  PRIMARY KEY (order_id, product_id)\n);\n\nINSERT INTO order_items (order_id, product_id, quantity)\nVALUES (1, 10, 2), (1, 20, 1), (2, 10, 5);\n\nSELECT *\nFROM order_items\nORDER BY order_id, product_id;",
      "failing": {
        "code": "INSERT INTO order_items (order_id, product_id, quantity)\nVALUES (1, 10, 3);",
        "error": "duplicate key value violates unique constraint \"order_items_pkey\""
      },
      "resultTable": {
        "headers": [
          "order_id",
          "product_id",
          "quantity"
        ],
        "rows": [
          [
            "1",
            "10",
            "2"
          ],
          [
            "1",
            "20",
            "1"
          ],
          [
            "2",
            "10",
            "5"
          ]
        ]
      }
    },
    {
      "heading": "IF NOT EXISTSで、すでにある表を作ろうとしてもエラーにしない",
      "body": "同じ名前の表がすでにあるとき、CREATE TABLEはエラーになります。IF NOT EXISTSを付けると、表があるときは何もせずに次へ進みます。下の例では、customersがすでにあるので表は作られず、中身も元の3行のままです。IF NOT EXISTSは、同じ名前があるかどうかだけを見ます。括弧の中に書いたemailの列が、既存のcustomersに足されることはありません。IF NOT EXISTSなしで実行すると、下のエラーになります。",
      "code": "CREATE TABLE IF NOT EXISTS customers (\n  id integer PRIMARY KEY,\n  name text NOT NULL,\n  email text\n);\n\nSELECT *\nFROM customers\nORDER BY id;",
      "failing": {
        "code": "CREATE TABLE customers (\n  id integer PRIMARY KEY,\n  name text NOT NULL,\n  email text\n);",
        "error": "relation \"customers\" already exists"
      },
      "resultTable": {
        "headers": [
          "id",
          "name"
        ],
        "rows": [
          [
            "1",
            "青木商店"
          ],
          [
            "2",
            "北野物産"
          ],
          [
            "3",
            "中央商事"
          ]
        ]
      }
    },
    {
      "heading": "CREATE TABLE AS SELECTで検索結果から表を作る",
      "body": "CREATE TABLE 表名 AS SELECT …と書くと、SELECTの結果をそのまま新しい表として保存できます。列名と型はSELECTの結果から決まります。下の例は、customersのうちidが2以上の行をcustomers_backupという表に写しています。保存されるのは写した時点の内容で、あとからcustomersを変えてもcustomers_backupは変わりません。主キーやNOT NULLは新しい表に付かないので、必要なら作ったあとに付けます。",
      "code": "CREATE TABLE customers_backup AS\nSELECT id, name\nFROM customers\nWHERE id >= 2;\n\nSELECT *\nFROM customers_backup\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name"
        ],
        "rows": [
          [
            "2",
            "北野物産"
          ],
          [
            "3",
            "中央商事"
          ]
        ]
      }
    },
    {
      "heading": "DROP TABLEで表を削除する",
      "body": "不要になった表はDROP TABLEで削除します。DELETEが行だけを消して表を残すのに対し、DROP TABLEは表の定義ごと消します。下の例では、draftsを作ってから削除し、draftsという名前の表がいくつあるかを数えています。結果は0です。続けてもう一度削除しようとすると、表がないのでエラーになります。DROP TABLE IF EXISTS draftsと書けば、表がなくてもエラーになりません。",
      "code": "CREATE TABLE drafts (\n  id integer,\n  body text\n);\n\nDROP TABLE drafts;\n\nSELECT COUNT(*) AS drafts_tables\nFROM information_schema.tables\nWHERE table_name = 'drafts';",
      "failing": {
        "code": "DROP TABLE drafts;",
        "error": "table \"drafts\" does not exist"
      },
      "resultTable": {
        "headers": [
          "drafts_tables"
        ],
        "rows": [
          [
            "0"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "最後の列の後ろにカンマを書く",
      "body": "括弧の中の最後の定義の後ろにカンマがあると、「syntax error at or near \")\"」というエラーになります。列を足したり消したりしたあとは、最後の行にカンマが残っていないかを確かめます。"
    },
    {
      "title": "userやorderのような予約語を表の名前にする",
      "body": "userやorderはSQLの予約語なので、CREATE TABLE user (…)は「syntax error at or near \"user\"」、CREATE TABLE order (…)は「syntax error at or near \"order\"」というエラーになります。usersやordersのように複数形にすると避けられます。"
    },
    {
      "title": "外部キーで参照する表を、後から作ろうとする",
      "body": "REFERENCESに書く表は、先に存在している必要があります。まだない表を参照すると「relation \"shops\" does not exist」というエラーになります。参照される側（customers）を先に、参照する側（orders）を後に作ります。削除は逆の順で、ordersから参照されているcustomersを先にDROP TABLEしようとするとエラーになります。"
    }
  ],
  "notes": [
    {
      "title": "idを自動で採番するにはGENERATED ALWAYS AS IDENTITYを使う",
      "body": "主キーの番号を自分で決めずに、行を追加するたびに1、2、3と自動で振りたいときは、列にGENERATED ALWAYS AS IDENTITYを付けます。INSERTではidを書かずに、ほかの列だけを指定します。この列にINSERTで値を直接指定すると、エラーになります。",
      "code": "CREATE TABLE tickets (\n  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  title text NOT NULL\n);\n\nINSERT INTO tickets (title)\nVALUES ('問い合わせ'), ('返品');\n\nSELECT *\nFROM tickets\nORDER BY id;"
    },
    {
      "title": "制約に名前を付けると、エラーの原因が分かりやすい",
      "body": "制約に名前を付けないと、products_price_checkのような名前が自動で付きます。CONSTRAINT 名前を制約の前に書くと、自分で名前を決められます。違反したときのエラーにその名前が出るので、どの決まりに引っかかったかを読み取りやすくなります。",
      "code": "CREATE TABLE products (\n  id integer PRIMARY KEY,\n  name text NOT NULL,\n  price integer NOT NULL CONSTRAINT price_not_negative CHECK (price >= 0)\n);\n\nINSERT INTO products (id, name, price)\nVALUES (1, 'ノート', 200);\n\nSELECT *\nFROM products;"
    }
  ],
  "faqs": [
    {
      "question": "主キー（PRIMARY KEY）とUNIQUEの違いは？",
      "answer": "主キーは1つの表に1つだけで、NULLを入れられません。UNIQUEは1つの表にいくつでも付けられ、NOT NULLを付けなければNULLが入ります。行を特定するための列を主キーにし、それ以外で重複させたくない列にUNIQUEを付けます。"
    },
    {
      "question": "textとvarchar(n)はどちらを使えばよい？",
      "answer": "PostgreSQLでは、textとvarchar(n)の性能にほとんど差はありません。文字数の上限を表の決まりとして持たせたいときはvarchar(n)、上限を決める必要がなければtextを使います。"
    },
    {
      "question": "作った表の列やデータ型を確認するには？",
      "answer": "このページの例のように、information_schema.columnsをtable_nameで絞ってSELECTすると、列名とデータ型を確認できます。psqlを使っている場合は、\\d 表名でも確認できます。"
    },
    {
      "question": "作った表に、あとから列を足したり制約を付けたりできる？",
      "answer": "できます。表を作り直さずに、ALTER TABLE products ADD COLUMN stock integerのようにALTER TABLEで列や制約を追加・変更します。書き方は、関連構文のALTER TABLEのガイドにまとめています。"
    },
    {
      "question": "外部キーで参照されている行を削除するとどうなる？",
      "answer": "ordersから参照されている顧客をcustomersから削除しようとすると、既定ではエラーになり、行は削除されません。先に参照している側の行を削除するか、外部キーにON DELETE CASCADEを付けて、参照している行も一緒に削除されるようにします。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：CREATE TABLE",
      "url": "https://www.postgresql.org/docs/current/sql-createtable.html",
      "description": "CREATE TABLEの構文、IF NOT EXISTS、列制約と表制約"
    },
    {
      "label": "PostgreSQL公式：Table Basics",
      "url": "https://www.postgresql.org/docs/current/ddl-basics.html",
      "description": "表の作成と削除の基本"
    },
    {
      "label": "PostgreSQL公式：Default Values",
      "url": "https://www.postgresql.org/docs/current/ddl-default.html",
      "description": "DEFAULTと、既定値のない列がNULLになること"
    },
    {
      "label": "PostgreSQL公式：Constraints",
      "url": "https://www.postgresql.org/docs/current/ddl-constraints.html",
      "description": "CHECK・NOT NULL・UNIQUE・主キー・外部キーの挙動"
    },
    {
      "label": "PostgreSQL公式：Identity Columns",
      "url": "https://www.postgresql.org/docs/current/ddl-identity-columns.html",
      "description": "GENERATED ALWAYS AS IDENTITYによる自動採番"
    },
    {
      "label": "PostgreSQL公式：Character Types",
      "url": "https://www.postgresql.org/docs/current/datatype-character.html",
      "description": "textとvarchar(n)の違い"
    },
    {
      "label": "PostgreSQL公式：CREATE TABLE AS",
      "url": "https://www.postgresql.org/docs/current/sql-createtableas.html",
      "description": "検索結果から表を作る構文"
    },
    {
      "label": "PostgreSQL公式：DROP TABLE",
      "url": "https://www.postgresql.org/docs/current/sql-droptable.html",
      "description": "表の削除とIF EXISTS"
    }
  ],
  "related": [
    "alter-table",
    "insert",
    "update",
    "delete",
    "cast",
    "insert-select"
  ],
  "practiceCategory": "create-table"
};
