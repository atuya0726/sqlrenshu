import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE employees (id integer PRIMARY KEY, name text NOT NULL, manager_id integer);
INSERT INTO employees VALUES (1,'山本',NULL),(2,'田中',1),(3,'佐藤',1),(4,'鈴木',2),(5,'高橋',2),(6,'伊藤',4);
CREATE TABLE routes (from_node text NOT NULL, to_node text NOT NULL);
INSERT INTO routes VALUES ('A','B'),('A','C'),('B','D'),('C','D'),('D','E');`,
  sources: ['SELECT * FROM employees ORDER BY id', 'SELECT * FROM routes ORDER BY from_node, to_node'],
};

export const topic: SqlTopic = {
  slug: 'with-recursive',
  label: 'WITH RECURSIVE（再帰CTE）',
  title: 'SQLのWITH RECURSIVE（再帰CTE）とは？連番の生成・組織図の階層・経路の作り方',
  description: 'SQLのWITH RECURSIVE（再帰CTE）をPostgreSQLの元の表・SQL・結果表で解説。非再帰項と再帰項、連番の生成、上司と部下の階層と深さ、経路の文字列、終了条件、UNIONとUNION ALLの違いを演習で学べます。',
  lead: 'WITH RECURSIVEは、CTEの中で自分自身を参照し、前の結果から次の行を作り続ける構文です。上司と部下のように何段つながるか分からないデータを、1つのSELECTでたどれます。入門のWITHの続きとして、連番、組織図、経路、終了条件を順に確認します。',
  sampleIntro: 'employeesは1行が社員1人で、manager_idは上司のidです。山本は社長でmanager_idがNULLです。山本の部下が田中と佐藤、田中の部下が鈴木と高橋、鈴木の部下が伊藤で、最も深い階層は4段です。routesは1行が片道の経路で、A→B、A→C、B→D、C→D、D→Eがあり、AからDへ行く道が2通りあります。ORDER BYのない結果の行順は保証されません。',
  sampleTables: [
    { caption: 'employees：社員6人', headers: ['id', 'name', 'manager_id'], rows: [['1', '山本', 'NULL'], ['2', '田中', '1'], ['3', '佐藤', '1'], ['4', '鈴木', '2'], ['5', '高橋', '2'], ['6', '伊藤', '4']] },
    { caption: 'routes：経路5件', headers: ['from_node', 'to_node'], rows: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E']] },
  ],
  syntax: `WITH RECURSIVE tree AS (
  SELECT id, name, 1 AS level
  FROM employees
  WHERE manager_id IS NULL
  UNION ALL
  SELECT employees.id, employees.name, tree.level + 1
  FROM employees
  JOIN tree ON employees.manager_id = tree.id
)
SELECT id, name, level
FROM tree
ORDER BY level, id;`,
  sections: [
    {
      heading: '再帰CTEで1から5までの連番を作る',
      body: '再帰CTEは「非再帰項」「UNION ALL」「再帰項」の3部分でできています。非再帰項は最初の1回だけ実行され、ここでは1を返します。再帰項はCTE自身（numbers）を読み、直前に出た行のnに1を足した行を作ります。WHERE n < 5があるので、nが4の行から5が作られた後は新しい行が出ず、ここで終わります。結果は1〜5の5行です。WITHのあとにRECURSIVEを付けるのを忘れないでください。',
      code: `WITH RECURSIVE numbers AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1
  FROM numbers
  WHERE n < 5
)
SELECT n
FROM numbers
ORDER BY n;`,
      resultTable: { headers: ['n'], rows: [['1'], ['2'], ['3'], ['4'], ['5']] },
    },
    {
      heading: '終了条件のWHEREが「次の行を作るか」を決める',
      body: '再帰項のWHEREは、直前の行から次の行を作ってよいかを判定します。再帰項が1行も返さなくなった時点で再帰が終わります。ここでは前の値を2倍し、2倍した結果が100以下のときだけ続けます。64の次は128になって100を超えるため作られず、結果は1、2、4、8、16、32、64の7行です。終了条件が無いか、いつまでも成り立つ条件だと、再帰は止まらずエラーやタイムアウトになります。nが100未満かを見る書き方だと、64から128が作られて1行多くなるので、条件は「次に作る値」で判断します。',
      code: `WITH RECURSIVE doubling AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n * 2
  FROM doubling
  WHERE n * 2 <= 100
)
SELECT n
FROM doubling
ORDER BY n;`,
      resultTable: { headers: ['n'], rows: [['1'], ['2'], ['4'], ['8'], ['16'], ['32'], ['64']] },
    },
    {
      heading: '上司から部下へたどり、階層の深さ（level）を付ける',
      body: '組織図は、非再帰項で最上位（manager_idがNULLの山本）を取り、再帰項でemployeesをtreeにJOINして「直前の行の部下」を取り出します。JOINのON条件は、部下のmanager_idが直前の行のidに等しいことです。levelは非再帰項で1とし、再帰項でtree.level + 1とすると深さになります。山本が1、田中と佐藤が2、鈴木と高橋が3、伊藤が4で、6人全員が出ます。何段あるか分からなくても、部下が見つからなくなるまで自動で続きます。',
      code: `WITH RECURSIVE tree AS (
  SELECT id, name, 1 AS level
  FROM employees
  WHERE manager_id IS NULL
  UNION ALL
  SELECT employees.id, employees.name, tree.level + 1
  FROM employees
  JOIN tree ON employees.manager_id = tree.id
)
SELECT id, name, level
FROM tree
ORDER BY level, id;`,
      resultTable: { headers: ['id', 'name', 'level'], rows: [['1', '山本', '1'], ['2', '田中', '2'], ['3', '佐藤', '2'], ['4', '鈴木', '3'], ['5', '高橋', '3'], ['6', '伊藤', '4']] },
    },
    {
      heading: '非再帰項の起点を変えて、特定の人の配下だけをたどる',
      body: 'たどり始める行は非再帰項のWHEREで決まります。manager_id IS NULLの代わりにid = 2とすると、田中を起点（level 1）として、田中の部下の鈴木と高橋（level 2）、鈴木の部下の伊藤（level 3）だけが出ます。佐藤は別の系統なので入りません。起点の田中自身も結果に含まれる点に注意してください。自分を除きたいときは外側のSELECTでlevel > 1のように絞ります。',
      code: `WITH RECURSIVE subordinates AS (
  SELECT id, name, 1 AS level
  FROM employees
  WHERE id = 2
  UNION ALL
  SELECT employees.id, employees.name, subordinates.level + 1
  FROM employees
  JOIN subordinates ON employees.manager_id = subordinates.id
)
SELECT id, name, level
FROM subordinates
ORDER BY level, id;`,
      resultTable: { headers: ['id', 'name', 'level'], rows: [['2', '田中', '1'], ['4', '鈴木', '2'], ['5', '高橋', '2'], ['6', '伊藤', '3']] },
    },
    {
      heading: '経路（上司の連なり）を文字列で作る',
      body: '階層の途中の値は、再帰項で文字列として引き継げます。非再帰項ではpathをnameだけにし、再帰項でtree.path || \' > \' || employees.nameとつなぐと、社長からその人までの道すじが残ります。伊藤の経路は「山本 > 田中 > 鈴木 > 伊藤」です。非再帰項と再帰項で列の型は同じにします。ここではどちらもtextです。経路を持たせると、誰の配下かを1行で読め、後からLIKEで特定の部署以下を絞ることもできます。',
      code: `WITH RECURSIVE tree AS (
  SELECT id, name, name AS path
  FROM employees
  WHERE manager_id IS NULL
  UNION ALL
  SELECT employees.id, employees.name, tree.path || ' > ' || employees.name
  FROM employees
  JOIN tree ON employees.manager_id = tree.id
)
SELECT id, path
FROM tree
ORDER BY id;`,
      resultTable: { headers: ['id', 'path'], rows: [['1', '山本'], ['2', '山本 > 田中'], ['3', '山本 > 佐藤'], ['4', '山本 > 田中 > 鈴木'], ['5', '山本 > 田中 > 高橋'], ['6', '山本 > 田中 > 鈴木 > 伊藤']] },
    },
    {
      heading: 'UNION ALLとUNIONで、同じ行の扱いが変わる',
      body: '再帰CTEのUNION ALLは、出た行をそのまま全部残します。UNIONに替えると、すでに出た行と同じ行は捨てて、新しい行が無くなった時点で終わります。routesでAから行ける場所をたどると、Dへは「A→B→D」と「A→C→D」の2通りあります。UNION ALLではDとEが2回ずつ出て7行、UNIONでは重複が消えて5行（A、B、C、D、E）です。同じ地点を何度も通る循環のあるデータでも、UNIONなら行が重複せず止まります。ただしlevelやpathのように行ごとに値が変わる列を持つと、同じ地点でも別の行とみなされて止まりません。',
      code: `WITH RECURSIVE
all_rows AS (
  SELECT 'A'::text AS node
  UNION ALL
  SELECT routes.to_node
  FROM routes
  JOIN all_rows ON routes.from_node = all_rows.node
),
distinct_rows AS (
  SELECT 'A'::text AS node
  UNION
  SELECT routes.to_node
  FROM routes
  JOIN distinct_rows ON routes.from_node = distinct_rows.node
)
SELECT
  (SELECT COUNT(*) FROM all_rows) AS union_all_rows,
  (SELECT COUNT(*) FROM distinct_rows) AS union_rows;`,
      resultTable: { headers: ['union_all_rows', 'union_rows'], rows: [['7', '5']] },
    },
  ],
  mistakes: [
    {
      title: '終了条件が無い再帰は止まらない',
      body: '再帰項のWHEREを書き忘れる、または常に成り立つ条件にすると、再帰項が新しい行を作り続けて終わりません。数や深さに上限があるデータでは、WHERE n < 5のように必ず終了条件を置きます。上司の連なりに循環（Aの上司がBで、Bの上司がA）が紛れ込むと、組織図でも同じことが起きます。この例は動かなくなるため、コードは載せません。',
    },
    {
      title: '非再帰項と再帰項で列の型が合わないとエラーになる',
      body: '非再帰項の列の型と、再帰項が返す列の型は一致している必要があります。たとえば非再帰項のpathを文字数の決まった型で作り、再帰項でそれより長い文字列をつなぐと、型が一致しないというエラーになります。経路や連番は、textやintegerなど最初から余裕のある型で始めてください。この例はエラーになるため、コードは載せません。',
    },
  ],
  notes: [
    {
      title: '保険として深さの上限を付ける',
      body: '循環の可能性があるデータでは、再帰項のWHEREにlevelの上限を加えると、最悪でもその段数で止められます。ここでは10段までに制限しています。上限は暫定の安全策で、循環そのものを見つける方法ではありません。',
      code: `WITH RECURSIVE tree AS (
  SELECT id, name, 1 AS level
  FROM employees
  WHERE manager_id IS NULL
  UNION ALL
  SELECT employees.id, employees.name, tree.level + 1
  FROM employees
  JOIN tree ON employees.manager_id = tree.id
  WHERE tree.level < 10
)
SELECT COUNT(*) FROM tree;`,
    },
    {
      title: 'PostgreSQL 14以降はCYCLE句で循環を検出できる',
      body: 'CYCLE句に監視する列を指定すると、同じ値が2回目に現れた行にだけ循環の印（ここではis_cycle）が付き、そこで再帰が止まります。1→2→3→1とつながる例では、最後の1にだけtrueが付きます。PostgreSQL 14で追加された機能で、古いバージョンでは使えません。',
      code: `WITH RECURSIVE
links(src, dst) AS (VALUES (1, 2), (2, 3), (3, 1)),
walk(id) AS (
  SELECT 1
  UNION ALL
  SELECT links.dst
  FROM links
  JOIN walk ON links.src = walk.id
) CYCLE id SET is_cycle USING path
SELECT id, is_cycle
FROM walk;`,
    },
  ],
  faqs: [
    {
      question: '再帰CTEはどんなときに使いますか？',
      answer: '深さが決まっていない親子関係（組織図、カテゴリの階層、部品表）をたどるとき、連番や日付の並びを作るとき、経路をたどるときに使います。深さが2〜3段で固定なら、JOINを段数分だけ重ねる書き方でも足ります。',
    },
    {
      question: 'UNION ALLとUNIONはどちらを使いますか？',
      answer: '階層をたどる通常の用途ではUNION ALLを使います。重複を調べる手間がなく、levelやpathのような列も持てます。同じ行が何度も出る経路探索で、重複を除きながら止めたいときだけUNIONを検討します。',
    },
    {
      question: '再帰項の中でCTEを何回参照できますか？',
      answer: '再帰項の中で、そのCTE自身を参照できるのは1回だけです。ほかにも、再帰項の中では集計関数を使えないといった制限があります。集計したいときは、外側のSELECTへ移します。',
    },
    {
      question: '連番を作るだけなら再帰CTEが最適ですか？',
      answer: '再帰CTEでも作れますが、PostgreSQLにはgenerate_series関数があり、連番だけならそちらのほうが簡潔です。再帰CTEは、前の行の値から次の行を作る必要があるときに向いています。',
    },
  ],
  references: [
    { label: 'PostgreSQL公式：再帰クエリ（WITH RECURSIVE）', url: 'https://www.postgresql.org/docs/current/queries-with.html#QUERIES-WITH-RECURSIVE', description: '非再帰項と再帰項、UNIONとUNION ALL、再帰の終了と評価の仕組み' },
    { label: 'PostgreSQL公式：循環の検出（CYCLE句）', url: 'https://www.postgresql.org/docs/current/queries-with.html#QUERIES-WITH-CYCLE', description: 'CYCLE句による循環検出と、上限を付けて止める方法' },
  ],
  related: ['with', 'union', 'self-join', 'generate-series', 'inner-join'],
  practiceCategory: 'with-recursive',
};
