import { buildExerciseEntries } from '../exerciseEntries';

const setup = `CREATE TABLE staff (id integer PRIMARY KEY, dept text NOT NULL, salary integer);
INSERT INTO staff VALUES (1,'営業',250000),(2,'営業',300000),(3,'営業',300000),(4,'営業',320000),(5,'営業',1500000),(6,'開発',400000),(7,'開発',420000),(8,'開発',450000),(9,'開発',500000),(10,'開発',NULL);`;

const cumulativeSetup = `CREATE TABLE departments (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE employees (id integer PRIMARY KEY, name text NOT NULL, dept_id integer REFERENCES departments(id), salary integer, hired_on date NOT NULL);
INSERT INTO departments VALUES (1,'営業'),(2,'開発'),(3,'総務');
INSERT INTO employees VALUES (1,'青木',1,300000,'2019-04-01'),(2,'北野',1,280000,'2021-04-01'),(3,'中央',1,320000,'2022-04-01'),(4,'大和',1,600000,'2023-04-01'),(5,'森',1,NULL,'2024-04-01'),(6,'林',2,400000,'2020-04-01'),(7,'石井',2,450000,'2021-04-01'),(8,'村上',2,500000,'2022-04-01'),(9,'吉田',2,520000,'2025-04-01'),(10,'斎藤',3,350000,'2021-04-01'),(11,'山本',3,360000,'2022-04-01');`;

export const entries = buildExerciseEntries({
  category: 'percentile-cont',
  tags: ['PERCENTILE_CONT', '中央値'],
  setup,
  exercises: [
    {
      slug: 'median-all',
      title: 'PERCENTILE_CONT',
      description: '全社員の給与の中央値を取得してください。別名は付けません。給与が未入力（NULL）の社員は計算に含まれません。',
      sql: 'SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY salary)\nFROM staff;',
      columns: ['percentile_cont'],
      rows: [[400000]],
      hint: '割合は0〜1で指定し、並べ替えの列はWITHIN GROUPの中に書きます。',
      explanation: 'NULLを除く9件を並べると5番目が400000です。偶数件ではないので補間は起こりません。',
    },
    {
      slug: 'median-even-interpolation',
      title: '偶数件の補間',
      description: '開発部の給与の中央値を取得してください。別名は付けません。',
      sql: "SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY salary)\nFROM staff\nWHERE dept = '開発';",
      columns: ['percentile_cont'],
      rows: [[435000]],
      hint: 'WHEREで開発に絞ってから、同じ書き方で中央値を求めます。',
      explanation: 'NULLを除く4件（400000、420000、450000、500000）の真ん中は、420000と450000の間です。補間して435000になり、表にない値が返ります。',
    },
    {
      slug: 'percentile-disc-compare',
      title: 'PERCENTILE_DISC',
      description: '開発部の給与について、補間する中央値と、補間しない中央値（実在する値）を1行で並べて取得してください。列名は cont と disc とします。',
      sql: "SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY salary) AS cont,\n       percentile_disc(0.5) WITHIN GROUP (ORDER BY salary) AS disc\nFROM staff\nWHERE dept = '開発';",
      columns: ['cont', 'disc'],
      rows: [[435000, 420000]],
      hint: '補間しないほうの関数名はpercentile_discです。',
      explanation: 'CONTは420000と450000の間を補間して435000、DISCは0.5以上になる最初の値の420000を返します。',
    },
    {
      slug: 'median-by-dept',
      title: 'GROUP BYと中央値',
      description: '部署ごとに給与の中央値を取得してください。部署名と中央値の2列で、行順は問いません。別名は付けません。',
      sql: 'SELECT dept, percentile_cont(0.5) WITHIN GROUP (ORDER BY salary)\nFROM staff\nGROUP BY dept;',
      columns: ['dept', 'percentile_cont'],
      rows: [['営業', 300000], ['開発', 435000]],
      hint: '集約関数なので、部署ごとに求めるにはGROUP BYを使います。',
      explanation: '営業は5件の3番目で300000、開発は4件の補間で435000です。',
    },
    {
      slug: 'average-vs-median',
      title: '平均と中央値',
      description: '部署ごとに、給与の平均と中央値を並べて取得してください。列名は dept、average、median とし、行順は問いません。',
      sql: 'SELECT dept,\n       AVG(salary) AS average,\n       percentile_cont(0.5) WITHIN GROUP (ORDER BY salary) AS median\nFROM staff\nGROUP BY dept;',
      columns: ['dept', 'average', 'median'],
      rows: [['営業', 534000, 300000], ['開発', 442500, 435000]],
      hint: 'AVGと中央値を同じSELECTに並べ、それぞれに別名を付けます。',
      explanation: '営業は1,500,000円の外れ値で平均が534000に上がりますが、中央値は300000のままです。開発は外れ値がなく、平均442500と中央値435000が近くなります。',
    },
    {
      slug: 'mode-salary',
      title: 'MODE',
      description: '全社員の給与の最頻値（最も多く現れる給与）を取得してください。別名は付けません。',
      sql: 'SELECT mode() WITHIN GROUP (ORDER BY salary)\nFROM staff;',
      columns: ['mode'],
      rows: [[300000]],
      hint: 'modeは割合を取らないので、カッコの中は空にします。',
      explanation: '300000円は営業の2人にあり、他の給与はすべて1人ずつです。NULLは数えません。',
    },
    {
      slug: 'chapter-review-mean-above-median',
      title: '章末問題：PERCENTILE_CONT・AVG・HAVING',
      description: '給与の平均が中央値より100000円以上大きい部署の部署名を取得してください。外れ値で平均が引き上げられた部署を探します。初期SQLを直します。',
      sql: 'SELECT dept\nFROM staff\nGROUP BY dept\nHAVING AVG(salary) - percentile_cont(0.5) WITHIN GROUP (ORDER BY salary) >= 100000;',
      columns: ['dept'],
      rows: [['営業']],
      hint: 'HAVINGの中でも、平均と中央値を同時に使えます。',
      explanation: '営業は平均534000と中央値300000の差が234000で条件を満たします。開発は442500と435000で差が7500なので除外されます。',
      starter: 'SELECT dept\nFROM staff\nGROUP BY dept\nHAVING AVG(salary) >= 100000;',
      review: 'chapter review',
      requirements: ['部署ごとに平均を求める', '部署ごとに中央値を求める', '平均が中央値より100000円以上大きい部署だけを残す'],
    },
    {
      slug: 'cumulative-review-median-by-dept-name',
      title: 'まとめ問題：PERCENTILE_CONT・JOIN・WHERE・GROUP BY・HAVING・ORDER BY',
      description: '2020年4月1日以降に入社した社員だけを対象に、部署ごとの給与の中央値を取得してください。社員が3人以上の部署だけを残し、部署名と中央値の2列を中央値の高い順に並べます。給与が未入力の社員も人数には数えます。別名は付けません。',
      sql: "SELECT departments.name, percentile_cont(0.5) WITHIN GROUP (ORDER BY employees.salary)\nFROM employees\nINNER JOIN departments ON departments.id = employees.dept_id\nWHERE employees.hired_on >= DATE '2020-04-01'\nGROUP BY departments.id, departments.name\nHAVING COUNT(*) >= 3\nORDER BY 2 DESC;",
      columns: ['name', 'percentile_cont'],
      rows: [['開発', 475000], ['営業', 320000]],
      hint: '入社日の条件はWHERE、人数の条件はHAVINGに書きます。',
      explanation: '2019年入社の青木を除くと、営業は4人（給与のある3人は280000、320000、600000で中央値320000）です。開発は4人で中央値475000です。総務は2人なので除外されます。人数はCOUNT(*)で数えるため、給与NULLの森も営業の人数に入ります。',
      setup: cumulativeSetup,
      ordered: true,
      review: 'cumulative review',
      requirements: ['2020年4月1日以降に入社した社員だけを対象にする', '部署名を表示するために部署表と結合する', '社員が3人以上の部署だけを残す', '中央値の降順で表示する'],
    },
  ],
});
