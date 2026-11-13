import type { QuestionCore, QuestionTranslation } from '@/lib/types';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };
type Exercise = {
  slug: string; title: string; description: string; sql: string;
  columns: string[]; rows: unknown[][]; hint: string; explanation: string;
  setup?: string; starter?: string; ordered?: boolean;
  review?: 'chapter review' | 'cumulative review'; requirements?: string[];
};
const setup = "CREATE TABLE registrations (id integer PRIMARY KEY, last_name text, first_name text, product_code text);\nINSERT INTO registrations VALUES\n  (1, '青木', '太郎', 'AB-001'), (2, '北野', NULL, ' CD-002 '),\n  (3, '中央', '', 'AB --003'), (4, NULL, '花子', '日用品-004'),\n  (5, NULL, NULL, NULL);";
const extraCustomers = "\nINSERT INTO customers VALUES (6, ' 青木商店 ', '東'), (7, '北野-物産', '西'), (8, '青木-商店', '東');\nINSERT INTO orders VALUES (108,6,'2026-04-01',12000,'paid'), (109,7,'2026-04-02',5000,'paid'), (110,8,'2026-04-03',99999,'cancelled');";

export function stringFunctionsEntries(previousCommerce: string): Entry[] {
  const exercises: Exercise[] = [
  {
    "slug": "concatenation-null",
    "title": "||・CONCAT",
    "description": "全登録の全列の末尾に、姓と名を||でつないだ値、CONCATでつないだ値をこの順に追加してください。間に区切り文字は入れません。別名は付けず、行順は問いません。",
    "sql": "SELECT *, last_name || first_name, CONCAT(last_name, first_name)\nFROM registrations;",
    "columns": [
      "id",
      "last_name",
      "first_name",
      "product_code",
      "?column?",
      "concat"
    ],
    "rows": [
      [
        1,
        "青木",
        "太郎",
        "AB-001",
        "青木太郎",
        "青木太郎"
      ],
      [
        2,
        "北野",
        null,
        " CD-002 ",
        null,
        "北野"
      ],
      [
        3,
        "中央",
        "",
        "AB --003",
        "中央",
        "中央"
      ],
      [
        4,
        null,
        "花子",
        "日用品-004",
        null,
        "花子"
      ],
      [
        5,
        null,
        null,
        null,
        null,
        ""
      ]
    ],
    "hint": "||とCONCATはNULLの扱いが異なります。",
    "explanation": "姓・名の片方がNULLなら||はNULL、CONCATは入力済みの部分を返します。両方NULLならCONCATは空文字です。"
  },
  {
    "slug": "substring-position",
    "title": "SUBSTRING",
    "description": "全登録の全列の末尾に、商品コードの1文字目から2文字を切り出した値を追加してください。前後の空白は削らず、SUBSTRINGを使います。別名は付けず、行順は問いません。",
    "sql": "SELECT *, SUBSTRING(product_code FROM 1 FOR 2)\nFROM registrations;",
    "columns": [
      "id",
      "last_name",
      "first_name",
      "product_code",
      "substring"
    ],
    "rows": [
      [
        1,
        "青木",
        "太郎",
        "AB-001",
        "AB"
      ],
      [
        2,
        "北野",
        null,
        " CD-002 ",
        " C"
      ],
      [
        3,
        "中央",
        "",
        "AB --003",
        "AB"
      ],
      [
        4,
        null,
        "花子",
        "日用品-004",
        "日用"
      ],
      [
        5,
        null,
        null,
        null,
        null
      ]
    ],
    "hint": "FROM 1が開始位置、FOR 2が文字数です。",
    "explanation": "ID2は先頭の空白も1文字なので空白とCです。日本語のコードは2文字の日用になります。"
  },
  {
    "slug": "trim-spaces",
    "title": "TRIM",
    "description": "全登録の全列の末尾に、商品コードの前後の半角スペースをTRIMで取り除いた値を追加してください。ハイフンや内部の文字は残します。別名は付けず、行順は問いません。",
    "sql": "SELECT *, TRIM(product_code)\nFROM registrations;",
    "columns": [
      "id",
      "last_name",
      "first_name",
      "product_code",
      "btrim"
    ],
    "rows": [
      [
        1,
        "青木",
        "太郎",
        "AB-001",
        "AB-001"
      ],
      [
        2,
        "北野",
        null,
        " CD-002 ",
        "CD-002"
      ],
      [
        3,
        "中央",
        "",
        "AB --003",
        "AB --003"
      ],
      [
        4,
        null,
        "花子",
        "日用品-004",
        "日用品-004"
      ],
      [
        5,
        null,
        null,
        null,
        null
      ]
    ],
    "hint": "TRIMに商品コードを渡します。",
    "explanation": "ID2の前後の空白だけが消えます。元のproduct_codeはそのままです。既定の結果列名はbtrimになります。"
  },
  {
    "slug": "replace-hyphens",
    "title": "REPLACE",
    "description": "全登録の全列の末尾に、商品コード中のハイフンをすべて取り除いた値をREPLACEで追加してください。前後の空白は残します。別名は付けず、行順は問いません。",
    "sql": "SELECT *, REPLACE(product_code, '-', '')\nFROM registrations;",
    "columns": [
      "id",
      "last_name",
      "first_name",
      "product_code",
      "replace"
    ],
    "rows": [
      [
        1,
        "青木",
        "太郎",
        "AB-001",
        "AB001"
      ],
      [
        2,
        "北野",
        null,
        " CD-002 ",
        " CD002 "
      ],
      [
        3,
        "中央",
        "",
        "AB --003",
        "AB 003"
      ],
      [
        4,
        null,
        "花子",
        "日用品-004",
        "日用品004"
      ],
      [
        5,
        null,
        null,
        null,
        null
      ]
    ],
    "hint": "REPLACEの第2引数に'-'、第3引数に空文字を指定します。",
    "explanation": "ハイフンが2個あるID3もAB 003になります。ID2の前後の空白は残ります。"
  },
  {
    "slug": "chapter-review-clean-prefix",
    "title": "章末問題：CONCAT・TRIM・REPLACE・SUBSTRING",
    "description": "全登録の全列の末尾に、姓と名を区切りなしでCONCATした値と、加工したコードの先頭2文字を追加してください。コードは前後の半角スペースを削り、すべてのハイフンを削ってから先頭2文字を取り出します。コードがNULLなら追加のコード列もNULLです。別名は付けず、行順は問いません。初期SQLを修正してください。",
    "sql": "SELECT *, CONCAT(last_name, first_name),\n  SUBSTRING(REPLACE(TRIM(product_code), '-', '') FROM 1 FOR 2)\nFROM registrations;",
    "columns": [
      "id",
      "last_name",
      "first_name",
      "product_code",
      "concat",
      "substring"
    ],
    "rows": [
      [
        1,
        "青木",
        "太郎",
        "AB-001",
        "青木太郎",
        "AB"
      ],
      [
        2,
        "北野",
        null,
        " CD-002 ",
        "北野",
        "CD"
      ],
      [
        3,
        "中央",
        "",
        "AB --003",
        "中央",
        "AB"
      ],
      [
        4,
        null,
        "花子",
        "日用品-004",
        "花子",
        "日用"
      ],
      [
        5,
        null,
        null,
        null,
        "",
        null
      ]
    ],
    "hint": "TRIMとREPLACEで整えてからSUBSTRINGを適用します。",
    "explanation": "ID2は先頭の空白を消してから切り出すのでCDです。名が未入力でも北野や花子は残り、両方未入力なら名前は空文字です。",
    "review": "chapter review",
    "starter": "SELECT *, last_name || first_name,\n  SUBSTRING(product_code FROM 1 FOR 2)\nFROM registrations;",
    "requirements": [
      "NULLの名前部分を飛ばして連結する",
      "コードの前後の空白とすべてのハイフンを取り除く",
      "加工後のコードの先頭2文字を取得する"
    ]
  },
  {
    "slug": "cumulative-review-normalized-customers",
    "title": "まとめ問題：TRIM・REPLACE・JOIN・WHERE・GROUP BY・HAVING・ORDER BY",
    "description": "顧客名の前後の半角スペースと、名前に含まれるハイフンを取り除き、加工後の名前が同じ顧客をまとめて集計してください。この問題では加工後の名前が同じ行を同じ顧客と見なします。支払済み（statusがpaid）の注文だけを数え、2件以上の顧客について、加工後の名前、COUNT(*)、SUM(金額)をこの順で取得します。合計の降順、同額なら加工後の名前の昇順に並べ、別名は付けません。",
    "sql": "SELECT REPLACE(TRIM(customers.name), '-', ''), COUNT(*), SUM(orders.amount)\nFROM customers\nINNER JOIN orders ON customers.id = orders.customer_id\nWHERE orders.status = 'paid'\nGROUP BY REPLACE(TRIM(customers.name), '-', '')\nHAVING COUNT(*) >= 2\nORDER BY SUM(orders.amount) DESC, REPLACE(TRIM(customers.name), '-', '');",
    "columns": [
      "replace",
      "count",
      "sum"
    ],
    "rows": [
      [
        "中央商事",
        2,
        40000
      ],
      [
        "青木商店",
        3,
        32000
      ],
      [
        "北野物産",
        2,
        30000
      ]
    ],
    "hint": "SELECTとGROUP BYで同じ名前の加工式を使い、支払済み条件は集計前に指定します。",
    "explanation": "青木商店と前後に空白のある同名顧客は合計3件32000円です。北野物産と北野-物産は2件30000円になります。青木-商店の取消注文は含めません。実際に同じ顧客かの判断は、この問題では設問のルールに従います。",
    "review": "cumulative review",
    "ordered": true,
    "requirements": [
      "前後の空白とハイフンを除いた名前で集計する",
      "支払済み注文だけを数える",
      "2件以上の顧客だけを残す",
      "金額合計の降順、加工後の名前の昇順に並べる"
    ]
  }
];
  return exercises.map((exercise, index) => ({
    core: {
      id: `string-functions-${String(index + 1).padStart(2, '0')}`, slug: exercise.slug, category: 'string-functions',
      level: exercise.review === 'cumulative review' ? 4 : exercise.review ? 3 : 2,
      setupSql: exercise.review === 'cumulative review' ? previousCommerce + extraCustomers : setup, starterSql: exercise.starter ?? (exercise.review === 'cumulative review' ? 'SELECT\n  -- 名前を加工して集計してください\nFROM customers\n' : 'SELECT *,\n  -- ガイドを参考に加工した値を追加してください\nFROM registrations;'),
      expectedResult: { columns: exercise.columns, rows: exercise.rows.map((row) => Object.fromEntries(exercise.columns.map((column, i) => [column, row[i]]))) },
      grading: { mode: 'result', compareRowOrder: exercise.ordered ?? false, compareColumnOrder: true, numericTolerance: 0 },
      compatibility: { dialect: 'postgresql', postgres: true, notes: 'PostgreSQLで実行・検証しています。' },
      source: { type: 'original' }, tags: ['文字列', exercise.title, ...(exercise.review ? [exercise.review] : [])],
    },
    translations: { ja: { title: exercise.title, description: exercise.description, solutionSql: exercise.sql,
      hints: [exercise.hint], explanation: exercise.explanation, ...(exercise.requirements ? { requirements: exercise.requirements } : {}) } },
  }));
}
