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
            "中央",
            "30"
          ],
          [
            "北野",
            "20"
          ],
          [
            "北野",
            "25"
          ],
          [
            "青木",
            "10"
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
      "body": "UNION ALLの最後にORDER BYを書くと、午前・午後を合わせた6件全体が並びます。点数の降順にすると中央さん30点、北野さん25点、20点、青木さん10点の3行です。同点では名前の昇順としています。PostgreSQLで集合演算の結果を直接並べ替える場合は、出力列名または列番号を指定します。ここでは出力列scoreとnameを使い、元の表名で修飾しません。ORDER BYを書けるのは最後の1か所です。1つ目のSELECTの直後に書くと、下のように構文エラーになります。",
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
      },
      "failing": {
        "code": "SELECT *\nFROM morning_results\nORDER BY score DESC\nUNION ALL\nSELECT *\nFROM evening_results;",
        "error": "syntax error at or near \"UNION\""
      }
    },
    {
      "heading": "どちらの表から来た行かを列で残す",
      "body": "UNION ALLでつなぐと、どの行が午前でどの行が午後だったかは結果から分からなくなります。区別を残したいときは、それぞれのSELECTに'午前'や'午後'のような決まった値の列を足します。列名は1つ目のSELECTのAS sessionで決まるので、2つ目のSELECTには別名を書かなくてもかまいません。",
      "code": "SELECT '午前' AS session, name, score\nFROM morning_results\nUNION ALL\nSELECT '午後', name, score\nFROM evening_results\nORDER BY session, name, score;",
      "resultTable": {
        "headers": [
          "session",
          "name",
          "score"
        ],
        "rows": [
          [
            "午前",
            "北野",
            "20"
          ],
          [
            "午前",
            "青木",
            "10"
          ],
          [
            "午前",
            "青木",
            "10"
          ],
          [
            "午後",
            "中央",
            "30"
          ],
          [
            "午後",
            "北野",
            "25"
          ],
          [
            "午後",
            "青木",
            "10"
          ]
        ]
      }
    },
    {
      "heading": "UNION ALLでつないだ結果をGROUP BYで集計する",
      "body": "つないだ結果をさらに集計したいときは、UNION ALLの部分を括弧で囲んでFROMに置き、外側でGROUP BYします。括弧の後ろのAS all_resultsは、つないだ結果に付ける名前です。ここでは名前ごとに、測定の回数と点数の合計を出しています。青木さんは午前2回と午後1回の3回で合計30点です。UNIONでつなぐと青木さん10点が1行にまとまり、回数も合計も変わってしまうので、集計の前はUNION ALLを使います。",
      "code": "SELECT name, COUNT(*) AS records, SUM(score) AS total_score\nFROM (\n  SELECT *\n  FROM morning_results\n  UNION ALL\n  SELECT *\n  FROM evening_results\n) AS all_results\nGROUP BY name\nORDER BY name;",
      "resultTable": {
        "headers": [
          "name",
          "records",
          "total_score"
        ],
        "rows": [
          [
            "中央",
            "1",
            "30"
          ],
          [
            "北野",
            "2",
            "45"
          ],
          [
            "青木",
            "3",
            "30"
          ]
        ]
      }
    },
    {
      "heading": "UNION ALLの結果から、重複している行と件数を調べる",
      "body": "UNIONにすると重複は消えますが、どの行が何件重複していたかは分かりません。それを知りたいときは、UNION ALLでつないだ結果を全列でGROUP BYし、HAVINGで件数が2以上の組だけを残します。この例で重複しているのは青木さん10点の3件だけです。UNION ALLの6行がUNIONで4行に減るのは、この3件が1行にまとまるためです。",
      "code": "SELECT name, score, COUNT(*) AS times\nFROM (\n  SELECT *\n  FROM morning_results\n  UNION ALL\n  SELECT *\n  FROM evening_results\n) AS all_results\nGROUP BY name, score\nHAVING COUNT(*) >= 2;",
      "resultTable": {
        "headers": [
          "name",
          "score",
          "times"
        ],
        "rows": [
          [
            "青木",
            "10",
            "3"
          ]
        ]
      }
    },
    {
      "heading": "UNIONがUNION ALLより遅くなりうる理由を実行計画で見る",
      "body": "UNION ALLは2つの結果をつなぐだけですが、UNIONはつないだあとで、同じ行がないかを全行について調べます。この差は実行計画に表れます。SQLの前にEXPLAINを付けると、PostgreSQLがその文をどう処理するかを表示できます。下の結果では、それぞれの表を読んだ（Seq Scan）あとに、行を並べ替えるSortと、同じ行を1行にまとめるUniqueという段があります。UNION ALLの実行計画は、2つの表を読んでつなぐAppendだけで、SortもUniqueもありません。重複がないと分かっている場合や、重複も残したい場合は、UNION ALLを選びます。行数が少ないうちは、差はほとんど感じられません。実行計画の形は、データの量によって変わることがあります。",
      "code": "EXPLAIN (COSTS OFF)\nSELECT *\nFROM morning_results\nUNION\nSELECT *\nFROM evening_results;",
      "resultTable": {
        "headers": [
          "QUERY PLAN"
        ],
        "rows": [
          [
            "Unique"
          ],
          [
            "  ->  Merge Append"
          ],
          [
            "        Sort Key: morning_results.name, morning_results.score"
          ],
          [
            "        ->  Sort"
          ],
          [
            "              Sort Key: morning_results.name, morning_results.score"
          ],
          [
            "              ->  Seq Scan on morning_results"
          ],
          [
            "        ->  Sort"
          ],
          [
            "              Sort Key: evening_results.name, evening_results.score"
          ],
          [
            "              ->  Seq Scan on evening_results"
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
    },
    {
      "title": "NULLどうしも重複として1行にまとまる",
      "body": "ふつうの比較ではNULL = NULLはtrueになりませんが、UNIONが重複を除くときは、NULLどうしを同じ値として扱います。下の例は、NULLを1行ずつ返す2つのSELECTをUNIONでつないでいて、結果は1行です。UNION ALLにすると2行になります。",
      "code": "SELECT NULL::integer AS score\nUNION\nSELECT NULL;"
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
    },
    {
      "question": "UNIONとUNION ALLはどちらが速いですか？",
      "answer": "重複を除く処理がない分、UNION ALLのほうが速くなります。PostgreSQLの公式ドキュメントも、使える場面ではUNION ALLを使うよう勧めています。ただし、重複を除く必要があるのにUNION ALLを使うと結果が変わります。速さではなく、まず必要な結果がどちらかで選びます。"
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
    },
    {
      "label": "PostgreSQL公式：EXPLAINの使い方",
      "url": "https://www.postgresql.org/docs/current/using-explain.html",
      "description": "実行計画の読み方"
    }
  ],
  "related": [
    "intersect-except",
    "select",
    "order-by",
    "inner-join",
    "with",
    "group-by",
    "having",
    "subquery"
  ],
  "practiceCategory": "union"
};
