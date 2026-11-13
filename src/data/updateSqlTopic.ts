import type { SqlTopic } from './sqlTopics';

export const updateTopic: SqlTopic = {
  "slug": "update",
  "label": "UPDATE",
  "title": "SQLのUPDATE文とは？WHEREで行を選んで値を書き換える",
  "description": "SQLのUPDATE文をPostgreSQLの元の表・SQL・結果表で解説。SETとWHEREの書き方、複数列の更新、現在の値を使った計算、複数行の更新、RETURNING、WHERE忘れの危険を学べます。",
  "lead": "UPDATEは、表にすでにある行の値を書き換えるSQLです。SETで新しい値を指定し、WHEREで書き換える行を選びます。WHEREを書き忘れると全行が書き換わるため、どの行が対象になるかを結果で確かめながら覚えましょう。",
  "sampleIntro": "productsは1行が商品1件です。idは主キー、nameは商品名、priceは価格（円）、stockは在庫数です。消しゴムと付箋は在庫が0です。以降の各例は、この更新前の状態から始め、更新後のproductsをid順に表示した結果を示します。",
  "sampleTables": [
    {
      "caption": "products：商品5件（更新前）",
      "headers": [
        "id",
        "name",
        "price",
        "stock"
      ],
      "rows": [
        [
          "1",
          "ノート",
          "200",
          "50"
        ],
        [
          "2",
          "ペン",
          "120",
          "100"
        ],
        [
          "3",
          "消しゴム",
          "80",
          "0"
        ],
        [
          "4",
          "定規",
          "150",
          "30"
        ],
        [
          "5",
          "付箋",
          "100",
          "0"
        ]
      ]
    }
  ],
  "syntax": "UPDATE products\nSET price = 130\nWHERE id = 2;",
  "sections": [
    {
      "heading": "UPDATE ... SET ... WHEREで1行を書き換える",
      "body": "UPDATEの後に表名、SETの後に「列 = 新しい値」、WHEREの後に対象の条件を書きます。idは主キーなので、WHERE id = 2はペンの1行だけを選びます。ペンの価格が120から130に変わり、ほかの4行は変わりません。",
      "code": "UPDATE products\nSET price = 130\nWHERE id = 2;\n\nSELECT * FROM products ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "price",
          "stock"
        ],
        "rows": [
          [
            "1",
            "ノート",
            "200",
            "50"
          ],
          [
            "2",
            "ペン",
            "130",
            "100"
          ],
          [
            "3",
            "消しゴム",
            "80",
            "0"
          ],
          [
            "4",
            "定規",
            "150",
            "30"
          ],
          [
            "5",
            "付箋",
            "100",
            "0"
          ]
        ]
      }
    },
    {
      "heading": "複数の列をカンマで区切って同時に書き換える",
      "body": "SETには、カンマで区切って複数の列を並べられます。ノートの価格を250、在庫を40にまとめて書き換えます。列ごとにUPDATEを分けず、1つの文で1行をまとめて更新できます。",
      "code": "UPDATE products\nSET price = 250, stock = 40\nWHERE id = 1;\n\nSELECT * FROM products ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "price",
          "stock"
        ],
        "rows": [
          [
            "1",
            "ノート",
            "250",
            "40"
          ],
          [
            "2",
            "ペン",
            "120",
            "100"
          ],
          [
            "3",
            "消しゴム",
            "80",
            "0"
          ],
          [
            "4",
            "定規",
            "150",
            "30"
          ],
          [
            "5",
            "付箋",
            "100",
            "0"
          ]
        ]
      }
    },
    {
      "heading": "現在の値を使って計算した結果に書き換える",
      "body": "SETの右辺に、その行の現在の列を使った式を書けます。stock = stock - 1は「今の在庫から1を引く」という意味です。ペンの在庫が100から99になります。右辺の列名は、更新前のその行の値を指します。",
      "code": "UPDATE products\nSET stock = stock - 1\nWHERE id = 2;\n\nSELECT * FROM products ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "price",
          "stock"
        ],
        "rows": [
          [
            "1",
            "ノート",
            "200",
            "50"
          ],
          [
            "2",
            "ペン",
            "120",
            "99"
          ],
          [
            "3",
            "消しゴム",
            "80",
            "0"
          ],
          [
            "4",
            "定規",
            "150",
            "30"
          ],
          [
            "5",
            "付箋",
            "100",
            "0"
          ]
        ]
      }
    },
    {
      "heading": "WHEREに合う複数の行をまとめて書き換える",
      "body": "WHEREの条件に合う行がいくつあっても、すべて書き換わります。stock = 0の消しゴムと付箋の2行が対象になり、在庫がどちらも20になります。条件に合わない3行は変わりません。",
      "code": "UPDATE products\nSET stock = 20\nWHERE stock = 0;\n\nSELECT * FROM products ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "price",
          "stock"
        ],
        "rows": [
          [
            "1",
            "ノート",
            "200",
            "50"
          ],
          [
            "2",
            "ペン",
            "120",
            "100"
          ],
          [
            "3",
            "消しゴム",
            "80",
            "20"
          ],
          [
            "4",
            "定規",
            "150",
            "30"
          ],
          [
            "5",
            "付箋",
            "100",
            "20"
          ]
        ]
      }
    },
    {
      "heading": "RETURNINGで更新した行を受け取る",
      "body": "RETURNINGを付けると、更新後の値を受け取れます。在庫のある3行（ノート、ペン、定規）の価格を10円上げ、更新された行のidと新しい価格を確認します。更新されなかった行は結果に出ません。",
      "code": "UPDATE products\nSET price = price + 10\nWHERE stock > 0\nRETURNING id, price;",
      "resultTable": {
        "headers": [
          "id",
          "price"
        ],
        "rows": [
          [
            "1",
            "210"
          ],
          [
            "2",
            "130"
          ],
          [
            "4",
            "160"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "WHEREを書き忘れると全行が更新される",
      "body": "UPDATE products SET stock = 0;のようにWHEREを省くと、表のすべての行が対象になります。この表では5行すべての在庫が0になります。更新前に同じWHEREをSELECTに付けて、対象の行を確認する習慣をつけましょう。",
      "code": "UPDATE products\nSET stock = 0;"
    }
  ],
  "notes": [
    {
      "title": "複数の列を括弧でまとめて代入できる",
      "body": "PostgreSQLでは、SET (price, stock) = (250, 40)のように、列と値を括弧でまとめて書けます。列の数と値の数は同じにします。",
      "code": "UPDATE products\nSET (price, stock) = (250, 40)\nWHERE id = 1;"
    }
  ],
  "faqs": [
    {
      "question": "何行が更新されたかを知るには？",
      "answer": "RETURNINGで更新した行を受け取れば、行数と値を確認できます。多くのクライアントは、UPDATE 3のように更新した件数も表示します。"
    },
    {
      "question": "WHEREに合う行がないとどうなりますか？",
      "answer": "エラーにはならず、0行が更新されます。どの行も変わりません。条件の書き間違いに気づくために、更新件数やRETURNINGを確認します。"
    },
    {
      "question": "SETの右辺で同じ行の別の列を使えますか？",
      "answer": "使えます。price = price + 10のように、その行の更新前の値を使って計算できます。"
    },
    {
      "question": "UPDATEとINSERTはどう使い分けますか？",
      "answer": "すでにある行の値を変えるのがUPDATE、新しい行を増やすのがINSERTです。行があれば更新し、なければ追加したい場合はINSERTのON CONFLICT DO UPDATEが使えます。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：データの更新",
      "url": "https://www.postgresql.org/docs/current/dml-update.html",
      "description": "UPDATEの基本、複数列、条件"
    },
    {
      "label": "PostgreSQL公式：UPDATE",
      "url": "https://www.postgresql.org/docs/current/sql-update.html",
      "description": "SET、WHERE、RETURNING、列のグループ代入"
    },
    {
      "label": "PostgreSQL公式：変更した行からのデータ返却",
      "url": "https://www.postgresql.org/docs/current/dml-returning.html",
      "description": "RETURNING句の使い方"
    }
  ],
  "related": [
    "insert",
    "delete",
    "where",
    "case"
  ],
  "practiceCategory": "update"
};
