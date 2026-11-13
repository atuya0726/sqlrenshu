import { buildExerciseEntries } from '../exerciseEntries';

const setup = "CREATE TABLE test_scores (id integer PRIMARY KEY, student text NOT NULL, score integer NOT NULL);\nINSERT INTO test_scores VALUES (1,'青木',90),(2,'伊藤',85),(3,'上田',85),(4,'遠藤',75),(5,'大野',70),(6,'加藤',70),(7,'工藤',60),(8,'小林',50),(9,'斎藤',40);";

export const entries = buildExerciseEntries({
  category: 'ntile',
  tags: ["NTILE","PERCENT_RANK","CUME_DIST","ウィンドウ関数"],
  setup,
  exercises: [
    {
      "slug": "ntile-quartile",
      "title": "NTILE",
      "description": "点数の高い順、同点ならid順で四分位に分け、student、score、グループ番号を取得してください。1を最上位とし、番号の列にはAS別名を付けずNTILEの既定名を使います。行はその順序で返します。",
      "sql": "SELECT student, score,\n  NTILE(4) OVER (ORDER BY score DESC, id)\nFROM test_scores\nORDER BY score DESC, id;",
      "columns": [
        "student",
        "score",
        "ntile"
      ],
      "rows": [
        [
          "青木",
          90,
          1
        ],
        [
          "伊藤",
          85,
          1
        ],
        [
          "上田",
          85,
          1
        ],
        [
          "遠藤",
          75,
          2
        ],
        [
          "大野",
          70,
          2
        ],
        [
          "加藤",
          70,
          3
        ],
        [
          "工藤",
          60,
          3
        ],
        [
          "小林",
          50,
          4
        ],
        [
          "斎藤",
          40,
          4
        ]
      ],
      "hint": "NTILEの引数に分割数、OVERの中に並び順を書きます。",
      "explanation": "9人を4つに分けると先頭の1グループだけ3人になり、青木・伊藤・上田が1、遠藤・大野が2、加藤・工藤が3、小林・斎藤が4です。",
      "ordered": true
    },
    {
      "slug": "ntile-sizes",
      "title": "割り切れないときの配分",
      "description": "点数の高い順、同点ならid順で5つのグループに分け、グループ番号bucketごとの人数membersを、bucket順に取得してください。",
      "sql": "SELECT bucket, COUNT(*) AS members\nFROM (\n  SELECT NTILE(5) OVER (ORDER BY score DESC, id) AS bucket\n  FROM test_scores\n) t\nGROUP BY bucket\nORDER BY bucket;",
      "columns": [
        "bucket",
        "members"
      ],
      "rows": [
        [
          1,
          2
        ],
        [
          2,
          2
        ],
        [
          3,
          2
        ],
        [
          4,
          2
        ],
        [
          5,
          1
        ]
      ],
      "hint": "NTILEの結果をサブクエリで列にし、外側で数えます。",
      "explanation": "9÷5は商1・余り4なので、余りは先頭の4グループへ1人ずつ配られ、2人、2人、2人、2人、1人になります。",
      "ordered": true
    },
    {
      "slug": "percent-rank",
      "title": "PERCENT_RANK",
      "description": "点数の高い順にstudent、score、PERCENT_RANKを取得してください。同点はid順で並べ、PERCENT_RANKの列にはAS別名を付けず既定名を使います。",
      "sql": "SELECT student, score,\n  PERCENT_RANK() OVER (ORDER BY score DESC)\nFROM test_scores\nORDER BY score DESC, id;",
      "columns": [
        "student",
        "score",
        "percent_rank"
      ],
      "rows": [
        [
          "青木",
          90,
          0
        ],
        [
          "伊藤",
          85,
          0.125
        ],
        [
          "上田",
          85,
          0.125
        ],
        [
          "遠藤",
          75,
          0.375
        ],
        [
          "大野",
          70,
          0.5
        ],
        [
          "加藤",
          70,
          0.5
        ],
        [
          "工藤",
          60,
          0.75
        ],
        [
          "小林",
          50,
          0.875
        ],
        [
          "斎藤",
          40,
          1
        ]
      ],
      "hint": "PERCENT_RANKは引数なしで、OVERに並び順を書きます。",
      "explanation": "(順位-1)÷(9-1)なので、1位の青木が0、同点2位の伊藤と上田が0.125、同点5位の大野と加藤が0.5、最下位の斎藤が1です。",
      "ordered": true
    },
    {
      "slug": "cume-dist-vs-percent-rank",
      "title": "CUME_DISTとPERCENT_RANK",
      "description": "点数の降順で計算したCUME_DISTが0.5以下の学生のstudent、scoreを取得してください。行はid順にします。",
      "sql": "SELECT student, score\nFROM (\n  SELECT id, student, score,\n    CUME_DIST() OVER (ORDER BY score DESC) AS cd\n  FROM test_scores\n) t\nWHERE cd <= 0.5\nORDER BY id;",
      "columns": [
        "student",
        "score"
      ],
      "rows": [
        [
          "青木",
          90
        ],
        [
          "伊藤",
          85
        ],
        [
          "上田",
          85
        ],
        [
          "遠藤",
          75
        ]
      ],
      "hint": "CUME_DISTをサブクエリで列にし、外側のWHEREで比べます。",
      "explanation": "CUME_DISTは青木が1÷9、伊藤と上田が3÷9、遠藤が4÷9、同点の大野と加藤が6÷9です。0.5以下の4人が残ります。PERCENT_RANKなら0.5になる大野と加藤も入るので、人数が変わります。",
      "ordered": true
    },
    {
      "slug": "ntile-ties",
      "title": "NTILEと同値",
      "description": "点数の高い順、同点ならid順で2つのグループに分けたとき、得点が70点の学生のstudent、score、グループ番号halfを取得してください。行はid順にします。",
      "sql": "SELECT student, score, half\nFROM (\n  SELECT id, student, score,\n    NTILE(2) OVER (ORDER BY score DESC, id) AS half\n  FROM test_scores\n) t\nWHERE score = 70\nORDER BY id;",
      "columns": [
        "student",
        "score",
        "half"
      ],
      "rows": [
        [
          "大野",
          70,
          1
        ],
        [
          "加藤",
          70,
          2
        ]
      ],
      "hint": "NTILEの結果を列にしたあとで、外側のWHEREで点数を絞ります。",
      "explanation": "9人を2つに分けると前半が5人です。5人目の大野は1、6人目の加藤は2になり、同じ70点でも別のグループになります。",
      "ordered": true
    },
    {
      "slug": "top-25-percent",
      "title": "上位25%の抽出",
      "description": "PERCENT_RANKを点数の降順で計算し、0.25以下の学生のstudent、scoreを、点数の降順、同点ならid順で取得してください。",
      "sql": "SELECT student, score\nFROM (\n  SELECT id, student, score,\n    PERCENT_RANK() OVER (ORDER BY score DESC) AS pr\n  FROM test_scores\n) t\nWHERE pr <= 0.25\nORDER BY score DESC, id;",
      "columns": [
        "student",
        "score"
      ],
      "rows": [
        [
          "青木",
          90
        ],
        [
          "伊藤",
          85
        ],
        [
          "上田",
          85
        ]
      ],
      "hint": "相対位置を列にしてから、外側のWHEREで0.25以下に絞ります。",
      "explanation": "青木は0、同点の伊藤と上田は0.125で、いずれも0.25以下です。遠藤は0.375なので入りません。CUME_DISTで同じ条件にすると青木だけになります。",
      "ordered": true
    },
    {
      "slug": "chapter-review-quartile-summary",
      "title": "章末問題：NTILE・GROUP BY・集計",
      "description": "点数の高い順、同点ならid順で四分位に分け、グループ番号tileごとの人数students、最低点min_score、最高点max_scoreを、tile順に取得してください。",
      "sql": "SELECT tile, COUNT(*) AS students,\n  MIN(score) AS min_score, MAX(score) AS max_score\nFROM (\n  SELECT score,\n    NTILE(4) OVER (ORDER BY score DESC, id) AS tile\n  FROM test_scores\n) t\nGROUP BY tile\nORDER BY tile;",
      "columns": [
        "tile",
        "students",
        "min_score",
        "max_score"
      ],
      "rows": [
        [
          1,
          3,
          85,
          90
        ],
        [
          2,
          2,
          70,
          75
        ],
        [
          3,
          2,
          60,
          70
        ],
        [
          4,
          2,
          40,
          50
        ]
      ],
      "hint": "NTILEの番号を列にしたサブクエリを作り、外側でGROUP BYします。",
      "explanation": "グループ1は青木・伊藤・上田で3人、85〜90点です。グループ2は遠藤と大野、グループ3は加藤と工藤で、同点の70点がグループ2の最低点とグループ3の最高点に現れます。",
      "ordered": true,
      "review": "chapter review",
      "requirements": [
        "点数の降順、同点はid順でNTILE(4)を付ける",
        "サブクエリの結果をグループ番号ごとにGROUP BYする",
        "人数・最低点・最高点を求め、グループ番号順に並べる"
      ]
    },
    {
      "slug": "cumulative-review-class-top-half",
      "title": "まとめ問題：JOIN・WHERE・PARTITION BY・PERCENT_RANK",
      "description": "数学の点数について、クラス内で点数の降順にPERCENT_RANKを求め、0.5以下の生徒のclass_name、name、scoreを取得してください。クラス名順、クラス内は点数の降順、同点は生徒id順にします。",
      "sql": "SELECT class_name, name, score\nFROM (\n  SELECT s.id, s.class_name, s.name, r.score,\n    PERCENT_RANK() OVER (\n      PARTITION BY s.class_name\n      ORDER BY r.score DESC\n    ) AS pr\n  FROM students s\n  JOIN exam_results r ON r.student_id = s.id\n  WHERE r.subject = '数学'\n) t\nWHERE pr <= 0.5\nORDER BY class_name, score DESC, id;",
      "columns": [
        "class_name",
        "name",
        "score"
      ],
      "rows": [
        [
          "A組",
          "青木",
          90
        ],
        [
          "A組",
          "伊藤",
          80
        ],
        [
          "A組",
          "上田",
          80
        ],
        [
          "B組",
          "加藤",
          85
        ],
        [
          "B組",
          "工藤",
          75
        ],
        [
          "B組",
          "小林",
          75
        ]
      ],
      "hint": "数学に絞ったうえで、クラスごとに相対位置を求め、外側で0.5以下に絞ります。",
      "explanation": "A組は5人で、青木が0、伊藤と上田が0.25、遠藤が0.75なので3人が残ります。B組は4人で、加藤が0、同点の工藤と小林が1÷3なので3人が残ります。英語の点数を混ぜたり、クラスを分けずに順位を付けると結果が変わります。",
      "ordered": true,
      "setup": "CREATE TABLE students (id integer PRIMARY KEY, name text NOT NULL, class_name text NOT NULL);\nCREATE TABLE exam_results (student_id integer NOT NULL REFERENCES students(id), subject text NOT NULL, score integer NOT NULL);\nINSERT INTO students VALUES (1,'青木','A組'),(2,'伊藤','A組'),(3,'上田','A組'),(4,'遠藤','A組'),(5,'大野','A組'),(6,'加藤','B組'),(7,'工藤','B組'),(8,'小林','B組'),(9,'斎藤','B組');\nINSERT INTO exam_results VALUES (1,'数学',90),(2,'数学',80),(3,'数学',80),(4,'数学',70),(5,'数学',60),(6,'数学',85),(7,'数学',75),(8,'数学',75),(9,'数学',55),(1,'英語',50),(2,'英語',95),(3,'英語',60),(4,'英語',92),(5,'英語',88),(6,'英語',40),(7,'英語',99),(8,'英語',30),(9,'英語',91);",
      "review": "cumulative review",
      "requirements": [
        "JOINとWHEREで数学の点数だけを取り出す",
        "PARTITION BYでクラスごとにPERCENT_RANKを求める",
        "サブクエリの外側で0.5以下に絞り、クラスと点数の順に並べる"
      ]
    }
  ],
});
