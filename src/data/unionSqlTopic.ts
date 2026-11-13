import type { SqlTopic } from './sqlTopics';

export const unionTopic: SqlTopic = {
  "slug": "union",
  "label": "UNION・UNION ALL",
  "title": "SQLのUNIONとUNION ALLの違いとは？重複・列の対応・ORDER BYを解説",
  "description": "SQLのUNIONとUNION ALLをPostgreSQLの元の表・SQL・結果表で比較。重複行、列数と型、列の順序、結果全体のORDER BYとJOINとの違いを演習で学べます。",
  "lead": "UNION ALLは、複数のSELECTの結果を縦につなぐ構文です。UNIONは、つないだ結果から重複する行を除きます。午前・午後の測定記録を使い、記録をすべて残す場合と、同じ内容を1行にまとめる場合の違いを見ていきましょう。",
  "sampleIntro": "morning_resultsは午前、evening_resultsは午後の測定記録です。nameは名前、scoreは点数で、1行が1回の測定を表します。午前の青木さん10点は2回の別々の記録です。同じ名前・点数でも、記録件数を数えるときはそれぞれ1件として扱います。ORDER BYなしの結果の行の並びは一例で、午前の行が先に出る保証はありません。",
  "sampleTables": [
    {
      "caption": "morning_results：午前の測定3件",
      "headers": [
        "name（名前）",
        "score（点数）"
      ],
      "rows": [
        [
          "青木",
          "10"
        ],
        [
          "北野",
          "20"
        ],
        [
          "青木",
          "10"
        ]
      ]
    },
    {
      "caption": "evening_results：午後の測定3件",
      "headers": [
        "name（名前）",
        "score（点数）"
      ],
      "rows": [
        [
          "青木",
          "10"
        ],
        [
          "中央",
          "30"
        ],
        [
          "北野",
          "25"
        ]
      ]
    }
  ],
  "syntax": "SELECT *\nFROM morning_results\nUNION ALL\nSELECT *\nFROM evening_results;",
  "sections": [
    {
      "heading": "UNION ALLで2つの結果を縦につなぐ",
      "body": "2つのSELECTの間にUNION ALLを書くと、午前3件と午後3件を合わせた6件が返ります。青木さん10点は午前2件、午後1件の計3行が残ります。元の表を書き換える処理ではなく、検索結果をまとめる指定です。この2表は列の構成が同じなので、SELECT *でつなげられます。",
      "code": "SELECT *\nFROM morning_results\nUNION ALL\nSELECT *\nFROM evening_results;",
      "resultTable": {
        "headers": [
          "name",
          "score"
        ],
        "rows": [
          [
            "青木",
            "10"
          ],
          [
            "北野",
            "20"
          ],
          [
            "青木",
            "10"
          ],
          [
            "青木",
            "10"
          ],
          [
            "中央",
            "30"
          ],
          [
            "北野",
            "25"
          ]
        ]
      }
    },
    {
      "heading": "UNIONは行全体が同じ重複を除く",
      "body": "UNIONにすると、青木さん10点の3行が1行にまとまり、結果は4行になります。同じ表の中の重複も、表をまたいだ重複も除きます。北野さん20点と25点は名前が同じでも点数が違うので両方残ります。重複かどうかは、SELECTで返す全列の組み合わせで判定します。測定6回の件数を保ちたい場合はUNION ALLを使います。",
      "code": "SELECT *\nFROM morning_results\nUNION\nSELECT *\nFROM evening_results;",
      "resultTable": {
        "headers": [
          "name",
          "score"
        ],
        "rows": [
          [
            "青木",
            "10"
          ],
          [
            "北野",
            "20"
          ],
          [
            "中央",
            "30"
          ],
          [
            "北野",
            "25"
          ]
        ]
      }
    },
    {
      "heading": "列数・型・並び順をそろえる",
      "body": "両方のSELECTは同じ列数を返し、同じ位置の列は互換性のある型にします。列名が同じものを自動で探して対応付けるわけではありません。この例は両方をscore、nameの順にして、1列目を数値、2列目を文字列にそろえています。片方だけname、scoreにすると数値と文字列が対応し、エラーになります。列の並びを意図的にそろえる場面では、*の代わりに列名を明示します。",
      "code": "SELECT score, name\nFROM morning_results\nUNION ALL\nSELECT score, name\nFROM evening_results;",
      "resultTable": {
        "headers": [
          "score",
          "name"
        ],
        "rows": [
          [
            "10",
            "青木"
          ],
          [
            "20",
            "北野"
          ],
          [
            "10",
            "青木"
          ],
          [
            "10",
            "青木"
          ],
          [
            "30",
            "中央"
          ],
          [
            "25",
            "北野"
          ]
        ]
      }
    },
    {
      "heading": "最後のORDER BYで結果全体を並べ替える",
      "body": "UNION ALLの最後にORDER BYを書くと、午前・午後を合わせた6件全体が並びます。点数の降順にすると中央さん30点、北野さん25点、20点、青木さん10点の3行です。同点では名前の昇順としています。PostgreSQLで集合演算の結果を直接並べ替える場合は、出力列名または列番号を指定します。ここでは出力列scoreとnameを使い、元の表名で修飾しません。",
      "code": "SELECT *\nFROM morning_results\nUNION ALL\nSELECT *\nFROM evening_results\nORDER BY score DESC, name;",
      "resultTable": {
        "headers": [
          "name",
          "score"
        ],
        "rows": [
          [
            "中央",
            "30"
          ],
          [
            "北野",
            "25"
          ],
          [
            "北野",
            "20"
          ],
          [
            "青木",
            "10"
          ],
          [
            "青木",
            "10"
          ],
          [
            "青木",
            "10"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "記録件数を残したいのにUNIONを使う",
      "body": "このデータをUNIONでまとめてから数えると4件になります。測定回数は6件なので、同じ名前・点数の記録も残すUNION ALLが必要です。名前だけをSELECTすると、UNIONは同じ名前を1行にまとめるため結果の意味がさらに変わります。"
    }
  ],
  "notes": [
    {
      "title": "片方だけにLIMITを適用するならカッコで囲む",
      "body": "末尾のLIMITは、つないだ結果全体に適用されます。午前の最高点1件だけと午後の全件をつなぐなら、午前のORDER BY・LIMITを含むSELECTをカッコで囲みます。",
      "code": "(SELECT *\nFROM morning_results\nORDER BY score DESC, name\nLIMIT 1)\nUNION ALL\nSELECT *\nFROM evening_results;"
    }
  ],
  "faqs": [
    {
      "question": "UNIONとJOINはどう違いますか？",
      "answer": "UNIONは列の構成が対応する結果を縦につないで行を増やします。JOINは条件に合う行同士を対応付け、両方の表の列を組み合わせます。午前と午後の記録を一覧にするならUNION ALL、午前と午後の記録を名前などの条件で対応付けるならJOINです。JOINでは同じ名前の複数行が組み合わさることもあります。"
    },
    {
      "question": "UNION ALLなら最初のSELECTの行が先に出ますか？",
      "answer": "その順序は保証されません。表示順が必要なら、最後にORDER BYを付けて結果全体の順序を指定します。"
    },
    {
      "question": "結果の列名はどちらのSELECTから決まりますか？",
      "answer": "このページのような2つのSELECTをつなぐ場合は、最初のSELECTの出力列名になります。2番目のSELECTの列名が違っていても、対応は列の位置で決まります。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：問い合わせの結合",
      "url": "https://www.postgresql.org/docs/current/queries-union.html",
      "description": "UNION・UNION ALL、列数と型、カッコとLIMIT"
    },
    {
      "label": "PostgreSQL公式：結果の並べ替え",
      "url": "https://www.postgresql.org/docs/current/queries-order.html",
      "description": "集合演算の結果に対するORDER BY"
    },
    {
      "label": "PostgreSQL公式：SELECT",
      "url": "https://www.postgresql.org/docs/current/sql-select.html#SQL-UNION",
      "description": "UNIONの結果列と重複の扱い"
    }
  ],
  "related": [
    "intersect-except",
    "select",
    "order-by",
    "inner-join",
    "with"
  ],
  "practiceCategory": "union"
};
