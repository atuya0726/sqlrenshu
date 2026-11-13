import { buildExerciseEntries } from '../exerciseEntries';

const setup = "CREATE TABLE daily_sales (id integer PRIMARY KEY, sale_day integer NOT NULL, amount integer NOT NULL);\nINSERT INTO daily_sales VALUES (1,1,100),(2,2,200),(3,3,150),(4,3,50),(5,5,300),(6,6,100);";

export const entries = buildExerciseEntries({
  category: 'window-frame',
  tags: ["ウィンドウフレーム","ROWS BETWEEN","ウィンドウ関数"],
  setup,
  exercises: [
    {
      "slug": "default-frame",
      "title": "既定のフレーム",
      "description": "id、sale_day、amountに、sale_dayの順の累計を添えて、id順に取得してください。フレームは書かず、累計の列にはAS別名を付けずSUMの既定名を使います。同じ日の売上がどう扱われるかを確認します。",
      "sql": "SELECT id, sale_day, amount,\n  SUM(amount) OVER (ORDER BY sale_day)\nFROM daily_sales\nORDER BY id;",
      "columns": [
        "id",
        "sale_day",
        "amount",
        "sum"
      ],
      "rows": [
        [
          1,
          1,
          100,
          100
        ],
        [
          2,
          2,
          200,
          300
        ],
        [
          3,
          3,
          150,
          500
        ],
        [
          4,
          3,
          50,
          500
        ],
        [
          5,
          5,
          300,
          800
        ],
        [
          6,
          6,
          100,
          900
        ]
      ],
      "hint": "OVERの中にORDER BY sale_dayだけを書きます。",
      "explanation": "ORDER BYだけの既定フレームは同じ日の行をまとめて含めます。3日目のid 3とid 4はどちらも100+200+150+50=500になります。",
      "ordered": true
    },
    {
      "slug": "rows-vs-range",
      "title": "ROWSの累計",
      "description": "id、sale_day、amountに、1行ずつ積み上げる累計をrunning_totalとして添えて、id順に取得してください。同じ日の行はid順に並べます。",
      "sql": "SELECT id, sale_day, amount,\n  SUM(amount) OVER (\n    ORDER BY sale_day, id\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total\nFROM daily_sales\nORDER BY id;",
      "columns": [
        "id",
        "sale_day",
        "amount",
        "running_total"
      ],
      "rows": [
        [
          1,
          1,
          100,
          100
        ],
        [
          2,
          2,
          200,
          300
        ],
        [
          3,
          3,
          150,
          450
        ],
        [
          4,
          3,
          50,
          500
        ],
        [
          5,
          5,
          300,
          800
        ],
        [
          6,
          6,
          100,
          900
        ]
      ],
      "hint": "フレームをROWSで書き、同日の順番を決めるためORDER BYにidも入れます。",
      "explanation": "ROWSなら3日目の2行も別々に数えるので、id 3は450、id 4は500になります。既定フレームでは両方とも500でした。",
      "ordered": true
    },
    {
      "slug": "moving-sum",
      "title": "n PRECEDINGの移動合計",
      "description": "idとamountに、直近3行（現在行とその前の2行）の移動合計をmoving_totalとして添えて、id順に取得してください。",
      "sql": "SELECT id, amount,\n  SUM(amount) OVER (\n    ORDER BY sale_day, id\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) AS moving_total\nFROM daily_sales\nORDER BY id;",
      "columns": [
        "id",
        "amount",
        "moving_total"
      ],
      "rows": [
        [
          1,
          100,
          100
        ],
        [
          2,
          200,
          300
        ],
        [
          3,
          150,
          450
        ],
        [
          4,
          50,
          400
        ],
        [
          5,
          300,
          500
        ],
        [
          6,
          100,
          450
        ]
      ],
      "hint": "ROWS BETWEEN 2 PRECEDING AND CURRENT ROWで現在行を含む3行になります。",
      "explanation": "id 1は1行だけで100、id 2は2行の300、id 3は450です。id 4は200+150+50で400、id 5は150+50+300で500、id 6は50+300+100で450です。",
      "ordered": true
    },
    {
      "slug": "remaining-total",
      "title": "UNBOUNDED FOLLOWING",
      "description": "idとamountに、その行から最後の行までの残り合計をremainingとして添えて、id順に取得してください。同日の行はid順で扱います。",
      "sql": "SELECT id, amount,\n  SUM(amount) OVER (\n    ORDER BY sale_day, id\n    ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING\n  ) AS remaining\nFROM daily_sales\nORDER BY id;",
      "columns": [
        "id",
        "amount",
        "remaining"
      ],
      "rows": [
        [
          1,
          100,
          900
        ],
        [
          2,
          200,
          800
        ],
        [
          3,
          150,
          600
        ],
        [
          4,
          50,
          450
        ],
        [
          5,
          300,
          400
        ],
        [
          6,
          100,
          100
        ]
      ],
      "hint": "フレームの終わりを、パーティションの最後の行までにします。",
      "explanation": "全体は900で、id 1は900、2行目から順に自分の金額ずつ減って800、600、450、400、100になります。",
      "ordered": true
    },
    {
      "slug": "last-value-whole",
      "title": "LAST_VALUEとフレーム",
      "description": "idとamountに、全期間の最後の行（id順で最後）のamountをlast_amountとして添えて、id順に取得してください。",
      "sql": "SELECT id, amount,\n  LAST_VALUE(amount) OVER (\n    ORDER BY sale_day, id\n    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\n  ) AS last_amount\nFROM daily_sales\nORDER BY id;",
      "columns": [
        "id",
        "amount",
        "last_amount"
      ],
      "rows": [
        [
          1,
          100,
          100
        ],
        [
          2,
          200,
          100
        ],
        [
          3,
          150,
          100
        ],
        [
          4,
          50,
          100
        ],
        [
          5,
          300,
          100
        ],
        [
          6,
          100,
          100
        ]
      ],
      "hint": "既定のフレームは現在行までなので、最後の行まで広げます。",
      "explanation": "最後の行（id 6）のamountは100なので、全行で100になります。フレームを書かないと各行は自分自身の金額を返してしまいます。",
      "ordered": true
    },
    {
      "slug": "range-days",
      "title": "RANGEで直近の日数",
      "description": "id、sale_day、amountに、当日を含む直近2日間（sale_dayが当日-2以上の売上）の合計をlast_2_daysとして添えて、id順に取得してください。",
      "sql": "SELECT id, sale_day, amount,\n  SUM(amount) OVER (\n    ORDER BY sale_day\n    RANGE BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) AS last_2_days\nFROM daily_sales\nORDER BY id;",
      "columns": [
        "id",
        "sale_day",
        "amount",
        "last_2_days"
      ],
      "rows": [
        [
          1,
          1,
          100,
          100
        ],
        [
          2,
          2,
          200,
          300
        ],
        [
          3,
          3,
          150,
          500
        ],
        [
          4,
          3,
          50,
          500
        ],
        [
          5,
          5,
          300,
          500
        ],
        [
          6,
          6,
          100,
          400
        ]
      ],
      "hint": "行数ではなく、sale_dayの値の範囲で数えるモードを使います。",
      "explanation": "id 5は5日目なので3〜5日のid 3、4、5を合計して150+50+300=500です（4日目は営業なし）。id 6は6日目で4〜6日のid 5と6の300+100=400です。同日のid 3と4は、どちらも1〜3日の合計500になります。",
      "ordered": true
    },
    {
      "slug": "chapter-review-moving-filter",
      "title": "章末問題：ROWS・移動合計・サブクエリ",
      "description": "直近3行の移動合計が450以上の行について、idと移動合計をmoving_totalとして取得してください。同日の行はid順で扱い、id順にします。",
      "sql": "SELECT id, moving_total\nFROM (\n  SELECT id,\n    SUM(amount) OVER (\n      ORDER BY sale_day, id\n      ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n    ) AS moving_total\n  FROM daily_sales\n) t\nWHERE moving_total >= 450\nORDER BY id;",
      "columns": [
        "id",
        "moving_total"
      ],
      "rows": [
        [
          3,
          450
        ],
        [
          5,
          500
        ],
        [
          6,
          450
        ]
      ],
      "hint": "ウィンドウ関数はWHEREに書けないので、サブクエリで列にしてから絞ります。",
      "explanation": "移動合計は100、300、450、400、500、450なので、id 3、5、6が残ります。RANGEで日数を数えたり、同日を1つにまとめたりすると、id 4も残るなど別の結果になります。",
      "ordered": true,
      "review": "chapter review",
      "requirements": [
        "ROWSで当月を含む直近3行のフレームを指定する",
        "サブクエリで移動合計を列として作る",
        "外側のWHEREで450以上に絞り、id順に並べる"
      ]
    },
    {
      "slug": "cumulative-review-branch-running",
      "title": "まとめ問題：WHERE・GROUP BY・ウィンドウフレーム・ORDER BY",
      "description": "statusがpaidの売上だけを使い、支店・日ごとの合計をdaily_totalとして求め、各支店内で日付順の累計をrunning_totalとして添えてください。branch、sale_day、daily_total、running_totalの順に、支店、日付順で取得します。",
      "sql": "SELECT branch, sale_day,\n  SUM(amount) AS daily_total,\n  SUM(SUM(amount)) OVER (\n    PARTITION BY branch\n    ORDER BY sale_day\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_total\nFROM branch_sales\nWHERE status = 'paid'\nGROUP BY branch, sale_day\nORDER BY branch, sale_day;",
      "columns": [
        "branch",
        "sale_day",
        "daily_total",
        "running_total"
      ],
      "rows": [
        [
          "A支店",
          1,
          150,
          150
        ],
        [
          "A支店",
          3,
          120,
          270
        ],
        [
          "B支店",
          1,
          200,
          200
        ],
        [
          "B支店",
          2,
          160,
          360
        ],
        [
          "B支店",
          4,
          90,
          450
        ]
      ],
      "hint": "先にWHEREとGROUP BYで日別にまとめ、その合計に対して累計を取ります。",
      "explanation": "A支店は1日目が100+50で150、取消の2日目は除かれ3日目が120で累計270です。B支店は200、100+60の160、4日目の90で累計450です。取消を除かないと累計がずれます。",
      "ordered": true,
      "setup": "CREATE TABLE branch_sales (id integer PRIMARY KEY, branch text NOT NULL, sale_day integer NOT NULL, amount integer NOT NULL, status text NOT NULL);\nINSERT INTO branch_sales VALUES (1,'A支店',1,100,'paid'),(2,'A支店',1,50,'paid'),(3,'A支店',2,80,'cancelled'),(4,'A支店',3,120,'paid'),(5,'B支店',1,200,'paid'),(6,'B支店',2,100,'paid'),(7,'B支店',2,60,'paid'),(8,'B支店',3,40,'cancelled'),(9,'B支店',4,90,'paid');",
      "review": "cumulative review",
      "requirements": [
        "WHEREでpaidの売上だけに絞る",
        "GROUP BYで支店・日ごとの合計を求める",
        "支店ごとにPARTITION BYし、ROWSで日付順の累計を求める"
      ]
    }
  ],
});
