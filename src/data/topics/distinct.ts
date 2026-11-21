import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  "setup": "CREATE TABLE orders (id integer PRIMARY KEY, customer text NOT NULL, item text);\nINSERT INTO orders VALUES (1, '青木', 'ノート'), (2, '北野', 'ペン'), (3, '青木', 'ノート'), (4, '青木', 'ペン'), (5, '中央', NULL), (6, '北野', NULL);",
  "sources": [
    "SELECT * FROM orders ORDER BY id"
  ]
};

export const topic: SqlTopic = {
  "slug": "distinct",
  "label": "DISTINCT",
  "title": "SQLのDISTINCTとは？重複を除く書き方と複数列・COUNT・GROUP BYとの違い",
  "description": "SQLのDISTINCTをPostgreSQLの元の表・SQL・結果表で解説。重複行の除外、複数列を指定したときの判定、NULLの扱い、COUNT(DISTINCT)、ORDER BYとの併用、GROUP BYやDISTINCT ONとの違いを演習付きで学べます。",
  "lead": "DISTINCTは、検索結果から重複した行を除くための指定です。SELECTの直後に書くと、同じ値の行が1行にまとまります。注文の表を使って、1列の場合、複数列の場合、NULLがある場合に結果がどう変わるかを順に確かめましょう。",
  "sampleIntro": "ordersは注文の表で、1行が1件の注文です。customerは顧客名、itemは商品名で、itemがNULLの行は商品が未入力の注文です。青木さんは3件、北野さんは2件の注文があり、青木さんのノートの注文は2件あります。結果表の行の並びは一例です。ORDER BYを指定しない場合、表示順は保証されません。",
  "sampleTables": [
    {
      "caption": "orders：注文6件",
      "headers": [
        "id（注文ID）",
        "customer（顧客名）",
        "item（商品名）"
      ],
      "rows": [
        [
          "1",
          "青木",
          "ノート"
        ],
        [
          "2",
          "北野",
          "ペン"
        ],
        [
          "3",
          "青木",
          "ノート"
        ],
        [
          "4",
          "青木",
          "ペン"
        ],
        [
          "5",
          "中央",
          "NULL"
        ],
        [
          "6",
          "北野",
          "NULL"
        ]
      ]
    }
  ],
  "syntax": "SELECT DISTINCT customer\nFROM orders;",
  "sections": [
    {
      "heading": "DISTINCTなしでは、同じ値が行の数だけ表示される",
      "body": "まず、DISTINCTを付けずに顧客名だけを取り出します。注文は6件あるので、結果も6行です。青木さんは3回、北野さんは2回注文しているので、同じ名前が何度も出ます。SELECTは、元の表の1行につき1行を返すためです。",
      "code": "SELECT customer\nFROM orders;",
      "resultTable": {
        "headers": [
          "customer"
        ],
        "rows": [
          [
            "青木"
          ],
          [
            "北野"
          ],
          [
            "青木"
          ],
          [
            "青木"
          ],
          [
            "中央"
          ],
          [
            "北野"
          ]
        ]
      }
    },
    {
      "heading": "SELECT DISTINCTで重複を除き、値の種類だけを見る",
      "body": "SELECTの直後にDISTINCTを書くと、同じ値の行が1行にまとまります。6行あった顧客名が、青木・北野・中央の3行になりました。「注文したことのある顧客は誰か」のように、値の種類を知りたいときに使います。元のordersの行が減るわけではなく、結果の表示がまとまるだけです。",
      "code": "SELECT DISTINCT customer\nFROM orders;",
      "resultTable": {
        "headers": [
          "customer"
        ],
        "rows": [
          [
            "中央"
          ],
          [
            "北野"
          ],
          [
            "青木"
          ]
        ]
      }
    },
    {
      "heading": "複数の列にDISTINCTを付けると、組み合わせで重複を判定する",
      "body": "列を2つ以上書いた場合、DISTINCTは列の組み合わせが同じ行だけを重複と見なします。青木・ノートは2件あるので1行にまとまりますが、青木・ペンは別の組み合わせなので残ります。結果は5行です。DISTINCTは先頭の列だけに効くのではなく、SELECTに書いた全部の列にかかります。",
      "code": "SELECT DISTINCT customer, item\nFROM orders;",
      "resultTable": {
        "headers": [
          "customer",
          "item"
        ],
        "rows": [
          [
            "中央",
            "NULL"
          ],
          [
            "北野",
            "ペン"
          ],
          [
            "北野",
            "NULL"
          ],
          [
            "青木",
            "ノート"
          ],
          [
            "青木",
            "ペン"
          ]
        ]
      }
    },
    {
      "heading": "DISTINCTはNULLどうしも1行にまとめる",
      "body": "itemがNULL（未入力）の注文は2件あります。ふつうの比較ではNULL = NULLはtrueになりませんが、DISTINCTは重複を判定するとき、NULLどうしを同じ値として扱います。そのため結果は、ノート、ペン、NULLの3行です。NULLの行が消えるわけではなく、1行として残ります。",
      "code": "SELECT DISTINCT item\nFROM orders;",
      "resultTable": {
        "headers": [
          "item"
        ],
        "rows": [
          [
            "ノート"
          ],
          [
            "ペン"
          ],
          [
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "COUNT(DISTINCT 列)で、値の種類の数を数える",
      "body": "DISTINCTは、COUNTの括弧の中にも書けます。COUNT(*)は行の数、COUNT(DISTINCT customer)は顧客の種類の数です。注文は6件、顧客は3人です。COUNT(DISTINCT item)が2なのは、COUNTがNULLを数えないためです。前の節のSELECT DISTINCT itemはNULLを含めて3行でしたが、数えるとノートとペンの2種類になります。",
      "code": "SELECT\n  COUNT(*) AS orders,\n  COUNT(DISTINCT customer) AS customers,\n  COUNT(DISTINCT item) AS items\nFROM orders;",
      "resultTable": {
        "headers": [
          "orders",
          "customers",
          "items"
        ],
        "rows": [
          [
            "6",
            "3",
            "2"
          ]
        ]
      }
    },
    {
      "heading": "DISTINCTの結果をORDER BYで並べ替える",
      "body": "DISTINCTの結果も、ORDER BYで並べ替えられます。ここでは顧客名の順に並べています。ただし、並べ替えに使えるのはSELECTに書いた列だけです。まとめたあとの1行は、元の複数の行を代表しています。青木さんの行のidは1・3・4のどれとも決められないので、ORDER BY idはエラーになります。",
      "code": "SELECT DISTINCT customer\nFROM orders\nORDER BY customer;",
      "failing": {
        "code": "SELECT DISTINCT customer\nFROM orders\nORDER BY id;",
        "error": "for SELECT DISTINCT, ORDER BY expressions must appear in select list"
      },
      "resultTable": {
        "headers": [
          "customer"
        ],
        "rows": [
          [
            "中央"
          ],
          [
            "北野"
          ],
          [
            "青木"
          ]
        ]
      }
    },
    {
      "heading": "DISTINCTとGROUP BYの違い：件数も出すならGROUP BY",
      "body": "値の種類を見るだけならDISTINCTで足ります。顧客ごとの注文件数のように、まとめた行について集計もしたいときはGROUP BYを使います。GROUP BY customerは顧客ごとに行をまとめ、COUNT(*)でそれぞれの件数を数えます。SELECT DISTINCT customerと同じ3人が並び、件数の列が加わります。",
      "code": "SELECT customer, COUNT(*) AS orders\nFROM orders\nGROUP BY customer\nORDER BY customer;",
      "resultTable": {
        "headers": [
          "customer",
          "orders"
        ],
        "rows": [
          [
            "中央",
            "1"
          ],
          [
            "北野",
            "2"
          ],
          [
            "青木",
            "3"
          ]
        ]
      }
    },
    {
      "heading": "DISTINCT ONで、グループごとに先頭の1行を残す（PostgreSQL）",
      "body": "「顧客ごとに、最初の注文を1行だけ」のように、1つの列でまとめつつ、ほかの列も表示したいことがあります。PostgreSQLではDISTINCT ON (customer)と書くと、customerが同じ行のうち、ORDER BYで先頭になる1行だけが残ります。ここではcustomer、idの順に並べているので、顧客ごとにidが最も小さい注文が残ります。DISTINCT ONはPostgreSQL独自の書き方です。",
      "code": "SELECT DISTINCT ON (customer) customer, id, item\nFROM orders\nORDER BY customer, id;",
      "resultTable": {
        "headers": [
          "customer",
          "id",
          "item"
        ],
        "rows": [
          [
            "中央",
            "5",
            "NULL"
          ],
          [
            "北野",
            "2",
            "ペン"
          ],
          [
            "青木",
            "1",
            "ノート"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "DISTINCT (列)と括弧を付ければ、その列だけに効くと考える",
      "body": "DISTINCT (customer), itemと書いても、括弧はcustomerを囲んでいるだけで、DISTINCTはcustomerとitemの組み合わせにかかります。下のSQLの結果は、括弧のないSELECT DISTINCT customer, itemと同じ5行です。1つの列でまとめてほかの列も表示したいときは、GROUP BYで集計するか、DISTINCT ONを使います。",
      "code": "SELECT DISTINCT (customer), item\nFROM orders;"
    }
  ],
  "notes": [
    {
      "title": "どの行が何件重複しているかは、GROUP BYとHAVINGで調べる",
      "body": "DISTINCTは重複を消しますが、どの行が何件あったかは分かりません。重複の中身を確かめたいときは、全部の列でGROUP BYし、HAVINGで件数が2以上の組だけを残します。この表で重複しているのは、青木・ノートの2件です。",
      "code": "SELECT customer, item, COUNT(*) AS times\nFROM orders\nGROUP BY customer, item\nHAVING COUNT(*) >= 2;"
    }
  ],
  "faqs": [
    {
      "question": "DISTINCTとGROUP BYはどちらを使えばよいですか？",
      "answer": "値の種類を一覧にするだけならDISTINCT、まとめた行ごとに件数や合計も出すならGROUP BYを使います。SELECT DISTINCT customerとSELECT customer … GROUP BY customerは同じ行を返しますが、COUNTやSUMを一緒に使えるのはGROUP BYです。"
    },
    {
      "question": "複数の列のうち、1列だけを基準に重複を除けますか？",
      "answer": "SELECT DISTINCTではできません。DISTINCTはSELECTに書いた全部の列の組み合わせで判定します。1つの列を基準にまとめたいときは、GROUP BYでほかの列を集計するか、PostgreSQLのDISTINCT ONで各グループの先頭の1行を取ります。"
    },
    {
      "question": "COUNT(DISTINCT 列)はNULLを数えますか？",
      "answer": "数えません。COUNT(列)がNULLを除いて数えるのと同じで、COUNT(DISTINCT 列)もNULLでない値の種類だけを数えます。このページの例では、SELECT DISTINCT itemはNULLを含む3行を返しますが、COUNT(DISTINCT item)は2です。"
    },
    {
      "question": "DISTINCTはSELECTのどこに書きますか？",
      "answer": "SELECTの直後、最初の列名の前に書きます。SELECT customer, DISTINCT itemのように途中の列の前には書けません。集計関数の中で使う場合は、COUNT(DISTINCT item)のように括弧の中の先頭に書きます。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：DISTINCT",
      "url": "https://www.postgresql.org/docs/current/queries-select-lists.html#QUERIES-DISTINCT",
      "description": "重複行の除外と、NULLを等しいものとして扱うこと、DISTINCT ON"
    },
    {
      "label": "PostgreSQL公式：SELECT（DISTINCT句）",
      "url": "https://www.postgresql.org/docs/current/sql-select.html#SQL-DISTINCT",
      "description": "DISTINCTとDISTINCT ONの構文、ORDER BYとの関係"
    },
    {
      "label": "PostgreSQL公式：集約式",
      "url": "https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES",
      "description": "集計関数の中に書くDISTINCT"
    }
  ],
  "related": [
    "select",
    "group-by",
    "having",
    "order-by",
    "union"
  ],
  "seeAlso": [
    {
      "label": "DISTINCT ON（PostgreSQL）",
      "href": "/postgresql/distinct-on/"
    }
  ],
  "practiceCategory": "distinct"
};
