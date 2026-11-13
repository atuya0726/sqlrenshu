import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, attrs jsonb NOT NULL);
INSERT INTO products VALUES
  (1, 'ノートPC', '{"brand":"Acme","price":98000,"specs":{"ram":16,"os":"Linux"},"tags":["pc","work"]}'),
  (2, 'マウス', '{"brand":"Boltix","price":2500,"tags":["accessory","work"]}'),
  (3, 'モニター', '{"brand":"Acme","price":32000,"specs":{"size":27},"tags":["display"]}'),
  (4, 'キーボード', '{"brand":"Boltix","price":6800,"tags":["accessory"]}');`,
  sources: ['SELECT id, name, attrs FROM products ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'jsonb',
  label: 'JSONB',
  title: 'PostgreSQLのJSONBとは？->と->>の違い・入れ子の取り出し・@>での検索',
  description: 'PostgreSQLのjsonb型を、元の表・SQL・実行結果で解説。->と->>の違い、#>>での入れ子の取り出し、数値へのキャスト、@>と?での検索、jsonb_array_elements_textで配列を行に展開する方法を学べます。',
  lead: 'jsonbは、JSON形式のデータをそのまま1つの列に保存できるPostgreSQLのデータ型です。商品ごとにブランド、価格、タグなど項目が違うデータを、列を増やさずに扱えます。->と->>で値を取り出し、@>で条件に合う行を探し、配列は行に展開して集計する、という流れで使い方を確認しましょう。標準SQLにもJSONを扱う構文はありますが、このページの演算子（->、->>、@>、?）は標準SQLの構文ではなく、PostgreSQLの書き方です。',
  sampleIntro: 'productsは商品1件が1行で、attrsがjsonb列です。brand（ブランド）、price（価格・円）、tags（タグの配列）が入り、ノートPCとモニターにはspecs（仕様）という入れ子のオブジェクトもあります。jsonbはキーを短い順、同じ長さなら辞書順に並べて保存するため、表示するとtagsが先頭に来ます。ORDER BYのないSQLの行順は保証されません。',
  sampleTables: [
    {
      caption: 'products：商品4件',
      headers: ["id","name","attrs"], rows: [["1","ノートPC","{\"tags\":[\"pc\",\"work\"],\"brand\":\"Acme\",\"price\":98000,\"specs\":{\"os\":\"Linux\",\"ram\":16}}"],["2","マウス","{\"tags\":[\"accessory\",\"work\"],\"brand\":\"Boltix\",\"price\":2500}"],["3","モニター","{\"tags\":[\"display\"],\"brand\":\"Acme\",\"price\":32000,\"specs\":{\"size\":27}}"],["4","キーボード","{\"tags\":[\"accessory\"],\"brand\":\"Boltix\",\"price\":6800}"]],
    },
  ],
  syntax: "SELECT name, attrs ->> 'brand' AS brand\nFROM products\nORDER BY id;",
  sections: [
    {
      heading: '->はjsonb、->>はtextで値を取り出す',
      body: "attrs -> 'brand'はキーbrandの値をjsonbのまま返し、attrs ->> 'brand'は同じ値をtextとして返します。この結果表では両方ともAcmeと表示されますが、->の実体はJSONの文字列（二重引用符つきの\"Acme\"）です。右辺をJSONとして書いた'\"Acme\"'と比べるとtrueになることで、jsonbのままだと分かります。WHEREで普通の文字列と比べたり、画面に表示したりする用途では->>を使います。さらに別のキーをたどりたいときは、jsonbを返す->でつなぎます。存在しないキーを指定してもエラーにはならず、NULLが返ります。",
      code: "SELECT\n  name,\n  attrs -> 'brand' AS brand_json,\n  attrs ->> 'brand' AS brand_text,\n  attrs -> 'brand' = '\"Acme\"' AS json_is_acme\nFROM products\nORDER BY id;",
      resultTable: { headers: ["name","brand_json","brand_text","json_is_acme"], rows: [["ノートPC","Acme","Acme","true"],["マウス","Boltix","Boltix","false"],["モニター","Acme","Acme","true"],["キーボード","Boltix","Boltix","false"]] },
    },
    {
      heading: '#>>と連続した->で入れ子の値を取り出す',
      body: "specsの中のosのように入れ子になった値は、attrs #>> '{specs,os}'とキーの経路を配列リテラルで渡すと、textで取り出せます。attrs -> 'specs' ->> 'os'のように、途中は->、最後だけ->>でつないでも同じ結果です。途中のキーがない商品（マウス、キーボード）や、osキーがない商品（モニター）は、エラーではなくNULLになります。経路が深いときは#>>、1〜2段なら連続した->が読みやすくなります。",
      code: "SELECT\n  name,\n  attrs #>> '{specs,os}' AS os_path,\n  attrs -> 'specs' ->> 'os' AS os_chain\nFROM products\nORDER BY id;",
      resultTable: { headers: ["name","os_path","os_chain"], rows: [["ノートPC","Linux","Linux"],["マウス","NULL","NULL"],["モニター","NULL","NULL"],["キーボード","NULL","NULL"]] },
    },
    {
      heading: '->>の結果は数値にキャストして比べる',
      body: "->>で取り出した値は、元が数値でもtextです。価格を数値として比べるには、(attrs ->> 'price')::integerのようにキャストします。5000円以上の商品は、ノートPC、モニター、キーボードの3件です。マウス（2500円）は除かれます。キャストを忘れて文字列のまま比べると、辞書順の比較になり結果が変わります（よくある間違いで確認します）。",
      code: "SELECT id, name\nFROM products\nWHERE (attrs ->> 'price')::integer >= 5000\nORDER BY id;",
      resultTable: { headers: ["id","name"], rows: [["1","ノートPC"],["3","モニター"],["4","キーボード"]] },
    },
    {
      heading: '@>で指定した値を含む行を探す',
      body: "attrs @> '{\"tags\":[\"work\"]}'は、attrsの中にtagsが「workを含む配列」として入っている行を探す、包含検索です。右辺もjsonbとして書き、配列は要素を含んでいれば一致します。ノートPCとマウスが該当し、tagsにworkがないモニターとキーボードは除かれます。キーと値の組を複数並べると、すべてを満たす行だけが残ります。値の取り出しよりも、条件指定を簡潔に書きたいときに向いています。",
      code: "SELECT id, name\nFROM products\nWHERE attrs @> '{\"tags\":[\"work\"]}'\nORDER BY id;",
      resultTable: { headers: ["id","name"], rows: [["1","ノートPC"],["2","マウス"]] },
    },
    {
      heading: '?でキーが存在する行を探す',
      body: "attrs ? 'specs'は、最上位にspecsというキーがあるかをtrue・falseで調べます。ノートPCとモニターが該当します。?は最上位のキーだけを調べ、入れ子の中のキー（specsの中のsizeなど）は対象外です。キーがあるかだけを知りたく、値は問わないときに使います。複数のキーのうちどれか1つでもあれば?|、すべてあれば?&も使えます。",
      code: "SELECT id, name\nFROM products\nWHERE attrs ? 'specs'\nORDER BY id;",
      resultTable: { headers: ["id","name"], rows: [["1","ノートPC"],["3","モニター"]] },
    },
    {
      heading: 'jsonb_array_elements_textで配列を行に展開する',
      body: "tagsのような配列は、jsonb_array_elements_text(attrs -> 'tags')で、要素ごとに1行へ展開できます。FROMに並べると、商品の行と展開した行が組み合わされ、ノートPCは2行、モニターは1行になります。展開後はWHEREやGROUP BYで普通の列と同じように扱えます。textではなくjsonbのまま取り出す場合はjsonb_array_elementsを使います。",
      code: "SELECT p.name, t.tag\nFROM products AS p, jsonb_array_elements_text(p.attrs -> 'tags') AS t(tag)\nORDER BY p.id, t.tag;",
      resultTable: { headers: ["name","tag"], rows: [["ノートPC","pc"],["ノートPC","work"],["マウス","accessory"],["マウス","work"],["モニター","display"],["キーボード","accessory"]] },
    },
  ],
  mistakes: [
    {
      title: '->>の結果を数値と比べたつもりで文字列比較になる',
      body: "->>はtextを返すため、attrs ->> 'price' >= '5000'は文字列の辞書順比較です。'32000'は先頭の3が5より小さいので除かれ、'6800'や'98000'は残ります。モニター（32000円）が漏れるので、数値で比べるときは必ず::integerや::numericにキャストします。なお、->の結果（jsonb）と'Acme'のような普通の文字列を=で比べようとすると、右辺がJSONとして不正なためエラーになります。文字列と比べるなら->>を使います。",
      code: "SELECT id, name\nFROM products\nWHERE attrs ->> 'price' >= '5000'\nORDER BY id;",
    },
  ],
  notes: [
    {
      title: 'jsonとjsonbの違い',
      body: 'PostgreSQLにはjsonとjsonbの2つの型があります。jsonは入力した文字列をそのまま保存するため、空白、キーの順序、重複したキーも残ります。jsonbは解析した後の形式で保存し、空白や順序を保持せず、重複キーは最後の値だけを残します。そのかわり検索が速く、GINインデックスも使えます。公式ドキュメントも、特別な事情がなければjsonbを使うことを勧めています。@>や?はjsonbだけの演算子です。',
      code: "SELECT\n  '{\"b\": 1,  \"a\": 2}'::json AS as_json,\n  '{\"b\": 1,  \"a\": 2}'::jsonb AS as_jsonb;",
    },
    {
      title: '標準SQLや他のDBとの違い',
      body: 'JSONを扱う構文は標準SQLにもあり、PostgreSQL 17からはJSON_VALUEやJSON_QUERYも使えます。ただし、->、->>、@>、?といった演算子は標準SQLにはなく、jsonb型や@>、?はPostgreSQL固有です。MySQLやSQLiteにも->、->>はありますが、MySQLの->は$.nameのようなJSONパスを右辺に取るなど、PostgreSQLとは仕様が異なります。他のDBのSQLをそのまま移すことはできません。',
    },
    {
      title: '頻繁に検索するキーは列に出すことも検討する',
      body: 'jsonbは項目が不定のデータに向いていますが、全行で必ず存在し、よく絞り込む値（このページのpriceなど）は、通常の列にしたほうが型やNOT NULL制約を使えて扱いやすくなります。jsonbを検索する場合は、@>や?に対応するGINインデックスを作ると、大量の行でも検索を速くできます。',
    },
  ],
  faqs: [
    {
      question: '->と->>はどう使い分けますか？',
      answer: "->はjsonbを返すので、さらに->でたどったり、@>で比べたりするときに使います。->>はtextを返すので、画面に表示する、文字列と比べる、数値へキャストする、といった最終的な値の取り出しに使います。",
    },
    {
      question: '存在しないキーを取り出すとエラーになりますか？',
      answer: '->、->>、#>>は、キーや経路が存在しなくてもエラーにならずNULLを返します。そのため、キー名を打ち間違えても結果が空になるだけで、気づきにくい点に注意してください。',
    },
    {
      question: 'jsonbの中の数値を合計するにはどうしますか？',
      answer: "->>でtextとして取り出し、::integerや::numericにキャストしてからSUMに渡します。例えばSUM((attrs ->> 'price')::integer)のように書きます。",
    },
    {
      question: 'キーの順序が保持されないのはなぜですか？',
      answer: 'jsonbは検索を速くするため、解析済みの形式で保存します。その際にキーを短い順、同じ長さなら辞書順に並べ替えるので、入力時の順序は残りません。順序を保存したい特別な事情があるときだけjsonを使います。',
    },
  ],
  references: [
    { label: 'PostgreSQL公式：JSON型', url: 'https://www.postgresql.org/docs/current/datatype-json.html', description: 'jsonとjsonbの違い、jsonbの包含・存在判定、インデックスの考え方' },
    { label: 'PostgreSQL公式：JSON関数と演算子', url: 'https://www.postgresql.org/docs/current/functions-json.html', description: '->、->>、#>>、@>、?、jsonb_array_elements_textの仕様' },
  ],
  related: ['select', 'where', 'cast', 'array', 'group-by'],
  practiceCategory: 'jsonb',
};
