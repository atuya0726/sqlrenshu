import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  "setup": "CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, price integer, stock integer NOT NULL);\nINSERT INTO products VALUES (1, 'ノート', 200, 50), (2, 'ペン', 120, 100), (3, '消しゴム', 80, 0), (4, '定規', 150, 30), (5, '付箋', 100, 0);\nCREATE TABLE price_updates (product_id integer PRIMARY KEY, new_price integer NOT NULL);\nINSERT INTO price_updates VALUES (1, 220), (2, 130), (3, 90), (4, 140), (9, 500);\nCREATE TABLE sales (product_id integer NOT NULL, quantity integer NOT NULL);\nINSERT INTO sales VALUES (1, 10), (1, 5), (2, 20), (4, 10);",
  "sources": [
    "SELECT * FROM products ORDER BY id",
    "SELECT * FROM price_updates ORDER BY product_id",
    "SELECT * FROM sales ORDER BY product_id, quantity"
  ]
};

export const topic: SqlTopic = {
  "slug": "update-from",
  "label": "UPDATE … FROM",
  "title": "PostgreSQLのUPDATE … FROMとは？別の表の値で更新する書き方と注意点",
  "description": "PostgreSQLのUPDATE … FROMを元の表・SQL・結果表で解説。別の表の値で更新する書き方、結合条件の書き忘れの危険、相関サブクエリとの比較、集計結果での更新、MySQLなど他DBとの違いを演習付きで学べます。",
  "lead": "UPDATE … FROMは、別の表の値を使って表の行を書き換えるPostgreSQLの書き方です。新しい価格の一覧で商品の価格をそろえる、販売記録の合計で在庫を減らす、といった更新を、SETにその表の列をそのまま書いて行えます。標準SQLではなくPostgreSQLの拡張なので、他のDBの書き方との違いにも注意が必要です。",
  "sampleIntro": "productsは商品1件が1行で、idは商品番号、nameは商品名、priceは価格（円）、stockは在庫数です。price_updatesは新しい価格の一覧で、product_idがproductsのidに対応します。product_idが9の行は、productsに該当する商品がありません。salesは販売記録で、同じ商品が複数行に出てきます。各節では実行前の状態から更新し、更新後のproductsをid順に表示します。",
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
    },
    {
      "caption": "price_updates：新しい価格の一覧5件",
      "headers": [
        "product_id",
        "new_price"
      ],
      "rows": [
        [
          "1",
          "220"
        ],
        [
          "2",
          "130"
        ],
        [
          "3",
          "90"
        ],
        [
          "4",
          "140"
        ],
        [
          "9",
          "500"
        ]
      ]
    },
    {
      "caption": "sales：販売記録4件",
      "headers": [
        "product_id",
        "quantity"
      ],
      "rows": [
        [
          "1",
          "5"
        ],
        [
          "1",
          "10"
        ],
        [
          "2",
          "20"
        ],
        [
          "4",
          "10"
        ]
      ]
    }
  ],
  "syntax": "UPDATE products\nSET price = u.new_price\nFROM price_updates AS u\nWHERE products.id = u.product_id;",
  "sections": [
    {
      "heading": "FROMで別の表を指定して、その値で更新する",
      "body": "UPDATEの後ろにFROMを書くと、更新先の表とその表を結合して、結合後の各行ごとに更新できます。SETの右辺にはFROMの表の列を使え、結合の条件はWHEREに書きます。ここではid 1・2・3・4の価格が新しい価格に変わります。price_updatesに無いid 5は結合に一致しないので、更新されず100円のままです。",
      "code": "UPDATE products\nSET price = u.new_price\nFROM price_updates AS u\nWHERE products.id = u.product_id;\n\nSELECT * FROM products ORDER BY id;",
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
            "220",
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
            "90",
            "0"
          ],
          [
            "4",
            "定規",
            "140",
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
      "heading": "結合条件に絞り込みを足して一部だけ更新する",
      "body": "結合条件のあとにANDで条件を足すと、更新する行をさらに絞れます。条件にはFROMの表の列も、更新先の表の列も使えます。ここでは在庫のある商品だけを更新するため、在庫0のid 3は新しい価格の候補があっても80円のままです。結合に一致しない行と同じく、条件を満たさない行は変更されません。",
      "code": "UPDATE products\nSET price = u.new_price\nFROM price_updates AS u\nWHERE products.id = u.product_id\n  AND products.stock > 0;\n\nSELECT * FROM products ORDER BY id;",
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
            "220",
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
            "140",
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
      "heading": "相関サブクエリで同じ更新を書いて比べる",
      "body": "FROMを使わず、SETの右辺にサブクエリを書く方法でも同じ結果になります。ただし、サブクエリは一致する行が無いとNULLを返すので、WHEREで「price_updatesに行がある商品だけ」に絞る必要があります。公式ドキュメントも、FROMの結合は一致が複数あると結果が予測できなくなるため、他の表をサブクエリだけで参照する方が安全だが読みにくく遅いことが多い、と説明しています。",
      "code": "UPDATE products\nSET price = (\n  SELECT u.new_price\n  FROM price_updates AS u\n  WHERE u.product_id = products.id\n)\nWHERE EXISTS (\n  SELECT 1\n  FROM price_updates AS u\n  WHERE u.product_id = products.id\n);\n\nSELECT * FROM products ORDER BY id;",
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
            "220",
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
            "90",
            "0"
          ],
          [
            "4",
            "定規",
            "140",
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
      "heading": "集計した結果を使って更新する",
      "body": "集計が必要なときは、FROMにサブクエリ（派生表）を書きます。salesを商品ごとにSUMでまとめてから結合するので、更新先の1行に結合される行が1行になります。集計せずにsalesを直接結合すると、id 1のように複数行ある商品でどの行が使われるか決まりません。ここでは在庫から販売数量の合計を引き、id 1は50-15で35、id 2は100-20で80、id 4は30-10で20になります。",
      "code": "UPDATE products\nSET stock = products.stock - s.sold\nFROM (\n  SELECT product_id, SUM(quantity) AS sold\n  FROM sales\n  GROUP BY product_id\n) AS s\nWHERE products.id = s.product_id;\n\nSELECT * FROM products ORDER BY id;",
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
            "35"
          ],
          [
            "2",
            "ペン",
            "120",
            "80"
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
            "20"
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
      "heading": "別名の付け方とMySQLなど他DBとの書き方の違い",
      "body": "更新先にも別名を付けられ、WHEREでは別名で参照します。一方、SETの左側の列名には更新先の表名や別名を付けられません。ここでは現在より高い新価格のときだけ更新するので、値下げ（150円から140円）のid 4は変わりません。MySQLはUPDATEの直後にJOINを書く形、SQL ServerはFROMの中で更新先の表をもう一度書く形で、どちらもPostgreSQLとは異なります。PostgreSQLのFROMで更新先の表を再掲すると、別の行との自己結合になります。",
      "code": "UPDATE products AS p\nSET price = u.new_price\nFROM price_updates AS u\nWHERE p.id = u.product_id\n  AND u.new_price > p.price;\n\nSELECT * FROM products ORDER BY id;",
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
            "220",
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
            "90",
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
    }
  ],
  "mistakes": [
    {
      "title": "結合条件を書き忘れると、全商品が同じ価格になることがある",
      "body": "WHEREで結合条件を書かないと、すべての商品とすべての新価格の組み合わせができ、更新先の1行に複数行が結合されます。この場合どの行の値が使われるかは決まっておらず、実際には全商品が同じ価格になることが多くなります。エラーも出ないので、更新後の表を見るまで気づけません。FROMを書いたら、更新先との結合条件が必ずあるか確認します。",
      "code": "UPDATE products\nSET price = u.new_price\nFROM price_updates AS u;\n\nSELECT * FROM products ORDER BY id;"
    },
    {
      "title": "相関サブクエリでWHEREを省くと、一致しない行がNULLになる",
      "body": "SETの右辺をサブクエリにしてWHEREを書かないと、全行が更新対象になります。price_updatesに無い商品はサブクエリがNULLを返すため、id 5の価格がNULLに書き換わります。NOT NULL制約のある列では、エラーで文全体が失敗します。「一致する行だけ」に絞るWHERE EXISTSが必要です。",
      "code": "UPDATE products\nSET price = (\n  SELECT u.new_price\n  FROM price_updates AS u\n  WHERE u.product_id = products.id\n);\n\nSELECT * FROM products ORDER BY id;"
    }
  ],
  "notes": [
    {
      "title": "更新先の1行に結合される行は、1行までにする",
      "body": "公式ドキュメントは、FROMを使うときは更新先の1行が他の表の複数行に結合されないようにするよう求めています。複数行に結合された場合は、そのうち1行だけが更新に使われ、どの行かは予測できません。price_updatesのように主キーでそろえる、集計でまとめるなど、結合の相手が1行になる設計にします。"
    },
    {
      "title": "更新先の表をFROMにもう一度書かない",
      "body": "PostgreSQLでは、更新先の表をFROMにも書くと、別の行どうしの自己結合になります。更新先の表を再掲する書き方をするDBもあるため、移植するときは注意が必要です。自己結合をしたいときだけ、FROM側に別名を付けて書きます。"
    },
    {
      "title": "RETURNINGでFROMの表の値も受け取れる",
      "body": "UPDATEにRETURNINGを付けると、更新された行ごとに、更新先の列だけでなくFROMの表の列も返せます。どの値で更新されたかを、その場で確認したいときに便利です。",
      "code": "UPDATE products\nSET price = u.new_price\nFROM price_updates AS u\nWHERE products.id = u.product_id\nRETURNING products.id, products.price, u.new_price;"
    }
  ],
  "faqs": [
    {
      "question": "UPDATE … FROMは標準SQLですか？",
      "answer": "標準SQLではなく、PostgreSQLの拡張です。公式ドキュメントも、FROMとRETURNINGはPostgreSQLの拡張だと説明しています。標準SQLに沿った書き方にしたいときは、相関サブクエリで書きます。"
    },
    {
      "question": "MySQLのUPDATE JOINと同じように書けますか？",
      "answer": "MySQLの「UPDATE 表 JOIN 別の表 ON 条件 SET …」は、PostgreSQLではそのままでは動きません。別の表をFROMに書き、結合条件をWHEREに書き換えます。SQL ServerのようにFROMで更新先を再掲する書き方も、PostgreSQLでは自己結合になるので使えません。"
    },
    {
      "question": "別の表に一致しない行はどうなりますか？",
      "answer": "FROMの結合に一致しない行は更新対象にならず、そのまま残ります。NULLに書き換わるのは、SETの右辺をサブクエリで書き、WHEREで絞らなかったときです。"
    },
    {
      "question": "MERGEとの違いは何ですか？",
      "answer": "UPDATE … FROMは「一致した行を更新する」だけです。一致した行は更新し、一致しない行は追加する、というように1文で分けて処理したいときは、PostgreSQL 15以降で使えるMERGEが向いています。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：UPDATE",
      "url": "https://www.postgresql.org/docs/current/sql-update.html",
      "description": "FROM句の仕様、結合が複数行になるときの注意、標準SQLとの互換性、他DBとのFROMの解釈の違いを確認しました。"
    },
    {
      "label": "PostgreSQL公式：データの更新",
      "url": "https://www.postgresql.org/docs/current/dml-update.html",
      "description": "UPDATEの基本的な考え方を確認しました。"
    }
  ],
  "related": [
    "update",
    "delete-using",
    "merge",
    "subquery",
    "correlated-subquery",
    "inner-join"
  ],
  "practiceCategory": "update-from"
};
