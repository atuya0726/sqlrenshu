import type { SqlTopic } from './sqlTopics';

export const orderByTopic: SqlTopic = {
  "slug": "order-by",
  "label": "ORDER BY",
  "title": "SQLのORDER BYとは？昇順・降順と複数列を結果表で解説",
  "description": "SQLのORDER BYとは？昇順・降順と複数列を結果表で解説。元の表とPostgreSQLのSQL・実行結果を見比べながら、使い方を段階的に学べます。",
  "lead": "ORDER BYは、検索結果の行を指定した順に並べる構文です。社員IDの小さい順や月給の高い順など、見たい順番を決められます。同じ5人の表で、並び方だけがどう変わるかを見てみましょう。",
  "sampleIntro": "employeesの1行が社員1人分です。営業が2人、開発が2人、サポートが1人います。salaryは月給（円）で、恵比寿さんのNULLは月給が未入力であることを表し、0円とは区別します。すべての例でこの5人を使います。",
  "sampleTables": [
    {
      "caption": "employees：社員5人の一覧（salaryは月給・円）",
      "headers": [
        "id（社員ID）",
        "name（名前）",
        "department（部署）",
        "salary（月給）"
      ],
      "rows": [
        [
          "1",
          "青木",
          "営業",
          "300000"
        ],
        [
          "2",
          "北野",
          "開発",
          "400000"
        ],
        [
          "3",
          "中央",
          "営業",
          "350000"
        ],
        [
          "4",
          "大和",
          "開発",
          "400000"
        ],
        [
          "5",
          "恵比寿",
          "サポート",
          "NULL"
        ]
      ]
    }
  ],
  "syntax": "SELECT id, name, salary\nFROM employees\nORDER BY id ASC;",
  "sections": [
    {
      "heading": "ASCで社員IDの小さい順に並べる",
      "body": "SELECTとFROMの後ろにORDER BY id ASCと書くと、社員IDが1、2、3、4、5の順に並びます。ASCは小さい値から大きい値への昇順です。並べ替えても社員の人数や月給は変わりません。",
      "code": "SELECT id, name, salary\nFROM employees\nORDER BY id ASC;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "salary"
        ],
        "rows": [
          [
            "1",
            "青木",
            "300000"
          ],
          [
            "2",
            "北野",
            "400000"
          ],
          [
            "3",
            "中央",
            "350000"
          ],
          [
            "4",
            "大和",
            "400000"
          ],
          [
            "5",
            "恵比寿",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "DESCで社員IDの大きい順に並べる",
      "body": "ASCをDESCに変えると、社員IDが5、4、3、2、1の順になります。DESCは大きい値から小さい値への降順です。最初の結果と、先頭・末尾の社員を見比べてください。",
      "code": "SELECT id, name, salary\nFROM employees\nORDER BY id DESC;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "salary"
        ],
        "rows": [
          [
            "5",
            "恵比寿",
            "NULL"
          ],
          [
            "4",
            "大和",
            "400000"
          ],
          [
            "3",
            "中央",
            "350000"
          ],
          [
            "2",
            "北野",
            "400000"
          ],
          [
            "1",
            "青木",
            "300000"
          ]
        ]
      }
    },
    {
      "heading": "複数列で同じ月給の人の順番を決める",
      "body": "月給の低い順にし、同額なら社員IDの小さい順にします。先にsalaryを比べ、月給400000円の北野さんと大和さんだけはidで順番を決めます。PostgreSQLでは昇順のNULLは既定で末尾なので、未入力の恵比寿さんが最後です。",
      "code": "SELECT id, name, salary\nFROM employees\nORDER BY salary ASC, id ASC;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "salary"
        ],
        "rows": [
          [
            "1",
            "青木",
            "300000"
          ],
          [
            "3",
            "中央",
            "350000"
          ],
          [
            "2",
            "北野",
            "400000"
          ],
          [
            "4",
            "大和",
            "400000"
          ],
          [
            "5",
            "恵比寿",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "NULLS LASTで未入力を末尾に置く",
      "body": "月給の高い順でも未入力の人を最後にしたい場合は、salary DESC NULLS LASTと書きます。PostgreSQLではDESCだけだとNULLが先頭になるため、この指定が必要です。ここでも同額ならidの小さい順にしています。",
      "code": "SELECT id, name, salary\nFROM employees\nORDER BY salary DESC NULLS LAST, id ASC;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "salary"
        ],
        "rows": [
          [
            "2",
            "北野",
            "400000"
          ],
          [
            "4",
            "大和",
            "400000"
          ],
          [
            "3",
            "中央",
            "350000"
          ],
          [
            "1",
            "青木",
            "300000"
          ],
          [
            "5",
            "恵比寿",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "LIMITで月給の上位2人を取り出す",
      "body": "前のSQLの末尾にLIMIT 2を足すと、並べた結果の先頭2行だけを取り出せます。この表では北野さんと大和さんです。同額でもidで順番を決めてあるので、上位の行を選ぶ基準が明確です。",
      "code": "SELECT id, name, salary\nFROM employees\nORDER BY salary DESC NULLS LAST, id ASC\nLIMIT 2;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "salary"
        ],
        "rows": [
          [
            "2",
            "北野",
            "400000"
          ],
          [
            "4",
            "大和",
            "400000"
          ]
        ]
      }
    }
  ],
  "mistakes": [],
  "notes": [
    {
      "title": "ASCは省略できる",
      "body": "ORDER BY idだけでもORDER BY id ASCと同じ昇順になります。複数列では列ごとに昇順・降順を指定するため、ORDER BY salary DESC, idは月給が降順、社員IDが昇順です。"
    }
  ],
  "faqs": [
    {
      "question": "ORDER BYを書かなくても社員ID順になりますか？",
      "answer": "保証されません。今回の元の表がID順に見えていても、検索結果をその順にしたいときはORDER BY idを指定します。"
    },
    {
      "question": "NULLを先頭に置きたい場合は？",
      "answer": "NULLS FIRSTを指定します。NULLS FIRSTとNULLS LASTは、ASC・DESCのどちらとでも組み合わせられます。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：行の並べ替え",
      "url": "https://www.postgresql.org/docs/current/queries-order.html",
      "description": "行の並べ替えの仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：LIMITとOFFSET",
      "url": "https://www.postgresql.org/docs/current/queries-limit.html",
      "description": "LIMITとOFFSETの仕様と使用例"
    }
  ],
  "related": [
    "select",
    "where",
    "window-functions"
  ],
  "practiceCategory": "order-by"
};

export const whereTopic: SqlTopic = {
  "slug": "where",
  "label": "WHERE",
  "title": "SQLのWHERE句とは？条件で残る行を結果表で解説",
  "description": "SQLのWHERE句とは？条件で残る行を結果表で解説。元の表とPostgreSQLのSQL・実行結果を見比べながら、使い方を段階的に学べます。",
  "lead": "WHEREは、表から条件に合う行だけを取り出す構文です。「営業の社員」「月給35万円以上の社員」など、見たい人を選べます。元の5行のうち、どの行が残るかを条件ごとに確かめましょう。",
  "sampleIntro": "employeesの1行が社員1人分です。営業が2人、開発が2人、サポートが1人います。salaryは月給（円）で、恵比寿さんのNULLは月給が未入力であることを表し、0円とは区別します。すべての例でこの5人を使います。結果表の行の並びは一例です。ORDER BYで指定しない限り、表示順は保証されません。",
  "sampleTables": [
    {
      "caption": "employees：社員5人の一覧（salaryは月給・円）",
      "headers": [
        "id（社員ID）",
        "name（名前）",
        "department（部署）",
        "salary（月給）"
      ],
      "rows": [
        [
          "1",
          "青木",
          "営業",
          "300000"
        ],
        [
          "2",
          "北野",
          "開発",
          "400000"
        ],
        [
          "3",
          "中央",
          "営業",
          "350000"
        ],
        [
          "4",
          "大和",
          "開発",
          "400000"
        ],
        [
          "5",
          "恵比寿",
          "サポート",
          "NULL"
        ]
      ]
    }
  ],
  "syntax": "SELECT name, department\nFROM employees\nWHERE department = '営業';",
  "sections": [
    {
      "heading": "等しい条件で営業の社員を選ぶ",
      "body": "営業の人だけを見るには、WHERE department = '営業'と書きます。=は左右が等しいという条件です。文字列の営業はシングルクォートで囲みます。元の表で営業なのは青木さんと中央さんなので、結果は2行です。",
      "code": "SELECT name, department\nFROM employees\nWHERE department = '営業';",
      "resultTable": {
        "headers": [
          "name",
          "department"
        ],
        "rows": [
          [
            "青木",
            "営業"
          ],
          [
            "中央",
            "営業"
          ]
        ]
      }
    },
    {
      "heading": "比較演算子で月給35万円以上を選ぶ",
      "body": ">=は「以上」を表します。350000円の中央さんも含め、北野さん・中央さん・大和さんの3行が残ります。>にすると350000円ちょうどの中央さんは含まれません。月給が未入力の恵比寿さんは、この比較では条件に合うと判定されません。",
      "code": "SELECT name, salary\nFROM employees\nWHERE salary >= 350000;",
      "resultTable": {
        "headers": [
          "name",
          "salary"
        ],
        "rows": [
          [
            "北野",
            "400000"
          ],
          [
            "中央",
            "350000"
          ],
          [
            "大和",
            "400000"
          ]
        ]
      }
    },
    {
      "heading": "ANDで両方の条件を満たす人を選ぶ",
      "body": "営業で、かつ月給が350000円以上の人を選びます。ANDは両方の条件が成立する場合だけ残します。営業の2人のうち、青木さんは300000円なので外れ、中央さんだけになります。",
      "code": "SELECT name, department, salary\nFROM employees\nWHERE department = '営業'\n  AND salary >= 350000;",
      "resultTable": {
        "headers": [
          "name",
          "department",
          "salary"
        ],
        "rows": [
          [
            "中央",
            "営業",
            "350000"
          ]
        ]
      }
    },
    {
      "heading": "ORでいずれかの条件を満たす人を選ぶ",
      "body": "営業またはサポートの人を選びます。ORはどちらかの条件が成立すれば残します。青木さん・中央さんに加え、サポートの恵比寿さんも表示されます。今回は月給を条件にしていないので、月給がNULLでも残ります。",
      "code": "SELECT name, department\nFROM employees\nWHERE department = '営業'\n  OR department = 'サポート';",
      "resultTable": {
        "headers": [
          "name",
          "department"
        ],
        "rows": [
          [
            "青木",
            "営業"
          ],
          [
            "中央",
            "営業"
          ],
          [
            "恵比寿",
            "サポート"
          ]
        ]
      }
    },
    {
      "heading": "INで同じ列の候補をまとめる",
      "body": "同じdepartment列を複数の候補と比べるなら、INで候補を並べられます。下のSQLは前のORの例と同じ3人を返します。候補が増えても、同じ列名を何度も書かずに済みます。",
      "code": "SELECT name, department\nFROM employees\nWHERE department IN ('営業', 'サポート');",
      "resultTable": {
        "headers": [
          "name",
          "department"
        ],
        "rows": [
          [
            "青木",
            "営業"
          ],
          [
            "中央",
            "営業"
          ],
          [
            "恵比寿",
            "サポート"
          ]
        ]
      }
    },
    {
      "heading": "BETWEENで月給の範囲を指定する",
      "body": "BETWEEN 300000 AND 350000は300000円以上、350000円以下です。両端の金額を含むので、青木さんと中央さんが残ります。ここでのANDは範囲の下限と上限をつなぐ書き方です。",
      "code": "SELECT name, salary\nFROM employees\nWHERE salary BETWEEN 300000 AND 350000;",
      "resultTable": {
        "headers": [
          "name",
          "salary"
        ],
        "rows": [
          [
            "青木",
            "300000"
          ],
          [
            "中央",
            "350000"
          ]
        ]
      }
    },
    {
      "heading": "LIKEで名前の一部を使って探す",
      "body": "北で始まる名前はLIKE '北%'で探せます。%は0文字以上の任意の文字列を表すため、北野さんが一致します。完全に同じ名前を探す=と、パターンを指定するLIKEを使い分けます。",
      "code": "SELECT name\nFROM employees\nWHERE name LIKE '北%';",
      "resultTable": {
        "headers": [
          "name"
        ],
        "rows": [
          [
            "北野"
          ]
        ]
      }
    },
    {
      "heading": "IS NULLで月給が未入力の人を探す",
      "body": "NULLは通常の値と同じようには比較できないため、salary = NULLとは書きません。未入力かどうかはIS NULLで判定します。今回の表では恵比寿さんだけが残ります。入力済みの人はIS NOT NULLで選べます。",
      "code": "SELECT name, salary\nFROM employees\nWHERE salary IS NULL;",
      "resultTable": {
        "headers": [
          "name",
          "salary"
        ],
        "rows": [
          [
            "恵比寿",
            "NULL"
          ]
        ]
      }
    }
  ],
  "mistakes": [],
  "notes": [
    {
      "title": "ANDとORを混ぜるときは括弧を付ける",
      "body": "ANDはORより先に評価されます。「営業か開発で、月給35万円以上」なら、(department = '営業' OR department = '開発') AND salary >= 350000のように部署の条件を括弧でまとめます。"
    }
  ],
  "faqs": [
    {
      "question": "「等しくない」はどう書きますか？",
      "answer": "<>を使います。department <> '営業'なら営業以外の部署を選べます。ただし比較する値がNULLの場合は、等しくないと確定できないためその行も除外されます。"
    },
    {
      "question": "WHEREとHAVINGはどう違いますか？",
      "answer": "WHEREは元の行を絞ります。HAVINGは部署ごとの人数など、集計した結果を条件にするときに使います。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：WHERE句",
      "url": "https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-WHERE",
      "description": "WHERE句の仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：比較とNULL判定",
      "url": "https://www.postgresql.org/docs/current/functions-comparison.html",
      "description": "比較とNULL判定の仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：LIKE",
      "url": "https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-LIKE",
      "description": "LIKEの仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：論理演算子",
      "url": "https://www.postgresql.org/docs/current/functions-logical.html",
      "description": "論理演算子の仕様と使用例"
    }
  ],
  "related": [
    "like",
    "select",
    "order-by",
    "having"
  ],
  "practiceCategory": "where"
};

export const groupByTopic: SqlTopic = {
  "slug": "group-by",
  "label": "GROUP BY",
  "title": "SQLのGROUP BYとは？部署ごとの件数・合計・平均を結果表で解説",
  "description": "SQLのGROUP BYとは？部署ごとの件数・合計・平均を結果表で解説。元の表とPostgreSQLのSQL・実行結果を見比べながら、使い方を段階的に学べます。",
  "lead": "GROUP BYは、同じ値を持つ行をまとめて集計する構文です。社員5人の一覧から「部署ごとの人数や月給の合計」を作れます。どの社員が同じグループになり、結果が何行になるかを確かめましょう。",
  "sampleIntro": "employeesの1行が社員1人分です。営業が2人、開発が2人、サポートが1人います。salaryは月給（円）で、恵比寿さんのNULLは月給が未入力であることを表し、0円とは区別します。すべての例でこの5人を使います。結果表の行の並びは一例です。ORDER BYで指定しない限り、表示順は保証されません。",
  "sampleTables": [
    {
      "caption": "employees：社員5人の一覧（salaryは月給・円）",
      "headers": [
        "id（社員ID）",
        "name（名前）",
        "department（部署）",
        "salary（月給）"
      ],
      "rows": [
        [
          "1",
          "青木",
          "営業",
          "300000"
        ],
        [
          "2",
          "北野",
          "開発",
          "400000"
        ],
        [
          "3",
          "中央",
          "営業",
          "350000"
        ],
        [
          "4",
          "大和",
          "開発",
          "400000"
        ],
        [
          "5",
          "恵比寿",
          "サポート",
          "NULL"
        ]
      ]
    }
  ],
  "syntax": "SELECT department, COUNT(*) AS people\nFROM employees\nGROUP BY department;",
  "sections": [
    {
      "heading": "部署ごとにまとめてCOUNTで人数を数える",
      "body": "GROUP BY departmentで部署が同じ社員をまとめ、COUNT(*)でその人数を数えます。営業は青木さんと中央さんの2人、開発も2人、サポートは1人です。元の5行が部署ごとの3行になります。AS peopleは人数の結果列に付けた名前です。",
      "code": "SELECT department, COUNT(*) AS people\nFROM employees\nGROUP BY department;",
      "resultTable": {
        "headers": [
          "department",
          "people"
        ],
        "rows": [
          [
            "サポート",
            "1"
          ],
          [
            "営業",
            "2"
          ],
          [
            "開発",
            "2"
          ]
        ]
      }
    },
    {
      "heading": "SUMで部署ごとの月給を合計する",
      "body": "COUNT(*)をSUM(salary)に変えると、人数の代わりに月給を合計します。営業は300000 + 350000で650000円、開発は400000 + 400000で800000円です。サポートは月給がNULLの1人だけなので、合計もNULLになります。",
      "code": "SELECT department, SUM(salary) AS total_salary\nFROM employees\nGROUP BY department;",
      "resultTable": {
        "headers": [
          "department",
          "total_salary"
        ],
        "rows": [
          [
            "サポート",
            "NULL"
          ],
          [
            "営業",
            "650000"
          ],
          [
            "開発",
            "800000"
          ]
        ]
      }
    },
    {
      "heading": "AVGで部署ごとの平均月給を求める",
      "body": "AVG(salary)は、入力されている月給の合計をその件数で割ります。営業の平均は650000 ÷ 2で325000円、開発は400000円です。NULLを0円として計算するわけではなく、入力値のないサポートは平均もNULLです。",
      "code": "SELECT department, AVG(salary) AS average_salary\nFROM employees\nGROUP BY department;",
      "resultTable": {
        "headers": [
          "department",
          "average_salary"
        ],
        "rows": [
          [
            "サポート",
            "NULL"
          ],
          [
            "営業",
            "325000"
          ],
          [
            "開発",
            "400000"
          ]
        ]
      }
    },
    {
      "heading": "MIN・MAXで部署の月給の幅を見る",
      "body": "MINは最小値、MAXは最大値です。営業では300000円と350000円、開発では全員が同額なので両方とも400000円になります。表示されるのは金額であり、その金額を受け取る社員名ではありません。",
      "code": "SELECT department,\n  MIN(salary) AS lowest_salary,\n  MAX(salary) AS highest_salary\nFROM employees\nGROUP BY department;",
      "resultTable": {
        "headers": [
          "department",
          "lowest_salary",
          "highest_salary"
        ],
        "rows": [
          [
            "サポート",
            "NULL",
            "NULL"
          ],
          [
            "営業",
            "300000",
            "350000"
          ],
          [
            "開発",
            "400000",
            "400000"
          ]
        ]
      }
    },
    {
      "heading": "COUNT(*)とCOUNT(salary)の違いを確かめる",
      "body": "COUNT(*)は社員の行を数え、COUNT(salary)は月給がNULLでない行だけを数えます。サポートには社員が1人いるのでpeopleは1ですが、入力済み月給の件数は0です。「人数」と「値が入っている件数」を区別しましょう。",
      "code": "SELECT department,\n  COUNT(*) AS people,\n  COUNT(salary) AS entered_salaries\nFROM employees\nGROUP BY department;",
      "resultTable": {
        "headers": [
          "department",
          "people",
          "entered_salaries"
        ],
        "rows": [
          [
            "サポート",
            "1",
            "0"
          ],
          [
            "営業",
            "2",
            "2"
          ],
          [
            "開発",
            "2",
            "2"
          ]
        ]
      }
    },
    {
      "heading": "COUNT DISTINCTで月給が何種類あるかを数える",
      "body": "COUNT(DISTINCT salary)は、重複を除いた月給の種類数です。営業は300000円と350000円の2種類、開発は2人とも400000円なので1種類になります。NULLは数えないためサポートは0です。",
      "code": "SELECT department, COUNT(DISTINCT salary) AS salary_types\nFROM employees\nGROUP BY department;",
      "resultTable": {
        "headers": [
          "department",
          "salary_types"
        ],
        "rows": [
          [
            "サポート",
            "0"
          ],
          [
            "営業",
            "2"
          ],
          [
            "開発",
            "1"
          ]
        ]
      }
    },
    {
      "heading": "複数列で「部署と月給」の組み合わせ別にまとめる",
      "body": "GROUP BY department, salaryとすると、部署だけでなく月給も同じ社員をまとめます。営業は月給が違うので2グループに分かれ、開発の2人は同じグループです。部署だけの3行から、結果が4行へ増える点に注目してください。",
      "code": "SELECT department, salary, COUNT(*) AS people\nFROM employees\nGROUP BY department, salary;",
      "resultTable": {
        "headers": [
          "department",
          "salary",
          "people"
        ],
        "rows": [
          [
            "サポート",
            "NULL",
            "1"
          ],
          [
            "営業",
            "300000",
            "1"
          ],
          [
            "営業",
            "350000",
            "1"
          ],
          [
            "開発",
            "400000",
            "2"
          ]
        ]
      }
    },
    {
      "heading": "WHEREで集計する社員を先に絞る",
      "body": "月給35万円以上の社員だけを数えるなら、GROUP BYの前にWHEREを書きます。営業の青木さんと、月給が未入力の恵比寿さんが集計対象から外れます。その結果、営業は1人、開発は2人になり、サポートの行はなくなります。",
      "code": "SELECT department, COUNT(*) AS people\nFROM employees\nWHERE salary >= 350000\nGROUP BY department;",
      "resultTable": {
        "headers": [
          "department",
          "people"
        ],
        "rows": [
          [
            "営業",
            "1"
          ],
          [
            "開発",
            "2"
          ]
        ]
      }
    }
  ],
  "mistakes": [],
  "notes": [
    {
      "title": "部署名を並べ替えるにはORDER BYを付ける",
      "body": "GROUP BYは同じ値をまとめますが、表示順までは決めません。部署名の順に表示したい場合は、GROUP BY departmentの後ろにORDER BY departmentを追加します。"
    }
  ],
  "faqs": [
    {
      "question": "社員名もSELECTに書いてよいですか？",
      "answer": "部署だけでまとめると、営業の名前を青木と中央のどちらにするか決まりません。この例でnameをそのままSELECTに加えるとエラーになります。社員ごとの行を残したい場合は、ウィンドウ関数のガイドを参照してください。"
    },
    {
      "question": "0人の部署も表示できますか？",
      "answer": "この社員表に存在しない部署は、GROUP BYだけでは表示されません。部署の一覧を別に用意してLEFT JOINする方法があります。"
    },
    {
      "question": "DISTINCTとの違いは？",
      "answer": "部署名の重複を除くだけならDISTINCTで十分です。部署ごとの人数や金額も計算したいときにGROUP BYを使います。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：GROUP BYとHAVING",
      "url": "https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP",
      "description": "GROUP BYとHAVINGの仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：集約関数",
      "url": "https://www.postgresql.org/docs/current/functions-aggregate.html",
      "description": "集約関数の仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：集約式",
      "url": "https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES",
      "description": "集約式の仕様と使用例"
    }
  ],
  "related": [
    "where",
    "having",
    "left-join",
    "window-functions"
  ],
  "practiceCategory": "group-by"
};

export const havingTopic: SqlTopic = {
  "slug": "having",
  "label": "HAVING",
  "title": "SQLのHAVINGとは？集計結果の絞り込みとWHEREの違いを解説",
  "description": "SQLのHAVINGとは？集計結果の絞り込みとWHEREの違いを解説。元の表とPostgreSQLのSQL・実行結果を見比べながら、使い方を段階的に学べます。",
  "lead": "HAVINGは、集計した結果を条件で絞る構文です。「社員が2人以上いる部署」のように、数えてから判断する条件に使います。まず全部署の集計を見て、条件を付けるとどの部署が残るかを確認しましょう。",
  "sampleIntro": "employeesの1行が社員1人分です。営業が2人、開発が2人、サポートが1人います。salaryは月給（円）で、恵比寿さんのNULLは月給が未入力であることを表し、0円とは区別します。すべての例でこの5人を使います。結果表の行の並びは一例です。ORDER BYで指定しない限り、表示順は保証されません。",
  "sampleTables": [
    {
      "caption": "employees：社員5人の一覧（salaryは月給・円）",
      "headers": [
        "id（社員ID）",
        "name（名前）",
        "department（部署）",
        "salary（月給）"
      ],
      "rows": [
        [
          "1",
          "青木",
          "営業",
          "300000"
        ],
        [
          "2",
          "北野",
          "開発",
          "400000"
        ],
        [
          "3",
          "中央",
          "営業",
          "350000"
        ],
        [
          "4",
          "大和",
          "開発",
          "400000"
        ],
        [
          "5",
          "恵比寿",
          "サポート",
          "NULL"
        ]
      ]
    }
  ],
  "syntax": "SELECT department, COUNT(*) AS people\nFROM employees\nGROUP BY department\nHAVING COUNT(*) >= 2;",
  "sections": [
    {
      "heading": "まずGROUP BYで全部署の人数を確認する",
      "body": "HAVINGを付ける前に、部署ごとの人数を出します。営業2人、開発2人、サポート1人の3行です。この集計結果を出発点に、次の節で「2人以上」という条件を付けます。",
      "code": "SELECT department, COUNT(*) AS people\nFROM employees\nGROUP BY department;",
      "resultTable": {
        "headers": [
          "department",
          "people"
        ],
        "rows": [
          [
            "サポート",
            "1"
          ],
          [
            "営業",
            "2"
          ],
          [
            "開発",
            "2"
          ]
        ]
      }
    },
    {
      "heading": "HAVING COUNTで2人以上の部署を選ぶ",
      "body": "GROUP BYの後ろにHAVING COUNT(*) >= 2を足します。集計した人数を比べるので、営業と開発が残り、1人のサポートは外れます。WHERE COUNT(*) >= 2とは書けません。集計結果を条件にする場所がHAVINGです。",
      "code": "SELECT department, COUNT(*) AS people\nFROM employees\nGROUP BY department\nHAVING COUNT(*) >= 2;",
      "resultTable": {
        "headers": [
          "department",
          "people"
        ],
        "rows": [
          [
            "営業",
            "2"
          ],
          [
            "開発",
            "2"
          ]
        ]
      }
    },
    {
      "heading": "HAVING SUMで月給の合計が70万円以上の部署を選ぶ",
      "body": "人数ではなく月給の合計を条件にするにはSUM(salary)を使います。営業は650000円、開発は800000円なので、開発だけが残ります。個人の月給が700000円以上かどうかではなく、部署全体の合計を比べています。",
      "code": "SELECT department, SUM(salary) AS total_salary\nFROM employees\nGROUP BY department\nHAVING SUM(salary) >= 700000;",
      "resultTable": {
        "headers": [
          "department",
          "total_salary"
        ],
        "rows": [
          [
            "開発",
            "800000"
          ]
        ]
      }
    },
    {
      "heading": "WHEREで月給35万円以上の社員だけを集計する",
      "body": "WHEREとHAVINGの違いを見るため、まずWHEREだけを使います。集計前に社員を絞るので、営業の青木さんは外れます。残った中央さんで営業1人、北野さんと大和さんで開発2人になります。",
      "code": "SELECT department, COUNT(*) AS people\nFROM employees\nWHERE salary >= 350000\nGROUP BY department;",
      "resultTable": {
        "headers": [
          "department",
          "people"
        ],
        "rows": [
          [
            "営業",
            "1"
          ],
          [
            "開発",
            "2"
          ]
        ]
      }
    },
    {
      "heading": "WHEREとHAVINGを組み合わせる",
      "body": "前の結果にHAVING COUNT(*) >= 2を加えます。月給35万円以上の社員だけをWHEREで選び、その人数が2人以上の部署をHAVINGで残します。営業は1人になっているため外れ、開発だけが表示されます。",
      "code": "SELECT department, COUNT(*) AS people\nFROM employees\nWHERE salary >= 350000\nGROUP BY department\nHAVING COUNT(*) >= 2;",
      "resultTable": {
        "headers": [
          "department",
          "people"
        ],
        "rows": [
          [
            "開発",
            "2"
          ]
        ]
      }
    },
    {
      "heading": "ANDで集計結果の条件を2つ指定する",
      "body": "人数が2人以上で、平均月給も350000円以上の部署を選びます。営業は2人ですが平均325000円なので外れます。開発は2人、平均400000円で両方を満たします。SELECTに判定に使う値を出すと、残った理由を確認できます。",
      "code": "SELECT department, COUNT(*) AS people,\n  AVG(salary) AS average_salary\nFROM employees\nGROUP BY department\nHAVING COUNT(*) >= 2\n  AND AVG(salary) >= 350000;",
      "resultTable": {
        "headers": [
          "department",
          "people",
          "average_salary"
        ],
        "rows": [
          [
            "開発",
            "2",
            "400000"
          ]
        ]
      }
    }
  ],
  "mistakes": [],
  "notes": [
    {
      "title": "HAVINGには集計式をもう一度書く",
      "body": "PostgreSQLのHAVINGでは、同じSELECTで付けたpeopleなどの列の別名は使えません。SELECT COUNT(*) AS peopleと書いていても、条件はHAVING COUNT(*) >= 2と書きます。"
    }
  ],
  "faqs": [
    {
      "question": "GROUP BYなしでもHAVINGは使えますか？",
      "answer": "使えます。表全体を1つのグループと見なします。今回の表でSELECT COUNT(*) FROM employees HAVING COUNT(*) >= 5;なら5を含む1行が返り、条件を>= 6にすると0行になります。"
    },
    {
      "question": "平均がNULLの部署は比較条件に残りますか？",
      "answer": "AVG(salary) >= 350000のような比較では残りません。月給が全員未入力の部署を探すなら、HAVING AVG(salary) IS NULLで判定します。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：GROUP BYとHAVING",
      "url": "https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP",
      "description": "GROUP BYとHAVINGの仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：SELECT",
      "url": "https://www.postgresql.org/docs/current/sql-select.html",
      "description": "SELECTの仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：集約関数",
      "url": "https://www.postgresql.org/docs/current/functions-aggregate.html",
      "description": "集約関数の仕様と使用例"
    }
  ],
  "related": [
    "group-by",
    "where",
    "subquery"
  ],
  "practiceCategory": "having"
};

export const subqueryTopic: SqlTopic = {
  "slug": "subquery",
  "label": "サブクエリ",
  "title": "SQLのサブクエリとは？内側のSELECTと実行結果から学ぶ使い方",
  "description": "SQLのサブクエリとは？内側のSELECTと実行結果から学ぶ使い方。元の表とPostgreSQLのSQL・実行結果を見比べながら、使い方を段階的に学べます。",
  "lead": "サブクエリは、SQLの中に書く別のSELECT文です。「平均金額より高い注文」のように、別の検索結果を条件に使えます。まず内側のSELECTだけを実行し、その値を外側でどう使うかを見てみましょう。",
  "sampleIntro": "customersは顧客の表、ordersは注文の表です。orders.customer_idで注文した顧客が分かります。青木商店には2件、北野物産には1件の注文があり、中央商事には注文がありません。どの例もこの2つの表を使います。結果表の行の並びは一例です。ORDER BYで指定しない限り、表示順は保証されません。",
  "sampleTables": [
    {
      "caption": "customers：顧客3件の一覧",
      "headers": [
        "id（顧客ID）",
        "name（顧客名）"
      ],
      "rows": [
        [
          "1",
          "青木商店"
        ],
        [
          "2",
          "北野物産"
        ],
        [
          "3",
          "中央商事"
        ]
      ]
    },
    {
      "caption": "orders：注文3件の一覧（金額は円）",
      "headers": [
        "id（注文ID）",
        "customer_id（顧客ID）",
        "amount（金額）"
      ],
      "rows": [
        [
          "101",
          "1",
          "12000"
        ],
        [
          "102",
          "1",
          "8000"
        ],
        [
          "103",
          "2",
          "25000"
        ]
      ]
    }
  ],
  "syntax": "SELECT id, amount\nFROM orders\nWHERE amount > (\n  SELECT AVG(amount)\n  FROM orders\n);",
  "sections": [
    {
      "heading": "まず内側のSELECTで平均注文額を求める",
      "body": "注文額の合計は12000 + 8000 + 25000で45000円です。AVG(amount)で3件の平均を求めると15000円になります。この1行1列の結果を、次の節で比較の基準に使います。",
      "code": "SELECT AVG(amount) AS average_amount\nFROM orders;",
      "resultTable": {
        "headers": [
          "average_amount"
        ],
        "rows": [
          [
            "15000"
          ]
        ]
      }
    },
    {
      "heading": "求めた値を条件にして注文を探す",
      "body": "平均の15000円より高い注文を、いったん数値を直接書いて探します。12000円と8000円は外れ、25000円の注文103だけが残ります。このSQLでは、平均が変わるたびに15000を書き直す必要があります。",
      "code": "SELECT id, amount\nFROM orders\nWHERE amount > 15000;",
      "resultTable": {
        "headers": [
          "id",
          "amount"
        ],
        "rows": [
          [
            "103",
            "25000"
          ]
        ]
      }
    },
    {
      "heading": "数値の代わりにサブクエリを入れる",
      "body": "前の15000を、平均を求めるSELECTで置き換えます。括弧の中がサブクエリです。今の表では平均15000円と比較するので同じ注文103が残りますが、注文が増えても、そのときの平均が比較に使われます。",
      "code": "SELECT id, amount\nFROM orders\nWHERE amount > (\n  SELECT AVG(amount)\n  FROM orders\n);",
      "resultTable": {
        "headers": [
          "id",
          "amount"
        ],
        "rows": [
          [
            "103",
            "25000"
          ]
        ]
      }
    },
    {
      "heading": "INで複数行の候補を条件にする",
      "body": "注文した顧客のIDを内側で取り出すと、1、1、2になります。INはその候補にcustomers.idが含まれるかを調べます。青木商店と北野物産が残り、中央商事は外れます。候補に1が2回あっても、青木商店の結果は1行です。",
      "code": "SELECT id, name\nFROM customers\nWHERE id IN (\n  SELECT customer_id\n  FROM orders\n);",
      "resultTable": {
        "headers": [
          "id",
          "name"
        ],
        "rows": [
          [
            "2",
            "北野物産"
          ],
          [
            "1",
            "青木商店"
          ]
        ]
      }
    },
    {
      "heading": "FROMにサブクエリを置いて集計表として使う",
      "body": "内側では注文を顧客IDごとに数えます。顧客1が2件、顧客2が1件の集計表です。この表にtotalsという別名を付け、外側のWHEREで2件以上を選びます。結果は顧客1の1行です。今回はHAVINGでも書けますが、検索結果を表として使う形を確認しましょう。",
      "code": "SELECT customer_id, order_count\nFROM (\n  SELECT customer_id, COUNT(*) AS order_count\n  FROM orders\n  GROUP BY customer_id\n) AS totals\nWHERE order_count >= 2;",
      "resultTable": {
        "headers": [
          "customer_id",
          "order_count"
        ],
        "rows": [
          [
            "1",
            "2"
          ]
        ]
      }
    },
    {
      "heading": "EXISTSの導入：相関で注文の有無を調べる",
      "body": "内側のWHEREが外側のcustomers.idを参照する相関サブクエリです。注文がある顧客1と2がそれぞれ1行ずつ残ります。条件付きの存在確認やJOINとの使い分けは、関連構文のEXISTS・NOT EXISTSガイドで詳しく学べます。",
      "code": "SELECT customers.id, customers.name\nFROM customers\nWHERE EXISTS (\n  SELECT 1\n  FROM orders\n  WHERE orders.customer_id = customers.id\n);",
      "resultTable": {
        "headers": [
          "id",
          "name"
        ],
        "rows": [
          [
            "2",
            "北野物産"
          ],
          [
            "1",
            "青木商店"
          ]
        ]
      }
    },
    {
      "heading": "NOT EXISTSの導入：対応する行の不在を調べる",
      "body": "同じ相関条件にNOT EXISTSを使うと、注文のない顧客3だけが残ります。存在と不在の条件を組み合わせる方法は、関連構文のEXISTS・NOT EXISTSガイドで扱います。",
      "code": "SELECT customers.id, customers.name\nFROM customers\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM orders\n  WHERE orders.customer_id = customers.id\n);",
      "resultTable": {
        "headers": [
          "id",
          "name"
        ],
        "rows": [
          [
            "3",
            "中央商事"
          ]
        ]
      }
    }
  ],
  "mistakes": [],
  "notes": [
    {
      "title": "存在確認の詳しい使い分けは専用ガイドへ",
      "body": "このページでは、EXISTSを相関サブクエリの入口として扱います。条件付きEXISTS、NOT EXISTSとNOT INのNULLの違い、注文が複数ある場合のJOINとの比較は、関連構文のEXISTS・NOT EXISTSガイドで確認できます。"
    }
  ],
  "faqs": [
    {
      "question": "サブクエリが複数行を返すとエラーになるのはなぜですか？",
      "answer": "amount > (SELECT ...)の右側のように1つの値が必要な場所では、1列・最大1行である必要があります。複数の候補と照合したい場合はINを使います。0行の場合は値がNULLになります。"
    },
    {
      "question": "相関サブクエリとは何ですか？",
      "answer": "本文のEXISTSの例のように、内側のSQLが外側の行の値を参照するサブクエリです。顧客ごとに注文の有無を考えると意味を追えますが、実際の実行手順はデータベースが決めます。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：スカラーサブクエリ",
      "url": "https://www.postgresql.org/docs/current/sql-expressions.html#SQL-SYNTAX-SCALAR-SUBQUERIES",
      "description": "スカラーサブクエリの仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：FROM内のサブクエリ",
      "url": "https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-SUBQUERIES",
      "description": "FROM内のサブクエリの仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：IN・EXISTSとサブクエリ",
      "url": "https://www.postgresql.org/docs/current/functions-subquery.html",
      "description": "IN・EXISTSとサブクエリの仕様と使用例"
    }
  ],
  "related": [
    "exists",
    "select",
    "where",
    "group-by",
    "inner-join"
  ],
  "practiceCategory": "subquery"
};

export const windowFunctionsTopic: SqlTopic = {
  "slug": "window-functions",
  "label": "ウィンドウ関数",
  "title": "SQLのウィンドウ関数（window関数）とは？OVER・順位・累計を結果表で解説",
  "description": "SQLのウィンドウ関数（window関数）とは、行を残したまま集計や順位を付ける機能です。OVER・PARTITION BY・ROW_NUMBER・RANK・LAG・累計をPostgreSQLの実行結果で学べます。",
  "lead": "ウィンドウ関数は、元の行を残したまま、順位や合計などの計算結果を各行に付ける機能です。月別の売上をそのまま表示しながら、担当者別の合計や累計を添えられます。同じ5行の売上で、一つずつ計算を加えましょう。",
  "sampleIntro": "salesの1行は、同じ年の「担当者1人・1か月」の売上です。青木さんは1〜3月、北野さんは1〜2月のデータがあります。青木さんの2月と3月は同額なので、順位の違いも確認できます。各例の末尾のORDER BYは、結果表の表示順を決めるために付けています。",
  "sampleTables": [
    {
      "caption": "sales：担当者ごとの月間売上（amountは万円）",
      "headers": [
        "id（行ID）",
        "salesperson（担当者）",
        "month_no（月）",
        "amount（売上・万円）"
      ],
      "rows": [
        [
          "1",
          "青木",
          "1",
          "10"
        ],
        [
          "2",
          "青木",
          "2",
          "20"
        ],
        [
          "3",
          "青木",
          "3",
          "20"
        ],
        [
          "4",
          "北野",
          "1",
          "30"
        ],
        [
          "5",
          "北野",
          "2",
          "40"
        ]
      ]
    }
  ],
  "syntax": "SELECT id, salesperson, month_no, amount,\n  SUM(amount) OVER () AS total_amount\nFROM sales\nORDER BY id;",
  "sections": [
    {
      "heading": "OVER ()で各行に全体の合計を付ける",
      "body": "売上は10 + 20 + 20 + 30 + 40で合計120万円です。SUM(amount) OVER ()は、この合計を5行すべてに付けます。SUM(amount)だけで集計すると1行になりますが、OVER ()を付けた結果では月別の5行が残ります。",
      "code": "SELECT id, salesperson, month_no, amount,\n  SUM(amount) OVER () AS total_amount\nFROM sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "salesperson",
          "month_no",
          "amount",
          "total_amount"
        ],
        "rows": [
          [
            "1",
            "青木",
            "1",
            "10",
            "120"
          ],
          [
            "2",
            "青木",
            "2",
            "20",
            "120"
          ],
          [
            "3",
            "青木",
            "3",
            "20",
            "120"
          ],
          [
            "4",
            "北野",
            "1",
            "30",
            "120"
          ],
          [
            "5",
            "北野",
            "2",
            "40",
            "120"
          ]
        ]
      }
    },
    {
      "heading": "PARTITION BYで担当者ごとに計算する",
      "body": "OVERの中にPARTITION BY salespersonを足すと、合計を求める範囲が担当者ごとに分かれます。青木さんの行には50万円、北野さんの行には70万円が付きます。GROUP BYのように担当者を1行にまとめるのではなく、月別の5行を残します。",
      "code": "SELECT id, salesperson, month_no, amount,\n  SUM(amount) OVER (PARTITION BY salesperson) AS person_total\nFROM sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "salesperson",
          "month_no",
          "amount",
          "person_total"
        ],
        "rows": [
          [
            "1",
            "青木",
            "1",
            "10",
            "50"
          ],
          [
            "2",
            "青木",
            "2",
            "20",
            "50"
          ],
          [
            "3",
            "青木",
            "3",
            "20",
            "50"
          ],
          [
            "4",
            "北野",
            "1",
            "30",
            "70"
          ],
          [
            "5",
            "北野",
            "2",
            "40",
            "70"
          ]
        ]
      }
    },
    {
      "heading": "ROW_NUMBERで売上の高い順に連番を付ける",
      "body": "ROW_NUMBERは1から始まる連番を付けます。OVER内のORDER BY amount DESC, idで、売上の高い順、同額なら行IDの小さい順に番号を決めます。20万円の行にも3と4の別の番号が付きます。末尾のORDER BYも同じ順にして、番号と表示を見比べられるようにしています。",
      "code": "SELECT id, salesperson, month_no, amount,\n  ROW_NUMBER() OVER (ORDER BY amount DESC, id) AS position\nFROM sales\nORDER BY amount DESC, id;",
      "resultTable": {
        "headers": [
          "id",
          "salesperson",
          "month_no",
          "amount",
          "position"
        ],
        "rows": [
          [
            "5",
            "北野",
            "2",
            "40",
            "1"
          ],
          [
            "4",
            "北野",
            "1",
            "30",
            "2"
          ],
          [
            "2",
            "青木",
            "2",
            "20",
            "3"
          ],
          [
            "3",
            "青木",
            "3",
            "20",
            "4"
          ],
          [
            "1",
            "青木",
            "1",
            "10",
            "5"
          ]
        ]
      }
    },
    {
      "heading": "RANKで同じ売上に同じ順位を付ける",
      "body": "同額を同順位にしたいときはRANKを使います。40万円が1位、30万円が2位、20万円の2行はどちらも3位です。その次の10万円は5位になります。同順位を判定するOVER内では売上だけを比較し、idは表示順にだけ使います。",
      "code": "SELECT id, salesperson, month_no, amount,\n  RANK() OVER (ORDER BY amount DESC) AS position\nFROM sales\nORDER BY amount DESC, id;",
      "resultTable": {
        "headers": [
          "id",
          "salesperson",
          "month_no",
          "amount",
          "position"
        ],
        "rows": [
          [
            "5",
            "北野",
            "2",
            "40",
            "1"
          ],
          [
            "4",
            "北野",
            "1",
            "30",
            "2"
          ],
          [
            "2",
            "青木",
            "2",
            "20",
            "3"
          ],
          [
            "3",
            "青木",
            "3",
            "20",
            "3"
          ],
          [
            "1",
            "青木",
            "1",
            "10",
            "5"
          ]
        ]
      }
    },
    {
      "heading": "DENSE_RANKで次の順位を飛ばさずに付ける",
      "body": "RANKをDENSE_RANKに変えると、同じ売上に同順位を付けつつ、その次を飛ばしません。20万円の2行が3位なのは同じですが、10万円は4位になります。前のRANKの結果と、最後の行の番号を比べてください。",
      "code": "SELECT id, salesperson, month_no, amount,\n  DENSE_RANK() OVER (ORDER BY amount DESC) AS position\nFROM sales\nORDER BY amount DESC, id;",
      "resultTable": {
        "headers": [
          "id",
          "salesperson",
          "month_no",
          "amount",
          "position"
        ],
        "rows": [
          [
            "5",
            "北野",
            "2",
            "40",
            "1"
          ],
          [
            "4",
            "北野",
            "1",
            "30",
            "2"
          ],
          [
            "2",
            "青木",
            "2",
            "20",
            "3"
          ],
          [
            "3",
            "青木",
            "3",
            "20",
            "3"
          ],
          [
            "1",
            "青木",
            "1",
            "10",
            "4"
          ]
        ]
      }
    },
    {
      "heading": "LAGで前の月の売上を隣に表示する",
      "body": "LAG(amount)は指定順で1行前の売上を返します。担当者ごとに分け、month_no順で計算すると、青木さんの2月には1月の10万円が付きます。各担当者の先頭月は前の行がないのでNULLです。この表は月が連続していますが、欠けた月があると「前の行」は前月とは限りません。",
      "code": "SELECT id, salesperson, month_no, amount,\n  LAG(amount) OVER (\n    PARTITION BY salesperson ORDER BY month_no\n  ) AS previous_amount\nFROM sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "salesperson",
          "month_no",
          "amount",
          "previous_amount"
        ],
        "rows": [
          [
            "1",
            "青木",
            "1",
            "10",
            "NULL"
          ],
          [
            "2",
            "青木",
            "2",
            "20",
            "10"
          ],
          [
            "3",
            "青木",
            "3",
            "20",
            "20"
          ],
          [
            "4",
            "北野",
            "1",
            "30",
            "NULL"
          ],
          [
            "5",
            "北野",
            "2",
            "40",
            "30"
          ]
        ]
      }
    },
    {
      "heading": "SUMとROWSで月ごとの累計を求める",
      "body": "担当者ごとに月順で足し上げます。ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROWは「先頭行から今の行まで」という計算範囲です。青木さんは10、30、50万円、北野さんは30、70万円となり、担当者が変わると累計も別になります。",
      "code": "SELECT id, salesperson, month_no, amount,\n  SUM(amount) OVER (\n    PARTITION BY salesperson ORDER BY month_no\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total\nFROM sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "salesperson",
          "month_no",
          "amount",
          "running_total"
        ],
        "rows": [
          [
            "1",
            "青木",
            "1",
            "10",
            "10"
          ],
          [
            "2",
            "青木",
            "2",
            "20",
            "30"
          ],
          [
            "3",
            "青木",
            "3",
            "20",
            "50"
          ],
          [
            "4",
            "北野",
            "1",
            "30",
            "30"
          ],
          [
            "5",
            "北野",
            "2",
            "40",
            "70"
          ]
        ]
      }
    },
    {
      "heading": "AVGとROWSで直前の月と今月の平均を求める",
      "body": "前の例の範囲をROWS BETWEEN 1 PRECEDING AND CURRENT ROWに変え、AVGを使います。青木さんの2月は(10 + 20) ÷ 2で15万円、3月は(20 + 20) ÷ 2で20万円です。先頭月は1行しかないため、その月の値が平均になります。",
      "code": "SELECT id, salesperson, month_no, amount,\n  AVG(amount) OVER (\n    PARTITION BY salesperson ORDER BY month_no\n    ROWS BETWEEN 1 PRECEDING AND CURRENT ROW\n  ) AS moving_average\nFROM sales\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "salesperson",
          "month_no",
          "amount",
          "moving_average"
        ],
        "rows": [
          [
            "1",
            "青木",
            "1",
            "10",
            "10"
          ],
          [
            "2",
            "青木",
            "2",
            "20",
            "15"
          ],
          [
            "3",
            "青木",
            "3",
            "20",
            "20"
          ],
          [
            "4",
            "北野",
            "1",
            "30",
            "30"
          ],
          [
            "5",
            "北野",
            "2",
            "40",
            "35"
          ]
        ]
      }
    },
    {
      "heading": "順位を条件にするには外側のWHEREで絞る",
      "body": "ウィンドウ関数の結果は、同じSELECTのWHEREでは条件にできません。まず内側で売上順のpositionを付け、その結果にrankedという名前を付けます。外側でposition <= 2とすると、40万円と30万円の2行が残ります。",
      "code": "SELECT id, salesperson, month_no, amount, position\nFROM (\n  SELECT id, salesperson, month_no, amount,\n    ROW_NUMBER() OVER (ORDER BY amount DESC, id) AS position\n  FROM sales\n) AS ranked\nWHERE position <= 2\nORDER BY position;",
      "resultTable": {
        "headers": [
          "id",
          "salesperson",
          "month_no",
          "amount",
          "position"
        ],
        "rows": [
          [
            "5",
            "北野",
            "2",
            "40",
            "1"
          ],
          [
            "4",
            "北野",
            "1",
            "30",
            "2"
          ]
        ]
      }
    }
  ],
  "mistakes": [],
  "notes": [
    {
      "title": "WHEREで消した行は計算に入らない",
      "body": "同じSELECTでWHERE month_no = 2とすると、1月の行はLAGの計算前に消えます。前月売上を計算してから2月だけを表示したい場合は、本文の順位と同じように内側で計算し、外側のWHEREで表示する月を絞ります。"
    }
  ],
  "faqs": [
    {
      "question": "OVERの中と末尾のORDER BYはどう違いますか？",
      "answer": "OVER内は順位や前後関係を計算する順番です。SQL末尾は最終的な表示順です。OVER内にORDER BYを書くだけでは表示順は保証されません。"
    },
    {
      "question": "担当者ごとの順位も付けられますか？",
      "answer": "はい。ROW_NUMBERやRANKのOVER内にPARTITION BY salespersonを加えると、担当者ごとに順位が1から始まります。"
    },
    {
      "question": "累計のROWSは省略してよいですか？",
      "answer": "省略すると、OVER内のORDER BYで同じ値を持つ行をまとめて範囲に含める既定の動作になります。1行ずつ足す意図ならROWSを明示し、同順位がある場合は行IDなども計算順に加えます。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：ウィンドウ関数入門",
      "url": "https://www.postgresql.org/docs/current/tutorial-window.html",
      "description": "ウィンドウ関数入門の仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：ウィンドウ関数",
      "url": "https://www.postgresql.org/docs/current/functions-window.html",
      "description": "ウィンドウ関数の仕様と使用例"
    },
    {
      "label": "PostgreSQL公式：ウィンドウ式と計算範囲",
      "url": "https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS",
      "description": "ウィンドウ式と計算範囲の仕様と使用例"
    }
  ],
  "related": [
    "group-by",
    "order-by",
    "subquery"
  ],
  "practiceCategory": "window-functions"
};
