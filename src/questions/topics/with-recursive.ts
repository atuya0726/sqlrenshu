import { buildExerciseEntries } from '../exerciseEntries';

const setup = `CREATE TABLE departments (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE employees (id integer PRIMARY KEY, name text NOT NULL, manager_id integer, dept_id integer REFERENCES departments(id));
CREATE TABLE routes (from_node text NOT NULL, to_node text NOT NULL);
INSERT INTO departments VALUES (1,'営業'),(2,'開発'),(3,'総務');
INSERT INTO employees VALUES (1,'山本',NULL,3),(2,'田中',1,2),(3,'佐藤',1,1),(4,'鈴木',2,2),(5,'高橋',2,2),(6,'伊藤',4,1),(7,'中村',3,1),(8,'小林',6,2);
INSERT INTO routes VALUES ('A','B'),('A','C'),('B','D'),('C','D'),('D','E');`;

export const entries = buildExerciseEntries({
  category: 'with-recursive',
  tags: ['WITH RECURSIVE', '再帰CTE'],
  setup,
  exercises: [
    {
      slug: 'number-series', title: 'WITH RECURSIVE',
      description: '再帰CTEを使って、1から7までの連番を1列（nという名前）で取得してください。行順は問いません。',
      sql: 'WITH RECURSIVE numbers AS (\n  SELECT 1 AS n\n  UNION ALL\n  SELECT n + 1\n  FROM numbers\n  WHERE n < 7\n)\nSELECT n\nFROM numbers;',
      columns: ['n'], rows: [[1], [2], [3], [4], [5], [6], [7]],
      hint: '非再帰項で1を作り、再帰項で直前のnに1を足して、nが7未満の間だけ続けます。',
      explanation: '非再帰項が1を作り、再帰項がn + 1を作ります。nが6の行から7ができ、7の行はn < 7を満たさないので次の行は作られません。n <= 7にすると8まで出て8行になります。',
    },
    {
      slug: 'stop-condition', title: '再帰の終了条件',
      description: '1から始めて、前の値を2倍していく数列を、2倍した結果が100以下の間だけ、nという列で取得してください。行順は問いません。',
      sql: 'WITH RECURSIVE doubling AS (\n  SELECT 1 AS n\n  UNION ALL\n  SELECT n * 2\n  FROM doubling\n  WHERE n * 2 <= 100\n)\nSELECT n\nFROM doubling;',
      columns: ['n'], rows: [[1], [2], [4], [8], [16], [32], [64]],
      hint: '再帰項のWHEREには、次に作る値（n * 2）が上限以内かを書きます。',
      explanation: '64の次の128は100を超えるため作られず、1、2、4、8、16、32、64の7行です。WHERE n < 100と書くと、64から128が作られて8行になります。',
    },
    {
      slug: 'org-level', title: '階層の深さ（level）',
      description: '社長（manager_idがNULLの社員）を階層1として、全社員のid、name、階層の深さをこの順に取得してください。深さの列名はlevelです。階層の浅い順、同じ階層ではidの昇順に並べます。',
      sql: 'WITH RECURSIVE tree AS (\n  SELECT id, name, 1 AS level\n  FROM employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  SELECT employees.id, employees.name, tree.level + 1\n  FROM employees\n  JOIN tree ON employees.manager_id = tree.id\n)\nSELECT id, name, level\nFROM tree\nORDER BY level, id;',
      columns: ['id', 'name', 'level'],
      rows: [[1, '山本', 1], [2, '田中', 2], [3, '佐藤', 2], [4, '鈴木', 3], [5, '高橋', 3], [7, '中村', 3], [6, '伊藤', 4], [8, '小林', 5]],
      ordered: true,
      hint: '再帰項でemployeesをCTEにJOINし、部下のmanager_idが直前の行のidと等しい行を取り、levelに1を足します。',
      explanation: '山本が1、田中・佐藤が2、鈴木・高橋・中村が3、伊藤が4、小林が5です。伊藤の部下の小林まで、段数を決めずに8人全員がたどれます。',
    },
    {
      slug: 'subordinates-of', title: '起点を指定した再帰',
      description: '田中（id = 2）を階層1として、田中とその配下の全員のid、name、階層の深さ（列名level）をこの順に取得してください。階層の浅い順、同じ階層ではidの昇順に並べます。',
      sql: 'WITH RECURSIVE subordinates AS (\n  SELECT id, name, 1 AS level\n  FROM employees\n  WHERE id = 2\n  UNION ALL\n  SELECT employees.id, employees.name, subordinates.level + 1\n  FROM employees\n  JOIN subordinates ON employees.manager_id = subordinates.id\n)\nSELECT id, name, level\nFROM subordinates\nORDER BY level, id;',
      columns: ['id', 'name', 'level'],
      rows: [[2, '田中', 1], [4, '鈴木', 2], [5, '高橋', 2], [6, '伊藤', 3], [8, '小林', 4]],
      ordered: true,
      hint: '非再帰項のWHEREを、社長を選ぶ条件から田中を選ぶ条件へ替えます。',
      explanation: '田中の部下の鈴木・高橋、鈴木の部下の伊藤、伊藤の部下の小林が続きます。佐藤と中村は別の系統なので入りません。起点の田中自身は含まれます。',
    },
    {
      slug: 'path-text', title: '経路の文字列',
      description: '社長から各社員までの上司の連なりを「山本 > 田中」のように「 > 」（前後に半角スペース）でつないだ文字列にして、idとpath（列名）を取得してください。idの昇順に並べます。',
      sql: "WITH RECURSIVE tree AS (\n  SELECT id, name, name AS path\n  FROM employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  SELECT employees.id, employees.name, tree.path || ' > ' || employees.name\n  FROM employees\n  JOIN tree ON employees.manager_id = tree.id\n)\nSELECT id, path\nFROM tree\nORDER BY id;",
      columns: ['id', 'path'],
      rows: [[1, '山本'], [2, '山本 > 田中'], [3, '山本 > 佐藤'], [4, '山本 > 田中 > 鈴木'], [5, '山本 > 田中 > 高橋'], [6, '山本 > 田中 > 鈴木 > 伊藤'], [7, '山本 > 佐藤 > 中村'], [8, '山本 > 田中 > 鈴木 > 伊藤 > 小林']],
      ordered: true,
      hint: '非再帰項ではpathをnameだけにし、再帰項で直前のpathに \' > \' と部下のnameを連結します。',
      explanation: '再帰のたびに直前の行のpathへ部下の名前を足すので、小林は「山本 > 田中 > 鈴木 > 伊藤 > 小林」と5人の連なりになります。社長の山本はpathが名前だけです。',
    },
    {
      slug: 'union-dedup', title: 'UNIONによる重複除去',
      description: 'routesで、地点Aから経路をたどって行ける地点を、Aも含めて重複なしでnodeという列に取得してください。AからDへはBを通る道とCを通る道の2通りありますが、Dは1行にします。nodeの昇順に並べます。',
      sql: "WITH RECURSIVE reach AS (\n  SELECT 'A'::text AS node\n  UNION\n  SELECT routes.to_node\n  FROM routes\n  JOIN reach ON routes.from_node = reach.node\n)\nSELECT node\nFROM reach\nORDER BY node;",
      columns: ['node'], rows: [['A'], ['B'], ['C'], ['D'], ['E']], ordered: true,
      hint: '非再帰項と再帰項をUNION ALLではなくUNIONでつなぐと、すでに出た行は捨てられます。',
      explanation: 'UNION ALLだとDとEが2回ずつ出て7行になります。UNIONなら2回目以降の同じ行が捨てられ、A、B、C、D、Eの5行です。',
    },
    {
      slug: 'chapter-review-subtree-path', title: '章末問題：再帰CTE・階層・経路・WHERE',
      description: '田中（id = 2）の配下の社員（田中自身は除く）について、id、name、田中を階層1とした深さlevel、田中からの経路path（「田中 > 鈴木」のように「 > 」でつなぐ）をこの順に取得してください。階層の浅い順、同じ階層ではidの昇順に並べます。',
      sql: "WITH RECURSIVE subordinates AS (\n  SELECT id, name, 1 AS level, name AS path\n  FROM employees\n  WHERE id = 2\n  UNION ALL\n  SELECT employees.id, employees.name, subordinates.level + 1, subordinates.path || ' > ' || employees.name\n  FROM employees\n  JOIN subordinates ON employees.manager_id = subordinates.id\n)\nSELECT id, name, level, path\nFROM subordinates\nWHERE level > 1\nORDER BY level, id;",
      columns: ['id', 'name', 'level', 'path'],
      rows: [[4, '鈴木', 2, '田中 > 鈴木'], [5, '高橋', 2, '田中 > 高橋'], [6, '伊藤', 3, '田中 > 鈴木 > 伊藤'], [8, '小林', 4, '田中 > 鈴木 > 伊藤 > 小林']],
      ordered: true,
      starter: 'WITH RECURSIVE subordinates AS (\n  SELECT id, name, 1 AS level, name AS path\n  FROM employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  SELECT employees.id, employees.name, subordinates.level + 1, subordinates.path || employees.name\n  FROM employees\n  JOIN subordinates ON employees.manager_id = subordinates.id\n)\nSELECT id, name, level, path\nFROM subordinates\nORDER BY level, id;',
      hint: '起点を田中にし、levelとpathを再帰項で更新して、外側のWHEREで田中自身を除きます。',
      explanation: '起点を社長のままにすると山本や佐藤の系統も出ます。田中を起点にすると鈴木・高橋（2）、伊藤（3）、小林（4）が残り、田中自身は外側のWHERE level > 1で除かれます。',
      review: 'chapter review',
      requirements: ['田中（id = 2）を起点にして配下をたどる', '田中を階層1としたlevelを再帰項で計算する', '田中からの経路を「 > 」でつないだpathを作る', '田中自身を除き、階層の浅い順・idの昇順に並べる'],
    },
    {
      slug: 'cumulative-review-dept-count', title: 'まとめ問題：再帰CTE・JOIN・WHERE・GROUP BY・ORDER BY',
      description: '田中（id = 2）の配下の社員（田中自身は除く）を、部署（departments）の名前ごとに数え、部署名（name）と人数をこの順に取得してください。人数の多い順に並べます。別名は付けません。',
      sql: 'WITH RECURSIVE subordinates AS (\n  SELECT id, dept_id, 1 AS level\n  FROM employees\n  WHERE id = 2\n  UNION ALL\n  SELECT employees.id, employees.dept_id, subordinates.level + 1\n  FROM employees\n  JOIN subordinates ON employees.manager_id = subordinates.id\n)\nSELECT departments.name, COUNT(*)\nFROM subordinates\nJOIN departments ON departments.id = subordinates.dept_id\nWHERE subordinates.level > 1\nGROUP BY departments.name\nORDER BY COUNT(*) DESC;',
      columns: ['name', 'count'], rows: [['開発', 3], ['営業', 1]], ordered: true,
      hint: '再帰CTEで配下を集め、departmentsにJOINしてから、田中自身を外してGROUP BYで数えます。',
      explanation: '配下は鈴木・高橋・小林（開発）と伊藤（営業）の4人です。田中自身（開発）を数えると開発が4になります。人数の多い順で、開発3人、営業1人です。',
      review: 'cumulative review',
      requirements: ['再帰CTEで田中の配下をたどる', 'departmentsとJOINして部署名を取り出す', '田中自身を除いて部署ごとに人数を数える', '人数の多い順に並べる'],
    },
  ],
});
