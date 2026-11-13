import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE sales (id integer PRIMARY KEY, sold_on date NOT NULL, amount integer NOT NULL);
INSERT INTO sales VALUES (1,'2026-01-01',1000),(2,'2026-01-01',500),(3,'2026-01-03',2000),(4,'2026-01-05',800),(5,'2026-02-02',1200);`,
  sources: ['SELECT * FROM sales ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'generate-series',
  label: 'generate_series',
  title: 'PostgreSQLのgenerate_seriesとは？連番・日付の並びの作り方と実績のない日を0で埋める方法',
  description: 'PostgreSQLのgenerate_seriesで連番、日付、月の並びを作る方法を、売上表と実行結果で解説。interval刻み、LEFT JOINとCOALESCEで実績のない日を0で埋める方法、WITH RECURSIVEや他DBとの違いも学べます。',
  lead: 'generate_seriesは、開始値から終了値まで一定の刻みで並ぶ行を作り出すPostgreSQL固有の関数です。表にない連番や日付を作れるため、売上のない日が抜けてしまう集計を、0件の日つきで出し直すときに使います。',
  sampleIntro: 'salesは1行が売上1件です。sold_onは売上日（date）、amountは金額（円）です。1月は1日（2件）、3日、5日に売上があり、2日と4日は売上がありません。2月は2日に1件あります。',
  sampleTables: [
    {
      caption: 'sales：売上5件',
      headers: ['id', 'sold_on', 'amount'],
      rows: [
        ['1', '2026-01-01', '1000'],
        ['2', '2026-01-01', '500'],
        ['3', '2026-01-03', '2000'],
        ['4', '2026-01-05', '800'],
        ['5', '2026-02-02', '1200'],
      ],
    },
  ],
  syntax: 'SELECT *\nFROM generate_series(1, 5) AS n;',
  sections: [
    {
      heading: 'generate_seriesで連番を作る',
      body: "generate_series(開始, 終了)は、開始から終了までを1ずつ増やした行を返します。FROM句に書き、AS nのように別名を付けると、列名もnになります。終了の値も結果に含まれ、元になる表は必要ありません。",
      code: 'SELECT *\nFROM generate_series(1, 5) AS n;',
      resultTable: { headers: ['n'], rows: [['1'], ['2'], ['3'], ['4'], ['5']] },
    },
    {
      heading: '第3引数で刻みを指定する',
      body: "第3引数は刻みです。負の値を指定すると降順になり、このとき開始が終了より小さいと0行になります。10から0へ5ずつ減らすと10、5、0です。刻みが0だとエラーになります。",
      code: 'SELECT *\nFROM generate_series(10, 0, -5) AS n;',
      resultTable: { headers: ['n'], rows: [['10'], ['5'], ['0']] },
    },
    {
      heading: '日付の並びをinterval刻みで作る',
      body: "日付や日時では刻みにintervalを指定します。1日刻みの例では、結果の型はtimestampです。日付だけを扱いたいので::dateに変換します。開始と終了にTIMESTAMPを明示すると、タイムゾーンの影響を受けません。",
      code: "SELECT d::date AS day\nFROM generate_series(TIMESTAMP '2026-01-01', TIMESTAMP '2026-01-05', INTERVAL '1 day') AS d;",
      resultTable: { headers: ['day'], rows: [['2026-01-01'], ['2026-01-02'], ['2026-01-03'], ['2026-01-04'], ['2026-01-05']] },
    },
    {
      heading: 'INTERVAL \'1 month\'で月初の並びを作る',
      body: "刻みを1か月にすると、毎月1日の並びが作れます。月の長さが違っても、日付が月初のまま進みます。月ごとの集計表の行を先に作るときに使います。",
      code: "SELECT d::date AS month_start\nFROM generate_series(TIMESTAMP '2026-01-01', TIMESTAMP '2026-04-01', INTERVAL '1 month') AS d;",
      resultTable: { headers: ['month_start'], rows: [['2026-01-01'], ['2026-02-01'], ['2026-03-01'], ['2026-04-01']] },
    },
    {
      heading: 'LEFT JOINとCOALESCEで売上のない日を0にする',
      body: "売上表だけをGROUP BYすると、2日と4日の行は現れません。日付の並びを左側にしてLEFT JOINし、SUMの結果をCOALESCEで0にすると、5日分すべてが出ます。2日と4日は売上が1件もなくSUMがNULLになるので、0に置き換わります。",
      code: "SELECT d::date AS day, COALESCE(SUM(s.amount), 0) AS total\nFROM generate_series(TIMESTAMP '2026-01-01', TIMESTAMP '2026-01-05', INTERVAL '1 day') AS d\nLEFT JOIN sales AS s ON s.sold_on = d::date\nGROUP BY d\nORDER BY d;",
      resultTable: { headers: ['day', 'total'], rows: [['2026-01-01', '1500'], ['2026-01-02', '0'], ['2026-01-03', '2000'], ['2026-01-04', '0'], ['2026-01-05', '800']] },
    },
    {
      heading: '月ごとの件数も0件の月を含めて出す',
      body: "月の並びを左にして、期間の条件をONに書くと、売上のない月も出せます。COUNT(s.id)は売上がない月に0を返しますが、COUNT(*)にすると、LEFT JOINで作られたNULLの行も数えて1になります。1月は4件、2月は1件、3月は0件です。",
      code: "SELECT m::date AS month, COUNT(s.id) AS cnt\nFROM generate_series(TIMESTAMP '2026-01-01', TIMESTAMP '2026-03-01', INTERVAL '1 month') AS m\nLEFT JOIN sales AS s\n  ON s.sold_on >= m::date AND s.sold_on < (m + INTERVAL '1 month')::date\nGROUP BY m\nORDER BY m;",
      resultTable: { headers: ['month', 'cnt'], rows: [['2026-01-01', '4'], ['2026-02-01', '1'], ['2026-03-01', '0']] },
    },
  ],
  mistakes: [
    {
      title: '期間の絞り込みをWHEREに書くと0件の行が消える',
      body: "LEFT JOINの後ろにWHERE s.sold_on >= ...のように右側の表の条件を書くと、NULLの行が条件を満たさず消えてしまい、売上のない日や月が結果から外れます。右側の表の条件はON句に書きます。",
      code: "SELECT d::date AS day, COALESCE(SUM(s.amount), 0) AS total\nFROM generate_series(TIMESTAMP '2026-01-01', TIMESTAMP '2026-01-05', INTERVAL '1 day') AS d\nLEFT JOIN sales AS s ON s.sold_on = d::date\nWHERE s.amount >= 1000\nGROUP BY d\nORDER BY d;",
    },
  ],
  notes: [
    {
      title: 'WITH RECURSIVEや他DBでの代用',
      body: "generate_seriesはPostgreSQL固有で、標準SQLにはありません。他のDBでは、標準SQLのWITH RECURSIVEで同じ並びを作れます。PostgreSQLでも書けますが、短く書けるgenerate_seriesが一般的です。OracleではCONNECT BY LEVELを使う方法もあります。",
      code: "WITH RECURSIVE days(day) AS (\n  SELECT DATE '2026-01-01'\n  UNION ALL\n  SELECT day + 1 FROM days WHERE day < DATE '2026-01-05'\n)\nSELECT day FROM days;",
    },
    {
      title: 'date型を渡すとtimestamptzで返る',
      body: "開始と終了にdateを渡しても、返る型はtimestamp with time zoneです。日付だけが欲しいときは::dateで戻すか、本文のようにTIMESTAMPを明示します。日時の刻み（INTERVAL '6 hours'など）もそのまま指定できます。",
      code: "SELECT pg_typeof(g)\nFROM generate_series(DATE '2026-01-01', DATE '2026-01-02', INTERVAL '1 day') AS g\nLIMIT 1;",
    },
  ],
  faqs: [
    {
      question: '終了の値は結果に含まれますか？',
      answer: '刻みの途中で終了の値にちょうど届くときは含まれます。1から5なら5を含み、1から10を3刻みなら10を含みますが、1から9なら7までです。',
    },
    {
      question: 'FROM句ではなくSELECT句に書いてもよいですか？',
      answer: 'SELECT generate_series(1, 3)と書くこともできますが、複数の集合を返す関数を並べると行数の扱いが分かりにくくなります。FROM句に書く形をおすすめします。',
    },
    {
      question: '開始が終了より大きいとどうなりますか？',
      answer: '正の刻みで開始が終了より大きいと、エラーではなく0行になります。降順にするには、負の刻みを指定します。',
    },
    {
      question: '日付の列を月ごとに集計するときはDATE_TRUNCではだめですか？',
      answer: 'DATE_TRUNCで月ごとのグループは作れますが、売上のない月は行になりません。月の並びをgenerate_seriesで先に作り、LEFT JOINすると0件の月も出せます。',
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：集合を返す関数',
      url: 'https://www.postgresql.org/docs/current/functions-srf.html',
      description: 'generate_seriesの引数、型、終了値と刻みの扱い',
    },
    {
      label: 'PostgreSQL公式：WITHクエリ（再帰）',
      url: 'https://www.postgresql.org/docs/current/queries-with.html',
      description: 'WITH RECURSIVEによる並びの生成',
    },
  ],
  related: ['left-join', 'coalesce', 'date-trunc', 'date-arithmetic', 'with-recursive'],
  practiceCategory: 'generate-series',
};
