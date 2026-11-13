import { buildExerciseEntries } from '../exerciseEntries';

const setup = `CREATE TABLE product_tags (id integer PRIMARY KEY, product text NOT NULL, tag text);
INSERT INTO product_tags VALUES (1,'りんご','果物'),(2,'りんご','国産'),(3,'りんご','果物'),(4,'みかん','果物'),(5,'みかん',NULL),(6,'バナナ','輸入'),(7,'ぶどう',NULL);`;

const ordersSetup = `CREATE TABLE customers (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE orders (id integer PRIMARY KEY, customer_id integer REFERENCES customers(id), item text, ordered_on date NOT NULL);
INSERT INTO customers VALUES (1,'青木商店'),(2,'北野物産'),(3,'中央商事');
INSERT INTO orders VALUES (1,1,'ペン','2026-01-05'),(2,1,'ノート','2026-01-20'),(3,1,'ペン','2026-01-31'),(4,1,'定規','2026-02-01'),(5,2,'ペン','2026-01-10'),(6,2,'ペン','2026-01-11'),(7,3,'ノート','2026-01-15'),(8,3,'テープ','2026-01-16'),(9,3,NULL,'2026-01-17');`;

export const entries = buildExerciseEntries({
  category: 'string-agg',
  tags: ['STRING_AGG', 'ARRAY_AGG'],
  setup,
  exercises: [
    {
      slug: 'string-agg-basic',
      title: 'STRING_AGG',
      description: '商品「りんご」のタグを、id順に「, 」（カンマと半角スペース）でつないだ1つの文字列として取得してください。別名は付けません。',
      sql: "SELECT string_agg(tag, ', ' ORDER BY id)\nFROM product_tags\nWHERE product = 'りんご';",
      columns: ['string_agg'],
      rows: [['果物, 国産, 果物']],
      hint: 'string_agg(列, 区切り文字)の引数の後ろに、ORDER BYを続けます。',
      explanation: 'りんごのタグはid順に果物、国産、果物の3件です。同じ「果物」が2回あっても、重複は除かずそのままつながります。',
    },
    {
      slug: 'string-agg-group',
      title: 'STRING_AGGとGROUP BY',
      description: '商品ごとに、タグをid順に「, 」でつないだ文字列を取得してください。商品名とタグの文字列の2列で、行順は問いません。別名は付けません。',
      sql: "SELECT product, string_agg(tag, ', ' ORDER BY id)\nFROM product_tags\nGROUP BY product;",
      columns: ['product', 'string_agg'],
      rows: [['りんご', '果物, 国産, 果物'], ['みかん', '果物'], ['バナナ', '輸入'], ['ぶどう', null]],
      hint: '商品ごとに1行にしたいので、GROUP BYに商品名の列を指定します。',
      explanation: 'みかんの2行のうちNULLのタグは連結されず「果物」だけです。ぶどうはNULLしかないので、結果もNULLです。',
    },
    {
      slug: 'string-agg-order-by',
      title: '集約内のORDER BY',
      description: '商品「りんご」のタグを、タグ名の降順に「, 」でつないだ1つの文字列として取得してください。',
      sql: "SELECT string_agg(tag, ', ' ORDER BY tag DESC)\nFROM product_tags\nWHERE product = 'りんご';",
      columns: ['string_agg'],
      rows: [['果物, 果物, 国産']],
      hint: '並べ替えは関数のカッコの中に書きます。降順はDESCです。',
      explanation: '降順では果物、果物、国産の順になります。id順（果物、国産、果物）とは異なり、並べ替えの指定で連結順が変わります。',
    },
    {
      slug: 'string-agg-distinct',
      title: 'STRING_AGGとDISTINCT',
      description: '商品「りんご」のタグを、重複を除いてタグ名の昇順に「, 」でつないだ1つの文字列として取得してください。',
      sql: "SELECT string_agg(DISTINCT tag, ', ' ORDER BY tag)\nFROM product_tags\nWHERE product = 'りんご';",
      columns: ['string_agg'],
      rows: [['国産, 果物']],
      hint: 'DISTINCTを引数の前に置き、ORDER BYにはDISTINCTと同じ列を使います。',
      explanation: '果物が2件ありますが1回だけになり、国産と果物が残ります。文字コード順で国産が先になります。',
    },
    {
      slug: 'array-agg-null',
      title: 'ARRAY_AGGとNULL',
      description: '商品「みかん」のタグを、id順の配列として1つ取得してください。NULLのタグも要素として残します。別名は付けません。',
      sql: "SELECT array_agg(tag ORDER BY id)\nFROM product_tags\nWHERE product = 'みかん';",
      columns: ['array_agg'],
      rows: [[['果物', 'NULL']]], // PGliteはtext配列中のNULLを文字列 'NULL' で返す
      hint: 'ARRAY_AGGはNULLも配列の要素に含めます。',
      explanation: 'みかんの2行は果物とNULLなので、配列は{果物,NULL}です。STRING_AGGなら「果物」だけになり、NULLの行があったことが分かりません。',
    },
    {
      slug: 'string-agg-coalesce',
      title: 'STRING_AGGとCOALESCE',
      description: '商品ごとに、タグをid順に「, 」でつないだ文字列を取得してください。タグがすべてNULLの商品は「(なし)」と表示します。列名は product と tags とし、行順は問いません。',
      sql: "SELECT product, COALESCE(string_agg(tag, ', ' ORDER BY id), '(なし)') AS tags\nFROM product_tags\nGROUP BY product;",
      columns: ['product', 'tags'],
      rows: [['りんご', '果物, 国産, 果物'], ['みかん', '果物'], ['バナナ', '輸入'], ['ぶどう', '(なし)']],
      hint: 'STRING_AGGの結果全体を、COALESCEで包みます。',
      explanation: 'ぶどうはタグがNULLの1行だけなのでSTRING_AGGの結果はNULLになり、COALESCEで「(なし)」に置き換わります。みかんは「果物」のまま変わりません。',
    },
    {
      slug: 'chapter-review-distinct-tags-having',
      title: '章末問題：STRING_AGG・DISTINCT・HAVING',
      description: 'タグ（NULLを除く）の種類が2つ以上ある商品について、商品名と、重複を除いてタグ名の昇順に「/」でつないだ文字列を取得してください。初期SQLを直します。行順は問いません。別名は付けません。',
      sql: "SELECT product, string_agg(DISTINCT tag, '/' ORDER BY tag)\nFROM product_tags\nGROUP BY product\nHAVING COUNT(DISTINCT tag) >= 2;",
      columns: ['product', 'string_agg'],
      rows: [['りんご', '国産/果物']],
      hint: '種類数はCOUNT(DISTINCT tag)で数えると、NULLも重複も数えません。',
      explanation: 'りんごは果物と国産の2種類なので残ります。みかんは行が2つでもNULLを除くと「果物」の1種類、バナナとぶどうも1種類以下なので除外されます。COUNT(*)では行数を数えてしまい、みかんが残ります。',
      starter: "SELECT product, string_agg(DISTINCT tag, '/' ORDER BY tag)\nFROM product_tags\nGROUP BY product\nHAVING COUNT(*) >= 2;",
      review: 'chapter review',
      requirements: ['タグを重複なしで昇順に「/」でつなぐ', 'NULLを除いたタグの種類数が2以上の商品だけに絞る', '商品ごとに1行で表示する'],
    },
    {
      slug: 'cumulative-review-orders-items',
      title: 'まとめ問題：STRING_AGG・JOIN・WHERE・GROUP BY・HAVING',
      description: '2026年1月（1月1日以上2月1日未満）の注文について、顧客ごとに購入した商品名を、重複を除いて商品名の昇順に「, 」でつないでください。購入した商品の種類（NULLを除く）が2つ以上の顧客だけを対象にし、顧客名と連結した文字列の2列を、顧客IDの昇順で取得します。別名は付けません。',
      sql: "SELECT customers.name, string_agg(DISTINCT orders.item, ', ' ORDER BY orders.item)\nFROM customers\nINNER JOIN orders ON orders.customer_id = customers.id\nWHERE orders.ordered_on >= DATE '2026-01-01'\n  AND orders.ordered_on < DATE '2026-02-01'\nGROUP BY customers.id, customers.name\nHAVING COUNT(DISTINCT orders.item) >= 2\nORDER BY customers.id;",
      columns: ['name', 'string_agg'],
      rows: [['青木商店', 'ノート, ペン'], ['中央商事', 'テープ, ノート']],
      hint: '期間はWHERE、種類数の条件はGROUP BYの後のHAVINGに書きます。',
      explanation: '青木商店は1月にペンとノート（2月1日の定規は期間外）なので2種類で残ります。北野物産はペンを2回買っただけで1種類のため除外します。中央商事はテープとノートで、NULLの商品は連結にも種類数にも入りません。',
      setup: ordersSetup,
      ordered: true,
      review: 'cumulative review',
      requirements: ['2026年1月の注文だけを対象にする', '顧客ごとに商品名を重複なしで昇順につなぐ', 'NULLを除く商品の種類が2つ以上の顧客だけに絞る', '顧客IDの昇順で表示する'],
    },
  ],
});
