import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE staff (id integer PRIMARY KEY, dept text NOT NULL, salary integer);
INSERT INTO staff VALUES (1,'営業',250000),(2,'営業',300000),(3,'営業',300000),(4,'営業',320000),(5,'営業',1500000),(6,'開発',400000),(7,'開発',420000),(8,'開発',450000),(9,'開発',500000),(10,'開発',NULL);`,
  sources: ['SELECT * FROM staff ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'percentile-cont',
  label: '中央値・PERCENTILE_CONT',
  title: 'SQLで中央値を求めるには？PERCENTILE_CONTの使い方・PERCENTILE_DISCとの違い',
  description: 'PostgreSQLのPERCENTILE_CONTで中央値を求める方法を、社員給与の表と実行結果で解説。WITHIN GROUP、偶数件の補間、PERCENTILE_DISCとの違い、部署ごとの中央値、平均との違い、MODEも学べます。',
  lead: 'PERCENTILE_CONTは、並べた値の指定した位置（0.5なら真ん中）の値を返す関数で、SQLで中央値を求める標準的な方法です。AVGと違い、極端に大きい値の影響を受けません。社員給与を使い、書き方と平均との違いを確認しましょう。',
  sampleIntro: 'staffは1行が社員1人です。deptは部署、salaryは月給（円）で、開発の1人は未入力でNULLです。営業には1,500,000円という外れ値があります。営業は5人、開発は給与のある4人（NULL除く）で、NULLは計算の対象に含まれません。',
  sampleTables: [
    {
      caption: 'staff：社員10人（salaryは月給・円）',
      headers: ['id', 'dept', 'salary'],
      rows: [
        ['1', '営業', '250000'],
        ['2', '営業', '300000'],
        ['3', '営業', '300000'],
        ['4', '営業', '320000'],
        ['5', '営業', '1500000'],
        ['6', '開発', '400000'],
        ['7', '開発', '420000'],
        ['8', '開発', '450000'],
        ['9', '開発', '500000'],
        ['10', '開発', 'NULL'],
      ],
    },
  ],
  syntax: 'SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY salary)\nFROM staff;',
  sections: [
    {
      heading: 'WITHIN GROUPで中央値（0.5）を求める',
      body: "percentile_cont(割合) WITHIN GROUP (ORDER BY 列)の形で書きます。割合は0〜1で、0.5が中央値です。並べ替えの列は括弧の外のWITHIN GROUPの中に書きます。NULLは無視されるので、給与のある9人の5番目の値、400000円が返ります。",
      code: 'SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY salary)\nFROM staff;',
      resultTable: { headers: ['percentile_cont'], rows: [['400000']] },
    },
    {
      heading: '偶数件では隣り合う2値の間を補間する',
      body: "開発の給与は4件（400000、420000、450000、500000）です。真ん中は2番目と3番目の間にあたるため、PERCENTILE_CONTは420000と450000の間を補間して435000を返します。実在しない値が結果に出ることがある点に注意します。",
      code: "SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY salary)\nFROM staff\nWHERE dept = '開発';",
      resultTable: { headers: ['percentile_cont'], rows: [['435000']] },
    },
    {
      heading: 'PERCENTILE_DISCは補間せず実在する値を返す',
      body: "PERCENTILE_DISCは、指定した割合以上になる最初の値を返し、補間しません。開発の0.5では420000です。実在する値だけを返したいときはDISC、なめらかな中央値が欲しいときはCONTを使います。ORDER BYの対象は数値以外（日付や文字列）でもDISCなら使えます。",
      code: "SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY salary) AS cont,\n       percentile_disc(0.5) WITHIN GROUP (ORDER BY salary) AS disc\nFROM staff\nWHERE dept = '開発';",
      resultTable: { headers: ['cont', 'disc'], rows: [['435000', '420000']] },
    },
    {
      heading: 'GROUP BYで部署ごとの中央値を求める',
      body: "GROUP BYと組み合わせると、グループごとの中央値が出ます。営業は5件の3番目の300000円、開発は435000円です。1文で複数グループの中央値を比べられます。",
      code: 'SELECT dept, percentile_cont(0.5) WITHIN GROUP (ORDER BY salary)\nFROM staff\nGROUP BY dept\nORDER BY min(id);',
      resultTable: { headers: ['dept', 'percentile_cont'], rows: [['営業', '300000'], ['開発', '435000']] },
    },
    {
      heading: '平均と中央値の違いを外れ値で確認する',
      body: "営業は1,500,000円の外れ値があるため、平均は534000円まで引き上げられますが、中央値は300000円のままです。開発は外れ値がなく、平均442500円と中央値435000円が近い値です。分布が偏るデータでは、平均だけでは「ふつうの値」を表せません。",
      code: 'SELECT dept,\n       avg(salary) AS average,\n       percentile_cont(0.5) WITHIN GROUP (ORDER BY salary) AS median\nFROM staff\nGROUP BY dept\nORDER BY min(id);',
      resultTable: { headers: ['dept', 'average', 'median'], rows: [['営業', '534000', '300000'], ['開発', '442500', '435000']] },
    },
    {
      heading: 'MODEで最も多い値（最頻値）を求める',
      body: "mode() WITHIN GROUP (ORDER BY 列)は、最も多く現れる値を返します。300000円は2人いるので、他の値より多く、結果は300000です。同数の値が複数あるときは、そのうちの1つが返されます。",
      code: 'SELECT mode() WITHIN GROUP (ORDER BY salary)\nFROM staff;',
      resultTable: { headers: ['mode'], rows: [['300000']] },
    },
  ],
  mistakes: [],
  notes: [
    {
      title: '複数の割合を配列で一度に求める',
      body: "割合に配列を渡すと、四分位数などをまとめて求められます。結果は同じ形の配列で返ります。",
      code: 'SELECT percentile_cont(ARRAY[0.25, 0.5, 0.75]) WITHIN GROUP (ORDER BY salary)\nFROM staff;',
    },
    {
      title: '他のDBのMEDIANとの違い',
      body: "OracleなどにはMEDIAN関数がありますが、PostgreSQLにはありません。中央値はPERCENTILE_CONT(0.5)で書きます。PERCENTILE_CONTは並べ替えが必要な順序集合集約のため、全件を保持・ソートして計算します。大きな表では、その分のコストがかかります。",
    },
  ],
  faqs: [
    {
      question: 'AVGと同じようにOVERでウィンドウ関数として使えますか？',
      answer: 'PERCENTILE_CONTはWITHIN GROUPを使う順序集合集約で、OVERを付けるウィンドウ関数としては使えません。GROUP BYの集約として使います。',
    },
    {
      question: 'NULLの行はどう扱われますか？',
      answer: '並べ替えの対象列がNULLの行は無視されます。開発のNULLの1人は計算に含まれず、4件で中央値を求めます。',
    },
    {
      question: '割合に0〜1以外を指定するとどうなりますか？',
      answer: 'エラーになります。0.5が中央値、0.25と0.75が四分位数、0が最小、1が最大です。',
    },
    {
      question: 'PERCENTILE_DISCとMODEの違いは？',
      answer: 'PERCENTILE_DISCは順位の位置で値を選びます。MODEは最も多く現れる値を選びます。この表の全体では、DISCの0.5は400000、MODEは300000です。',
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：集約関数（順序集合集約）',
      url: 'https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE',
      description: 'percentile_cont、percentile_disc、modeの定義、補間、NULLの扱い',
    },
    {
      label: 'PostgreSQL公式：集約式',
      url: 'https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES',
      description: 'WITHIN GROUP構文と直接引数',
    },
  ],
  related: ['group-by', 'having', 'window-functions', 'coalesce', 'ntile'],
  practiceCategory: 'percentile-cont',
};
