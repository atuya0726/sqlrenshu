import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE product_tags (id integer PRIMARY KEY, product text NOT NULL, tag text);
INSERT INTO product_tags VALUES (1,'りんご','果物'),(2,'りんご','国産'),(3,'りんご','果物'),(4,'みかん','果物'),(5,'みかん',NULL),(6,'バナナ','輸入'),(7,'ぶどう',NULL);`,
  sources: ['SELECT * FROM product_tags ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'string-agg',
  label: 'STRING_AGG・ARRAY_AGG',
  title: 'SQLのSTRING_AGG・ARRAY_AGGとは？複数行を1行にまとめる使い方と順序・重複・NULL',
  description: 'PostgreSQLのSTRING_AGGとARRAY_AGGを、商品タグの表と実行結果で解説。区切り文字つきの連結、集約内のORDER BY、DISTINCT、NULLの扱い、GROUP_CONCATやLISTAGGとの対応を学べます。',
  lead: 'STRING_AGGは、複数行の文字列を区切り文字でつないで1つの文字列にする集約関数です。ARRAY_AGGは同じように複数行を1つの配列にまとめます。商品ごとのタグを1行にまとめながら、順序、重複、NULLの扱いを確認しましょう。',
  sampleIntro: 'product_tagsは1行が「商品1つにつけたタグ1つ」を表します。productは商品名、tagはタグで、未設定の行はNULLです。りんごには「果物」が2回付いており、みかんには1件だけNULLがあり、ぶどうはタグがNULLの1行だけです。',
  sampleTables: [
    {
      caption: 'product_tags：商品タグ7件',
      headers: ['id', 'product', 'tag'],
      rows: [
        ['1', 'りんご', '果物'],
        ['2', 'りんご', '国産'],
        ['3', 'りんご', '果物'],
        ['4', 'みかん', '果物'],
        ['5', 'みかん', 'NULL'],
        ['6', 'バナナ', '輸入'],
        ['7', 'ぶどう', 'NULL'],
      ],
    },
  ],
  syntax: "SELECT string_agg(tag, ', ' ORDER BY id)\nFROM product_tags;",
  sections: [
    {
      heading: 'STRING_AGGで複数行を区切り文字つきの1行にする',
      body: "string_agg(値, 区切り文字)は、各行の値を区切り文字でつないだ1つの文字列を返します。GROUP BYがなければ全行が対象で、結果は1行です。ここではりんごの3件を「, 」でつなぎます。連結の順序は集約の中のORDER BYで指定しないと保証されないため、ここではid順にしています。",
      code: "SELECT string_agg(tag, ', ' ORDER BY id)\nFROM product_tags\nWHERE product = 'りんご';",
      resultTable: { headers: ['string_agg'], rows: [['果物, 国産, 果物']] },
    },
    {
      heading: 'GROUP BYで商品ごとにまとめる',
      body: "GROUP BYと組み合わせると、グループごとに1つの文字列ができます。りんごは3件、みかんは1件、バナナは1件が連結されます。みかんは2行ありますが、1行はタグがNULLなので連結に入らず「果物」だけになります。ぶどうはNULLしかないので、結果もNULLです。",
      code: "SELECT product, string_agg(tag, ', ' ORDER BY id)\nFROM product_tags\nGROUP BY product\nORDER BY min(id);",
      resultTable: {
        headers: ['product', 'string_agg'],
        rows: [['りんご', '果物, 国産, 果物'], ['みかん', '果物'], ['バナナ', '輸入'], ['ぶどう', 'NULL']],
      },
    },
    {
      heading: '集約の中のORDER BYで連結順を決める',
      body: "ORDER BYは関数のカッコの中、引数の後ろに書きます。ここではタグ名の降順にしており、元のid順（果物、国産、果物）とは別の順序になります。外側のORDER BYは出力行の順序を決めるだけで、連結される値の順序には影響しません。",
      code: "SELECT string_agg(tag, ', ' ORDER BY tag DESC)\nFROM product_tags\nWHERE product = 'りんご';",
      resultTable: { headers: ['string_agg'], rows: [['果物, 果物, 国産']] },
    },
    {
      heading: 'DISTINCTで重複した値を1つにする',
      body: "string_agg(DISTINCT ...)は、同じ値を1回だけ連結します。りんごの「果物」は2件ありますが、結果には1回だけ現れます。DISTINCTと集約内のORDER BYを併用する場合、ORDER BYにはDISTINCTで指定した式と同じものしか書けません。",
      code: "SELECT string_agg(DISTINCT tag, ', ' ORDER BY tag)\nFROM product_tags\nWHERE product = 'りんご';",
      resultTable: { headers: ['string_agg'], rows: [['国産, 果物']] },
    },
    {
      heading: 'NULLはSTRING_AGGでは無視され、ARRAY_AGGでは残る',
      body: "STRING_AGGはNULLの値を連結から除きます。一方ARRAY_AGGはNULLも配列の要素として残します。みかんの2行を比べると、string_aggは「果物」だけ、array_aggは{果物,NULL}になります。NULLの有無まで保ちたいときや、後でアプリ側で配列として扱いたいときはARRAY_AGGが向きます。",
      code: "SELECT string_agg(tag, ', ' ORDER BY id) AS joined,\n       array_agg(tag ORDER BY id) AS tags\nFROM product_tags\nWHERE product = 'みかん';",
      resultTable: { headers: ['joined', 'tags'], rows: [['果物', '{果物,NULL}']] },
    },
    {
      heading: 'すべてNULLのグループにはCOALESCEで代わりの文字を出す',
      body: "対象の値がすべてNULLのグループでは、STRING_AGGの結果もNULLです。画面や帳票で空欄にしたくないときは、COALESCEで代わりの文字を指定します。ぶどうは「(なし)」になり、他の商品の結果は変わりません。",
      code: "SELECT product,\n       COALESCE(string_agg(tag, ', ' ORDER BY id), '(なし)') AS tags\nFROM product_tags\nGROUP BY product\nORDER BY min(id);",
      resultTable: {
        headers: ['product', 'tags'],
        rows: [['りんご', '果物, 国産, 果物'], ['みかん', '果物'], ['バナナ', '輸入'], ['ぶどう', '(なし)']],
      },
    },
  ],
  mistakes: [
    {
      title: '集約内のORDER BYを省くと連結順が保証されない',
      body: "ORDER BYを書かないSTRING_AGGやARRAY_AGGは、行を読んだ順に連結します。この順序は実行のたびに同じとは限らず、データ更新や実行計画で変わることがあります。結果の順序が意味を持つ場合は、必ず集約の中にORDER BYを書きます。",
      code: "SELECT string_agg(tag, ', ' ORDER BY id)\nFROM product_tags\nWHERE product = 'りんご';",
    },
  ],
  notes: [
    {
      title: '他のDBのGROUP_CONCAT・LISTAGGとの対応',
      body: "MySQLのGROUP_CONCAT、OracleのLISTAGGが同じ役割です。PostgreSQLではSTRING_AGGを使い、区切り文字は第2引数、並び順は集約の中のORDER BYで指定します。MySQLのように区切り文字を省略して既定値を使うことはできません。配列にまとめたいときは、PostgreSQL固有のARRAY_AGGを使います。",
    },
    {
      title: '配列を文字列にするARRAY_TO_STRING',
      body: "ARRAY_AGGで作った配列は、ARRAY_TO_STRINGで区切り文字つきの文字列に変換できます。NULL要素は第3引数を指定しない限り出力から省かれるため、NULLを無視するSTRING_AGGとほぼ同じ結果になります。",
      code: "SELECT array_to_string(array_agg(tag ORDER BY id), ', ')\nFROM product_tags\nWHERE product = 'みかん';",
    },
  ],
  faqs: [
    {
      question: 'STRING_AGGの区切り文字を省略できますか？',
      answer: "できません。string_agg(値, 区切り文字)の2引数が必須です。区切りが不要なら空文字''を指定します。",
    },
    {
      question: 'STRING_AGGは数値の列にも使えますか？',
      answer: "引数はtext（またはbytea）です。数値の列は::textなどで文字列へ変換してから渡します。",
    },
    {
      question: 'ARRAY_AGGとSTRING_AGGはどう使い分けますか？',
      answer: "表示用に1つの文字列へまとめるならSTRING_AGG、後続の処理で要素として扱ったりNULLも残したりするならARRAY_AGGです。みかんの例では、STRING_AGGは「果物」、ARRAY_AGGは{果物,NULL}になります。",
    },
    {
      question: '対象の行が0件のときの結果は？',
      answer: "STRING_AGGもARRAY_AGGもNULLを返します。COUNTのように0にはなりません。空の配列が必要なときはCOALESCEで補います。",
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：集約関数',
      url: 'https://www.postgresql.org/docs/current/functions-aggregate.html',
      description: 'string_aggとarray_aggの引数、NULLの扱い、対象が0行のときの結果',
    },
    {
      label: 'PostgreSQL公式：集約式',
      url: 'https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES',
      description: '集約内のORDER BYとDISTINCTの書き方',
    },
  ],
  related: ['group-by', 'coalesce', 'string-functions', 'array', 'select'],
  practiceCategory: 'string-agg',
};
