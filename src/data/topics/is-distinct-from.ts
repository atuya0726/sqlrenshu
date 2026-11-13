import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE product_prices (id integer PRIMARY KEY, product text NOT NULL, old_price integer, new_price integer);
INSERT INTO product_prices VALUES (1,'ペン',100,100),(2,'ノート',200,250),(3,'定規',NULL,NULL),(4,'付箋',NULL,150),(5,'のり',300,NULL),(6,'クリップ',0,NULL);
CREATE TABLE members (id integer PRIMARY KEY, name text NOT NULL, area_code text);
CREATE TABLE areas (code text, label text NOT NULL);
INSERT INTO members VALUES (1,'青木','A'),(2,'伊藤','B'),(3,'上田',NULL),(4,'江口',NULL);
INSERT INTO areas VALUES ('A','東日本'),('B','西日本'),(NULL,'未設定');`,
  sources: ['SELECT * FROM product_prices ORDER BY id', 'SELECT * FROM members ORDER BY id', "SELECT * FROM areas ORDER BY code NULLS LAST"],
};

export const topic: SqlTopic = {
  slug: 'is-distinct-from',
  label: 'IS DISTINCT FROM',
  title: 'SQLのIS DISTINCT FROMとは？NULLを値として比べる方法と<>との違い',
  description: 'SQLのIS DISTINCT FROM・IS NOT DISTINCT FROMをPostgreSQLの元の表・SQL・結果表で解説。NULLを値として比べる方法、<>で行が落ちる理由、旧値と新値の変更検知、結合条件での使い方を演習で学べます。',
  lead: 'IS DISTINCT FROMは、NULLを「ひとつの値」として扱って2つの値が異なるかを調べる比較です。<>はどちらかがNULLだと結果がNULLになり、WHEREで行が落ちますが、IS DISTINCT FROMは必ずtrueかfalseを返します。旧値と新値の変更検知を中心に、<>との違いを確認します。',
  sampleIntro: 'product_pricesは1行が商品1件で、old_priceは旧価格、new_priceは新価格（円）です。NULLは価格未設定を表します。ペンは同じ価格、ノートは値上げ、定規は両方NULL、付箋は新たに設定、のりは設定を取り消し、クリップは旧価格0円から未設定になっています。membersは会員、areasは地域コードと名前の一覧で、areasにはコードがNULLの「未設定」の行があります。',
  sampleTables: [
    { caption: 'product_prices：商品6件', headers: ['id', 'product', 'old_price', 'new_price'], rows: [['1', 'ペン', '100', '100'], ['2', 'ノート', '200', '250'], ['3', '定規', 'NULL', 'NULL'], ['4', '付箋', 'NULL', '150'], ['5', 'のり', '300', 'NULL'], ['6', 'クリップ', '0', 'NULL']] },
    { caption: 'members：会員4人', headers: ['id', 'name', 'area_code'], rows: [['1', '青木', 'A'], ['2', '伊藤', 'B'], ['3', '上田', 'NULL'], ['4', '江口', 'NULL']] },
    { caption: 'areas：地域3件', headers: ['code', 'label'], rows: [['A', '東日本'], ['B', '西日本'], ['NULL', '未設定']] },
  ],
  syntax: `SELECT id, product
FROM product_prices
WHERE old_price IS DISTINCT FROM new_price
ORDER BY id;`,
  sections: [
    {
      heading: 'IS DISTINCT FROMは異なるかを必ずtrueかfalseで返す',
      body: 'a IS DISTINCT FROM bは、aとbが異なればtrue、同じならfalseを返します。普通の<>と違うのは、NULLを1つの値として扱う点です。NULLと数値は「異なる」のでtrue、NULLとNULLは「同じ」なのでfalseになり、結果がNULLになることはありません。ペン（100と100）は同じなのでfalse、ノート（200と250）はtrue、定規（NULLとNULL）はfalse、付箋・のり・クリップは片方がNULLなのでtrueです。',
      code: `SELECT id, product, old_price IS DISTINCT FROM new_price AS changed
FROM product_prices
ORDER BY id;`,
      resultTable: { headers: ['id', 'product', 'changed'], rows: [['1', 'ペン', 'false'], ['2', 'ノート', 'true'], ['3', '定規', 'false'], ['4', '付箋', 'true'], ['5', 'のり', 'true'], ['6', 'クリップ', 'true']] },
    },
    {
      heading: '<>はNULLが絡むと行が落ちる',
      body: 'old_price <> new_priceは、どちらかがNULLだと結果がtrueでもfalseでもなくNULLになります。WHEREはtrueの行だけを残すので、NULLの行はすべて落ちます。結果は両方に値があって違うノートの1行だけで、付箋・のり・クリップの変更が見つかりません。エラーにはならないため、変更が漏れていても気づきにくい点に注意してください。',
      code: `SELECT *
FROM product_prices
WHERE old_price <> new_price
ORDER BY id;`,
      resultTable: { headers: ['id', 'product', 'old_price', 'new_price'], rows: [['2', 'ノート', '200', '250']] },
    },
    {
      heading: 'IS DISTINCT FROMで旧値と新値が変わった行を拾う（変更検知）',
      body: '同じ条件を<>の代わりにIS DISTINCT FROMにすると、価格が変わった行がすべて残ります。ノート、付箋（新たに設定）、のり（設定を取り消し）、クリップ（0円から未設定）の4行です。ペンと、両方NULLの定規は変わっていないので入りません。旧値と新値を比べる変更検知や差分チェックで、NULLが入りうる列を比べるときの基本形です。',
      code: `SELECT *
FROM product_prices
WHERE old_price IS DISTINCT FROM new_price
ORDER BY id;`,
      resultTable: { headers: ['id', 'product', 'old_price', 'new_price'], rows: [['2', 'ノート', '200', '250'], ['4', '付箋', 'NULL', '150'], ['5', 'のり', '300', 'NULL'], ['6', 'クリップ', '0', 'NULL']] },
    },
    {
      heading: 'IS NOT DISTINCT FROMはNULLどうしを等しいとみなす',
      body: 'IS NOT DISTINCT FROMは、IS DISTINCT FROMの反対で、同じならtrueです。=と違い、NULLとNULLも「同じ」としてtrueを返します。価格が変わっていない行を探すと、ペン（100と100）と定規（NULLとNULL）の2行が残ります。old_price = new_priceで探すとペンしか残らず、両方NULLの定規が「変更なし」として拾えません。',
      code: `SELECT *
FROM product_prices
WHERE old_price IS NOT DISTINCT FROM new_price
ORDER BY id;`,
      resultTable: { headers: ['id', 'product', 'old_price', 'new_price'], rows: [['1', 'ペン', '100', '100'], ['3', '定規', 'NULL', 'NULL']] },
    },
    {
      heading: '定数との比較でも、NULLの行を落とさずに「異なる」を判定する',
      body: '比較の相手は列だけでなく定数でもかまいません。new_price <> 150だと、new_priceがNULLの定規・のり・クリップは落ちて、ペンとノートの2行しか残りません。new_price IS DISTINCT FROM 150にすると、150円ではない行として、NULLの行も残ります。結果は、ペン、ノート、定規、のり、クリップの5行です。付箋は150円なので入りません。「その値以外（未設定を含む）」を取りたい場面で使います。',
      code: `SELECT id, product, new_price
FROM product_prices
WHERE new_price IS DISTINCT FROM 150
ORDER BY id;`,
      resultTable: { headers: ['id', 'product', 'new_price'], rows: [['1', 'ペン', '100'], ['2', 'ノート', '250'], ['3', '定規', 'NULL'], ['5', 'のり', 'NULL'], ['6', 'クリップ', 'NULL']] },
    },
    {
      heading: '結合条件でNULLどうしを対応させる',
      body: 'JOINのONで=を使うと、NULLどうしは対応せず、area_codeがNULLの上田と江口は結果から消えます。結果は青木と伊藤の2行です。ONにIS NOT DISTINCT FROMを使うと、NULLのareas行（未設定）と対応するので、上田と江口が「未設定」に結び付き、4行になります。NULLを意味のある値（未設定）として別表に持っている場合だけ使います。通常のコード（A、B）は、どちらの書き方でも同じように対応します。',
      code: `SELECT members.name, areas.label
FROM members
JOIN areas ON members.area_code IS NOT DISTINCT FROM areas.code
ORDER BY members.id;`,
      resultTable: { headers: ['name', 'label'], rows: [['青木', '東日本'], ['伊藤', '西日本'], ['上田', '未設定'], ['江口', '未設定']] },
    },
  ],
  mistakes: [
    {
      title: 'COALESCEで0などに置き換えて比べると、実在する値と区別できない',
      body: 'COALESCE(old_price, 0) <> COALESCE(new_price, 0)のように、NULLを0へ置き換えて<>で比べる書き方があります。しかしクリップのように旧価格が本当に0円で、新価格が未設定の行では、どちらも0になり「変更なし」と判定されます。置き換える値が実際のデータにも存在しうるときは、IS DISTINCT FROMを使ってください。この表では、変更のあるクリップ（id 6）が結果から落ちます。',
      code: `SELECT id, product
FROM product_prices
WHERE COALESCE(old_price, 0) <> COALESCE(new_price, 0)
ORDER BY id;`,
    },
  ],
  notes: [
    {
      title: '行どうしを丸ごと比べることもできる',
      body: 'PostgreSQLでは、(a, b) IS DISTINCT FROM (c, d)のように、カッコで囲んだ複数列の組（行）を比べることもできます。組のどこか1か所でもNULLを含めて異なれば、全体が異なるとみなされます。複数列をまとめて変更検知したいときに、列ごとのORを書かずに済みます。',
      code: `SELECT id, product
FROM product_prices
WHERE (old_price, product) IS DISTINCT FROM (new_price, product)
ORDER BY id;`,
    },
    {
      title: 'IS NOT DISTINCT FROMは=ほど最適化されないことがある',
      body: '通常の=による結合は、ハッシュ結合やインデックスを使った高速な方法を選べます。IS NOT DISTINCT FROMはこうした方法の対象になりにくく、大きな表の結合では遅くなることがあります。NULLを比べる必要がない列には、通常の=を使うのが基本です。',
    },
  ],
  faqs: [
    {
      question: '<>とIS DISTINCT FROMの違いは何ですか？',
      answer: '<>は、どちらかがNULLだと結果がNULLになり、WHEREで行が落ちます。IS DISTINCT FROMはNULLを値として扱い、NULLと値は異なる、NULLどうしは同じとして、必ずtrueかfalseを返します。この表では、old_price <> new_priceが1行、IS DISTINCT FROMが4行です。',
    },
    {
      question: 'NULLとの比較は、IS NULLと= NULLのどちらで書きますか？',
      answer: '= NULLや<> NULLは常にNULLとなり、WHEREでは行が残りません。NULLかどうかはIS NULL、IS NOT NULLで調べます。2つの列をNULLを含めて比べるときに、IS DISTINCT FROMとIS NOT DISTINCT FROMを使います。',
    },
    {
      question: 'IS DISTINCT FROMは他のデータベースでも使えますか？',
      answer: '標準SQLにある比較述語ですが、対応状況や書き方はデータベースごとに異なります。たとえばMySQLには、IS NOT DISTINCT FROMと同じ働きをする<=>演算子があります。この記事の書き方はPostgreSQLのものです。',
    },
    {
      question: 'IS DISTINCT FROMとIS NOT DISTINCT FROMはどう使い分けますか？',
      answer: '「異なる行（変更のある行）」を取りたいときはIS DISTINCT FROM、「同じ行（変更のない行）」を取りたいときや、NULLどうしを対応させたいJOINにはIS NOT DISTINCT FROMを使います。どちらも、一方を否定すると、もう一方と同じ結果になります。',
    },
  ],
  references: [
    { label: 'PostgreSQL公式：比較関数と演算子（IS DISTINCT FROM）', url: 'https://www.postgresql.org/docs/current/functions-comparison.html', description: 'IS DISTINCT FROM・IS NOT DISTINCT FROMの意味と、NULLの扱い' },
    { label: 'PostgreSQL公式：行と配列の比較', url: 'https://www.postgresql.org/docs/current/functions-comparisons.html#ROW-WISE-COMPARISON', description: '複数列の行どうしの比較と、IS DISTINCT FROMの扱い' },
  ],
  related: ['where', 'coalesce', 'case', 'inner-join', 'not-in', 'nullif'],
  practiceCategory: 'is-distinct-from',
};
