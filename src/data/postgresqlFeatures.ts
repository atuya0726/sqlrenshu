// PostgreSQL固有機能ページ（/postgresql/{slug}/）のデータ。
// 掲載する実行結果は postgresqlFeatures.test.ts がPGliteで実行して照合する。

export type PgTable = { headers: string[]; rows: string[][] };

export type PgFeature = {
  slug: string;
  label: string;
  title: string;
  description: string;
  summary: string; // 一覧ページ用の一言説明
  lead: string;
  setup: string; // 例で使う表を作るSQL（各例はこの状態から実行する）
  sampleIntro: string;
  sampleTables: (PgTable & { caption: string; source: string })[];
  syntax: string;
  syntaxNote: string;
  examples: { heading: string; body: string; code: string; resultTable: PgTable; resultNote: string }[];
  mistakes: { title: string; body: string; code: string; error?: string }[];
  alternatives: { heading: string; body: string; code?: string; resultTable?: PgTable }[];
  faqs: { question: string; answer: string }[];
  references: { label: string; url: string; description: string }[];
  related: string[]; // /sql/{slug}/
  practice: { category: string; label: string }[]; // /practice/{category}/
};

const ordersSetup = `CREATE TABLE orders (
  id integer PRIMARY KEY,
  customer text NOT NULL,
  ordered_on date NOT NULL,
  amount integer NOT NULL
);
INSERT INTO orders (id, customer, ordered_on, amount) VALUES
  (1, '青木', '2025-01-05', 3000),
  (2, '青木', '2025-02-10', 5000),
  (3, '佐藤', '2025-01-20', 4000),
  (4, '佐藤', '2025-03-01', 2000),
  (5, '鈴木', '2025-02-15', 6000);`;

const distinctOn: PgFeature = {
  slug: 'distinct-on',
  label: 'DISTINCT ON',
  title: 'PostgreSQLのDISTINCT ONとは？グループごとの先頭1行を取る書き方',
  description: 'PostgreSQLのDISTINCT ONで、顧客ごとの最新注文のように「グループごとの先頭1行」を取る方法を解説。ORDER BYとの関係、ROW_NUMBERでの代替、よくある間違いを実行結果つきで学べます。',
  summary: '顧客ごとの最新注文など、グループごとの先頭1行だけを取り出します。',
  lead: 'DISTINCT ONは、指定した列の値が同じ行のグループから、並べ替えた先頭の1行だけを残すPostgreSQL独自の構文です。「顧客ごとの最新の注文」「商品ごとの最高額」のように、グループごとに代表の1行がほしいときに使います。GROUP BYと違い、選んだ1行の全列をそのまま取り出せるのが特徴です。',
  setup: ordersSetup,
  sampleIntro: 'ordersの1行が注文1件です。ordered_onは注文日、amountは金額（円）です。青木さんと佐藤さんは2件ずつ、鈴木さんは1件の注文があります。すべての例でこの5件を使います。',
  sampleTables: [{
    caption: 'orders：注文5件',
    headers: ['id（注文ID）', 'customer（顧客）', 'ordered_on（注文日）', 'amount（金額）'],
    rows: [['1', '青木', '2025-01-05', '3000'], ['2', '青木', '2025-02-10', '5000'], ['3', '佐藤', '2025-01-20', '4000'], ['4', '佐藤', '2025-03-01', '2000'], ['5', '鈴木', '2025-02-15', '6000']],
    source: 'SELECT id, customer, ordered_on, amount FROM orders ORDER BY id;',
  }],
  syntax: 'SELECT DISTINCT ON (グループにする列) 列1, 列2, ...\nFROM テーブル名\nORDER BY グループにする列, 先頭を決める列 DESC;',
  syntaxNote: 'ON (...) に書いた列の値が同じ行が1グループになり、ORDER BYで並べた先頭の1行が残ります。ORDER BYの先頭は、ON (...) と同じ列にそろえる必要があります。',
  examples: [
    {
      heading: '顧客ごとの最新の注文を1行ずつ取る',
      body: 'customerをグループにして、注文日が新しい順に並べます。各顧客の先頭、つまり最新の1件だけが残るので、5行が3行になります。取り出した行のordered_onとamountは、同じ1件の注文の値です。',
      code: 'SELECT DISTINCT ON (customer)\n  customer, ordered_on, amount\nFROM orders\nORDER BY customer, ordered_on DESC;',
      resultTable: { headers: ['customer', 'ordered_on', 'amount'], rows: [['佐藤', '2025-03-01', '2000'], ['鈴木', '2025-02-15', '6000'], ['青木', '2025-02-10', '5000']] },
      resultNote: '行の順番はORDER BYの先頭にあるcustomerの並びです。この環境では文字コード順になるため、佐藤、鈴木、青木の順に表示されます。',
    },
    {
      heading: 'ORDER BYを変えて、顧客ごとの最高額の注文を取る',
      body: '先頭を決める基準は、ORDER BYの2列目以降で変えられます。amount DESCにすると、顧客ごとに金額が最も大きい注文が残ります。佐藤さんは3月の2000円ではなく、1月の4000円の注文が選ばれます。',
      code: 'SELECT DISTINCT ON (customer)\n  customer, ordered_on, amount\nFROM orders\nORDER BY customer, amount DESC;',
      resultTable: { headers: ['customer', 'ordered_on', 'amount'], rows: [['佐藤', '2025-01-20', '4000'], ['鈴木', '2025-02-15', '6000'], ['青木', '2025-02-10', '5000']] },
      resultNote: 'グループの基準（customer）は同じで、先頭を決める列だけを変えると別の1行が選ばれます。',
    },
    {
      heading: '選んだ結果を、別の列で並べ替える',
      body: 'DISTINCT ONを使うと、ORDER BYの先頭は必ずON (...) の列になります。結果を金額の大きい順に見たいときは、DISTINCT ONの部分をサブクエリにして、外側のSELECTで並べ替えます。',
      code: 'SELECT *\nFROM (\n  SELECT DISTINCT ON (customer)\n    customer, ordered_on, amount\n  FROM orders\n  ORDER BY customer, ordered_on DESC\n) AS latest\nORDER BY amount DESC;',
      resultTable: { headers: ['customer', 'ordered_on', 'amount'], rows: [['鈴木', '2025-02-15', '6000'], ['青木', '2025-02-10', '5000'], ['佐藤', '2025-03-01', '2000']] },
      resultNote: '内側で「顧客ごとの最新1件」を決め、外側でその3行を金額順に並べています。',
    },
  ],
  mistakes: [
    {
      title: 'ORDER BYの先頭をON (...) の列と別の列にする',
      body: 'ON (customer) と書いたのに、ORDER BYを注文日だけにするとエラーになります。DISTINCT ONは並べ替えの先頭がグループ列であることを前提にしているためです。ORDER BYには、まずON (...) と同じ列を書いてください。',
      code: 'SELECT DISTINCT ON (customer)\n  customer, ordered_on, amount\nFROM orders\nORDER BY ordered_on DESC;',
      error: 'SELECT DISTINCT ON expressions must match initial ORDER BY expressions',
    },
    {
      title: 'ORDER BYを書かずに「最新」が取れると思う',
      body: 'ORDER BYを省略してもエラーにはなりませんが、各グループのどの行が残るかは決まりません。実行するたびに違う行になる可能性があるため、「最新」「最高額」を取りたいときは必ずORDER BYの2列目以降で基準を指定します。',
      code: 'SELECT DISTINCT ON (customer)\n  customer, ordered_on, amount\nFROM orders;',
    },
  ],
  alternatives: [
    {
      heading: '標準SQLのROW_NUMBER()で書く',
      body: 'DISTINCT ONはPostgreSQL固有で、MySQLなど他のデータベースでは使えません。代わりに、ウィンドウ関数のROW_NUMBER()でグループ内の順位をつけ、1位の行だけを残す書き方が広く使えます（MySQLはバージョン8.0以降でウィンドウ関数に対応しています）。1つ目の例と同じ3行が得られます。ただし、このコードはPostgreSQLで確認したものです。',
      code: 'SELECT customer, ordered_on, amount\nFROM (\n  SELECT customer, ordered_on, amount,\n    ROW_NUMBER() OVER (\n      PARTITION BY customer\n      ORDER BY ordered_on DESC\n    ) AS rn\n  FROM orders\n) AS t\nWHERE rn = 1\nORDER BY customer;',
      resultTable: { headers: ['customer', 'ordered_on', 'amount'], rows: [['佐藤', '2025-03-01', '2000'], ['鈴木', '2025-02-15', '6000'], ['青木', '2025-02-10', '5000']] },
    },
  ],
  faqs: [
    { question: 'DISTINCT ONとDISTINCTの違いは何ですか？', answer: 'DISTINCTは選んだ列の組み合わせがすべて同じ行をまとめます。DISTINCT ONは、ON (...) に書いた列だけを見て重複を判定し、ORDER BYで先頭になった1行を丸ごと残します。残す行を基準で選べる点が違います。' },
    { question: '同じ並び順の行が複数あるとき、どれが選ばれますか？', answer: 'ORDER BYで順位がつかない行が複数あると、どれが選ばれるかは決まりません。1件に確定させたいときは、ORDER BYの最後にidのような一意な列を足してください。' },
    { question: 'DISTINCT ONで、NULLのグループはどう扱われますか？', answer: 'PostgreSQL公式ドキュメントによると、DISTINCT ONでもNULL同士は同じ値として扱われ、1つのグループになります。' },
  ],
  references: [
    { label: 'PostgreSQL公式：SELECTのDISTINCT句', url: 'https://www.postgresql.org/docs/current/sql-select.html#SQL-DISTINCT', description: 'DISTINCT ONの仕様と、ORDER BYとの関係' },
    { label: 'PostgreSQL公式：ウィンドウ関数のチュートリアル', url: 'https://www.postgresql.org/docs/current/tutorial-window.html', description: 'ROW_NUMBER()などウィンドウ関数の基本' },
  ],
  related: ['order-by', 'group-by', 'window-functions'],
  practice: [{ category: 'order-by', label: 'ORDER BY' }, { category: 'window-functions', label: 'ウィンドウ関数' }],
};

const filterSetup = `CREATE TABLE orders (
  id integer PRIMARY KEY,
  customer text NOT NULL,
  status text NOT NULL,
  amount integer NOT NULL
);
INSERT INTO orders (id, customer, status, amount) VALUES
  (1, '青木', 'paid', 3000),
  (2, '青木', 'cancelled', 5000),
  (3, '佐藤', 'paid', 4000),
  (4, '佐藤', 'paid', 2000),
  (5, '鈴木', 'pending', 6000),
  (6, '鈴木', 'paid', 1000),
  (7, '田中', 'cancelled', 7000);`;

const filter: PgFeature = {
  slug: 'filter',
  label: 'FILTER',
  title: 'PostgreSQLのFILTER句とは？条件付き集計をCASEなしで書く方法',
  description: 'PostgreSQLのFILTER句で、COUNTやSUMに条件をつけて「支払い済みの件数」などを1回のSELECTで集計する方法を解説。CASEとの違い、NULLの注意点を実行結果つきで学べます。',
  summary: 'COUNTやSUMごとに対象行の条件を指定し、条件付き集計を1回で行います。',
  lead: 'FILTERは、COUNTやSUMなどの集約関数の直後に WHERE 条件を付けて、その集計だけの対象行を絞る構文です。「全件数」と「支払い済みの件数」を同じSELECTで並べて出したいときに使います。CASE式を使った条件付き集計より、何を数えているかが読み取りやすくなります。',
  setup: filterSetup,
  sampleIntro: 'ordersの1行が注文1件です。statusは状態で、paidは支払い済み、cancelledはキャンセル、pendingは支払い待ちを表します。amountは金額（円）です。田中さんの注文はキャンセルだけです。すべての例でこの7件を使います。',
  sampleTables: [{
    caption: 'orders：注文7件',
    headers: ['id（注文ID）', 'customer（顧客）', 'status（状態）', 'amount（金額）'],
    rows: [['1', '青木', 'paid', '3000'], ['2', '青木', 'cancelled', '5000'], ['3', '佐藤', 'paid', '4000'], ['4', '佐藤', 'paid', '2000'], ['5', '鈴木', 'pending', '6000'], ['6', '鈴木', 'paid', '1000'], ['7', '田中', 'cancelled', '7000']],
    source: 'SELECT id, customer, status, amount FROM orders ORDER BY id;',
  }],
  syntax: "SELECT\n  COUNT(*) AS 全件数,\n  COUNT(*) FILTER (WHERE 条件) AS 条件に合う件数\nFROM テーブル名;",
  syntaxNote: 'FILTERは集約関数の直後に書きます。括弧の中は、必ず WHERE から始めます。',
  examples: [
    {
      heading: '全件数と支払い済みの件数を同時に数える',
      body: "COUNT(*) は7件すべてを数え、COUNT(*) FILTER (WHERE status = 'paid') はstatusがpaidの行だけを数えます。同じSELECTの中で、対象行の違う2つの集計を並べられます。",
      code: "SELECT\n  COUNT(*) AS total,\n  COUNT(*) FILTER (WHERE status = 'paid') AS paid_count\nFROM orders;",
      resultTable: { headers: ['total', 'paid_count'], rows: [['7', '4']] },
      resultNote: '注文7件のうち、paidは4件です。',
    },
    {
      heading: '顧客ごとに、件数と支払い済み金額を集計する',
      body: "GROUP BYと組み合わせると、顧客ごとの条件付き集計になります。FILTERはSUMにも付けられます。田中さんにはpaidの注文がないので、paid_amountは0ではなくNULLになります。",
      code: "SELECT\n  customer,\n  COUNT(*) AS total,\n  COUNT(*) FILTER (WHERE status = 'paid') AS paid_count,\n  SUM(amount) FILTER (WHERE status = 'paid') AS paid_amount\nFROM orders\nGROUP BY customer\nORDER BY customer;",
      resultTable: { headers: ['customer', 'total', 'paid_count', 'paid_amount'], rows: [['佐藤', '2', '2', '6000'], ['田中', '1', '0', 'NULL'], ['鈴木', '2', '1', '1000'], ['青木', '2', '1', '3000']] },
      resultNote: 'COUNTは対象行がなければ0を返しますが、SUMは対象行がなければNULLを返します。',
    },
    {
      heading: 'SUMの結果がNULLになるときはCOALESCEで0にする',
      body: '支払い済みの注文がない顧客の合計を0として表示したいときは、FILTER付きのSUMをCOALESCEで包みます。これで田中さんの金額が0になります。',
      code: "SELECT\n  customer,\n  COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) AS paid_amount\nFROM orders\nGROUP BY customer\nORDER BY customer;",
      resultTable: { headers: ['customer', 'paid_amount'], rows: [['佐藤', '6000'], ['田中', '0'], ['鈴木', '1000'], ['青木', '3000']] },
      resultNote: 'NULLを別の値に置き換える方法は、COALESCEのガイドで詳しく解説しています。',
    },
  ],
  mistakes: [
    {
      title: 'FILTERの括弧の中でWHEREを省く',
      body: 'FILTER (status = \'paid\') のようにWHEREを省くと構文エラーになります。FILTERの括弧の中は、必ず WHERE 条件 の形で書きます。',
      code: "SELECT COUNT(*) FILTER (status = 'paid')\nFROM orders;",
      error: 'syntax error',
    },
    {
      title: 'FILTERをテーブル名や行の絞り込みに使う',
      body: 'FILTERは集約関数に付ける構文です。FROMの後ろに付けて行を絞ることはできません。テーブル全体の行を絞りたいときは、通常のWHERE句を使います。',
      code: "SELECT customer, COUNT(*)\nFROM orders FILTER (WHERE status = 'paid')\nGROUP BY customer;",
      error: 'syntax error',
    },
  ],
  alternatives: [
    {
      heading: 'CASE式で条件付き集計を書く',
      body: 'MySQLなどFILTER句を使えないデータベースでは、集約関数の中にCASE式を入れて同じ集計を行います。CASEはWHENに合わない行でNULLを返し、COUNTやSUMはNULLを無視するので、条件に合う行だけが集計されます。次のSQLはPostgreSQLで確認したものです。',
      code: "SELECT\n  COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paid_count,\n  SUM(CASE WHEN status = 'paid' THEN amount END) AS paid_amount\nFROM orders;",
      resultTable: { headers: ['paid_count', 'paid_amount'], rows: [['4', '10000']] },
    },
  ],
  faqs: [
    { question: 'FILTERとWHEREの違いは何ですか？', answer: 'WHEREは集計の前に、テーブル全体の対象行を絞ります。FILTERは1つの集約関数だけの対象行を絞ります。同じSELECTで「全件数」と「条件に合う件数」を並べたいときは、FILTERが向いています。' },
    { question: 'FILTERはCOUNT以外の関数にも使えますか？', answer: 'この記事ではCOUNTとSUMで確認しました。PostgreSQL公式ドキュメントでは、FILTERは集約関数の呼び出しに付けられる構文として説明されています。' },
    { question: 'CASE式と比べて、FILTERを使う利点は何ですか？', answer: '「何を数えているか」が WHERE の形で読み取れるため、条件が増えたときも読みやすくなります。一方でMySQLなどでは使えない点には注意してください。' },
  ],
  references: [
    { label: 'PostgreSQL公式：集約式（FILTER句）', url: 'https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES', description: '集約関数の構文とFILTER句の仕様' },
    { label: 'PostgreSQL公式：集約関数', url: 'https://www.postgresql.org/docs/current/functions-aggregate.html', description: 'COUNT・SUMなどの集約関数とNULLの扱い' },
  ],
  related: ['group-by', 'case', 'coalesce'],
  practice: [{ category: 'group-by', label: 'GROUP BY' }, { category: 'case', label: 'CASE' }],
};

const productsSetup = `CREATE TABLE products (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  price integer NOT NULL,
  stock integer NOT NULL
);
INSERT INTO products (name, price, stock) VALUES
  ('ノート', 200, 10),
  ('ペン', 100, 30),
  ('定規', 150, 5);`;

const returning: PgFeature = {
  slug: 'returning',
  label: 'RETURNING',
  title: 'PostgreSQLのRETURNINGとは？INSERT・UPDATE・DELETEの結果をその場で受け取る',
  description: 'PostgreSQLのRETURNING句で、INSERT・UPDATE・DELETEした行の値（自動採番のidなど）をその場で受け取る方法を解説。SELECTを打ち直さずに済む理由と注意点を実行結果つきで学べます。',
  summary: 'INSERT・UPDATE・DELETEした行を、そのまま結果として返します。',
  lead: 'RETURNINGは、INSERT・UPDATE・DELETEの末尾に付けて、変更した行の値をそのまま結果として受け取るPostgreSQLの構文です。自動採番されたidを知りたいときや、削除した行を記録したいときに、あとからSELECTを実行し直す必要がありません。',
  setup: productsSetup,
  sampleIntro: 'productsの1行が商品1点です。idは自動で採番される番号、priceは価格（円）、stockは在庫数です。idはINSERT時に自動で付くので、新しい商品を足すときは書きません。すべての例でこの3点から始めます。',
  sampleTables: [{
    caption: 'products：商品3点',
    headers: ['id（商品ID）', 'name（商品名）', 'price（価格）', 'stock（在庫）'],
    rows: [['1', 'ノート', '200', '10'], ['2', 'ペン', '100', '30'], ['3', '定規', '150', '5']],
    source: 'SELECT id, name, price, stock FROM products ORDER BY id;',
  }],
  syntax: 'INSERT INTO テーブル名 (列, ...) VALUES (値, ...)\nRETURNING 返したい列;\n\nUPDATE テーブル名 SET 列 = 値 WHERE 条件\nRETURNING 返したい列;\n\nDELETE FROM テーブル名 WHERE 条件\nRETURNING 返したい列;',
  syntaxNote: 'RETURNINGにはSELECTと同じように列名を書きます。全列なら * も使えます。',
  examples: [
    {
      heading: 'INSERTした行の自動採番idを受け取る',
      body: 'idを指定せずに商品を追加すると、PostgreSQLがidを自動で決めます。RETURNING id, name を付けると、決まったidをその場で受け取れます。元の3点にid 1〜3があるので、新しい行のidは4です。',
      code: "INSERT INTO products (name, price, stock)\nVALUES ('消しゴム', 80, 20)\nRETURNING id, name;",
      resultTable: { headers: ['id', 'name'], rows: [['4', '消しゴム']] },
      resultNote: '追加した1行だけが返ります。表全体が返るわけではありません。',
    },
    {
      heading: 'UPDATEした行の更新後の値を受け取る',
      body: 'ペンの在庫を3つ減らし、更新後の在庫を返します。30から3を引いた27が返ります。RETURNINGが返すのは、更新される前ではなく更新後の値です。',
      code: "UPDATE products\nSET stock = stock - 3\nWHERE name = 'ペン'\nRETURNING id, name, stock;",
      resultTable: { headers: ['id', 'name', 'stock'], rows: [['2', 'ペン', '27']] },
      resultNote: 'WHEREに合った行だけが返ります。複数行を更新すれば、その行数分が返ります。',
    },
    {
      heading: 'DELETEした行の内容を受け取る',
      body: '在庫が10未満の商品を削除し、消した行の内容を返します。条件に合うのは在庫5の定規だけです。削除したデータをログに残したいときに便利です。',
      code: 'DELETE FROM products\nWHERE stock < 10\nRETURNING id, name, stock;',
      resultTable: { headers: ['id', 'name', 'stock'], rows: [['3', '定規', '5']] },
      resultNote: 'ノート（在庫10）は「10未満」に当たらないため、削除されません。',
    },
  ],
  mistakes: [
    {
      title: 'RETURNINGが更新前の値を返すと思い込む',
      body: 'UPDATEのRETURNINGは更新後の値を返します。更新前の値がほしいときは、UPDATEの前にSELECTで取得しておく必要があります。',
      code: "UPDATE products\nSET stock = 0\nWHERE name = 'ノート'\nRETURNING stock;",
    },
    {
      title: '一致する行がないとき、エラーではなく0行になる',
      body: 'WHEREに合う行がなければ、UPDATEもDELETEも何も変更せず、RETURNINGの結果は0行になります。エラーにはならないため、アプリ側では「0行だった」ことを確認する必要があります。',
      code: "UPDATE products\nSET stock = 0\nWHERE name = 'ハサミ'\nRETURNING id, name, stock;",
    },
  ],
  alternatives: [
    {
      heading: 'RETURNINGを使わない場合',
      body: 'RETURNINGは標準SQLではなく、MySQLにもありません。MySQLではINSERTのあとにLAST_INSERT_ID()で直前のidを取得するなど、別の手順が必要です（SQL ServerにはOUTPUT句という似た機能があります）。PostgreSQLでRETURNINGを使わないなら、変更後にSELECTで探し直します。次の例は、INSERTのあとにSELECTでidを調べる書き方です。',
      code: "INSERT INTO products (name, price, stock)\nVALUES ('消しゴム', 80, 20);\n\nSELECT id, name\nFROM products\nWHERE name = '消しゴム';",
      resultTable: { headers: ['id', 'name'], rows: [['4', '消しゴム']] },
    },
  ],
  faqs: [
    { question: 'RETURNINGでは複数の行を返せますか？', answer: '返せます。複数行をVALUESで追加したり、WHEREに合う複数行を更新・削除したりすれば、変更した行の数だけ結果が返ります。' },
    { question: 'RETURNING * と列名を指定するのはどちらがよいですか？', answer: '必要な列だけを書くのがおすすめです。*だと、あとで表に列が増えたときに返る内容が変わります。' },
    { question: 'RETURNINGはSELECTと同じ式を書けますか？', answer: 'PostgreSQL公式ドキュメントでは、SELECTの出力リストと同じ形式で書けると説明されています。列名のほか、計算式にも対応しています。この記事では列名で動作を確認しました。' },
  ],
  references: [
    { label: 'PostgreSQL公式：変更した行からデータを返す（RETURNING）', url: 'https://www.postgresql.org/docs/current/dml-returning.html', description: 'INSERT・UPDATE・DELETEのRETURNING句の概要' },
    { label: 'PostgreSQL公式：INSERT', url: 'https://www.postgresql.org/docs/current/sql-insert.html', description: 'INSERT文の構文とRETURNING句' },
  ],
  related: ['select', 'where'],
  practice: [],
};

const inventorySetup = `CREATE TABLE inventory (
  sku text PRIMARY KEY,
  name text NOT NULL,
  qty integer NOT NULL
);
INSERT INTO inventory (sku, name, qty) VALUES
  ('A001', 'ノート', 10),
  ('A002', 'ペン', 30);`;

const onConflict: PgFeature = {
  slug: 'on-conflict',
  label: 'ON CONFLICT',
  title: 'PostgreSQLのON CONFLICTとは？重複時に無視・更新するUPSERTの書き方',
  description: 'PostgreSQLのINSERT ... ON CONFLICTで、主キーが重複したときに無視（DO NOTHING）したり更新（DO UPDATE）したりするUPSERTの書き方を、実行結果とMERGE・MySQLとの違いつきで解説します。',
  summary: '主キーなどが重複したときに、INSERTを無視するか更新に切り替えます。',
  lead: 'ON CONFLICTは、INSERTしようとした行が一意制約（主キーなど）に違反したときの動きを指定する構文です。エラーにする代わりに、その行を無視する（DO NOTHING）か、既存の行を更新する（DO UPDATE）かを選べます。「なければ追加、あれば更新」を1文で書けるため、UPSERTとも呼ばれます。',
  setup: inventorySetup,
  sampleIntro: 'inventoryの1行が商品1点の在庫です。skuは商品コードで主キー、qtyは在庫数です。同じskuの行は2つ作れません。すべての例でこの2点から始め、最後に表の中身を確認します。',
  sampleTables: [{
    caption: 'inventory：在庫2点（skuは主キー）',
    headers: ['sku（商品コード）', 'name（商品名）', 'qty（在庫数）'],
    rows: [['A001', 'ノート', '10'], ['A002', 'ペン', '30']],
    source: 'SELECT sku, name, qty FROM inventory ORDER BY sku;',
  }],
  syntax: 'INSERT INTO テーブル名 (列, ...)\nVALUES (値, ...)\nON CONFLICT (重複を判定する列)\nDO NOTHING;\n\nINSERT INTO テーブル名 (列, ...)\nVALUES (値, ...)\nON CONFLICT (重複を判定する列)\nDO UPDATE SET 列 = EXCLUDED.列;',
  syntaxNote: 'EXCLUDEDは「INSERTしようとした行」を指す特別な名前です。DO UPDATEの中で、新しく入れようとした値を参照できます。',
  examples: [
    {
      heading: '重複した行を無視する（DO NOTHING）',
      body: "A001（ノート）はすでにあるので、追加は行われず、在庫は10のままです。A003（定規）は新しいコードなので、そのまま追加されます。重複した行があってもエラーにならず、残りの行は追加されます。",
      code: "INSERT INTO inventory (sku, name, qty)\nVALUES\n  ('A001', 'ノート', 99),\n  ('A003', '定規', 5)\nON CONFLICT (sku) DO NOTHING;\n\nSELECT sku, name, qty\nFROM inventory\nORDER BY sku;",
      resultTable: { headers: ['sku', 'name', 'qty'], rows: [['A001', 'ノート', '10'], ['A002', 'ペン', '30'], ['A003', '定規', '5']] },
      resultNote: 'A001のqtyは99ではなく10のままです。',
    },
    {
      heading: '重複した行を新しい値で更新する（DO UPDATE）',
      body: 'DO UPDATE SET qty = EXCLUDED.qty にすると、重複したA001の在庫が、入れようとした99に更新されます。A003は新規行として追加されます。',
      code: "INSERT INTO inventory (sku, name, qty)\nVALUES\n  ('A001', 'ノート', 99),\n  ('A003', '定規', 5)\nON CONFLICT (sku)\nDO UPDATE SET qty = EXCLUDED.qty;\n\nSELECT sku, name, qty\nFROM inventory\nORDER BY sku;",
      resultTable: { headers: ['sku', 'name', 'qty'], rows: [['A001', 'ノート', '99'], ['A002', 'ペン', '30'], ['A003', '定規', '5']] },
      resultNote: 'A001が更新され、A003が追加されました。',
    },
    {
      heading: '既存の値に足し算して更新する',
      body: '入荷した数を、いまの在庫に加えたいときは、DO UPDATEの右辺で既存の値（inventory.qty）と新しい値（EXCLUDED.qty）の両方を使います。ペンの在庫30に20を足して50になります。',
      code: "INSERT INTO inventory (sku, name, qty)\nVALUES ('A002', 'ペン', 20)\nON CONFLICT (sku)\nDO UPDATE SET qty = inventory.qty + EXCLUDED.qty;\n\nSELECT sku, name, qty\nFROM inventory\nORDER BY sku;",
      resultTable: { headers: ['sku', 'name', 'qty'], rows: [['A001', 'ノート', '10'], ['A002', 'ペン', '50']] },
      resultNote: 'inventory.qtyは更新前の在庫、EXCLUDED.qtyはINSERTしようとした数量です。',
    },
  ],
  mistakes: [
    {
      title: '一意制約のない列をON CONFLICTに指定する',
      body: 'ON CONFLICT (列) には、一意制約（PRIMARY KEYやUNIQUE）が付いた列を指定する必要があります。nameのように一意でない列を指定すると、エラーになります。',
      code: "INSERT INTO inventory (sku, name, qty)\nVALUES ('A001', 'ノート', 99)\nON CONFLICT (name) DO NOTHING;",
      error: 'there is no unique or exclusion constraint matching the ON CONFLICT specification',
    },
    {
      title: '同じキーの行を1つのINSERTに2回含める',
      body: 'DO UPDATEでは、1つのINSERTの中で同じキーの行を2つ以上並べるとエラーになります。1回の文で同じ行を二度更新することはできないためです。VALUESの中では、キーが重ならないようにまとめてください。',
      code: "INSERT INTO inventory (sku, name, qty)\nVALUES\n  ('A009', '消しゴム', 1),\n  ('A009', '消しゴム', 2)\nON CONFLICT (sku)\nDO UPDATE SET qty = EXCLUDED.qty;",
      error: 'ON CONFLICT DO UPDATE command cannot affect row a second time',
    },
  ],
  alternatives: [
    {
      heading: '標準SQLのMERGEで書く',
      body: 'MySQLでは INSERT ... ON DUPLICATE KEY UPDATE という別の書き方でUPSERTを行います。標準SQLにはMERGE文があり、PostgreSQLでも使えます（この記事のPGliteで動作を確認しました）。2つ目の例と同じ結果になります。ただしMERGEの細かな挙動は、ON CONFLICTと完全に同じではありません。',
      code: "MERGE INTO inventory AS t\nUSING (VALUES\n  ('A001', 'ノート', 99),\n  ('A003', '定規', 5)\n) AS s(sku, name, qty)\nON t.sku = s.sku\nWHEN MATCHED THEN\n  UPDATE SET qty = s.qty\nWHEN NOT MATCHED THEN\n  INSERT (sku, name, qty)\n  VALUES (s.sku, s.name, s.qty);\n\nSELECT sku, name, qty\nFROM inventory\nORDER BY sku;",
      resultTable: { headers: ['sku', 'name', 'qty'], rows: [['A001', 'ノート', '99'], ['A002', 'ペン', '30'], ['A003', '定規', '5']] },
    },
  ],
  faqs: [
    { question: 'ON CONFLICTだけで列を省略できますか？', answer: 'DO NOTHINGでは、(sku) のような対象列を省略できます。この場合、どの一意制約に違反した場合も無視されます。DO UPDATEでは対象列の指定が必要です。' },
    { question: 'DO NOTHINGのとき、無視された行は何件か分かりますか？', answer: 'INSERTの結果として返る処理件数には、実際に追加された行だけが含まれます。無視された行は数えられません。' },
    { question: 'UPSERTの結果を受け取れますか？', answer: 'RETURNING句を付けると、追加または更新された行を受け取れます。DO NOTHINGで無視された行は返りません。RETURNINGの詳しい使い方は専用ページを参照してください。' },
  ],
  references: [
    { label: 'PostgreSQL公式：INSERTのON CONFLICT句', url: 'https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT', description: 'DO NOTHING・DO UPDATE・EXCLUDEDの仕様' },
    { label: 'PostgreSQL公式：MERGE', url: 'https://www.postgresql.org/docs/current/sql-merge.html', description: 'MERGE文の構文' },
  ],
  related: ['select', 'where'],
  practice: [],
};

const lateralSetup = `CREATE TABLE customers (
  id integer PRIMARY KEY,
  name text NOT NULL
);
CREATE TABLE orders (
  id integer PRIMARY KEY,
  customer_id integer NOT NULL,
  ordered_on date NOT NULL,
  amount integer NOT NULL
);
INSERT INTO customers (id, name) VALUES
  (1, '青木'),
  (2, '佐藤'),
  (3, '鈴木');
INSERT INTO orders (id, customer_id, ordered_on, amount) VALUES
  (1, 1, '2025-01-05', 3000),
  (2, 1, '2025-02-10', 5000),
  (3, 1, '2025-03-15', 2000),
  (4, 2, '2025-01-20', 4000),
  (5, 2, '2025-03-01', 2500);`;

const lateral: PgFeature = {
  slug: 'lateral',
  label: 'LATERAL',
  title: 'PostgreSQLのLATERALとは？サブクエリから前の表を参照する使い方',
  description: 'PostgreSQLのLATERAL結合で、顧客ごとの最新2件の注文など「行ごとに変わるサブクエリ」を書く方法を解説。CROSS JOIN・LEFT JOINとの組み合わせ、ROW_NUMBERでの代替を実行結果つきで学べます。',
  summary: 'FROM内のサブクエリから、左側の表の列を参照できるようにします。',
  lead: 'LATERALは、FROM句のサブクエリの中から、その左にあるテーブルの列を参照できるようにする構文です。通常のサブクエリは外側の表を参照できませんが、LATERALを付けると「顧客1人ごとに、その人の注文だけを最新2件取る」のような、行ごとに変わる検索を結合の形で書けます。',
  setup: lateralSetup,
  sampleIntro: 'customersの1行が顧客1人、ordersの1行が注文1件です。orders.customer_idはcustomers.idに対応します。青木さんは3件、佐藤さんは2件の注文があり、鈴木さんは注文がありません。すべての例でこの2つの表を使います。',
  sampleTables: [
    {
      caption: 'customers：顧客3人',
      headers: ['id（顧客ID）', 'name（名前）'],
      rows: [['1', '青木'], ['2', '佐藤'], ['3', '鈴木']],
      source: 'SELECT id, name FROM customers ORDER BY id;',
    },
    {
      caption: 'orders：注文5件',
      headers: ['id（注文ID）', 'customer_id（顧客ID）', 'ordered_on（注文日）', 'amount（金額）'],
      rows: [['1', '1', '2025-01-05', '3000'], ['2', '1', '2025-02-10', '5000'], ['3', '1', '2025-03-15', '2000'], ['4', '2', '2025-01-20', '4000'], ['5', '2', '2025-03-01', '2500']],
      source: 'SELECT id, customer_id, ordered_on, amount FROM orders ORDER BY id;',
    },
  ],
  syntax: 'SELECT ...\nFROM 表A\nCROSS JOIN LATERAL (\n  SELECT ...\n  FROM 表B\n  WHERE 表B.列 = 表A.列\n  ORDER BY ...\n  LIMIT 件数\n) AS 別名;',
  syntaxNote: 'LATERALの後ろのサブクエリでは、左側の表A（この例ではFROMで先に書いた表）の列を条件に使えます。',
  examples: [
    {
      heading: '顧客ごとの最新2件の注文を取る',
      body: 'customersの1行ごとに、サブクエリがその顧客の注文だけを新しい順に並べ、LIMIT 2で2件を取ります。青木さんは3件のうち最新の2件、佐藤さんは2件すべてが出ます。注文のない鈴木さんは、CROSS JOINなので結果に出ません。',
      code: 'SELECT c.name, o.ordered_on, o.amount\nFROM customers AS c\nCROSS JOIN LATERAL (\n  SELECT ordered_on, amount\n  FROM orders\n  WHERE customer_id = c.id\n  ORDER BY ordered_on DESC\n  LIMIT 2\n) AS o\nORDER BY c.id, o.ordered_on DESC;',
      resultTable: { headers: ['name', 'ordered_on', 'amount'], rows: [['青木', '2025-03-15', '2000'], ['青木', '2025-02-10', '5000'], ['佐藤', '2025-03-01', '2500'], ['佐藤', '2025-01-20', '4000']] },
      resultNote: 'WHERE customer_id = c.id のc.idが、左側の表customersの列です。LATERALがなければ、この参照はエラーになります。',
    },
    {
      heading: '注文のない顧客も残して、最新1件を取る',
      body: '注文のない顧客も一覧に残したいときは、LEFT JOIN LATERAL ... ON true を使います。サブクエリが0行でも左側の行が残るため、鈴木さんの注文日と金額はNULLになります。ON trueは「条件なしで結合する」という意味の決まり文句です。',
      code: 'SELECT c.name, o.ordered_on, o.amount\nFROM customers AS c\nLEFT JOIN LATERAL (\n  SELECT ordered_on, amount\n  FROM orders\n  WHERE customer_id = c.id\n  ORDER BY ordered_on DESC\n  LIMIT 1\n) AS o ON true\nORDER BY c.id;',
      resultTable: { headers: ['name', 'ordered_on', 'amount'], rows: [['青木', '2025-03-15', '2000'], ['佐藤', '2025-03-01', '2500'], ['鈴木', 'NULL', 'NULL']] },
      resultNote: '3人全員が出て、注文のない鈴木さんだけNULLになります。',
    },
  ],
  mistakes: [
    {
      title: 'LATERALを付け忘れる',
      body: 'LATERALなしのサブクエリは、左側の表の列を参照できません。c.idを使うと、FROM句の参照が無効だというエラーになります。サブクエリの中で左側の表の列を使うときは、必ずLATERALを付けます。',
      code: 'SELECT c.name, o.ordered_on\nFROM customers AS c\nCROSS JOIN (\n  SELECT ordered_on\n  FROM orders\n  WHERE customer_id = c.id\n  LIMIT 1\n) AS o;',
      error: 'invalid reference to FROM-clause entry for table "c"',
    },
    {
      title: 'LEFT JOIN LATERALでONを省略する',
      body: 'LEFT JOINにはONが必要です。LATERALでも同じで、条件が不要なときは ON true と書きます。省略すると構文エラーになります。',
      code: 'SELECT c.name, o.ordered_on\nFROM customers AS c\nLEFT JOIN LATERAL (\n  SELECT ordered_on\n  FROM orders\n  WHERE customer_id = c.id\n  LIMIT 1\n) AS o;',
      error: 'syntax error',
    },
  ],
  alternatives: [
    {
      heading: 'ROW_NUMBER()で書く',
      body: 'LATERALを使えないデータベースでは、ウィンドウ関数のROW_NUMBER()で顧客ごとの順位をつけ、2位までに絞る書き方で同じ結果を得られます。MySQLもバージョン8.0.14以降でLATERAL派生テーブルに対応しているため、新しい版ならLATERALも使えます。次のSQLはPostgreSQLで確認しており、1つ目の例と同じ4行が得られます。',
      code: 'SELECT name, ordered_on, amount\nFROM (\n  SELECT c.id AS customer_id, c.name,\n    o.ordered_on, o.amount,\n    ROW_NUMBER() OVER (\n      PARTITION BY c.id\n      ORDER BY o.ordered_on DESC\n    ) AS rn\n  FROM customers AS c\n  JOIN orders AS o ON o.customer_id = c.id\n) AS t\nWHERE rn <= 2\nORDER BY customer_id, ordered_on DESC;',
      resultTable: { headers: ['name', 'ordered_on', 'amount'], rows: [['青木', '2025-03-15', '2000'], ['青木', '2025-02-10', '5000'], ['佐藤', '2025-03-01', '2500'], ['佐藤', '2025-01-20', '4000']] },
    },
  ],
  faqs: [
    { question: 'LATERALは相関サブクエリと何が違いますか？', answer: '相関サブクエリはSELECTやWHEREの中で1つの値を返すのが基本です。LATERALはFROM句に置くため、複数の列と複数の行を返せ、通常のテーブルのように結合できます。' },
    { question: 'LATERALを使うと遅くなりますか？', answer: '左側の行ごとにサブクエリを実行する形になるため、行数が多いと遅くなることがあります。実際の速さはデータ量やインデックスで変わるので、この記事の小さな表では比べていません。' },
    { question: 'CROSS JOIN LATERALとカンマ区切りは同じですか？', answer: 'FROM 表A, LATERAL (...) のようにカンマで書いても結合できます。PostgreSQL公式ドキュメントでも、LATERALの前にJOINを書かない形が紹介されています。この記事ではJOINの種類が分かりやすい書き方を使いました。' },
  ],
  references: [
    { label: 'PostgreSQL公式：LATERALサブクエリ', url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-LATERAL', description: 'LATERALの仕様と使い方' },
    { label: 'PostgreSQL公式：ウィンドウ関数のチュートリアル', url: 'https://www.postgresql.org/docs/current/tutorial-window.html', description: 'ROW_NUMBER()などウィンドウ関数の基本' },
  ],
  related: ['inner-join', 'left-join', 'subquery', 'window-functions'],
  practice: [{ category: 'window-functions', label: 'ウィンドウ関数' }, { category: 'join', label: 'JOIN' }],
};

export const postgresqlFeatures: PgFeature[] = [distinctOn, filter, returning, onConflict, lateral];
export const postgresqlFeatureBySlug: Record<string, PgFeature> = Object.fromEntries(postgresqlFeatures.map((feature) => [feature.slug, feature]));
