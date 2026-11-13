import type { SqlTopic } from './sqlTopics';

export const joinTopics: SqlTopic[] = [
  {
    "slug": "inner-join",
    "label": "INNER JOIN",
    "title": "SQLのINNER JOINとは？書き方とLEFT JOINとの違いを実行結果で解説",
    "description": "SQLのINNER JOINの書き方を、顧客と注文の小さな表で解説。ONの結合条件、一致しない行が消える理由、LEFT JOINとの違い、テーブルの別名をPostgreSQLの結果表で学べます。",
    "lead": "INNER JOINは、2つの表から条件に合う行同士を結び付ける構文です。たとえば、注文の表に顧客名がなくても、顧客の表と結ぶと「誰の注文か」を表示できます。まずは小さな2つの表で、どの行がつながるかを見てみましょう。",
    "sampleIntro": "このページでは、次の顧客3件と注文3件を使います。ordersのcustomer_idは、注文した顧客の番号です。注文101と102は顧客1の青木商店、注文103は顧客2の北野物産に対応します。顧客3の中央商事には注文がありません。",
    "sampleTables": [
      {
        "caption": "customers：顧客の一覧",
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
      },
      {
        "caption": "orders：注文の一覧",
        "headers": [
          "id（注文ID）",
          "customer_id（注文した顧客のID）",
          "amount（金額）"
        ],
        "rows": [
          [
            "101",
            "1",
            "12000"
          ],
          [
            "102",
            "1",
            "8000"
          ],
          [
            "103",
            "2",
            "25000"
          ]
        ]
      }
    ],
    "syntax": "SELECT customers.name, orders.id, orders.amount\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id\nORDER BY orders.id;",
    "sections": [
      {
        "heading": "INNER JOINで注文に顧客名を付ける",
        "body": "やりたいことは、顧客名・注文ID・金額を同じ行に並べることです。FROM customersで顧客の表を指定し、INNER JOIN ordersで注文の表を結びます。ON customers.id = orders.customer_idは「顧客IDが同じ行同士を組み合わせる」という条件です。SELECTには、結果に表示したい列を書きます。",
        "code": "SELECT customers.name, orders.id, orders.amount\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id\nORDER BY orders.id;",
        "resultTable": {
          "headers": [
            "name",
            "id",
            "amount"
          ],
          "rows": [
            [
              "青木商店",
              "101",
              "12000"
            ],
            [
              "青木商店",
              "102",
              "8000"
            ],
            [
              "北野物産",
              "103",
              "25000"
            ]
          ]
        }
      },
      {
        "heading": "ONでどの行が結び付いたかを確かめる",
        "body": "青木商店のidは1です。注文101と102もcustomer_idが1なので、それぞれ青木商店と結び付きます。下のSQLでは比較した2つのIDも表示しています。customers.idは「顧客の表のid」、orders.idは「注文の表のid」です。同じidという列名でも、意味が違うので表の名前を付けて区別します。",
        "code": "SELECT customers.id, customers.name,\n  orders.customer_id, orders.amount\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id\nORDER BY orders.id;",
        "resultTable": {
          "headers": [
            "id",
            "name",
            "customer_id",
            "amount"
          ],
          "rows": [
            [
              "1",
              "青木商店",
              "1",
              "12000"
            ],
            [
              "1",
              "青木商店",
              "1",
              "8000"
            ],
            [
              "2",
              "北野物産",
              "2",
              "25000"
            ]
          ]
        }
      },
      {
        "heading": "同じ顧客名が2行出るのはなぜ？",
        "body": "青木商店には注文が2件あるので、結果にも青木商店が2行出ます。それぞれ注文101と注文102を表しており、同じ注文が二重に表示されたわけではありません。INNER JOINは条件に合う組み合わせをすべて返します。顧客1件につき結果も1行になるとは限りません。",
        "code": "SELECT customers.name, orders.id, orders.amount\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id\nWHERE customers.id = 1\nORDER BY orders.id;",
        "resultTable": {
          "headers": [
            "name",
            "id",
            "amount"
          ],
          "rows": [
            [
              "青木商店",
              "101",
              "12000"
            ],
            [
              "青木商店",
              "102",
              "8000"
            ]
          ]
        }
      },
      {
        "heading": "一致する注文がない顧客は結果に出ない",
        "body": "中央商事のidは3ですが、ordersにはcustomer_idが3の注文がありません。結び付く相手がないため、最初の結果表に中央商事は出てきません。次のSQLで中央商事だけを指定しても、結果は0行です。元の顧客データが削除されるわけではありません。",
        "code": "SELECT customers.name, orders.id, orders.amount\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id\nWHERE customers.id = 3;",
        "resultTable": {
          "headers": [
            "name",
            "id",
            "amount"
          ],
          "rows": []
        }
      },
      {
        "heading": "INNER JOINとLEFT JOINの違いを同じ表で比べる",
        "body": "違いは、結び付く相手がない行を残すかどうかです。INNER JOINをLEFT JOINに変えると、FROMに書いたcustomersの行はすべて残ります。注文のない中央商事も結果に出て、注文IDと金額はNULLになります。INNER JOINの結果は3行、LEFT JOINの結果は4行です。注文のある顧客だけが必要ならINNER JOIN、注文の有無にかかわらず全顧客を出すならLEFT JOINを使います。",
        "code": "SELECT customers.name, orders.id, orders.amount\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\nORDER BY customers.id, orders.id;",
        "resultTable": {
          "headers": [
            "name",
            "id",
            "amount"
          ],
          "rows": [
            [
              "青木商店",
              "101",
              "12000"
            ],
            [
              "青木商店",
              "102",
              "8000"
            ],
            [
              "北野物産",
              "103",
              "25000"
            ],
            [
              "中央商事",
              "NULL",
              "NULL"
            ]
          ]
        }
      },
      {
        "heading": "慣れたらASで表の名前を短くする",
        "body": "ここまでのcustomersをc、ordersをoと短く書くこともできます。FROM customers AS cと書くと、このSQLの中ではcがcustomersの別名になります。下のSQLは最初のSQLと同じ結果です。まずは省略しない形で理解してから、別名を使うと読みやすくなります。",
        "code": "SELECT c.name, o.id, o.amount\nFROM customers AS c\nINNER JOIN orders AS o\n  ON c.id = o.customer_id\nORDER BY o.id;",
        "resultTable": {
          "headers": [
            "name",
            "id",
            "amount"
          ],
          "rows": [
            [
              "青木商店",
              "101",
              "12000"
            ],
            [
              "青木商店",
              "102",
              "8000"
            ],
            [
              "北野物産",
              "103",
              "25000"
            ]
          ]
        }
      }
    ],
    "notes": [
      {
        "title": "結果を見比べるときはORDER BYを付ける",
        "body": "このページの例では、結果表と見比べやすいように注文IDで並べています。INNER JOIN自体は表示順を保証しないため、順番を決めたいときはORDER BYを付けます。"
      }
    ],
    "mistakes": [],
    "faqs": [
      {
        "question": "INNER JOINとLEFT JOINの違いは何ですか？",
        "answer": "結び付く注文がない顧客の扱いが違います。このページの顧客3件と注文3件では、INNER JOINは注文のある2顧客の3行だけを返し、注文のない中央商事は消えます。LEFT JOINは中央商事も残し、注文の列をNULLにして4行を返します。注文のある顧客だけならINNER JOIN、全顧客を出したいならLEFT JOINを使います。"
      },
      {
        "question": "JOINとINNER JOINは同じですか？",
        "answer": "はい。PostgreSQLではINNERを省略してJOINと書いても同じ意味です。このページでは結合の種類が分かるようにINNER JOINと書いています。"
      },
      {
        "question": "ONでは同じ名前の列を指定する必要がありますか？",
        "answer": "いいえ。この例ではcustomers.idとorders.customer_idのように、名前が違っていても同じ顧客を表すIDを比較します。列名が同じかどうかではなく、何の値かを確認して結びます。"
      }
    ],
    "references": [
      {
        "label": "PostgreSQL公式：テーブルの結合",
        "url": "https://www.postgresql.org/docs/current/tutorial-join.html",
        "description": "結合条件、列の指定、別名の基本"
      },
      {
        "label": "PostgreSQL公式：結合テーブル",
        "url": "https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN",
        "description": "INNER JOINとLEFT JOIN、ONとWHEREの仕様"
      }
    ],
    "related": [
      "select",
      "where",
      "left-join"
    ],
    "practiceCategory": "join"
  },
  {
    "slug": "left-join",
    "label": "LEFT JOIN",
    "title": "SQLのLEFT JOINとは？INNER JOINとの違いと一致しない行の残し方",
    "description": "SQLのLEFT JOINとINNER JOINの違いを、同じ顧客・注文の表の実行結果で比較。注文のない顧客を残す方法、NULLの意味、ONとWHEREの違い、0件を含む集計をPostgreSQLで学べます。",
    "lead": "LEFT JOINは、結び付く相手がなくても左側の表の行を残す構文です。「注文のない顧客も含めて一覧にしたい」ときに使います。INNER JOINと同じ顧客・注文の表で、結果の違いを確認しましょう。",
    "sampleIntro": "このページでは、次の顧客3件と注文3件を使います。ordersのcustomer_idは、注文した顧客の番号です。注文101と102は顧客1の青木商店、注文103は顧客2の北野物産に対応します。顧客3の中央商事には注文がありません。",
    "sampleTables": [
      {
        "caption": "customers：顧客の一覧",
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
      },
      {
        "caption": "orders：注文の一覧",
        "headers": [
          "id（注文ID）",
          "customer_id（注文した顧客のID）",
          "amount（金額）"
        ],
        "rows": [
          [
            "101",
            "1",
            "12000"
          ],
          [
            "102",
            "1",
            "8000"
          ],
          [
            "103",
            "2",
            "25000"
          ]
        ]
      }
    ],
    "syntax": "SELECT customers.name, orders.id, orders.amount\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\nORDER BY customers.id, orders.id;",
    "sections": [
      {
        "heading": "LEFT JOINで注文のない顧客も残す",
        "body": "FROM customersの顧客をすべて残し、条件に合う注文を結びます。中央商事には注文がないので、注文IDと金額はNULLになります。NULLはここでは「対応する注文の値がない」ことを表します。青木商店には2件の注文があるため、結果も2行です。",
        "code": "SELECT customers.name, orders.id, orders.amount\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\nORDER BY customers.id, orders.id;",
        "resultTable": {
          "headers": [
            "name",
            "id",
            "amount"
          ],
          "rows": [
            [
              "青木商店",
              "101",
              "12000"
            ],
            [
              "青木商店",
              "102",
              "8000"
            ],
            [
              "北野物産",
              "103",
              "25000"
            ],
            [
              "中央商事",
              "NULL",
              "NULL"
            ]
          ]
        }
      },
      {
        "heading": "INNER JOINとの違いを結果で比べる",
        "body": "同じSQLのLEFT JOINをINNER JOINに変えると、注文のない中央商事が結果から消えます。注文のある顧客だけならINNER JOIN、注文の有無にかかわらず全顧客を出すならLEFT JOINを使います。",
        "code": "SELECT customers.name, orders.id, orders.amount\nFROM customers\nINNER JOIN orders\n  ON customers.id = orders.customer_id\nORDER BY orders.id;",
        "resultTable": {
          "headers": [
            "name",
            "id",
            "amount"
          ],
          "rows": [
            [
              "青木商店",
              "101",
              "12000"
            ],
            [
              "青木商店",
              "102",
              "8000"
            ],
            [
              "北野物産",
              "103",
              "25000"
            ]
          ]
        }
      },
      {
        "heading": "ONに条件を加える：全顧客を残して1万円以上の注文を結ぶ",
        "body": "1万円以上の注文だけを付け、全顧客を残したい場合は、金額の条件もONに書きます。青木商店の8000円の注文は結合対象から外れますが、注文のない中央商事は残ります。",
        "code": "SELECT customers.name, orders.id, orders.amount\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\n  AND orders.amount >= 10000\nORDER BY customers.id, orders.id;",
        "resultTable": {
          "headers": [
            "name",
            "id",
            "amount"
          ],
          "rows": [
            [
              "青木商店",
              "101",
              "12000"
            ],
            [
              "北野物産",
              "103",
              "25000"
            ],
            [
              "中央商事",
              "NULL",
              "NULL"
            ]
          ]
        }
      },
      {
        "heading": "WHEREに条件を書くと、結合後の行を絞る",
        "body": "同じ金額条件をWHEREに書くと、結合後の結果から1万円以上の行だけが残ります。中央商事の金額はNULLなので条件を満たさず、中央商事も結果から消えます。全顧客を残したい場合は、前の例のようにONに条件を置きます。",
        "code": "SELECT customers.name, orders.id, orders.amount\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\nWHERE orders.amount >= 10000\nORDER BY customers.id, orders.id;",
        "resultTable": {
          "headers": [
            "name",
            "id",
            "amount"
          ],
          "rows": [
            [
              "青木商店",
              "101",
              "12000"
            ],
            [
              "北野物産",
              "103",
              "25000"
            ]
          ]
        }
      },
      {
        "heading": "IS NULLで注文のない顧客を探す",
        "body": "LEFT JOINの後でorders.id IS NULLを指定すると、注文と結び付かなかった顧客だけを取り出せます。判定には注文IDのように、元の表でNULLにならない列を使います。ここではorders.idを主キーとしています。",
        "code": "SELECT customers.id, customers.name\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\nWHERE orders.id IS NULL\nORDER BY customers.id;",
        "resultTable": {
          "headers": [
            "id",
            "name"
          ],
          "rows": [
            [
              "3",
              "中央商事"
            ]
          ]
        }
      }
    ],
    "notes": [
      {
        "title": "集計を学んだら：注文0件も数える",
        "body": "顧客別の注文数にはCOUNT(orders.id)を使います。COUNT(*)だと、注文がなくてもLEFT JOINが残した1行を数えてしまいます。COUNT(orders.id)はNULLを数えないため、中央商事を0件にできます。",
        "code": "SELECT customers.id, customers.name, COUNT(orders.id)\nFROM customers\nLEFT JOIN orders\n  ON customers.id = orders.customer_id\nGROUP BY customers.id, customers.name\nORDER BY customers.id;"
      }
    ],
    "mistakes": [],
    "faqs": [
      {
        "question": "INNER JOINとLEFT JOINの違いは何ですか？",
        "answer": "結び付く注文がない顧客の扱いが違います。このページと同じ顧客3件と注文3件では、INNER JOINは注文のある2顧客の3行だけを返し、注文のない中央商事は消えます。LEFT JOINは中央商事も残し、注文の列をNULLにして4行を返します。注文のある顧客だけならINNER JOIN、全顧客を出したいならLEFT JOINを使います。"
      },
      {
        "question": "LEFT JOINの「左」はどの表ですか？",
        "answer": "このページのように2つの表を結ぶ場合、FROMの直後に書いた表が左側です。全顧客を残したいので、customersをFROMの直後に置いています。"
      },
      {
        "question": "LEFT JOINとLEFT OUTER JOINは違いますか？",
        "answer": "同じ意味です。OUTERは省略できるため、このページではLEFT JOINと書いています。"
      }
    ],
    "references": [
      {
        "label": "PostgreSQL公式：テーブルの結合",
        "url": "https://www.postgresql.org/docs/current/tutorial-join.html",
        "description": "結合条件、列の指定、別名の基本"
      },
      {
        "label": "PostgreSQL公式：結合テーブル",
        "url": "https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN",
        "description": "INNER JOINとLEFT JOIN、ONとWHEREの仕様"
      }
    ],
    "related": [
      "inner-join",
      "where",
      "group-by"
    ]
  }
];
