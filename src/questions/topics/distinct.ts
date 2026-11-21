import { buildExerciseEntries, type Exercise } from '../exerciseEntries';

const setup = "CREATE TABLE purchases (id integer PRIMARY KEY, customer text NOT NULL, category text, city text NOT NULL, amount integer NOT NULL);\nINSERT INTO purchases VALUES (1, '佐藤', '文具', '東京', 500), (2, '鈴木', '食品', '大阪', 1200), (3, '佐藤', '文具', '東京', 300), (4, '田中', NULL, '東京', 800), (5, '鈴木', '文具', '大阪', 400), (6, '高橋', '食品', '福岡', 1500), (7, '佐藤', '食品', '東京', 900), (8, '田中', NULL, '東京', 200);";

const exercises: Exercise[] = [
  {
    "slug": "distinct-basic",
    "title": "DISTINCT",
    "description": "purchases から、購入したことのある顧客名（customer）を重複なく取り出してください。",
    "sql": "SELECT DISTINCT customer\nFROM purchases;",
    "starter": "SELECT \nFROM purchases;",
    "hint": "SELECTの直後にDISTINCTを書きます。",
    "explanation": "購入は8件ありますが、顧客は佐藤・鈴木・田中・高橋の4人です。DISTINCTを付けると、同じ顧客名の行が1行にまとまります。",
    "columns": [
      "customer"
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
      ],
      [
        "高橋"
      ]
    ]
  },
  {
    "slug": "distinct-multiple-columns",
    "title": "DISTINCT・複数列",
    "description": "purchases から、顧客名（customer）と都市（city）の組み合わせを重複なく取り出してください。",
    "sql": "SELECT DISTINCT customer, city\nFROM purchases;",
    "starter": "SELECT \nFROM purchases;",
    "hint": "DISTINCTの後ろに2つの列を並べると、組み合わせで重複を判定します。",
    "explanation": "DISTINCTはSELECTに書いた全部の列の組み合わせで重複を判定します。この表では顧客ごとに都市が1つなので、結果は顧客の数と同じ4行です。",
    "columns": [
      "customer",
      "city"
    ],
    "rows": [
      [
        "佐藤",
        "東京"
      ],
      [
        "田中",
        "東京"
      ],
      [
        "鈴木",
        "大阪"
      ],
      [
        "高橋",
        "福岡"
      ]
    ]
  },
  {
    "slug": "distinct-null",
    "title": "DISTINCT・NULL",
    "description": "purchases から、カテゴリ（category）の種類を重複なく取り出してください。未入力（NULL）も1行として含めます。",
    "sql": "SELECT DISTINCT category\nFROM purchases;",
    "starter": "SELECT \nFROM purchases;",
    "hint": "DISTINCTはNULLどうしを同じ値として1行にまとめます。WHEREで除く必要はありません。",
    "explanation": "categoryは文具、食品、NULLの3種類です。NULLの行は2件ありますが、DISTINCTでは1行にまとまります。",
    "columns": [
      "category"
    ],
    "rows": [
      [
        "文具"
      ],
      [
        "食品"
      ],
      [
        null
      ]
    ]
  },
  {
    "slug": "count-distinct",
    "title": "COUNT(DISTINCT)",
    "description": "purchases の購入件数を purchases、顧客の人数を customers、カテゴリの種類の数を categories という列名で、1行に表示してください。カテゴリの未入力（NULL）は数えません。",
    "sql": "SELECT\n  COUNT(*) AS purchases,\n  COUNT(DISTINCT customer) AS customers,\n  COUNT(DISTINCT category) AS categories\nFROM purchases;",
    "starter": "SELECT\n  \nFROM purchases;",
    "hint": "行の数はCOUNT(*)、種類の数はCOUNT(DISTINCT 列)で数えます。",
    "explanation": "購入は8件、顧客は4人、カテゴリは文具と食品の2種類です。COUNT(DISTINCT category)はNULLを数えないので、3ではなく2になります。",
    "columns": [
      "purchases",
      "customers",
      "categories"
    ],
    "rows": [
      [
        8,
        4,
        2
      ]
    ]
  },
  {
    "slug": "distinct-order-by",
    "title": "DISTINCT・ORDER BY",
    "ordered": true,
    "description": "purchases から、購入金額（amount）が500以上の購入について、顧客名（customer）を重複なく取り出し、顧客名の昇順に並べてください。",
    "sql": "SELECT DISTINCT customer\nFROM purchases\nWHERE amount >= 500\nORDER BY customer;",
    "starter": "SELECT \nFROM purchases\n",
    "hint": "WHEREで行を絞ってからDISTINCTでまとめ、最後にORDER BYで並べます。ORDER BYに書けるのはSELECTにある列です。",
    "explanation": "500以上の購入は5件で、顧客は佐藤（2件）・鈴木・田中・高橋です。WHEREで絞ったあとの行に対してDISTINCTが働くので、佐藤は1行になります。",
    "columns": [
      "customer"
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
      ],
      [
        "高橋"
      ]
    ]
  },
  {
    "slug": "count-distinct-group-by",
    "title": "COUNT(DISTINCT)・GROUP BY",
    "description": "purchases から、都市（city）ごとに、購入件数を purchases、顧客の人数を customers という列名で表示してください。",
    "sql": "SELECT city, COUNT(*) AS purchases, COUNT(DISTINCT customer) AS customers\nFROM purchases\nGROUP BY city;",
    "starter": "SELECT city, \nFROM purchases\n",
    "hint": "GROUP BY cityで都市ごとにまとめ、件数はCOUNT(*)、人数はCOUNT(DISTINCT customer)で数えます。",
    "explanation": "東京は購入5件で顧客は佐藤と田中の2人、大阪は2件で鈴木の1人、福岡は1件で高橋の1人です。同じ顧客が何度購入しても、COUNT(DISTINCT customer)では1人と数えます。",
    "columns": [
      "city",
      "purchases",
      "customers"
    ],
    "rows": [
      [
        "大阪",
        2,
        1
      ],
      [
        "東京",
        5,
        2
      ],
      [
        "福岡",
        1,
        1
      ]
    ]
  },
  {
    "slug": "chapter-review-distinct-pairs",
    "title": "章末問題：DISTINCT・WHERE・ORDER BY",
    "review": "chapter review",
    "ordered": true,
    "description": "東京（city が 東京）の購入について、顧客名（customer）とカテゴリ（category）の組み合わせを重複なく取り出してください。顧客名の昇順、同じ顧客の中ではカテゴリの昇順に並べます。",
    "requirements": [
      "WHEREで東京の購入だけに絞る",
      "customerとcategoryの組み合わせにDISTINCTを付ける",
      "ORDER BYで顧客名、カテゴリの順に並べる"
    ],
    "sql": "SELECT DISTINCT customer, category\nFROM purchases\nWHERE city = '東京'\nORDER BY customer, category;",
    "starter": "SELECT \nFROM purchases\n",
    "hint": "絞り込みはWHERE、重複の除外はDISTINCT、並べ替えはORDER BYです。書く順番はSELECT DISTINCT、FROM、WHERE、ORDER BYです。",
    "explanation": "東京の購入は5件です。佐藤・文具が2件、田中・NULLが2件あり、それぞれ1行にまとまるので、結果は佐藤・文具、佐藤・食品、田中・NULLの3行です。NULLどうしも同じ値としてまとめられます。",
    "columns": [
      "customer",
      "category"
    ],
    "rows": [
      [
        "佐藤",
        "文具"
      ],
      [
        "佐藤",
        "食品"
      ],
      [
        "田中",
        null
      ]
    ]
  },
  {
    "slug": "cumulative-review-category-summary",
    "title": "まとめ問題：COUNT(DISTINCT)・COALESCE・GROUP BY・HAVING",
    "review": "cumulative review",
    "ordered": true,
    "description": "カテゴリごとに、購入件数を purchases、顧客の人数を customers、購入金額の合計を total_amount という列名で表示してください。カテゴリが未入力（NULL）の行は '未分類' と表示し、列名は category とします。顧客が2人以上いるカテゴリだけを残し、合計金額の高い順に並べます。",
    "requirements": [
      "COALESCEでNULLのカテゴリを'未分類'に置き換える",
      "GROUP BYでカテゴリごとにまとめる",
      "COUNT(DISTINCT customer)で顧客の人数を数える",
      "HAVINGで顧客が2人以上のカテゴリだけを残す",
      "ORDER BYで合計金額の降順に並べる"
    ],
    "sql": "SELECT\n  COALESCE(category, '未分類') AS category,\n  COUNT(*) AS purchases,\n  COUNT(DISTINCT customer) AS customers,\n  SUM(amount) AS total_amount\nFROM purchases\nGROUP BY COALESCE(category, '未分類')\nHAVING COUNT(DISTINCT customer) >= 2\nORDER BY total_amount DESC;",
    "starter": "SELECT\n  \nFROM purchases\n",
    "hint": "集計後の条件はHAVINGに書きます。HAVINGの中でもCOUNT(DISTINCT customer)を使えます。",
    "explanation": "食品は3件で顧客は鈴木・高橋・佐藤の3人、合計3600円です。文具は3件で顧客は佐藤・鈴木の2人、合計1200円です。未分類は2件ありますが、顧客は田中の1人だけなのでHAVINGで除かれます。",
    "columns": [
      "category",
      "purchases",
      "customers",
      "total_amount"
    ],
    "rows": [
      [
        "食品",
        3,
        3,
        3600
      ],
      [
        "文具",
        3,
        2,
        1200
      ]
    ]
  }
];

export const entries = buildExerciseEntries({ category: 'distinct', tags: ["distinct", "DISTINCT"], setup, exercises });
