import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  "setup": "CREATE TABLE orders (id integer PRIMARY KEY, customer text NOT NULL, amount integer NOT NULL, status text NOT NULL);\nINSERT INTO orders VALUES (1, '佐藤', 3000, 'paid'), (2, '鈴木', 1200, 'cancelled'), (3, '佐藤', 4500, 'paid'), (4, '田中', 800, 'paid'), (5, '鈴木', 2000, 'paid');\nCREATE TABLE order_archive (id integer PRIMARY KEY, customer text NOT NULL, amount integer NOT NULL, status text NOT NULL, archived_by text NOT NULL DEFAULT 'system');\nCREATE TABLE customer_sales (customer text PRIMARY KEY, total integer NOT NULL, order_count integer NOT NULL);\nINSERT INTO customer_sales VALUES ('高橋', 5000, 2);\nCREATE TABLE customers (name text PRIMARY KEY);\nINSERT INTO customers VALUES ('佐藤');",
  "sources": [
    "SELECT * FROM orders ORDER BY id",
    "SELECT * FROM order_archive ORDER BY id",
    "SELECT * FROM customer_sales ORDER BY total",
    "SELECT * FROM customers ORDER BY name"
  ]
};

export const topic: SqlTopic = {
  "slug": "insert-select",
  "label": "INSERT … SELECT",
  "title": "SQLのINSERT … SELECTとは？別の表の検索結果をまとめて追加する書き方",
  "description": "SQLのINSERT … SELECTをPostgreSQLの元の表・SQL・結果表で解説。検索結果のコピー、列の対応、WHEREで絞って追加、集計結果の保存、NOT EXISTSで重複させない追加を演習付きで学べます。",
  "lead": "INSERT … SELECTは、SELECTで取り出した行をそのまま別の表へ追加するSQLです。注文を保管用の表へコピーする、集計結果を別の表に残す、まだ登録されていないものだけを足す、といった作業を1文で行えます。VALUESで1行ずつ値を書く方法との違いは、追加する値をクエリの結果から作る点です。",
  "sampleIntro": "ordersは注文1件が1行で、idは注文番号、customerは顧客名、amountは金額（円）、statusは支払状態（paid=支払済み、cancelled=取消）です。order_archiveは注文の保管先で、はじめは空です。archived_byは省略するとsystemが入ります。customer_salesは顧客別の売上の記録、customersは登録済みの顧客名の一覧です。各節では実行前の状態から追加し、追加先の表を確認用のSELECTで表示します。",
  "sampleTables": [
    {
      "caption": "orders：注文5件",
      "headers": [
        "id",
        "customer",
        "amount",
        "status"
      ],
      "rows": [
        [
          "1",
          "佐藤",
          "3000",
          "paid"
        ],
        [
          "2",
          "鈴木",
          "1200",
          "cancelled"
        ],
        [
          "3",
          "佐藤",
          "4500",
          "paid"
        ],
        [
          "4",
          "田中",
          "800",
          "paid"
        ],
        [
          "5",
          "鈴木",
          "2000",
          "paid"
        ]
      ]
    },
    {
      "caption": "order_archive：注文の保管先（空）",
      "headers": [
        "id",
        "customer",
        "amount",
        "status",
        "archived_by"
      ],
      "rows": []
    },
    {
      "caption": "customer_sales：顧客別の売上記録1件",
      "headers": [
        "customer",
        "total",
        "order_count"
      ],
      "rows": [
        [
          "高橋",
          "5000",
          "2"
        ]
      ]
    },
    {
      "caption": "customers：登録済みの顧客1件",
      "headers": [
        "name"
      ],
      "rows": [
        [
          "佐藤"
        ]
      ]
    }
  ],
  "syntax": "INSERT INTO order_archive (id, customer, amount, status)\nSELECT id, customer, amount, status\nFROM orders;",
  "sections": [
    {
      "heading": "INSERT … SELECTで別の表へ検索結果をコピーする",
      "body": "INSERT INTO 追加先 (列名のリスト) の後ろに、VALUESの代わりにSELECTを書きます。SELECTが返した行がすべて追加先に入るので、ここではordersの5行がorder_archiveに5行追加されます。元のordersは変わりません。追加された内容はSELECTで確認します。",
      "code": "INSERT INTO order_archive (id, customer, amount, status)\nSELECT id, customer, amount, status\nFROM orders;\n\nSELECT * FROM order_archive ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "customer",
          "amount",
          "status",
          "archived_by"
        ],
        "rows": [
          [
            "1",
            "佐藤",
            "3000",
            "paid",
            "system"
          ],
          [
            "2",
            "鈴木",
            "1200",
            "cancelled",
            "system"
          ],
          [
            "3",
            "佐藤",
            "4500",
            "paid",
            "system"
          ],
          [
            "4",
            "田中",
            "800",
            "paid",
            "system"
          ],
          [
            "5",
            "鈴木",
            "2000",
            "paid",
            "system"
          ]
        ]
      }
    },
    {
      "heading": "SELECTの列は列名リストと左から順に対応する",
      "body": "列は名前ではなく位置で対応します。INSERT側の列名リストが (customer, id, amount, status, archived_by) なら、SELECT側も同じ順に customer, id, amount, status, 追加したい値 と並べます。固定の文字列や計算式もSELECTに書けるので、archived_byには「月次バッチ」を入れています。列名リストに書かない列は既定値になります。",
      "code": "INSERT INTO order_archive (customer, id, amount, status, archived_by)\nSELECT customer, id, amount, status, '月次バッチ'\nFROM orders;\n\nSELECT * FROM order_archive ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "customer",
          "amount",
          "status",
          "archived_by"
        ],
        "rows": [
          [
            "1",
            "佐藤",
            "3000",
            "paid",
            "月次バッチ"
          ],
          [
            "2",
            "鈴木",
            "1200",
            "cancelled",
            "月次バッチ"
          ],
          [
            "3",
            "佐藤",
            "4500",
            "paid",
            "月次バッチ"
          ],
          [
            "4",
            "田中",
            "800",
            "paid",
            "月次バッチ"
          ],
          [
            "5",
            "鈴木",
            "2000",
            "paid",
            "月次バッチ"
          ]
        ]
      }
    },
    {
      "heading": "WHEREで絞り込んだ行だけを追加する",
      "body": "SELECTには通常どおりWHEREを付けられます。追加されるのは条件に合う行だけです。ここでは支払済み（paid）の4件だけをコピーし、取消のid 2は追加されません。条件を付け忘れると取消の注文まで保管先に入ります。",
      "code": "INSERT INTO order_archive (id, customer, amount, status)\nSELECT id, customer, amount, status\nFROM orders\nWHERE status = 'paid';\n\nSELECT * FROM order_archive ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "customer",
          "amount",
          "status",
          "archived_by"
        ],
        "rows": [
          [
            "1",
            "佐藤",
            "3000",
            "paid",
            "system"
          ],
          [
            "3",
            "佐藤",
            "4500",
            "paid",
            "system"
          ],
          [
            "4",
            "田中",
            "800",
            "paid",
            "system"
          ],
          [
            "5",
            "鈴木",
            "2000",
            "paid",
            "system"
          ]
        ]
      }
    },
    {
      "heading": "集計した結果を別の表に保存する",
      "body": "GROUP BYで集計したSELECTも、そのまま追加元にできます。支払済みの注文を顧客ごとに合計し、顧客名・合計金額・件数を customer_sales に保存します。SUMはbigintを返しますが、integerの列にはそのまま入ります。結果は最初から入っていた高橋の行と合わせて4行になります。",
      "code": "INSERT INTO customer_sales (customer, total, order_count)\nSELECT customer, SUM(amount), COUNT(*)\nFROM orders\nWHERE status = 'paid'\nGROUP BY customer;\n\nSELECT * FROM customer_sales ORDER BY total;",
      "resultTable": {
        "headers": [
          "customer",
          "total",
          "order_count"
        ],
        "rows": [
          [
            "田中",
            "800",
            "1"
          ],
          [
            "鈴木",
            "2000",
            "1"
          ],
          [
            "高橋",
            "5000",
            "2"
          ],
          [
            "佐藤",
            "7500",
            "2"
          ]
        ]
      }
    },
    {
      "heading": "NOT EXISTSで登録済みを除いて重複させない",
      "body": "customersの主キーは名前なので、同じ名前をもう一度入れるとエラーになり、文全体が取り消されます。登録済みの佐藤を除くには、追加元でNOT EXISTSを使います。ordersには佐藤と鈴木が2回ずつ出てくるため、DISTINCTで1人1行にそろえるのも必要です。結果は、まだ無かった田中と鈴木だけが増えて3人になります。",
      "code": "INSERT INTO customers (name)\nSELECT DISTINCT o.customer\nFROM orders AS o\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM customers AS c\n  WHERE c.name = o.customer\n);\n\nSELECT * FROM customers ORDER BY name;",
      "resultTable": {
        "headers": [
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
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "同じ型の列の順番を取り違えると、エラーにならず別の列へ入る",
      "body": "SELECTの列は位置で対応するため、customerとstatusのように同じ型（text）の列を入れ替えても実行できてしまいます。下の例ではstatusの値（paid・cancelled）が顧客名の列に入ります。型が違う場合はエラーになりますが、同じ型だと間違いに気づけません。列名リストとSELECTの並びは、必ず目で見比べて確認します。",
      "code": "INSERT INTO order_archive (id, customer, amount, status)\nSELECT id, status, amount, customer\nFROM orders;\n\nSELECT * FROM order_archive ORDER BY id;"
    }
  ],
  "notes": [
    {
      "title": "ON CONFLICT DO NOTHINGでも重複を避けられる（PostgreSQL）",
      "body": "主キーや一意制約と衝突する行を、エラーにせず読み飛ばす書き方もあります。ON CONFLICT DO NOTHINGを付けると、既に登録済みの行は追加されません。標準SQLではなくPostgreSQLの拡張で、conflict_targetを省略すると使えるすべての制約・一意インデックスとの衝突が対象になります。主キー以外の条件で除きたいときは、NOT EXISTSを使います。",
      "code": "INSERT INTO customers (name)\nSELECT customer\nFROM orders\nON CONFLICT (name) DO NOTHING;\n\nSELECT * FROM customers ORDER BY name;"
    },
    {
      "title": "列名リストを省略した書き方は表の変更に弱い",
      "body": "列名リストを書かないと、追加先の列が宣言順に、SELECTの列と左から順に対応します。SELECTの列が追加先より少ないときは、先頭から数えた列だけが対象です。動きますが、追加先に列が増えたり順番が変わったりすると、意図しない列へ入る原因になります。保管用の処理では列名リストを書いておくのが安全です。",
      "code": "INSERT INTO order_archive\nSELECT id, customer, amount, status\nFROM orders;\n\nSELECT * FROM order_archive ORDER BY id;"
    },
    {
      "title": "RETURNINGで追加された行を受け取れる",
      "body": "INSERT … SELECTにもRETURNINGを付けられます。実際に追加された行の値を、その場で結果として受け取れます。条件に合って何件追加されたかを確認したいときに便利です。RETURNINGはPostgreSQLの拡張で、状態を確認するためのSELECTを別に書かずに済みます。",
      "code": "INSERT INTO order_archive (id, customer, amount, status)\nSELECT id, customer, amount, status\nFROM orders\nWHERE status = 'paid'\nRETURNING id, customer;"
    }
  ],
  "faqs": [
    {
      "question": "INSERT … SELECTは「コピー」ですか？「移動」ですか？",
      "answer": "コピーです。追加元の行はそのまま残ります。保管表へ移して元の表から消したいときは、追加のあとに同じ条件のDELETEを実行します。PostgreSQLでは、DELETE … RETURNINGの結果をWITHで受けてINSERTへ渡し、1文で移すこともできます。"
    },
    {
      "question": "SELECTの結果が0行のときはどうなりますか？",
      "answer": "エラーにはならず、0行が追加されるだけです。WHEREの条件が厳しすぎたときも同じなので、追加件数が想定どおりかは確認用のSELECTで確かめます。"
    },
    {
      "question": "SELECTの列数が追加先の列名リストと合わないとどうなりますか？",
      "answer": "SELECTの列が列名リストより多いとエラーになります。列名リストより少ない場合も、値が足りないのでエラーになります。どちらも列名リストと同じ数にそろえます。列名リストを書かないときだけ、先頭の列から順に対応して残りは既定値になります。"
    },
    {
      "question": "新しい表を作ってそこへ入れたいときも使えますか？",
      "answer": "INSERT … SELECTは既にある表へ行を追加する構文です。結果をもとに表そのものを作りたいときは、別の構文であるCREATE TABLE ASを使います。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：INSERT",
      "url": "https://www.postgresql.org/docs/current/sql-insert.html",
      "description": "クエリで追加する書き方、列名リストと値の対応、省略した列の既定値、ON CONFLICTを確認しました。"
    },
    {
      "label": "PostgreSQL公式：データの挿入",
      "url": "https://www.postgresql.org/docs/current/dml-insert.html",
      "description": "表へ行を追加する基本と、クエリ結果で追加できることを確認しました。"
    }
  ],
  "related": [
    "insert",
    "select",
    "where",
    "group-by",
    "exists",
    "merge"
  ],
  "practiceCategory": "insert-select"
};
