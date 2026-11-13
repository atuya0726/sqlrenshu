import type { SqlTopic } from './sqlTopics';

export const deleteTopic: SqlTopic = {
  "slug": "delete",
  "label": "DELETE",
  "title": "SQLのDELETE文とは？WHEREで条件に合う行を削除する",
  "description": "SQLのDELETE文をPostgreSQLの元の表・SQL・結果表で解説。DELETE FROMとWHEREの書き方、複数行の削除、AND・OR、サブクエリ、RETURNING、WHERE忘れとTRUNCATEとの違いを学べます。",
  "lead": "DELETEは、表から行を削除するSQLです。WHEREで条件に合う行だけを選んで消します。WHEREを書き忘れると全行が消えるため、どの行が残るかを結果で確かめながら覚えましょう。",
  "sampleIntro": "productsは1行が商品1件です。idは主キー、nameは商品名、priceは価格（円）、stockは在庫数です。discontinuedは販売終了した商品のidを持つ表です。以降の各例は、この削除前の状態から始め、削除後のproductsをid順に表示した結果を示します。",
  "sampleTables": [
    {
      "caption": "products：商品5件（削除前）",
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
    },
    {
      "caption": "discontinued：販売終了の商品id 2件",
      "headers": [
        "product_id"
      ],
      "rows": [
        [
          "2"
        ],
        [
          "5"
        ]
      ]
    }
  ],
  "syntax": "DELETE FROM products\nWHERE id = 3;",
  "sections": [
    {
      "heading": "DELETE FROM ... WHEREでidを指定して1行を削除する",
      "body": "DELETE FROMの後に表名、WHEREの後に削除する行の条件を書きます。idは主キーなので、WHERE id = 3は消しゴムの1行だけを選びます。実行後のproductsは4行になり、ほかの行は変わりません。DELETE自体は結果表を返さないため、確認はSELECTで行います。",
      "code": "DELETE FROM products\nWHERE id = 3;\n\nSELECT * FROM products ORDER BY id;",
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
      "heading": "条件に合う複数の行をまとめて削除する",
      "body": "WHEREの条件に合う行は、いくつあってもすべて削除されます。stock = 0の消しゴムと付箋の2行が消え、ノート、ペン、定規の3行が残ります。",
      "code": "DELETE FROM products\nWHERE stock = 0;\n\nSELECT * FROM products ORDER BY id;",
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
            "4",
            "定規",
            "150",
            "30"
          ]
        ]
      }
    },
    {
      "heading": "ORやANDで複数の条件を組み合わせて削除する",
      "body": "ORでつなぐと、どちらかの条件に合う行がすべて削除されます。在庫が0、または価格が200以上の行を消すと、ノート、消しゴム、付箋が削除され、ペンと定規が残ります。条件を変えるときは、先に同じWHEREのSELECTで対象を確認しましょう。",
      "code": "DELETE FROM products\nWHERE stock = 0 OR price >= 200;\n\nSELECT * FROM products ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "price",
          "stock"
        ],
        "rows": [
          [
            "2",
            "ペン",
            "120",
            "100"
          ],
          [
            "4",
            "定規",
            "150",
            "30"
          ]
        ]
      }
    },
    {
      "heading": "別の表を使ったサブクエリで削除する",
      "body": "WHEREにINとサブクエリを使うと、別の表にある値を基準に削除できます。discontinuedにはid 2と5があるため、productsのペンと付箋が削除されます。サブクエリ側の表は変更されません。",
      "code": "DELETE FROM products\nWHERE id IN (SELECT product_id FROM discontinued);\n\nSELECT * FROM products ORDER BY id;",
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
          ]
        ]
      }
    },
    {
      "heading": "RETURNINGで削除した行を受け取る",
      "body": "RETURNINGを付けると、削除した行の値を受け取れます。在庫0の行を削除しつつ、何を消したかを同時に確認できます。結果に出るのは削除した消しゴムと付箋の2行です。",
      "code": "DELETE FROM products\nWHERE stock = 0\nRETURNING id, name;",
      "resultTable": {
        "headers": [
          "id",
          "name"
        ],
        "rows": [
          [
            "3",
            "消しゴム"
          ],
          [
            "5",
            "付箋"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "WHEREを書き忘れると全行が削除される",
      "body": "DELETE FROM products;のようにWHEREを省くと、表のすべての行が削除されます。表そのものは残りますが、この表では5行すべてが消えます。実行前に同じWHEREのSELECTで、対象の行を確認しましょう。",
      "code": "DELETE FROM products;"
    }
  ],
  "notes": [
    {
      "title": "全行を消すだけならTRUNCATEも使える",
      "body": "条件を付けずに全行を消す目的なら、TRUNCATEが使えます。TRUNCATEはWHEREで行を選べず、表全体を空にする命令です。通常の業務データでは、まずWHERE付きのDELETEで対象を絞る使い方が基本です。",
      "code": "TRUNCATE products;"
    }
  ],
  "faqs": [
    {
      "question": "DELETEで表そのものも消えますか？",
      "answer": "消えません。DELETEが消すのは行だけで、表の定義は残ります。表を消すにはDROP TABLEを使います。"
    },
    {
      "question": "WHEREに合う行がないとどうなりますか？",
      "answer": "エラーにはならず、0行が削除されます。どの行も変わりません。"
    },
    {
      "question": "削除した行は元に戻せますか？",
      "answer": "実行して確定した後は、DELETEだけでは戻せません。取り消す可能性がある操作は、BEGINからROLLBACKまでのトランザクションの中で実行すると、確定前なら元に戻せます。"
    },
    {
      "question": "DELETEとTRUNCATEの違いは？",
      "answer": "DELETEはWHEREで行を選べますが、TRUNCATEは表の全行を空にします。条件付きで消すならDELETEを使います。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：データの削除",
      "url": "https://www.postgresql.org/docs/current/dml-delete.html",
      "description": "DELETEの基本、WHEREの注意"
    },
    {
      "label": "PostgreSQL公式：DELETE",
      "url": "https://www.postgresql.org/docs/current/sql-delete.html",
      "description": "DELETEの構文、WHERE、RETURNING"
    },
    {
      "label": "PostgreSQL公式：TRUNCATE",
      "url": "https://www.postgresql.org/docs/current/sql-truncate.html",
      "description": "TRUNCATEと全行DELETEの違い"
    },
    {
      "label": "PostgreSQL公式：トランザクション",
      "url": "https://www.postgresql.org/docs/current/tutorial-transactions.html",
      "description": "BEGINとROLLBACKによる取り消し"
    }
  ],
  "related": [
    "insert",
    "update",
    "where",
    "exists"
  ],
  "practiceCategory": "delete"
};
