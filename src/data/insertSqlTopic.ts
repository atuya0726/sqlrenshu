import type { SqlTopic } from './sqlTopics';

export const insertTopic: SqlTopic = {
  "slug": "insert",
  "label": "INSERT",
  "title": "SQLのINSERT文とは？VALUESでデータを追加する書き方",
  "description": "SQLのINSERT文をPostgreSQLの元の表・SQL・結果表で解説。VALUESでの1行追加、列の省略とDEFAULT、複数行、INSERT SELECT、RETURNINGを演習付きで学べます。",
  "lead": "INSERTは、表に新しい行を追加するSQLです。商品表に商品を1件追加する、まとめて追加する、別の表の内容をコピーして追加する、といった作業ができます。追加前の表と追加後の表を見比べながら読みましょう。",
  "sampleIntro": "productsは1行が商品1件です。idは主キー、nameは商品名、priceは価格（円）、stockは在庫数で、stockを省略すると0が入ります。arrivalsは入荷予定の商品で、products追加用の元データです。以降の各例では、実行前の状態から追加し、追加後のproductsをid順に表示した結果を示します。",
  "sampleTables": [
    {
      "caption": "products：商品3件（追加前）",
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
        ]
      ]
    },
    {
      "caption": "arrivals：入荷予定2件",
      "headers": [
        "id",
        "name",
        "price",
        "stock"
      ],
      "rows": [
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
  ],
  "syntax": "INSERT INTO products (id, name, price, stock)\nVALUES (4, '定規', 150, 30);",
  "sections": [
    {
      "heading": "INSERT INTO ... VALUESで1行を追加する",
      "body": "INSERT INTOの後に表名と列名のリスト、VALUESの後に同じ順番で値を書きます。列名と値は位置で対応します。文字列はシングルクォートで囲みます。この文を実行すると、定規の行が1件増えて4行になります。INSERT自体は結果表を返さないため、追加後の表はSELECTで確認します。",
      "code": "INSERT INTO products (id, name, price, stock)\nVALUES (4, '定規', 150, 30);\n\nSELECT * FROM products ORDER BY id;",
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
      "heading": "列を省略してDEFAULTの値に任せる",
      "body": "列名のリストに書かなかった列には、その列のDEFAULT、なければNULLが入ります。stockにはDEFAULT 0があるので、定規の在庫は0になります。NOT NULLでDEFAULTもない列を省略するとエラーになるため、nameやpriceは省略できません。",
      "code": "INSERT INTO products (id, name, price)\nVALUES (4, '定規', 150);\n\nSELECT * FROM products ORDER BY id;",
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
            "0"
          ],
          [
            "4",
            "定規",
            "150",
            "0"
          ]
        ]
      }
    },
    {
      "heading": "VALUESに複数行を並べてまとめて追加する",
      "body": "VALUESの後に、カッコで囲んだ行をカンマで区切って並べると、1つの文で複数行を追加できます。定規と付箋を1回で追加し、表は5行になります。どれか1行でも制約に反するとエラーになり、追加される行はありません。",
      "code": "INSERT INTO products (id, name, price, stock)\nVALUES\n  (4, '定規', 150, 30),\n  (5, '付箋', 100, 20);\n\nSELECT * FROM products ORDER BY id;",
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
            "20"
          ]
        ]
      }
    },
    {
      "heading": "INSERT ... SELECTで別の表の行を追加する",
      "body": "VALUESの代わりにSELECTを書くと、別の表の検索結果をそのまま追加できます。arrivalsの2行をproductsへコピーするため、列名リストとSELECTの列は同じ数・同じ順番にします。入荷予定の表は変わらず、productsだけが5行になります。",
      "code": "INSERT INTO products (id, name, price, stock)\nSELECT id, name, price, stock\nFROM arrivals;\n\nSELECT * FROM products ORDER BY id;",
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
            "20"
          ]
        ]
      }
    },
    {
      "heading": "RETURNINGで追加した行をその場で受け取る",
      "body": "RETURNINGを付けると、追加した行の値をINSERTの結果として受け取れます。stockを省略した行にはDEFAULTの0が入っていることを、別のSELECTなしで確認できます。結果には追加した1行だけが出ます。",
      "code": "INSERT INTO products (id, name, price)\nVALUES (4, '定規', 150)\nRETURNING *;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "price",
          "stock"
        ],
        "rows": [
          [
            "4",
            "定規",
            "150",
            "0"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "主キーがすでにある値を追加するとエラーになる",
      "body": "idは主キーなので、すでにあるid 3をもう一度INSERTすると重複エラーになり、その文では何も追加されません。新しい行には使われていないidを指定します。"
    },
    {
      "title": "列名リストと値の数を合わせる",
      "body": "INSERT INTO products (id, name, price) VALUES (4, '定規')のように列数と値の数が合わないと、構文エラーになります。列名と値は先頭から順に対応させます。"
    }
  ],
  "notes": [
    {
      "title": "ON CONFLICT DO NOTHINGで重複をエラーにしない",
      "body": "PostgreSQLのON CONFLICTを使うと、主キーなどの重複があるときの動作を指定できます。DO NOTHINGなら、重複した行だけを追加せずにスキップします。次の例はid 3がすでにあるので、0行の追加になります。",
      "code": "INSERT INTO products (id, name, price, stock)\nVALUES (3, '消しゴム', 80, 0)\nON CONFLICT (id) DO NOTHING;"
    }
  ],
  "faqs": [
    {
      "question": "列名のリストは省略できますか？",
      "answer": "できます。INSERT INTO products VALUES (4, '定規', 150, 30)のように書くと、表を作ったときの列の順番で値が対応します。列の追加や順番の変更で壊れやすいため、列名を書くほうが安全です。"
    },
    {
      "question": "追加した結果はどう確認しますか？",
      "answer": "追加後にSELECTで表を見るか、INSERTにRETURNINGを付けて追加した行を受け取ります。このページの各例では、確認用のSELECTを続けて示しています。"
    },
    {
      "question": "文字列の値はどう書きますか？",
      "answer": "シングルクォートで囲みます。ダブルクォートは表名や列名などの識別子を囲む記号で、値には使いません。"
    },
    {
      "question": "一度に複数行を追加できますか？",
      "answer": "VALUESに複数行を並べるか、INSERT ... SELECTを使えば、1つの文で複数行を追加できます。どれか1行でも制約に反すると、その文で追加される行はありません。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：データの挿入",
      "url": "https://www.postgresql.org/docs/current/dml-insert.html",
      "description": "INSERTの基本、列の省略、複数行"
    },
    {
      "label": "PostgreSQL公式：INSERT",
      "url": "https://www.postgresql.org/docs/current/sql-insert.html",
      "description": "INSERTの構文、DEFAULT、ON CONFLICT、RETURNING"
    },
    {
      "label": "PostgreSQL公式：変更した行からのデータ返却",
      "url": "https://www.postgresql.org/docs/current/dml-returning.html",
      "description": "RETURNING句の使い方"
    }
  ],
  "related": [
    "update",
    "delete",
    "select",
    "where"
  ],
  "practiceCategory": "insert"
};
