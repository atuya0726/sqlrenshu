import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  "setup": "CREATE TABLE exam_scores (id integer PRIMARY KEY, student text NOT NULL, score integer NOT NULL);\nINSERT INTO exam_scores VALUES (1,'青木',95),(2,'伊藤',88),(3,'上田',88),(4,'遠藤',76),(5,'大野',70),(6,'加藤',70),(7,'工藤',55),(8,'小林',40),(9,'斎藤',30);",
  "sources": [
    "SELECT * FROM exam_scores ORDER BY id"
  ]
};

export const topic: SqlTopic = {
  "slug": "ntile",
  "label": "NTILE・PERCENT_RANK",
  "title": "SQLのNTILEとPERCENT_RANKとは？四分位・デシル・CUME_DISTの違いと上位25%の抽出",
  "description": "SQLのNTILEは行を等分したグループ番号を、PERCENT_RANKとCUME_DISTは0〜1の相対位置を返すウィンドウ関数です。PostgreSQLで、四分位、割り切れないときの配分、同値の扱い、上位25%の抽出を実行結果で学べます。",
  "lead": "NTILE(n)は行を点数順にn個のグループへ等分して番号を付け、PERCENT_RANKとCUME_DISTは全体の中の相対位置を0〜1の値で返します。四分位やデシルの区分、「上位25%」の抽出に使います。9人の試験の点数で、同点の扱いまで確認しましょう。",
  "sampleIntro": "exam_scoresの1行は1人の試験の点数です。伊藤と上田は88点、大野と加藤は70点の同点で、同点の扱いによる結果の違いを確かめます。9人なので、4つに分けると割り切れません。各例のORDER BYは、結果表の表示順を決めるために付けています。",
  "sampleTables": [
    {
      "caption": "exam_scores：試験の点数9件（満点100点）",
      "headers": [
        "id",
        "student",
        "score"
      ],
      "rows": [
        [
          "1",
          "青木",
          "95"
        ],
        [
          "2",
          "伊藤",
          "88"
        ],
        [
          "3",
          "上田",
          "88"
        ],
        [
          "4",
          "遠藤",
          "76"
        ],
        [
          "5",
          "大野",
          "70"
        ],
        [
          "6",
          "加藤",
          "70"
        ],
        [
          "7",
          "工藤",
          "55"
        ],
        [
          "8",
          "小林",
          "40"
        ],
        [
          "9",
          "斎藤",
          "30"
        ]
      ]
    }
  ],
  "syntax": "SELECT student, score,\n  NTILE(4) OVER (ORDER BY score DESC, id) AS quartile\nFROM exam_scores;",
  "sections": [
    {
      "heading": "NTILE(4)で四分位のグループに分ける",
      "body": "NTILE(n) OVER (ORDER BY ...)は、並べた行を先頭から順にn個のグループへ分け、1〜nの番号を返します。点数の高い順に分けるとき、1が上位グループです。同点の行を区別するため、ORDER BYにidを加えて順序を一意にします。9人を4つに分けると、先頭側のグループが多くなり、青木・伊藤・上田が1、遠藤・大野が2、加藤・工藤が3、小林・斎藤が4です。大野と加藤は同じ70点ですが、別のグループに入ります。",
      "code": "SELECT student, score,\n  NTILE(4) OVER (ORDER BY score DESC, id) AS quartile\nFROM exam_scores\nORDER BY score DESC, id;",
      "resultTable": {
        "headers": [
          "student",
          "score",
          "quartile"
        ],
        "rows": [
          [
            "青木",
            "95",
            "1"
          ],
          [
            "伊藤",
            "88",
            "1"
          ],
          [
            "上田",
            "88",
            "1"
          ],
          [
            "遠藤",
            "76",
            "2"
          ],
          [
            "大野",
            "70",
            "2"
          ],
          [
            "加藤",
            "70",
            "3"
          ],
          [
            "工藤",
            "55",
            "3"
          ],
          [
            "小林",
            "40",
            "4"
          ],
          [
            "斎藤",
            "30",
            "4"
          ]
        ]
      }
    },
    {
      "heading": "割り切れないときの人数の配分を確かめる",
      "body": "行数がnで割り切れないとき、NTILEは差が1行以下になるよう、先頭側のグループへ余りを1行ずつ配ります。9人を5つに分けると、9÷5は商1・余り4なので、先頭の4グループが2人、最後のグループが1人です。人数のずれは必ず先頭側に出ます。グループごとの人数を数えて確認します。",
      "code": "SELECT bucket, COUNT(*) AS members\nFROM (\n  SELECT NTILE(5) OVER (ORDER BY score DESC, id) AS bucket\n  FROM exam_scores\n) t\nGROUP BY bucket\nORDER BY bucket;",
      "resultTable": {
        "headers": [
          "bucket",
          "members"
        ],
        "rows": [
          [
            "1",
            "2"
          ],
          [
            "2",
            "2"
          ],
          [
            "3",
            "2"
          ],
          [
            "4",
            "2"
          ],
          [
            "5",
            "1"
          ]
        ]
      }
    },
    {
      "heading": "PERCENT_RANKで0〜1の相対位置を出す",
      "body": "PERCENT_RANKは(順位-1)÷(行数-1)を返し、先頭は0、最後は1になります。点数の降順なら、1位の青木が0、同点2位の伊藤と上田が(2-1)÷(9-1)=0.125、最下位の斎藤が1です。同点の行は同じ順位なので、同じ値になります。1行しかないパーティションは0になります。",
      "code": "SELECT student, score,\n  PERCENT_RANK() OVER (ORDER BY score DESC) AS pct_rank\nFROM exam_scores\nORDER BY score DESC, id;",
      "resultTable": {
        "headers": [
          "student",
          "score",
          "pct_rank"
        ],
        "rows": [
          [
            "青木",
            "95",
            "0"
          ],
          [
            "伊藤",
            "88",
            "0.125"
          ],
          [
            "上田",
            "88",
            "0.125"
          ],
          [
            "遠藤",
            "76",
            "0.375"
          ],
          [
            "大野",
            "70",
            "0.5"
          ],
          [
            "加藤",
            "70",
            "0.5"
          ],
          [
            "工藤",
            "55",
            "0.75"
          ],
          [
            "小林",
            "40",
            "0.875"
          ],
          [
            "斎藤",
            "30",
            "1"
          ]
        ]
      }
    },
    {
      "heading": "CUME_DISTとPERCENT_RANKの違いと同値の扱い",
      "body": "CUME_DISTは「現在行以前の行と同値の行の数÷全体の行数」で、最小値は1÷行数、最大値は1です。PERCENT_RANKが0から始まるのに対し、CUME_DISTは0になりません。同点は最後のピアまで数えるため、伊藤と上田はどちらも3÷9で0.333、大野と加藤は6÷9で0.667になります。PERCENT_RANKでは同じ2位が0.125なので、同点の扱いも異なります。",
      "code": "SELECT student, score,\n  RANK() OVER (ORDER BY score DESC) AS rnk,\n  PERCENT_RANK() OVER (ORDER BY score DESC) AS pct_rank,\n  ROUND(CUME_DIST() OVER (ORDER BY score DESC)::numeric, 3) AS cume_dist\nFROM exam_scores\nORDER BY score DESC, id;",
      "resultTable": {
        "headers": [
          "student",
          "score",
          "rnk",
          "pct_rank",
          "cume_dist"
        ],
        "rows": [
          [
            "青木",
            "95",
            "1",
            "0",
            "0.111"
          ],
          [
            "伊藤",
            "88",
            "2",
            "0.125",
            "0.333"
          ],
          [
            "上田",
            "88",
            "2",
            "0.125",
            "0.333"
          ],
          [
            "遠藤",
            "76",
            "4",
            "0.375",
            "0.444"
          ],
          [
            "大野",
            "70",
            "5",
            "0.5",
            "0.667"
          ],
          [
            "加藤",
            "70",
            "5",
            "0.5",
            "0.667"
          ],
          [
            "工藤",
            "55",
            "7",
            "0.75",
            "0.778"
          ],
          [
            "小林",
            "40",
            "8",
            "0.875",
            "0.889"
          ],
          [
            "斎藤",
            "30",
            "9",
            "1",
            "1"
          ]
        ]
      }
    },
    {
      "heading": "PERCENT_RANKで上位25%を抽出する",
      "body": "相対位置をWHEREで絞るには、サブクエリで列にしてから条件を書きます。降順のPERCENT_RANKが0.25以下の行は、青木（0）、伊藤と上田（0.125）の3人です。同点の伊藤と上田を同時に残せます。同じ条件をCUME_DISTで書くと、0.25以下は青木（1÷9=0.111）だけです。「何人目までか」「同点を含めるか」で、使う関数と不等号を選びます。",
      "code": "SELECT student, score\nFROM (\n  SELECT id, student, score,\n    PERCENT_RANK() OVER (ORDER BY score DESC) AS pct_rank\n  FROM exam_scores\n) t\nWHERE pct_rank <= 0.25\nORDER BY score DESC, id;",
      "resultTable": {
        "headers": [
          "student",
          "score"
        ],
        "rows": [
          [
            "青木",
            "95"
          ],
          [
            "伊藤",
            "88"
          ],
          [
            "上田",
            "88"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "NTILEで上位N%を切ると同点が分かれる",
      "body": "上位半分をNTILE(2)の1番で取ると、グループの境目に同点があるとき、同じ点数の人が別のグループへ分かれます。ここでは5人目の大野（70点）が1番、6人目の加藤（70点）が2番になります。同点を同じ扱いにしたいときは、PERCENT_RANKやCUME_DISTで絞ります。",
      "code": "SELECT student, score,\n  NTILE(2) OVER (ORDER BY score DESC, id) AS half\nFROM exam_scores\nORDER BY score DESC, id;"
    }
  ],
  "notes": [
    {
      "title": "グループ数が行数より多いとき",
      "body": "NTILE(n)のnが行数より大きいと、各行が1人ずつのグループになり、行数より後ろの番号は使われません。9人にNTILE(12)を使うと、番号は1〜9までです。デシル（10分位）にしたいのに9行しかないデータでは、10番のグループが空になります。",
      "code": "SELECT student, score,\n  NTILE(12) OVER (ORDER BY score DESC, id) AS bucket\nFROM exam_scores\nORDER BY score DESC, id;"
    },
    {
      "title": "中央値などの値そのものを求めるときは別の関数",
      "body": "NTILEやPERCENT_RANKは、行がどの位置にあるかを返します。「全体の25%点にあたる点数」のような値を求めるには、順序集合集計のPERCENTILE_CONTを使います。"
    }
  ],
  "faqs": [
    {
      "question": "NTILEで四分位やデシルを作るにはどう書きますか？",
      "answer": "四分位はNTILE(4)、デシル（10分位）はNTILE(10)です。OVERにORDER BYを書き、同点でも順序を一意にするため、idのような列を加えます。点数の高い順に分けるときはDESCにすると、1が上位です。"
    },
    {
      "question": "PERCENT_RANKとCUME_DISTはどちらを使えばよいですか？",
      "answer": "先頭を0にして「順位の位置」を見たいときはPERCENT_RANK、「その値以下が全体の何割か」を見たいときはCUME_DISTです。CUME_DISTは必ず0より大きく、最後は1になります。同点は、どちらも同じ値にまとまります。"
    },
    {
      "question": "NTILEで同点の行を同じグループにできますか？",
      "answer": "NTILEは行数だけで分けるため、同点でもグループの境目で分かれることがあります。同点を同じ扱いにしたいときは、PERCENT_RANKやCUME_DISTで絞り込みます。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：ウィンドウ関数（ntile・percent_rank・cume_dist）",
      "url": "https://www.postgresql.org/docs/current/functions-window.html",
      "description": "ntile・percent_rank・cume_distの定義を確認"
    },
    {
      "label": "PostgreSQL公式：ウィンドウ関数チュートリアル",
      "url": "https://www.postgresql.org/docs/current/tutorial-window.html",
      "description": "OVER・ORDER BYの基本"
    }
  ],
  "related": [
    "window-functions",
    "lag-lead",
    "window-frame",
    "percentile-cont",
    "subquery"
  ],
  "practiceCategory": "ntile"
};
