import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  "setup": "CREATE TABLE daily_sales (id integer PRIMARY KEY, sale_day integer NOT NULL, amount integer NOT NULL);\nINSERT INTO daily_sales VALUES (1,1,10),(2,2,30),(3,3,20),(4,3,40),(5,6,60),(6,7,50);",
  "sources": [
    "SELECT * FROM daily_sales ORDER BY id"
  ]
};

export const topic: SqlTopic = {
  "slug": "window-frame",
  "label": "ウィンドウフレーム（ROWS BETWEEN）",
  "title": "SQLのウィンドウフレーム（ROWS BETWEEN）とは？累計・移動平均・RANGEとの違いを解説",
  "description": "SQLのウィンドウフレーム（ROWS BETWEEN）は、ウィンドウ関数が計算に使う行の範囲を指定する句です。PostgreSQLで、既定のフレーム、ROWSとRANGEの違い、移動平均、UNBOUNDED PRECEDING・FOLLOWING、LAST_VALUEが期待どおりにならない理由を実行結果で学べます。",
  "lead": "ウィンドウフレームは、各行の計算に「どの行までを含めるか」を決める範囲です。ROWS BETWEEN 2 PRECEDING AND CURRENT ROWのように書くと、直近3行の移動平均や移動合計になります。既定の範囲、ROWSとRANGEの違い、LAST_VALUEの落とし穴を、同じ売上データで確認します。",
  "sampleIntro": "daily_salesの1行は1件の売上で、sale_dayは営業日の番号です。id 3と4は同じ3日目の売上で、4日目と5日目は営業がなく、次は6日目です。同じ日付の行と日付が飛ぶ行があるので、ROWSとRANGEの違いが結果に出ます。各例のORDER BYは、結果表の表示順を決めるために付けています。",
  "sampleTables": [
    {
      "caption": "daily_sales：日別の売上6件（amountは万円）",
      "headers": [
        "id",
        "sale_day",
        "amount"
      ],
      "rows": [
        [
          "1",
          "1",
          "10"
        ],
        [
          "2",
          "2",
          "30"
        ],
        [
          "3",
          "3",
          "20"
        ],
        [
          "4",
          "3",
          "40"
        ],
        [
          "5",
          "6",
          "60"
        ],
        [
          "6",
          "7",
          "50"
        ]
      ]
    }
  ],
  "syntax": "SELECT id, sale_day, amount,\n  SUM(amount) OVER (\n    ORDER BY id\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  )\nFROM daily_sales;",
  "sections": [
    {
      "heading": "ORDER BYだけを書いたときの既定フレーム",
      "body": "OVERにORDER BYがあってフレームを書かないと、既定は「先頭の行から、現在行と同じ並び順の値を持つ行（ピア）の最後まで」です。SUM(amount) OVER (ORDER BY sale_day)は累計になりますが、3日目のid 3とid 4は同じ並び順の値なので、どちらも10+30+20+40=100と同じ値になります。ORDER BYを付けない場合は全行がフレームに入り、全体の合計になります。",
      "code": "SELECT id, sale_day, amount,\n  SUM(amount) OVER (ORDER BY sale_day) AS running_total\nFROM daily_sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "sale_day",
          "amount",
          "running_total"
        ],
        "rows": [
          [
            "1",
            "1",
            "10",
            "10"
          ],
          [
            "2",
            "2",
            "30",
            "40"
          ],
          [
            "3",
            "3",
            "20",
            "100"
          ],
          [
            "4",
            "3",
            "40",
            "100"
          ],
          [
            "5",
            "6",
            "60",
            "160"
          ],
          [
            "6",
            "7",
            "50",
            "210"
          ]
        ]
      }
    },
    {
      "heading": "ROWSとRANGEの違い：同値の行を1行ずつ数えるか",
      "body": "ROWSは物理的な行の数で範囲を決め、RANGEは並び順の値で決めます。同じ3日目のid 3とid 4は、RANGE（既定）ではまとめて100ですが、ROWSでは1行ずつ積み上がって60と100になります。ROWSで同日の順番を安定させるには、ORDER BYにidのような一意の列を加えます。順序が一意でないと、同値の行の順番が実行ごとに変わり得ます。",
      "code": "SELECT id, sale_day, amount,\n  SUM(amount) OVER (\n    ORDER BY sale_day\n    RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS range_total,\n  SUM(amount) OVER (\n    ORDER BY sale_day, id\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS rows_total\nFROM daily_sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "sale_day",
          "amount",
          "range_total",
          "rows_total"
        ],
        "rows": [
          [
            "1",
            "1",
            "10",
            "10",
            "10"
          ],
          [
            "2",
            "2",
            "30",
            "40",
            "40"
          ],
          [
            "3",
            "3",
            "20",
            "100",
            "60"
          ],
          [
            "4",
            "3",
            "40",
            "100",
            "100"
          ],
          [
            "5",
            "6",
            "60",
            "160",
            "160"
          ],
          [
            "6",
            "7",
            "50",
            "210",
            "210"
          ]
        ]
      }
    },
    {
      "heading": "n PRECEDINGで直近の行だけの移動平均を作る",
      "body": "ROWS BETWEEN 2 PRECEDING AND CURRENT ROWは、現在行と、その前の2行の最大3行を計算に使います。AVGなら3行移動平均、SUMなら移動合計です。先頭付近は前の行が足りず、1行目は1行、2行目は2行だけの平均になります。件数も一緒に見ると、何行で計算した値かが分かります。",
      "code": "SELECT id, amount,\n  AVG(amount) OVER (\n    ORDER BY id\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) AS moving_avg,\n  COUNT(*) OVER (\n    ORDER BY id\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) AS frame_rows\nFROM daily_sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "amount",
          "moving_avg",
          "frame_rows"
        ],
        "rows": [
          [
            "1",
            "10",
            "10",
            "1"
          ],
          [
            "2",
            "30",
            "20",
            "2"
          ],
          [
            "3",
            "20",
            "20",
            "3"
          ],
          [
            "4",
            "40",
            "30",
            "3"
          ],
          [
            "5",
            "60",
            "40",
            "3"
          ],
          [
            "6",
            "50",
            "50",
            "3"
          ]
        ]
      }
    },
    {
      "heading": "UNBOUNDED FOLLOWINGで現在行から最後までの合計を出す",
      "body": "フレームの終わりをUNBOUNDED FOLLOWINGにすると、パーティションの最後の行までを含められます。ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWINGなら「その行から最後までの残り合計」で、全体の210から順に減ります。開始側にUNBOUNDED FOLLOWING、終了側にUNBOUNDED PRECEDINGは書けません。",
      "code": "SELECT id, amount,\n  SUM(amount) OVER (\n    ORDER BY id\n    ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING\n  ) AS remaining\nFROM daily_sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "amount",
          "remaining"
        ],
        "rows": [
          [
            "1",
            "10",
            "210"
          ],
          [
            "2",
            "30",
            "200"
          ],
          [
            "3",
            "20",
            "170"
          ],
          [
            "4",
            "40",
            "150"
          ],
          [
            "5",
            "60",
            "110"
          ],
          [
            "6",
            "50",
            "50"
          ]
        ]
      }
    },
    {
      "heading": "LAST_VALUEが期待どおりにならない理由",
      "body": "LAST_VALUEはフレームの最後の行の値を返します。既定のフレームは現在行までなので、LAST_VALUE(amount) OVER (ORDER BY id)は常に現在行自身の値になり、「最後の売上」にはなりません。パーティション全体の最後を取るには、ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWINGでフレームを広げます。FIRST_VALUEは既定のフレームでも先頭を返すので問題になりません。",
      "code": "SELECT id, amount,\n  LAST_VALUE(amount) OVER (ORDER BY id) AS default_last,\n  LAST_VALUE(amount) OVER (\n    ORDER BY id\n    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\n  ) AS whole_last\nFROM daily_sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "amount",
          "default_last",
          "whole_last"
        ],
        "rows": [
          [
            "1",
            "10",
            "10",
            "50"
          ],
          [
            "2",
            "30",
            "30",
            "50"
          ],
          [
            "3",
            "20",
            "20",
            "50"
          ],
          [
            "4",
            "40",
            "40",
            "50"
          ],
          [
            "5",
            "60",
            "60",
            "50"
          ],
          [
            "6",
            "50",
            "50",
            "50"
          ]
        ]
      }
    },
    {
      "heading": "日付が飛ぶとき：ROWSとRANGEのn PRECEDINGの違い",
      "body": "RANGE BETWEEN 2 PRECEDING AND CURRENT ROWは、並び順の値（sale_day）が「現在の値-2」以上の行を含めます。つまり「直近2日間」の範囲です。ROWSの2 PRECEDINGは、日付に関係なく前の2行です。6日目のid 5は、RANGEでは4〜6日の60だけですが、ROWSでは前の2行を含めて120になります。「直近N行」か「直近N日」かで使い分けます。RANGEにオフセットを付けるときはORDER BYの列が1つだけで、数値や日時の列である必要があります。",
      "code": "SELECT id, sale_day, amount,\n  SUM(amount) OVER (\n    ORDER BY sale_day\n    RANGE BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) AS last_2_days,\n  SUM(amount) OVER (\n    ORDER BY sale_day, id\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) AS last_3_rows\nFROM daily_sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "sale_day",
          "amount",
          "last_2_days",
          "last_3_rows"
        ],
        "rows": [
          [
            "1",
            "1",
            "10",
            "10",
            "10"
          ],
          [
            "2",
            "2",
            "30",
            "40",
            "40"
          ],
          [
            "3",
            "3",
            "20",
            "100",
            "60"
          ],
          [
            "4",
            "3",
            "40",
            "100",
            "90"
          ],
          [
            "5",
            "6",
            "60",
            "60",
            "120"
          ],
          [
            "6",
            "7",
            "50",
            "110",
            "150"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "ORDER BYを付けて全体合計のつもりが累計になる",
      "body": "各行に全体の合計を添えたいとき、OVER (ORDER BY ...)と書くと既定のフレームが先頭から現在行（とそのピア）までになり、累計に変わります。全体の合計は、OVER ()かUNBOUNDED PRECEDING〜UNBOUNDED FOLLOWINGで求めます。",
      "code": "SELECT id, amount,\n  SUM(amount) OVER () AS total,\n  SUM(amount) OVER (ORDER BY id) AS running_total\nFROM daily_sales\nORDER BY id;"
    },
    {
      "title": "一意でないORDER BYでROWSを使う",
      "body": "ROWSの累計や移動平均で、ORDER BY sale_dayのように同値の行がある並びを使うと、同日の行の順番が保証されず、行ごとの結果が実行によって変わり得ます。idなどの一意の列を加えます。",
      "code": "SELECT id, sale_day, amount,\n  SUM(amount) OVER (\n    ORDER BY sale_day\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS rows_total\nFROM daily_sales\nORDER BY id;"
    }
  ],
  "notes": [
    {
      "title": "GROUPSモードは同値の行を1グループとして数える",
      "body": "フレームのモードにはROWS・RANGEのほかにGROUPSがあり、同じ並び順の値を持つ行をまとめた「ピアグループ」を単位にオフセットを数えます。GROUPS BETWEEN 1 PRECEDING AND CURRENT ROWなら、同じ値のグループと、その1つ前のグループです。GROUPSモードにはORDER BYが必要です。",
      "code": "SELECT id, sale_day, amount,\n  SUM(amount) OVER (\n    ORDER BY sale_day\n    GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW\n  ) AS last_2_groups\nFROM daily_sales\nORDER BY id;"
    },
    {
      "title": "フレームを使う関数と使わない関数",
      "body": "フレームが結果に影響するのは、SUM・AVGなどの集計関数と、FIRST_VALUE・LAST_VALUE・NTH_VALUEです。ROW_NUMBER・RANK・LAG・LEADはフレームの指定に関係なく、パーティション全体の並びで計算します。"
    }
  ],
  "faqs": [
    {
      "question": "ウィンドウフレームの既定値は何ですか？",
      "answer": "ORDER BYがあるときはRANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROWで、先頭行から現在行と同値の行の最後までです。ORDER BYがなければ、全行が現在行のピアになるので、パーティション全体がフレームです。"
    },
    {
      "question": "ROWS BETWEEN 2 PRECEDING AND CURRENT ROWは何行を使いますか？",
      "answer": "現在行と、その前の2行の最大3行です。先頭付近では前の行が足りないので、1行目は1行、2行目は2行だけで計算します。3行そろった行だけを使いたいときは、サブクエリでCOUNTなどを併せて求めて絞り込みます。"
    },
    {
      "question": "RANGEとROWSはどちらを使うべきですか？",
      "answer": "「直近N行」ならROWS、「直近N日」のように並び順の値の範囲なら、数値や日時のORDER BYに対するRANGEです。同値の行を同じ扱いにしたくない累計では、一意な列を加えたROWSを使います。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：ウィンドウ関数の呼び出し（フレーム句）",
      "url": "https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS",
      "description": "ROWS・RANGE・GROUPS、frame_start・frame_end、既定のフレームを確認"
    },
    {
      "label": "PostgreSQL公式：ウィンドウ関数（組み込み関数）",
      "url": "https://www.postgresql.org/docs/current/functions-window.html",
      "description": "LAST_VALUEが既定フレームで期待どおりにならないことと、ORDER BY付き集計が累計になることを確認"
    },
    {
      "label": "PostgreSQL公式：ウィンドウ関数チュートリアル",
      "url": "https://www.postgresql.org/docs/current/tutorial-window.html",
      "description": "OVER句とウィンドウ関数の基本"
    }
  ],
  "related": [
    "window-functions",
    "lag-lead",
    "ntile",
    "group-by"
  ],
  "practiceCategory": "window-frame"
};
