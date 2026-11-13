import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE employees (id integer PRIMARY KEY, name text NOT NULL, dept text NOT NULL, salary integer);
INSERT INTO employees VALUES (1,'青木','営業',300000),(2,'北野','営業',400000),(3,'中央','開発',350000),(4,'大和','開発',500000),(5,'石井','総務',320000),(6,'森','総務',NULL);`,
  sources: ['SELECT * FROM employees ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'any-all',
  label: 'ANY・ALL',
  title: 'SQLのANYとALLとは？IN・MAX・MINとの対応と空集合・NULLの挙動',
  description: 'SQLのANY・ALL（SOME）の使い方をPostgreSQLの実行結果で解説。= ANYとIN、> ANY・> ALLとMIN・MAXの対応、サブクエリが空集合やNULLを含むときの結果を演習で学べます。',
  lead: 'ANYとALLは、比較演算子とサブクエリの結果を組み合わせ、「どれか1つに対して成り立つか」「すべてに対して成り立つか」を調べる式です。社員の給与を使い、INやMAX・MINとの対応を確かめたうえで、空集合とNULLのときの意外な結果まで見ていきます。',
  sampleIntro: 'employeesは1行が社員1人です。deptは部署、salaryは月給（円）で、総務の森は給与が未入力のNULLです。営業は300000円と400000円、開発は350000円と500000円、総務は320000円とNULLです。人事部の社員は1人もいません。ORDER BYを付けた例は行順が決まっています。',
  sampleTables: [
    {
      caption: 'employees：社員6人（森のsalaryはNULL）',
      headers: ['id', 'name', 'dept', 'salary'],
      rows: [
        ['1', '青木', '営業', '300000'],
        ['2', '北野', '営業', '400000'],
        ['3', '中央', '開発', '350000'],
        ['4', '大和', '開発', '500000'],
        ['5', '石井', '総務', '320000'],
        ['6', '森', '総務', 'NULL'],
      ],
    },
  ],
  syntax: "SELECT *\nFROM employees\nWHERE salary > ANY (\n  SELECT salary\n  FROM employees\n  WHERE dept = '営業'\n);",
  sections: [
    {
      heading: '= ANYはINと同じ意味',
      body: 'expression = ANY (サブクエリ)は、サブクエリの結果のどれかと等しければtrueです。給与400000円以上の社員がいる部署は営業と開発なので、その部署に所属する青木・北野・中央・大和が残ります。dept IN (...)と書いた場合と同じ結果で、PostgreSQLの公式ドキュメントでもINは= ANYと同等と説明されています。',
      code: "SELECT *\nFROM employees\nWHERE dept = ANY (\n  SELECT dept\n  FROM employees\n  WHERE salary >= 400000\n)\nORDER BY id;",
      resultTable: {
        headers: ['id', 'name', 'dept', 'salary'],
        rows: [['1', '青木', '営業', '300000'], ['2', '北野', '営業', '400000'], ['3', '中央', '開発', '350000'], ['4', '大和', '開発', '500000']],
      },
    },
    {
      heading: '> ANYは「どれか1つより大きい」',
      body: '営業の給与は300000円と400000円です。salary > ANYは、そのどちらか一方より大きければtrueなので、実質的に最小の300000円より大きい社員が残ります。北野（400000円）、中央、大和、石井が該当します。青木は自分と同額の300000円より大きくないので外れ、給与NULLの森は比較が不明で残りません。',
      code: "SELECT *\nFROM employees\nWHERE salary > ANY (\n  SELECT salary\n  FROM employees\n  WHERE dept = '営業'\n)\nORDER BY id;",
      resultTable: {
        headers: ['id', 'name', 'dept', 'salary'],
        rows: [['2', '北野', '営業', '400000'], ['3', '中央', '開発', '350000'], ['4', '大和', '開発', '500000'], ['5', '石井', '総務', '320000']],
      },
    },
    {
      heading: '> ALLは「すべてより大きい」',
      body: 'salary > ALLは、営業の300000円にも400000円にも勝つ必要があります。実質的に最大の400000円より大きい社員だけが残るので、結果は大和（500000円）の1人です。北野は自分と同額の400000円に勝てず、中央の350000円も400000円に届かないため外れます。ANYとは大きく結果が変わります。',
      code: "SELECT *\nFROM employees\nWHERE salary > ALL (\n  SELECT salary\n  FROM employees\n  WHERE dept = '営業'\n)\nORDER BY id;",
      resultTable: {
        headers: ['id', 'name', 'dept', 'salary'],
        rows: [['4', '大和', '開発', '500000']],
      },
    },
    {
      heading: 'MAX・MINとの対応を1行ずつ確かめる',
      body: '値が空でなくNULLもない集合なら、> ANYは> MIN、> ALLは> MAXと同じ結果です。営業の給与（300000円と400000円）で、ANY・ALLの式とMIN・MAXの式を同じ行に並べます。4つの列は、どの社員でも対応するANYとMIN、ALLとMAXが一致します。森のsalaryがNULLなので全列がNULLです。',
      code: "SELECT\n  id,\n  salary,\n  salary > ANY (SELECT salary FROM employees WHERE dept = '営業') AS any_result,\n  salary > (SELECT MIN(salary) FROM employees WHERE dept = '営業') AS min_result,\n  salary > ALL (SELECT salary FROM employees WHERE dept = '営業') AS all_result,\n  salary > (SELECT MAX(salary) FROM employees WHERE dept = '営業') AS max_result\nFROM employees\nORDER BY id;",
      resultTable: {
        headers: ['id', 'salary', 'any_result', 'min_result', 'all_result', 'max_result'],
        rows: [
          ['1', '300000', 'false', 'false', 'false', 'false'],
          ['2', '400000', 'true', 'true', 'false', 'false'],
          ['3', '350000', 'true', 'true', 'false', 'false'],
          ['4', '500000', 'true', 'true', 'true', 'true'],
          ['5', '320000', 'true', 'true', 'false', 'false'],
          ['6', 'NULL', 'NULL', 'NULL', 'NULL', 'NULL'],
        ],
      },
    },
    {
      heading: 'サブクエリにNULLがあると> ALLはtrueにならない',
      body: '総務の給与は320000円とNULLです。500000 > ALLは、320000円には勝つものの、NULLとの比較が不明になります。falseが1つも見つからないため、結果はtrueでもfalseでもなくNULLです。一方、500000 > ANYは、320000円に勝つ時点でtrueが確定します。100000 > ANYは、trueが見つからず、NULLの比較が残るのでfalseではなくNULLです。100000 > ALLは、320000円に負ける時点でfalseです。',
      code: "SELECT\n  500000 > ALL (SELECT salary FROM employees WHERE dept = '総務') AS all_with_null,\n  500000 > ANY (SELECT salary FROM employees WHERE dept = '総務') AS any_true,\n  100000 > ANY (SELECT salary FROM employees WHERE dept = '総務') AS any_unknown,\n  100000 > ALL (SELECT salary FROM employees WHERE dept = '総務') AS all_false;",
      resultTable: {
        headers: ['all_with_null', 'any_true', 'any_unknown', 'all_false'],
        rows: [['NULL', 'true', 'NULL', 'false']],
      },
    },
    {
      heading: '空集合では> ALLはtrue、> ANYはfalse',
      body: '人事部には社員がいないので、サブクエリは0行です。ALLは「すべての行が条件を満たす」を調べるため、0行なら反例がなく、trueになります。ANYは条件を満たす行が1つもないのでfalseです。MAXやMINは0行のときNULLを返すため、> MAXと> MINはNULLになり、> ALL・> ANYとは結果が異なります。',
      code: "SELECT\n  100 > ALL (SELECT salary FROM employees WHERE dept = '人事') AS all_result,\n  100 > (SELECT MAX(salary) FROM employees WHERE dept = '人事') AS max_result,\n  100 > ANY (SELECT salary FROM employees WHERE dept = '人事') AS any_result,\n  100 > (SELECT MIN(salary) FROM employees WHERE dept = '人事') AS min_result;",
      resultTable: {
        headers: ['all_result', 'max_result', 'any_result', 'min_result'],
        rows: [['true', 'NULL', 'false', 'NULL']],
      },
    },
  ],
  mistakes: [
    {
      title: 'NULLを含む列に> ALLを使うと0件になる',
      body: '総務の給与は320000円とNULLです。salary > ALLでその部署の全員より高い社員を探すと、候補にNULLがあるため、どの社員もtrueにならず0行になります。NULLが入りうる列では、サブクエリにsalary IS NOT NULLを付けてから比較します。',
      code: "SELECT *\nFROM employees\nWHERE salary > ALL (\n  SELECT salary\n  FROM employees\n  WHERE dept = '総務'\n)\nORDER BY id;",
    },
  ],
  notes: [
    {
      title: 'SOMEはANYの別名',
      body: 'PostgreSQLでは、SOMEはANYの同義語です。標準SQLにもある書き方で、どちらを使っても結果は同じです。この例ではsalary > ANYと同じ4人が返ります。',
      code: "SELECT *\nFROM employees\nWHERE salary > SOME (\n  SELECT salary\n  FROM employees\n  WHERE dept = '営業'\n)\nORDER BY id;",
    },
    {
      title: 'ANYには配列も渡せる',
      body: 'ANY・ALLは、サブクエリの代わりに配列も受け取れます。値を直接書くときは、IN (...)の代わりに= ANY (ARRAY[...])と書けます。この配列形式の説明は、公式ドキュメントの「Row and Array Comparisons」にあります。',
      code: "SELECT *\nFROM employees\nWHERE dept = ANY (ARRAY['営業', '総務'])\nORDER BY id;",
    },
    {
      title: '<> ALLはNOT INと同じ',
      body: 'NOT INは<> ALLと同等です。そのため、サブクエリにNULLがあるとNOT INと同じ理由で、結果がNULLになり行が残りません。NULLと三値論理の詳細は、NOT INとNULLのガイドで確認できます。',
      code: "SELECT *\nFROM employees\nWHERE dept <> ALL (\n  SELECT dept\n  FROM employees\n  WHERE salary >= 400000\n)\nORDER BY id;",
    },
  ],
  faqs: [
    {
      question: 'ANYとINはどう違いますか？',
      answer: 'INは= ANYと同じ意味です。ANYの利点は、>、<、<>など = 以外の比較演算子も使えることです。「どれかより大きい」はINでは書けません。',
    },
    {
      question: '> ALLと> (SELECT MAX(...))は同じですか？',
      answer: 'サブクエリが1行以上返し、NULLがなければ同じ結果です。0行のときは、ALLがtrue、MAXがNULLなので結果が変わります。NULLを含むと、ALLはNULLになり、MAXはNULLを無視した最大値と比べます。',
    },
    {
      question: 'ANYとALLのどちらを使うか迷います。',
      answer: '「どれか1つ」に勝てばよいならANY、「全員」に勝つ必要があるならALLです。> ANYは最小値、> ALLは最大値との比較と考えると、結果を予想しやすくなります。',
    },
    {
      question: 'ANY・ALLにサブクエリが2列以上返ると？',
      answer: 'スカラーの左辺と比べる形では、サブクエリは1列だけを返す必要があります。複数列で比べたいときは、左辺に行コンストラクタ（(a, b)のような形）を使います。',
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：ANY・SOME（サブクエリ）',
      url: 'https://www.postgresql.org/docs/current/functions-subquery.html#FUNCTIONS-SUBQUERY-ANY-SOME',
      description: 'ANY・SOMEの真偽値、INとの対応、NULLと空集合の結果',
    },
    {
      label: 'PostgreSQL公式：ALL（サブクエリ）',
      url: 'https://www.postgresql.org/docs/current/functions-subquery.html#FUNCTIONS-SUBQUERY-ALL',
      description: 'ALLの真偽値、NOT INとの対応、NULLと空集合の結果',
    },
    {
      label: 'PostgreSQL公式：ANY・SOME（配列）',
      url: 'https://www.postgresql.org/docs/current/functions-comparisons.html#FUNCTIONS-COMPARISONS-ANY-SOME',
      description: '配列に対するANY・SOMEの使い方',
    },
  ],
  related: ['subquery', 'exists', 'where', 'group-by', 'not-in', 'correlated-subquery'],
  practiceCategory: 'any-all',
};
