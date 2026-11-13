import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE employees (id integer PRIMARY KEY, name text NOT NULL, dept text NOT NULL, salary integer);
INSERT INTO employees VALUES (1,'青木','営業',300000),(2,'北野','営業',400000),(3,'中央','営業',440000),(4,'大和','開発',500000),(5,'石井','開発',500000),(6,'田中','開発',350000),(7,'森','総務',320000),(8,'渡辺','総務',NULL);`,
  sources: ['SELECT * FROM employees ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'correlated-subquery',
  label: '相関サブクエリ',
  title: 'SQLの相関サブクエリとは？外側の行ごとに評価される仕組みと書き換え',
  description: 'SQLの相関サブクエリをPostgreSQLの実行結果で解説。部署平均より高い社員、グループ内の最大行、SELECT句のスカラー副問合せ、JOIN+GROUP BYやウィンドウ関数との比較を演習で学べます。',
  lead: '相関サブクエリは、内側のSELECTが外側の行の値を参照するサブクエリです。外側の1行ごとに内側の答えが変わるため、「自分の部署の平均より高い」「グループ内で最大」といった、行ごとの基準で比べる問題に向きます。同じ社員表で、仕組みと書き換えを順に確かめます。',
  sampleIntro: 'employeesは1行が社員1人です。deptは部署、salaryは月給（円）で、総務の渡辺は給与が未入力のNULLです。営業の平均は380000円、開発の平均は450000円、総務の平均は320000円です。開発の大和と石井は最高給与が同額です。ORDER BYを付けた例は行順が決まっています。',
  sampleTables: [
    {
      caption: 'employees：社員8人（渡辺のsalaryはNULL）',
      headers: ['id', 'name', 'dept', 'salary'],
      rows: [
        ['1', '青木', '営業', '300000'],
        ['2', '北野', '営業', '400000'],
        ['3', '中央', '営業', '440000'],
        ['4', '大和', '開発', '500000'],
        ['5', '石井', '開発', '500000'],
        ['6', '田中', '開発', '350000'],
        ['7', '森', '総務', '320000'],
        ['8', '渡辺', '総務', 'NULL'],
      ],
    },
  ],
  syntax: 'SELECT id, name, salary\nFROM employees AS e1\nWHERE salary > (\n  SELECT AVG(salary)\n  FROM employees AS e2\n  WHERE e2.dept = e1.dept\n);',
  sections: [
    {
      heading: '外側の行ごとに内側の値が変わる',
      body: '内側のWHEREにe2.dept = e1.deptを書くと、内側は外側の社員の部署を参照します。SELECT句に置いたこの形のサブクエリは、社員の行ごとに自分の部署の平均給与を返します。営業の3人は380000円、開発の3人は450000円、総務の2人は320000円です。外側の表と内側の表は同じemployeesなので、e1とe2の別名で区別します。給与NULLの渡辺も部署は総務なので、平均は320000円です。',
      code: 'SELECT\n  id,\n  name,\n  dept,\n  salary,\n  (\n    SELECT AVG(salary)\n    FROM employees AS e2\n    WHERE e2.dept = e1.dept\n  ) AS dept_avg\nFROM employees AS e1\nORDER BY id;',
      resultTable: {
        headers: ['id', 'name', 'dept', 'salary', 'dept_avg'],
        rows: [
          ['1', '青木', '営業', '300000', '380000'],
          ['2', '北野', '営業', '400000', '380000'],
          ['3', '中央', '営業', '440000', '380000'],
          ['4', '大和', '開発', '500000', '450000'],
          ['5', '石井', '開発', '500000', '450000'],
          ['6', '田中', '開発', '350000', '450000'],
          ['7', '森', '総務', '320000', '320000'],
          ['8', '渡辺', '総務', 'NULL', '320000'],
        ],
      },
    },
    {
      heading: '自分の部署の平均より高い社員を選ぶ',
      body: '前の節の値をWHEREの比較に使います。外側の1行ごとに「自分の部署の平均」を求め、salaryと比べます。北野（400000円）と中央（440000円）は営業の平均380000円より高く、大和と石井（500000円）は開発の平均450000円より高いので残ります。森は総務の平均320000円と同額で、渡辺はNULLなので、どちらも外れます。',
      code: 'SELECT id, name, dept, salary\nFROM employees AS e1\nWHERE salary > (\n  SELECT AVG(salary)\n  FROM employees AS e2\n  WHERE e2.dept = e1.dept\n)\nORDER BY id;',
      resultTable: {
        headers: ['id', 'name', 'dept', 'salary'],
        rows: [['2', '北野', '営業', '400000'], ['3', '中央', '営業', '440000'], ['4', '大和', '開発', '500000'], ['5', '石井', '開発', '500000']],
      },
    },
    {
      heading: '相関を外すと基準が全社で固定される',
      body: '内側のWHEREがなければ、サブクエリは外側の行に関係なく、常に同じ値を返します。全社員の平均は約401428.57円なので、400000円の北野は外れ、中央・大和・石井の3人になります。前の節の結果と北野の扱いが変わりました。部署ごとの基準で比べたいときは、相関条件が必要です。',
      code: 'SELECT id, name, dept, salary\nFROM employees\nWHERE salary > (\n  SELECT AVG(salary)\n  FROM employees\n)\nORDER BY id;',
      resultTable: {
        headers: ['id', 'name', 'dept', 'salary'],
        rows: [['3', '中央', '営業', '440000'], ['4', '大和', '開発', '500000'], ['5', '石井', '開発', '500000']],
      },
    },
    {
      heading: 'グループ内で給与が最大の行を取る',
      body: 'GROUP BYで部署ごとの最大値は求められますが、最大の社員の名前は同じSELECTに出せません。相関サブクエリで部署の最大給与を求め、salary = (...)と比べると、その行全体が取れます。営業は中央、総務は森です。開発は最大が同額の大和と石井の2人とも残ります。渡辺はNULLなのでどの最大とも等しくなりません。',
      code: 'SELECT id, name, dept, salary\nFROM employees AS e1\nWHERE salary = (\n  SELECT MAX(salary)\n  FROM employees AS e2\n  WHERE e2.dept = e1.dept\n)\nORDER BY id;',
      resultTable: {
        headers: ['id', 'name', 'dept', 'salary'],
        rows: [['3', '中央', '営業', '440000'], ['4', '大和', '開発', '500000'], ['5', '石井', '開発', '500000'], ['7', '森', '総務', '320000']],
      },
    },
    {
      heading: 'JOINとGROUP BYの派生表で書き換える',
      body: '部署ごとの平均を先にGROUP BYで1回だけ集計し、社員の表とJOINして比べます。結果は相関サブクエリの2節目と同じ4人です。この形は、平均の表をほかの列と並べて表示したいときに便利です。外側の行ごとの評価という考え方が不要で、集計表と社員表の結合として読めます。',
      code: 'SELECT e.id, e.name, e.dept, e.salary\nFROM employees AS e\nJOIN (\n  SELECT dept, AVG(salary) AS dept_avg\n  FROM employees\n  GROUP BY dept\n) AS d\n  ON d.dept = e.dept\nWHERE e.salary > d.dept_avg\nORDER BY e.id;',
      resultTable: {
        headers: ['id', 'name', 'dept', 'salary'],
        rows: [['2', '北野', '営業', '400000'], ['3', '中央', '営業', '440000'], ['4', '大和', '開発', '500000'], ['5', '石井', '開発', '500000']],
      },
    },
    {
      heading: 'ウィンドウ関数で書き換える',
      body: 'AVG(salary) OVER (PARTITION BY dept)は、行を減らさずに各行へ部署平均を付けます。それを派生表にして、外側のWHEREでsalaryと比べると、同じ4人が得られます。サブクエリを使わずに平均を各行へ付けられるのが特徴です。ウィンドウ関数の結果はWHEREに直接書けないため、派生表（FROMのサブクエリ）にします。',
      code: 'SELECT id, name, dept, salary\nFROM (\n  SELECT\n    id,\n    name,\n    dept,\n    salary,\n    AVG(salary) OVER (PARTITION BY dept) AS dept_avg\n  FROM employees\n) AS t\nWHERE salary > dept_avg\nORDER BY id;',
      resultTable: {
        headers: ['id', 'name', 'dept', 'salary'],
        rows: [['2', '北野', '営業', '400000'], ['3', '中央', '営業', '440000'], ['4', '大和', '開発', '500000'], ['5', '石井', '開発', '500000']],
      },
    },
  ],
  mistakes: [
    {
      title: '別名を付けずに同じ表を使うと相関にならない',
      body: '外側も内側もemployeesのとき、内側のdept = deptは、どちらも内側の表の列として解決されます。外側との対応にはならず、NULLでない行ではすべて真になるため、全社員の平均と比べる結果になります。外側にe1、内側にe2の別名を付け、e2.dept = e1.deptと書いてください。',
      code: 'SELECT id, name, dept, salary\nFROM employees\nWHERE salary > (\n  SELECT AVG(salary)\n  FROM employees\n  WHERE dept = dept\n)\nORDER BY id;',
    },
    {
      title: 'スカラーとして使うサブクエリが2行以上返るとエラーになる',
      body: 'SELECT句や比較の右辺に置くサブクエリは、1行1列でなければなりません。たとえば内側のSELECTでAVGを付けずにe2.salaryだけを返すと、同じ部署の社員が複数いる行でエラーになります。0行ならNULLになるだけでエラーにはならないため、複数行を返す可能性を、集約関数やLIMITで確認しておきます。',
    },
  ],
  notes: [
    {
      title: 'グループごとに上位1件を取るならLATERAL',
      body: 'FROM句でも、LATERALを付けたサブクエリは、前に書いた表の列を参照できます。部署ごとに給与が最も高い1人を取るとき、同額なら小さいidを選ぶように並べてLIMIT 1とすれば、同額の複数行ではなく1行に絞れます。',
      code: 'SELECT d.dept, t.name, t.salary\nFROM (SELECT DISTINCT dept FROM employees) AS d\nCROSS JOIN LATERAL (\n  SELECT name, salary\n  FROM employees AS e\n  WHERE e.dept = d.dept\n  ORDER BY salary DESC NULLS LAST, id\n  LIMIT 1\n) AS t\nORDER BY d.dept;',
    },
    {
      title: '「行ごとに評価」は読み方で、実行計画は別',
      body: '相関サブクエリは、外側の行ごとに内側を評価すると考えると意味を追えます。PostgreSQLの公式ドキュメントでも、外側の変数は1回の評価の間は定数として扱われると説明されています。ただし実際の実行方法はPostgreSQLが決めるため、速度は件数やインデックスで変わります。気になる場合はEXPLAINで確認します。',
    },
  ],
  faqs: [
    {
      question: '相関サブクエリは遅いのでしょうか？',
      answer: '一概には言えません。実行方法はPostgreSQLが決めるため、同じ結果のJOINと同等になる場合もあります。件数が多く遅いと感じたら、EXPLAINで確認し、JOIN+GROUP BYやウィンドウ関数への書き換えも比べます。',
    },
    {
      question: '部署ごとの最大の社員が同額で複数いたらどうなりますか？',
      answer: 'salary = (部署の最大)で比べると、同額の社員はすべて残ります。1人だけにしたいときは、同額のときの選び方（idの小さい順など）を決めて、LATERALのLIMIT 1やROW_NUMBERを使います。',
    },
    {
      question: '相関サブクエリとJOINはどう使い分けますか？',
      answer: '行ごとの基準で絞るだけなら相関サブクエリが読みやすく、基準の値を結果の列にも並べたいならJOINの派生表やウィンドウ関数が向きます。結果が同じになるか、NULLや同額の行で確認してから選びます。',
    },
    {
      question: '相関条件の列名が外側か内側か分からなくなります。',
      answer: '内側のFROMに同名の列があると、内側の列が優先されます。外側を参照したいときは、外側の表に別名（e1など）を付けて、e1.deptのように修飾してください。',
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：スカラーサブクエリ',
      url: 'https://www.postgresql.org/docs/current/sql-expressions.html#SQL-SYNTAX-SCALAR-SUBQUERIES',
      description: '外側の変数を参照するスカラーサブクエリと、州ごとの最大人口を求める例',
    },
    {
      label: 'PostgreSQL公式：EXISTSと外側の変数',
      url: 'https://www.postgresql.org/docs/current/functions-subquery.html#FUNCTIONS-SUBQUERY-EXISTS',
      description: '外側の変数が1回の評価中は定数になること',
    },
    {
      label: 'PostgreSQL公式：LATERALサブクエリ',
      url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-LATERAL',
      description: 'FROM句で前の表の列を参照するLATERAL',
    },
    {
      label: 'PostgreSQL公式：ウィンドウ関数',
      url: 'https://www.postgresql.org/docs/current/tutorial-window.html',
      description: 'PARTITION BYで行を減らさずに集計する方法',
    },
  ],
  related: ['subquery', 'exists', 'group-by', 'window-functions', 'inner-join', 'any-all', 'not-in'],
  practiceCategory: 'correlated-subquery',
};
