import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  "setup": "CREATE TABLE store_sales (id integer PRIMARY KEY, store text NOT NULL, month_no integer NOT NULL, amount integer NOT NULL);\nINSERT INTO store_sales VALUES (1,'銀座',1,100),(2,'銀座',2,120),(3,'銀座',3,90),(4,'銀座',4,90),(5,'渋谷',1,80),(6,'渋谷',2,80),(7,'渋谷',3,110);",
  "sources": [
    "SELECT * FROM store_sales ORDER BY id"
  ]
};

export const topic: SqlTopic = {
  "slug": "lag-lead",
  "label": "LAG・LEAD",
  "title": "SQLのLAG・LEADとは？前の行・次の行の値、前月比、既定値をPARTITION BYで解説",
  "description": "SQLのLAG・LEADは、同じ結果の前後の行の値を取り出すウィンドウ関数です。PostgreSQLで、前月比の差分、オフセットと既定値、PARTITION BYによる店舗別の区切り、変化があった行の抜き出しを実行結果で学べます。",
  "lead": "LAGは現在行より前の行、LEADは後ろの行の値を同じ行に並べて取り出すウィンドウ関数です。自己結合を使わずに、前月との差や次の予定との比較を書けます。店舗別の月間売上で、基本、差分、既定値、グループ分け、変化の抽出まで進みましょう。",
  "sampleIntro": "store_salesの1行は「1店舗・1か月」の売上です。銀座は1〜4月、渋谷は1〜3月のデータがあります。銀座の3月と4月、渋谷の1月と2月は前の月と同額なので、変化の有無も確認できます。各例の末尾のORDER BYは、結果表の表示順を決めるために付けています。",
  "sampleTables": [
    {
      "caption": "store_sales：店舗別の月間売上7件（amountは万円）",
      "headers": [
        "id",
        "store",
        "month_no",
        "amount"
      ],
      "rows": [
        [
          "1",
          "銀座",
          "1",
          "100"
        ],
        [
          "2",
          "銀座",
          "2",
          "120"
        ],
        [
          "3",
          "銀座",
          "3",
          "90"
        ],
        [
          "4",
          "銀座",
          "4",
          "90"
        ],
        [
          "5",
          "渋谷",
          "1",
          "80"
        ],
        [
          "6",
          "渋谷",
          "2",
          "80"
        ],
        [
          "7",
          "渋谷",
          "3",
          "110"
        ]
      ]
    }
  ],
  "syntax": "SELECT store, month_no, amount,\n  LAG(amount, 1, 0) OVER (PARTITION BY store ORDER BY month_no)\nFROM store_sales;",
  "sections": [
    {
      "heading": "LAGで前の月の売上を同じ行に並べる",
      "body": "LAG(値) OVER (ORDER BY 並び順)は、並び順で1つ前の行の値を返します。ここでは銀座だけに絞り、月順に前月の売上を添えます。1月には前の行がないので、結果はNULLです。この先頭行のNULLは「前月が0だった」のではなく「前月の行がない」ことを表します。OVER内のORDER BYを省くと、前後の意味が定まりません。",
      "code": "SELECT month_no, amount,\n  LAG(amount) OVER (ORDER BY month_no) AS prev_amount\nFROM store_sales\nWHERE store = '銀座'\nORDER BY month_no;",
      "resultTable": {
        "headers": [
          "month_no",
          "amount",
          "prev_amount"
        ],
        "rows": [
          [
            "1",
            "100",
            "NULL"
          ],
          [
            "2",
            "120",
            "100"
          ],
          [
            "3",
            "90",
            "120"
          ],
          [
            "4",
            "90",
            "90"
          ]
        ]
      }
    },
    {
      "heading": "LEADで次の月の売上を同じ行に並べる",
      "body": "LEADはLAGと逆に、並び順で後ろの行の値を返します。銀座の各月に翌月の売上を添えると、最後の4月には次の行がないのでNULLになります。「今月の値と来月の予定を並べる」「次の変化までの距離を見る」場面で使います。LAGとLEADは向きが違うだけで、引数の書き方は同じです。",
      "code": "SELECT month_no, amount,\n  LEAD(amount) OVER (ORDER BY month_no) AS next_amount\nFROM store_sales\nWHERE store = '銀座'\nORDER BY month_no;",
      "resultTable": {
        "headers": [
          "month_no",
          "amount",
          "next_amount"
        ],
        "rows": [
          [
            "1",
            "100",
            "120"
          ],
          [
            "2",
            "120",
            "90"
          ],
          [
            "3",
            "90",
            "90"
          ],
          [
            "4",
            "90",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "LAGと引き算で前月との差分を求める",
      "body": "前月比の差は、amount - LAG(amount) OVER (...)と書きます。銀座は2月が+20、3月が-30、4月が0です。1月は前月がNULLなので、引き算の結果もNULLになります。NULLを0扱いにして差を出すのは、比較できない月を「変化した」と誤読させるので、先頭行はNULLのまま残すのが基本です。",
      "code": "SELECT month_no, amount,\n  amount - LAG(amount) OVER (ORDER BY month_no) AS diff\nFROM store_sales\nWHERE store = '銀座'\nORDER BY month_no;",
      "resultTable": {
        "headers": [
          "month_no",
          "amount",
          "diff"
        ],
        "rows": [
          [
            "1",
            "100",
            "NULL"
          ],
          [
            "2",
            "120",
            "20"
          ],
          [
            "3",
            "90",
            "-30"
          ],
          [
            "4",
            "90",
            "0"
          ]
        ]
      }
    },
    {
      "heading": "第2引数のオフセットと第3引数の既定値を使う",
      "body": "LAG(値, オフセット, 既定値)の第2引数は何行前か（省略時は1）、第3引数は該当行がないときに返す値（省略時はNULL）です。LAG(amount, 2, 0)なら2行前を見て、2行前がない1月と2月は0になります。オフセットは「行の数」であり、月数ではありません。既定値は値と互換性のある型で指定します。",
      "code": "SELECT month_no, amount,\n  LAG(amount, 2, 0) OVER (ORDER BY month_no) AS two_back\nFROM store_sales\nWHERE store = '銀座'\nORDER BY month_no;",
      "resultTable": {
        "headers": [
          "month_no",
          "amount",
          "two_back"
        ],
        "rows": [
          [
            "1",
            "100",
            "0"
          ],
          [
            "2",
            "120",
            "0"
          ],
          [
            "3",
            "90",
            "100"
          ],
          [
            "4",
            "90",
            "120"
          ]
        ]
      }
    },
    {
      "heading": "PARTITION BYで店舗ごとに区切る",
      "body": "PARTITION BY storeを加えると、店舗ごとに別の並びとして前後を探します。渋谷の1月は渋谷の先頭行なので、直前の行が銀座の4月であってもNULLのままです。PARTITION BYを書かないと、全店の行が1本の並びとして扱われ、店舗をまたいだ値が混ざります。グループごとの前月比には、PARTITION BYとORDER BYの両方が必要です。",
      "code": "SELECT id, store, month_no, amount,\n  LAG(amount) OVER (PARTITION BY store ORDER BY month_no) AS prev_amount\nFROM store_sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "store",
          "month_no",
          "amount",
          "prev_amount"
        ],
        "rows": [
          [
            "1",
            "銀座",
            "1",
            "100",
            "NULL"
          ],
          [
            "2",
            "銀座",
            "2",
            "120",
            "100"
          ],
          [
            "3",
            "銀座",
            "3",
            "90",
            "120"
          ],
          [
            "4",
            "銀座",
            "4",
            "90",
            "90"
          ],
          [
            "5",
            "渋谷",
            "1",
            "80",
            "NULL"
          ],
          [
            "6",
            "渋谷",
            "2",
            "80",
            "80"
          ],
          [
            "7",
            "渋谷",
            "3",
            "110",
            "80"
          ]
        ]
      }
    },
    {
      "heading": "前月から変化があった行だけを抜き出す",
      "body": "LAGの結果はWHEREに直接書けません。ウィンドウ関数はWHEREより後に計算されるためです。サブクエリで前月の値を列として作り、外側のWHEREでamountと比べます。amount <> prev_amountなら、同額の銀座4月・渋谷2月と、前月がNULLの各店1月は残りません。NULLとの比較は真にならないためです。先頭行も残したいときは、IS DISTINCT FROMで比べます。",
      "code": "SELECT id, store, month_no, amount, prev_amount\nFROM (\n  SELECT id, store, month_no, amount,\n    LAG(amount) OVER (PARTITION BY store ORDER BY month_no) AS prev_amount\n  FROM store_sales\n) t\nWHERE amount <> prev_amount\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "store",
          "month_no",
          "amount",
          "prev_amount"
        ],
        "rows": [
          [
            "2",
            "銀座",
            "2",
            "120",
            "100"
          ],
          [
            "3",
            "銀座",
            "3",
            "90",
            "120"
          ],
          [
            "7",
            "渋谷",
            "3",
            "110",
            "80"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "PARTITION BYを忘れて店舗をまたぐ",
      "body": "グループ別の前月比でPARTITION BYを書かないと、渋谷の1月に銀座4月の値が前月として入ります。エラーにならず、もっともらしい数字が出るので気づきにくい誤りです。",
      "code": "SELECT id, store, month_no, amount,\n  LAG(amount) OVER (ORDER BY id) AS prev_amount\nFROM store_sales\nORDER BY id;"
    },
    {
      "title": "既定値0で先頭月が大きな増加に見える",
      "body": "差分を出すときにLAG(amount, 1, 0)とすると、各店の1月は「前月0から増加」になり、1月の売上そのものが差分として出ます。前月がない行と前月が0の行を区別したいときは、既定値を付けずNULLのままにします。",
      "code": "SELECT id, store, month_no,\n  amount - LAG(amount, 1, 0) OVER (PARTITION BY store ORDER BY month_no) AS diff\nFROM store_sales\nORDER BY id;"
    }
  ],
  "notes": [
    {
      "title": "IGNORE NULLSはPostgreSQLで使えない",
      "body": "標準SQLにはLAG・LEADのRESPECT NULLS / IGNORE NULLSがありますが、PostgreSQLでは未実装で、常にRESPECT NULLS（NULLもそのまま1行として数える）です。直前の非NULL値を取りたいときは、別の書き方を使います。"
    },
    {
      "title": "欠けた月があるとオフセットは月を飛ばさない",
      "body": "LAG(amount, 1)は「並び順で1つ前の行」です。3月の行が存在しないデータでは、4月の前月として2月の値が返ります。月単位で比べたい場合は、月のカレンダー表と結合して欠けた月の行を作ってから使います。"
    }
  ],
  "faqs": [
    {
      "question": "LAGとLEADの違いは何ですか？",
      "answer": "LAGは並び順で前の行、LEADは後ろの行の値を返します。引数は同じで、LEAD(amount) OVER (ORDER BY month_no)とLAG(amount) OVER (ORDER BY month_no DESC)は、並びの向きを変えると同じ値になります。"
    },
    {
      "question": "前月比の増減率はどう求めますか？",
      "answer": "(amount - LAG(amount) OVER (...)) / LAG(amount) OVER (...)のように、差を前月の値で割ります。前月が0やNULLの行は割り算できないため、NULLIF(LAG(...), 0)で0除算を避けると安全です。"
    },
    {
      "question": "LAGをWHEREに直接書けますか？",
      "answer": "書けません。ウィンドウ関数はSELECT句とORDER BY句だけで使えます。変化の抽出のように条件にしたいときは、サブクエリかWITH（CTE）で列として計算してから絞り込みます。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：ウィンドウ関数（lag・lead）",
      "url": "https://www.postgresql.org/docs/current/functions-window.html",
      "description": "lag・leadの引数（offset・default）と、IGNORE NULLSが未実装であることを確認"
    },
    {
      "label": "PostgreSQL公式：ウィンドウ関数チュートリアル",
      "url": "https://www.postgresql.org/docs/current/tutorial-window.html",
      "description": "OVER・PARTITION BY・ORDER BYの基本"
    }
  ],
  "related": [
    "window-functions",
    "window-frame",
    "is-distinct-from",
    "subquery",
    "with"
  ],
  "practiceCategory": "lag-lead"
};
