import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE sales (id integer PRIMARY KEY, region text NOT NULL, category text, amount integer NOT NULL);
INSERT INTO sales VALUES (1,'東','食品',1000),(2,'東','食品',2000),(3,'東','雑貨',500),(4,'西','食品',1500),(5,'西','雑貨',700),(6,'西','雑貨',300),(7,'西',NULL,400);`,
  sources: ['SELECT * FROM sales ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'rollup',
  label: 'ROLLUP・CUBE・GROUPING SETS',
  title: 'SQLのROLLUP・CUBE・GROUPING SETSとは？小計と総計を1回で集計する方法',
  description: 'SQLのROLLUP・CUBE・GROUPING SETSをPostgreSQLの元の表・SQL・結果表で解説。小計と総計を1回で出す方法、全組み合わせのCUBE、GROUPING()によるNULLの見分け方、UNION ALLとの比較を演習で学べます。',
  lead: 'ROLLUP・CUBE・GROUPING SETSは、GROUP BYの中で複数の集計単位をまとめて指定し、小計や総計の行を1回のSELECTで出す構文です。地域別・カテゴリ別の売上を例に、3つの違いと、小計行のNULLと元データのNULLを見分ける方法を確認します。',
  sampleIntro: 'salesは1行が売上1件で、regionは地域、categoryは商品カテゴリ、amountは金額（円）です。東は食品2件・雑貨1件、西は食品1件・雑貨2件に加えて、カテゴリが未入力（NULL）の売上が1件あります。全体の合計は6,400円です。',
  sampleTables: [
    { caption: 'sales：売上7件', headers: ['id', 'region', 'category', 'amount'], rows: [['1', '東', '食品', '1000'], ['2', '東', '食品', '2000'], ['3', '東', '雑貨', '500'], ['4', '西', '食品', '1500'], ['5', '西', '雑貨', '700'], ['6', '西', '雑貨', '300'], ['7', '西', 'NULL', '400']] },
  ],
  syntax: `SELECT region, SUM(amount)
FROM sales
GROUP BY ROLLUP (region)
ORDER BY region;`,
  sections: [
    {
      heading: 'ROLLUPで地域別の合計と総計を1回で出す',
      body: 'GROUP BY ROLLUP (region)は、地域ごとの合計に加えて、全体を1つにまとめた総計の行も返します。東が3,500円、西が2,900円（カテゴリNULLの400円を含む）、総計が6,400円です。総計の行では、まとめたことでregionがNULLになります。ORDER BY regionのNULLは既定で最後に並ぶため、総計が最後の行です。通常のGROUP BY regionの結果に、総計の1行が足されたものと考えてください。',
      code: `SELECT region, SUM(amount)
FROM sales
GROUP BY ROLLUP (region)
ORDER BY region;`,
      resultTable: { headers: ['region', 'sum'], rows: [['東', '3500'], ['西', '2900'], ['NULL', '6400']] },
    },
    {
      heading: '列を2つ並べると、右の列から順に小計になる',
      body: 'ROLLUP (region, category)は、左から右へ階層的に集計します。regionとcategoryの組ごとの明細、regionごとの小計（categoryがNULL）、全体の総計（両方NULL）の3種類が出ます。東の小計は3,500円、西の小計は2,900円、総計は6,400円です。categoryだけの合計（食品の全地域合計など）は出ません。列の並び順が小計の単位を決めるので、ROLLUP (category, region)にすると、categoryごとの小計になります。行の並びは保証されないので、結果の行順は一例です。',
      code: `SELECT region, category, SUM(amount)
FROM sales
GROUP BY ROLLUP (region, category);`,
      resultTable: { headers: ['region', 'category', 'sum'], rows: [['東', '食品', '3000'], ['東', '雑貨', '500'], ['東', 'NULL', '3500'], ['西', '食品', '1500'], ['西', '雑貨', '1000'], ['西', 'NULL', '400'], ['西', 'NULL', '2900'], ['NULL', 'NULL', '6400']] },
    },
    {
      heading: 'CUBEは列の全組み合わせで集計する',
      body: 'CUBE (region, category)は、ROLLUPの結果に加えて、categoryだけの合計（regionがNULL）も出します。食品が4,500円、雑貨が1,500円、カテゴリ未入力が400円です。2列のCUBEは「両方」「regionのみ」「categoryのみ」「なし（総計）」の4通りを集計し、この表では11行になります。列が増えるほど組み合わせが2のべき乗で増え、行数も急に増えます。使う集計単位が決まっているなら、次のGROUPING SETSで絞るほうが無駄がありません。',
      code: `SELECT region, category, SUM(amount)
FROM sales
GROUP BY CUBE (region, category);`,
      resultTable: { headers: ['region', 'category', 'sum'], rows: [['東', '食品', '3000'], ['東', '雑貨', '500'], ['東', 'NULL', '3500'], ['西', '食品', '1500'], ['西', '雑貨', '1000'], ['西', 'NULL', '400'], ['西', 'NULL', '2900'], ['NULL', '食品', '4500'], ['NULL', '雑貨', '1500'], ['NULL', 'NULL', '400'], ['NULL', 'NULL', '6400']] },
    },
    {
      heading: 'GROUPING SETSで必要な集計単位だけを指定する',
      body: 'GROUPING SETSは、集計したい単位を1つずつカッコで列挙します。((region), (category))なら、地域別の合計とカテゴリ別の合計だけが出て、明細も総計も出ません。東が3,500円、西が2,900円、食品が4,500円、雑貨が1,500円、カテゴリ未入力が400円の5行です。使われなかった列はNULLで返ります。()を並べると総計の行も加えられます。ROLLUPやCUBEは、GROUPING SETSを短く書くための省略形です。',
      code: `SELECT region, category, SUM(amount)
FROM sales
GROUP BY GROUPING SETS ((region), (category));`,
      resultTable: { headers: ['region', 'category', 'sum'], rows: [['東', 'NULL', '3500'], ['西', 'NULL', '2900'], ['NULL', '食品', '4500'], ['NULL', '雑貨', '1500'], ['NULL', 'NULL', '400']] },
    },
    {
      heading: 'GROUPING()で小計行のNULLと元データのNULLを見分ける',
      body: 'ROLLUPの結果では、小計行のcategoryがNULLですが、元データでカテゴリが未入力の行もNULLです。西には「400円のカテゴリ未入力の明細」と「2,900円の西の小計」の2行があり、categoryの見た目だけでは区別できません。GROUPING(category)は、その行でcategoryが集計でまとめられたら1、そうでなければ0を返します。未入力の明細は0、小計は1です。この列を見れば、2行を確実に区別できます。ORDER BYにも使えるので、同じ地域の中で明細を先に、小計を後ろに並べられます。',
      code: `SELECT region, category, GROUPING(category) AS is_subtotal, SUM(amount)
FROM sales
GROUP BY ROLLUP (region, category)
ORDER BY region, GROUPING(category), category;`,
      resultTable: { headers: ['region', 'category', 'is_subtotal', 'sum'], rows: [['東', '雑貨', '0', '500'], ['東', '食品', '0', '3000'], ['東', 'NULL', '1', '3500'], ['西', '雑貨', '0', '1000'], ['西', '食品', '0', '1500'], ['西', 'NULL', '0', '400'], ['西', 'NULL', '1', '2900'], ['NULL', 'NULL', '1', '6400']] },
    },
    {
      heading: 'UNION ALLで書いた場合と比べる',
      body: 'ROLLUP (region)と同じ結果は、地域別の集計と総計を別々のSELECTで作ってUNION ALLでつないでも得られます。UNION ALLの2つ目のSELECTでは、regionの位置にNULLを書きます。結果は同じ3行ですが、salesを2回読み、集計の条件を2か所に書く必要があります。条件を変えるときに片方を直し忘れると、小計と総計の合わせ方がずれます。ROLLUPなら、表を読むのは1回で、書く集計条件も1つで済みます。',
      code: `SELECT region, SUM(amount)
FROM sales
GROUP BY region
UNION ALL
SELECT NULL, SUM(amount)
FROM sales;`,
      resultTable: { headers: ['region', 'sum'], rows: [['東', '3500'], ['西', '2900'], ['NULL', '6400']] },
    },
  ],
  mistakes: [
    {
      title: 'category IS NULLで小計行を探すと、元データのNULLも混ざる',
      body: 'ROLLUPの結果から小計を取り出すつもりでHAVING category IS NULLと書くと、小計行に加えて、カテゴリ未入力の明細（西の400円）も残ります。小計や総計の行だけを残すには、HAVING GROUPING(category) = 1を使います。',
      code: `SELECT region, category, SUM(amount)
FROM sales
GROUP BY ROLLUP (region, category)
HAVING category IS NULL;`,
    },
  ],
  notes: [
    {
      title: 'GROUPING()は複数列を渡すとビットの値になる',
      body: 'GROUPING(region, category)のように複数の列を渡すと、各列が集計でまとめられたかを1・0のビットにして並べた整数が返ります。左の列が上位のビットです。この表では、regionもcategoryも通常の行が0、categoryだけまとめられた小計が1、両方まとめられた総計が3です。',
      code: `SELECT region, category, GROUPING(region, category) AS grouping_bits, SUM(amount)
FROM sales
GROUP BY ROLLUP (region, category)
ORDER BY grouping_bits, region, category;`,
    },
    {
      title: 'ROLLUPやCUBEは部分的に使える',
      body: 'GROUP BY region, ROLLUP (category)のように、通常の列とROLLUPを組み合わせられます。この場合regionは常に集計の単位に含まれ、regionごとにカテゴリの小計が出ますが、全体の総計は出ません。',
      code: `SELECT region, category, SUM(amount)
FROM sales
GROUP BY region, ROLLUP (category);`,
    },
  ],
  faqs: [
    {
      question: 'ROLLUPとCUBEはどう使い分けますか？',
      answer: '地域→カテゴリのように上下関係のある集計では、小計と総計だけが必要なのでROLLUPを使います。どの列の組み合わせでも合計が欲しい、クロス集計のような場合にCUBEを使います。CUBEは行数が増えやすいので、必要な単位が決まっているならGROUPING SETSで指定します。',
    },
    {
      question: '小計の行に「小計」「総計」と表示できますか？',
      answer: 'できます。GROUPING()の結果をCASEで分岐し、1のときに「小計」などの文字を返します。COALESCEでNULLを置き換えると、元データのNULLまで「小計」になってしまうので、GROUPING()で判定してください。',
    },
    {
      question: 'ROLLUPで並び順は決まりますか？',
      answer: '決まりません。小計や総計の行がどこに出るかは保証されないため、見せたい順序はORDER BYで指定します。ORDER BYではNULLが既定で最後に並ぶので、列を並べればたいてい小計が各グループの後ろ、総計が最後に来ます。',
    },
    {
      question: 'ROLLUP・CUBE・GROUPING SETSは他のデータベースでも使えますか？',
      answer: 'これらは標準SQLにある構文ですが、対応範囲や書き方はデータベースごとに異なります。たとえばMySQLでは、GROUP BY ... WITH ROLLUPの形で小計と総計を出せます。この記事の書き方はPostgreSQLのものです。',
    },
  ],
  references: [
    { label: 'PostgreSQL公式：GROUPING SETS、CUBE、ROLLUP', url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUPING-SETS', description: 'GROUPING SETS・CUBE・ROLLUPの書き方と展開のされ方' },
    { label: 'PostgreSQL公式：グルーピング操作関数（GROUPING）', url: 'https://www.postgresql.org/docs/current/functions-aggregate.html#FUNCTIONS-GROUPING-TABLE', description: 'GROUPING関数が返すビットの意味' },
  ],
  related: ['group-by', 'having', 'union', 'case', 'coalesce'],
  practiceCategory: 'rollup',
};
