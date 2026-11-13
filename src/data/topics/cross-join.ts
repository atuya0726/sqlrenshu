import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE stores (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE days (day date PRIMARY KEY);
CREATE TABLE sales (id integer PRIMARY KEY, store_id integer NOT NULL REFERENCES stores(id), sold_on date NOT NULL, amount integer NOT NULL);
INSERT INTO stores VALUES (1,'渋谷'),(2,'新宿');
INSERT INTO days VALUES ('2026-04-01'),('2026-04-02'),('2026-04-03');
INSERT INTO sales VALUES (1,1,'2026-04-01',12000),(2,1,'2026-04-03',8000),(3,2,'2026-04-01',15000),(4,2,'2026-04-01',3000);`,
  sources: ['SELECT * FROM stores ORDER BY id', 'SELECT * FROM days ORDER BY day', 'SELECT * FROM sales ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'cross-join',
  label: 'CROSS JOIN',
  title: 'SQLのCROSS JOINとは？全組み合わせの作り方と、売上0を埋める枠の作り方',
  description: 'SQLのCROSS JOIN（直積）をPostgreSQLの元の表・SQL・結果表で解説。店舗×日付の全組み合わせ、行数がN×Mになる仕組み、ON無しJOINとの関係、枠を作ってLEFT JOINで売上0を埋める方法を学べます。',
  lead: 'CROSS JOINは、2つの表のすべての行の組み合わせを作る結合です。ONで対応を指定せず、左の1行ごとに右の全行を結び付けます。店舗と日付の全組み合わせを作り、売上がない日も0として表示する「枠」の作り方まで確認しましょう。サイズ×色のように、商品バリエーションの一覧を作る場面にも使えます。',
  sampleIntro: 'storesは店舗2件、daysは4月1日から3日までの日付3件、salesは売上4件です。salesの1行は1回の売上で、store_idが店舗のid、sold_onが売上日、amountが金額（円）です。渋谷は4月1日と3日、新宿は4月1日に売上があり、新宿の4月1日は2件あります。4月2日は両店舗とも売上がありません。ORDER BYのない結果の行順は一例で、保証されません。',
  sampleTables: [
    { caption: 'stores：店舗2件', headers: ['id', 'name'], rows: [['1', '渋谷'], ['2', '新宿']] },
    { caption: 'days：日付3件', headers: ['day'], rows: [['2026-04-01'], ['2026-04-02'], ['2026-04-03']] },
    {
      caption: 'sales：売上4件',
      headers: ['id', 'store_id', 'sold_on', 'amount'],
      rows: [['1', '1', '2026-04-01', '12000'], ['2', '1', '2026-04-03', '8000'], ['3', '2', '2026-04-01', '15000'], ['4', '2', '2026-04-01', '3000']],
    },
  ],
  syntax: 'SELECT s.name, d.day\nFROM stores AS s\nCROSS JOIN days AS d;',
  sections: [
    {
      heading: 'CROSS JOINで店舗と日付の全組み合わせを作る',
      body: 'CROSS JOINは、左の各行に右の全行を1行ずつ結び付けます。店舗2件と日付3件なので、渋谷の3日分と新宿の3日分、合わせて6行です。ONは書きません。2つの表の間に「対応」がなく、組み合わせそのものが欲しいときに使います。',
      code: 'SELECT s.name, d.day\nFROM stores AS s\nCROSS JOIN days AS d\nORDER BY s.id, d.day;',
      resultTable: { headers: ['name', 'day'], rows: [['渋谷', '2026-04-01'], ['渋谷', '2026-04-02'], ['渋谷', '2026-04-03'], ['新宿', '2026-04-01'], ['新宿', '2026-04-02'], ['新宿', '2026-04-03']] },
    },
    {
      heading: '行数は左の行数×右の行数になる',
      body: 'CROSS JOINの結果の行数は、左がN行、右がM行ならN×M行です。この例は2×3で6行です。足し算ではなく掛け算なので、100行と1,000行の表を結合すると10万行になります。大きな表どうしに使うと結果が急に膨らむため、行数を事前に見積もってから使います。',
      code: 'SELECT COUNT(*)\nFROM stores\nCROSS JOIN days;',
      resultTable: { headers: ['count'], rows: [['6']] },
    },
    {
      heading: 'WHEREで対応を絞るとINNER JOINと同じ結果になる',
      body: 'CROSS JOINにWHEREでs.id = x.store_idを付けると、全組み合わせのうち店舗が対応する行だけが残ります。店舗2件と売上4件の8行から4行に絞られ、INNER JOINでONに同じ条件を書いた結果と同じです。CROSS JOINはまず全組み合わせを作り、条件で絞るという考え方です。対応を書くなら、意図が伝わるINNER JOINとONの方が読みやすくなります。',
      code: 'SELECT s.name, x.sold_on, x.amount\nFROM stores AS s\nCROSS JOIN sales AS x\nWHERE s.id = x.store_id\nORDER BY x.id;',
      resultTable: { headers: ['name', 'sold_on', 'amount'], rows: [['渋谷', '2026-04-01', '12000'], ['渋谷', '2026-04-03', '8000'], ['新宿', '2026-04-01', '15000'], ['新宿', '2026-04-01', '3000']] },
    },
    {
      heading: '枠を作ってLEFT JOINで売上0の日も表示する',
      body: '売上表だけをGROUP BYすると、売上がない日は行そのものがなく、結果に現れません。そこで、店舗×日付の枠をCROSS JOINで作り、その枠にsalesをLEFT JOINします。ONには店舗と日付の両方の対応を書きます。売上がない組み合わせはamountがNULLなので、SUMの結果をCOALESCEで0にします。新宿の4月1日は2件の売上の合計18,000円で、4月2日は両店舗とも0円です。',
      code: 'SELECT s.name, d.day, COALESCE(SUM(x.amount), 0) AS total\nFROM stores AS s\nCROSS JOIN days AS d\nLEFT JOIN sales AS x\n  ON x.store_id = s.id\n AND x.sold_on = d.day\nGROUP BY s.id, s.name, d.day\nORDER BY s.id, d.day;',
      resultTable: { headers: ['name', 'day', 'total'], rows: [['渋谷', '2026-04-01', '12000'], ['渋谷', '2026-04-02', '0'], ['渋谷', '2026-04-03', '8000'], ['新宿', '2026-04-01', '18000'], ['新宿', '2026-04-02', '0'], ['新宿', '2026-04-03', '0']] },
    },
    {
      heading: '売上がない店舗×日付の組み合わせを探す',
      body: '枠にLEFT JOINした後、売上側のidがNULLの行だけを残すと、売上がない組み合わせを取り出せます。渋谷の4月2日、新宿の4月2日と3日の3行です。実績の有無で抜けを調べるときに使えます。売上側の列を判定するときは、NULLが入りうる列ではなく、主キーのidを使うと意味が確実です。',
      code: 'SELECT s.name, d.day\nFROM stores AS s\nCROSS JOIN days AS d\nLEFT JOIN sales AS x\n  ON x.store_id = s.id\n AND x.sold_on = d.day\nWHERE x.id IS NULL\nORDER BY s.id, d.day;',
      resultTable: { headers: ['name', 'day'], rows: [['渋谷', '2026-04-02'], ['新宿', '2026-04-02'], ['新宿', '2026-04-03']] },
    },
  ],
  mistakes: [
    {
      title: '日付の条件をWHEREに書くと、売上0の枠が消える',
      body: '枠へのLEFT JOINで、売上日の条件をONではなくWHEREのx.sold_on = d.dayに書くと、売上がなくNULLになった行が条件を通らず消えます。結果は売上がある3組だけになり、0円の行が出ません。枠と実績を対応させる条件はONに書きます。',
      code: 'SELECT s.name, d.day, x.amount\nFROM stores AS s\nCROSS JOIN days AS d\nLEFT JOIN sales AS x\n  ON x.store_id = s.id\nWHERE x.sold_on = d.day;',
    },
    {
      title: '対応条件を付け忘れると行数が掛け算で増える',
      body: 'FROM stores, salesのようにカンマで表を並べて対応条件のWHEREを忘れると、CROSS JOINと同じ全組み合わせになります。店舗2件と売上4件で8行になり、渋谷の売上に新宿の売上まで結び付きます。この結果でSUMすると、実際より大きい金額になります（渋谷は20,000円のはずが38,000円）。',
      code: 'SELECT s.name, SUM(x.amount)\nFROM stores AS s, sales AS x\nGROUP BY s.name;',
    },
  ],
  notes: [
    {
      title: 'FROM a, bとJOIN ... ON TRUEもCROSS JOINと同じ',
      body: '公式ドキュメントでは、T1 CROSS JOIN T2はT1 INNER JOIN T2 ON TRUEと等価で、FROM T1, T2とも等価です。ただし3つ以上の表を並べると、JOINがカンマより強く結合するため、完全には同じになりません。意図を明確にするため、全組み合わせを作るときはCROSS JOINと書きます。',
      code: 'SELECT COUNT(*)\nFROM stores AS s\nINNER JOIN days AS d\n  ON TRUE;',
    },
    {
      title: '日付の枠は連続日付を作る関数でも作れる',
      body: 'この例ではdaysという表を用意しましたが、連続した日付が必要ならgenerate_series関数でも枠を作れます。枠の表をわざわざ作らずに済み、期間を変えるときもクエリを書き換えるだけです。generate_seriesはPostgreSQLの機能です。',
    },
  ],
  faqs: [
    {
      question: 'CROSS JOINは何に使いますか？',
      answer: '全組み合わせが欲しいときに使います。サイズ3種類と色2種類の商品バリエーション6通りを作る、店舗と日付の枠を作って売上0を表示する、といった場面です。結合する表どうしに対応する列がないのが特徴です。',
    },
    {
      question: 'CROSS JOINにONは書けますか？',
      answer: 'CROSS JOINにはONを書きません。条件で絞りたいときはWHEREに書くか、INNER JOINとONに書き換えます。ONを書くINNER JOINで常に真の条件を指定すると、CROSS JOINと同じ結果になります。',
    },
    {
      question: '片方の表が0行だとどうなりますか？',
      answer: '結果は0行です。N×Mで、どちらかが0なら結果も0になります。店舗を結合した枠が空になるときは、元の表のデータを確認してください。',
    },
    {
      question: '売上表だけをGROUP BYしても売上0の日は表示できますか？',
      answer: '表示できません。売上表に行がない日は、集計の結果にも現れないためです。枠をCROSS JOINで作り、LEFT JOINで売上を結び付けてから集計します。',
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：結合テーブル（CROSS JOIN）',
      url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN',
      description: 'CROSS JOINの定義、N×M行、INNER JOIN ON TRUE・カンマとの等価性',
    },
    {
      label: 'PostgreSQL公式：SELECT（FROM句）',
      url: 'https://www.postgresql.org/docs/current/sql-select.html#SQL-FROM',
      description: 'JOINの種類と、ONを書かない形式',
    },
  ],
  related: ['inner-join', 'left-join', 'self-join', 'full-outer-join', 'generate-series', 'coalesce'],
  practiceCategory: 'cross-join',
};
