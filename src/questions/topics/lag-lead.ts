import { buildExerciseEntries } from '../exerciseEntries';

const setup = "CREATE TABLE shops (shop text PRIMARY KEY, region text NOT NULL);\nCREATE TABLE shop_sales (id integer PRIMARY KEY, shop text NOT NULL, month_no integer NOT NULL, amount integer NOT NULL);\nINSERT INTO shops VALUES ('A店','東'),('B店','西'),('C店','東');\nINSERT INTO shop_sales VALUES (1,'A店',1,100),(2,'A店',2,130),(3,'A店',3,130),(4,'A店',4,90),(5,'B店',1,200),(6,'B店',2,180),(7,'B店',3,220),(8,'C店',1,50);";

export const entries = buildExerciseEntries({
  category: 'lag-lead',
  tags: ["LAG","LEAD","ウィンドウ関数"],
  setup,
  exercises: [
    {
      "slug": "lag-basic",
      "title": "LAG",
      "description": "A店のmonth_no、amountに前月の売上を添え、月順で取得してください。前月がない行はNULLのままで、前月の列にはAS別名を付けずLAGの既定名を使います。",
      "sql": "SELECT month_no, amount,\n  LAG(amount) OVER (ORDER BY month_no)\nFROM shop_sales\nWHERE shop = 'A店'\nORDER BY month_no;",
      "columns": [
        "month_no",
        "amount",
        "lag"
      ],
      "rows": [
        [
          1,
          100,
          null
        ],
        [
          2,
          130,
          100
        ],
        [
          3,
          130,
          130
        ],
        [
          4,
          90,
          130
        ]
      ],
      "hint": "LAGのOVERの中に、月の並び順を書きます。",
      "explanation": "A店の1月には前の行がないのでNULLです。2月は1月の100、3月は2月の130、4月は3月の130が前月の値になります。",
      "ordered": true
    },
    {
      "slug": "lead-basic",
      "title": "LEAD",
      "description": "A店のmonth_no、amountに翌月の売上を添え、月順で取得してください。翌月の列にはAS別名を付けずLEADの既定名を使います。",
      "sql": "SELECT month_no, amount,\n  LEAD(amount) OVER (ORDER BY month_no)\nFROM shop_sales\nWHERE shop = 'A店'\nORDER BY month_no;",
      "columns": [
        "month_no",
        "amount",
        "lead"
      ],
      "rows": [
        [
          1,
          100,
          130
        ],
        [
          2,
          130,
          130
        ],
        [
          3,
          130,
          90
        ],
        [
          4,
          90,
          null
        ]
      ],
      "hint": "LAGの逆向きに値を取る関数です。",
      "explanation": "1月の翌月は2月の130、2月と3月はそれぞれ130と90、最後の4月は次の行がないのでNULLです。",
      "ordered": true
    },
    {
      "slug": "month-diff",
      "title": "LAGと差分",
      "description": "A店のmonth_noと、前月からの売上の増減（amountから前月のamountを引いた値）を、月順で取得してください。増減の列名はdiffとします。",
      "sql": "SELECT month_no,\n  amount - LAG(amount) OVER (ORDER BY month_no) AS diff\nFROM shop_sales\nWHERE shop = 'A店'\nORDER BY month_no;",
      "columns": [
        "month_no",
        "diff"
      ],
      "rows": [
        [
          1,
          null
        ],
        [
          2,
          30
        ],
        [
          3,
          0
        ],
        [
          4,
          -40
        ]
      ],
      "hint": "LAGの結果を引き算の右側に置き、式にはAS diffを付けます。",
      "explanation": "1月は前月がないのでNULL、2月は130-100で30、3月は130-130で0、4月は90-130で-40です。",
      "ordered": true
    },
    {
      "slug": "offset-default",
      "title": "オフセットと既定値",
      "description": "A店のmonth_no、amountに2か月前（2行前）の売上を添え、月順で取得してください。2行前がない行は0とし、列にはAS別名を付けずLAGの既定名を使います。",
      "sql": "SELECT month_no, amount,\n  LAG(amount, 2, 0) OVER (ORDER BY month_no)\nFROM shop_sales\nWHERE shop = 'A店'\nORDER BY month_no;",
      "columns": [
        "month_no",
        "amount",
        "lag"
      ],
      "rows": [
        [
          1,
          100,
          0
        ],
        [
          2,
          130,
          0
        ],
        [
          3,
          130,
          100
        ],
        [
          4,
          90,
          130
        ]
      ],
      "hint": "LAGの第2引数で行数、第3引数で行がないときの値を指定します。",
      "explanation": "1月と2月は2行前がないので既定値の0です。3月は1月の100、4月は2月の130になります。",
      "ordered": true
    },
    {
      "slug": "partition-by",
      "title": "PARTITION BY",
      "description": "全店舗のid、shop、month_no、amountに、同じ店舗内の前月の売上をprev_amountとして添えてください。店舗の最初の月はNULLのままで、行はid順にします。",
      "sql": "SELECT id, shop, month_no, amount,\n  LAG(amount) OVER (PARTITION BY shop ORDER BY month_no) AS prev_amount\nFROM shop_sales\nORDER BY id;",
      "columns": [
        "id",
        "shop",
        "month_no",
        "amount",
        "prev_amount"
      ],
      "rows": [
        [
          1,
          "A店",
          1,
          100,
          null
        ],
        [
          2,
          "A店",
          2,
          130,
          100
        ],
        [
          3,
          "A店",
          3,
          130,
          130
        ],
        [
          4,
          "A店",
          4,
          90,
          130
        ],
        [
          5,
          "B店",
          1,
          200,
          null
        ],
        [
          6,
          "B店",
          2,
          180,
          200
        ],
        [
          7,
          "B店",
          3,
          220,
          180
        ],
        [
          8,
          "C店",
          1,
          50,
          null
        ]
      ],
      "hint": "店ごとに別の並びとして扱うには、OVERの中でPARTITION BYを使います。",
      "explanation": "B店の1月は、直前の行がA店の4月でもNULLです。C店は1月しかないのでNULLのままです。PARTITION BYを忘れるとB店1月が90になります。",
      "ordered": true
    },
    {
      "slug": "changed-rows",
      "title": "変化があった行の抜き出し",
      "description": "前月と売上が違う行だけを、id、shop、month_no、amountの順に取得してください。店舗の最初の月と、前月と同額の行は含めません。行はid順にします。",
      "sql": "SELECT id, shop, month_no, amount\nFROM (\n  SELECT id, shop, month_no, amount,\n    LAG(amount) OVER (PARTITION BY shop ORDER BY month_no) AS prev_amount\n  FROM shop_sales\n) t\nWHERE amount <> prev_amount\nORDER BY id;",
      "columns": [
        "id",
        "shop",
        "month_no",
        "amount"
      ],
      "rows": [
        [
          2,
          "A店",
          2,
          130
        ],
        [
          4,
          "A店",
          4,
          90
        ],
        [
          6,
          "B店",
          2,
          180
        ],
        [
          7,
          "B店",
          3,
          220
        ]
      ],
      "hint": "LAGの結果はWHEREに書けないので、サブクエリで列にしてから比べます。",
      "explanation": "A店3月は130で前月と同額のため除外します。各店の最初の月は前月がNULLで、<>の比較が真にならず残りません。残るのはA店2月、A店4月、B店2月、B店3月です。",
      "ordered": true
    },
    {
      "slug": "chapter-review-drops",
      "title": "章末問題：LAG・PARTITION BY・サブクエリ",
      "description": "前月より売上が下がった行について、shop、month_no、下がった額をdrop_amountとして取得してください。下がった額は前月の売上から当月の売上を引いた正の数です。shop、month_no順にします。",
      "sql": "SELECT shop, month_no, prev_amount - amount AS drop_amount\nFROM (\n  SELECT shop, month_no, amount,\n    LAG(amount) OVER (PARTITION BY shop ORDER BY month_no) AS prev_amount\n  FROM shop_sales\n) t\nWHERE amount < prev_amount\nORDER BY shop, month_no;",
      "columns": [
        "shop",
        "month_no",
        "drop_amount"
      ],
      "rows": [
        [
          "A店",
          4,
          40
        ],
        [
          "B店",
          2,
          20
        ]
      ],
      "hint": "店ごとの前月を列にしたうえで、外側で当月と前月を比べます。",
      "explanation": "A店4月は130から90へ40下がり、B店2月は200から180へ20下がります。PARTITION BYを外すとC店1月が直前のB店3月（220）と比べられ、誤って下落に入ります。",
      "ordered": true,
      "review": "chapter review",
      "requirements": [
        "店舗ごとに月順で前月の売上を求める",
        "サブクエリで前月の売上と当月を比較する",
        "下がった額を前月から当月を引いて求め、店舗と月の順に並べる"
      ]
    },
    {
      "slug": "cumulative-review-east-rises",
      "title": "まとめ問題：LAG・JOIN・WHERE・GROUP BY・HAVING",
      "description": "東地域の店舗ごとに、前月より売上が増えた月の数をup_monthsとして数えてください。増えた月が2回以上の店舗だけを、shopとup_monthsの順に、月数の多い順、同数なら店名順で取得します。",
      "sql": "SELECT s.shop, COUNT(*) AS up_months\nFROM (\n  SELECT shop, month_no, amount,\n    LAG(amount) OVER (PARTITION BY shop ORDER BY month_no) AS prev_amount\n  FROM shop_sales\n) s\nJOIN shops h ON h.shop = s.shop\nWHERE h.region = '東'\n  AND s.amount > s.prev_amount\nGROUP BY s.shop\nHAVING COUNT(*) >= 2\nORDER BY up_months DESC, s.shop;",
      "columns": [
        "shop",
        "up_months"
      ],
      "rows": [
        [
          "E店",
          3
        ],
        [
          "D店",
          2
        ]
      ],
      "hint": "店ごとの前月を列にしてから、地域で絞り、増えた行を店ごとに数えます。",
      "explanation": "E店は3回、D店は2回増えています。A店の増加は1回でHAVINGで落ち、F店は3回増えていますが西地域なのでWHEREで除外されます。",
      "ordered": true,
      "setup": "CREATE TABLE shops (shop text PRIMARY KEY, region text NOT NULL);\nCREATE TABLE shop_sales (id integer PRIMARY KEY, shop text NOT NULL, month_no integer NOT NULL, amount integer NOT NULL);\nINSERT INTO shops VALUES ('A店','東'),('B店','西'),('C店','東'),('D店','東'),('E店','東'),('F店','西');\nINSERT INTO shop_sales VALUES (1,'A店',1,100),(2,'A店',2,130),(3,'A店',3,130),(4,'A店',4,90),(5,'B店',1,200),(6,'B店',2,180),(7,'B店',3,220),(8,'C店',1,50),(9,'D店',1,60),(10,'D店',2,70),(11,'D店',3,90),(12,'D店',4,80),(13,'E店',1,40),(14,'E店',2,50),(15,'E店',3,60),(16,'E店',4,70),(17,'F店',1,10),(18,'F店',2,20),(19,'F店',3,30),(20,'F店',4,40);",
      "review": "cumulative review",
      "requirements": [
        "LAGで店舗ごとの前月の売上を求める",
        "JOINとWHEREで東地域の店舗に絞る",
        "GROUP BYとHAVINGで増加月が2回以上の店舗だけを数える"
      ]
    }
  ],
});
