import { buildExerciseEntries } from '../exerciseEntries';

const setup = `CREATE TABLE product_prices (id integer PRIMARY KEY, product text NOT NULL, old_price integer, new_price integer);
CREATE TABLE members (id integer PRIMARY KEY, name text NOT NULL, area_code text, active boolean NOT NULL);
CREATE TABLE areas (code text, label text NOT NULL);
INSERT INTO product_prices VALUES (1,'ペン',100,100),(2,'ノート',200,250),(3,'定規',NULL,NULL),(4,'付箋',NULL,150),(5,'のり',300,NULL),(6,'クリップ',0,NULL);
INSERT INTO members VALUES (1,'青木','A',true),(2,'宮本','A',true),(3,'大橋','A',true),(4,'伊藤','B',true),(5,'上田',NULL,true),(6,'江口',NULL,true),(7,'西村',NULL,false),(8,'加藤','C',true);
INSERT INTO areas VALUES ('A','東日本'),('B','西日本'),(NULL,'未設定');`;

export const entries = buildExerciseEntries({
  category: 'is-distinct-from',
  tags: ['IS DISTINCT FROM', 'IS NOT DISTINCT FROM', 'NULL'],
  setup,
  exercises: [
    {
      slug: 'distinct-boolean', title: 'IS DISTINCT FROM',
      description: '商品（product_prices）ごとに、idと、旧価格と新価格が異なるかどうかの真偽値をchangedという列名で取得してください。NULLは1つの値として扱います。idの昇順に並べます。',
      sql: 'SELECT id, old_price IS DISTINCT FROM new_price AS changed\nFROM product_prices\nORDER BY id;',
      columns: ['id', 'changed'], rows: [[1, false], [2, true], [3, false], [4, true], [5, true], [6, true]], ordered: true,
      hint: '2つの列をIS DISTINCT FROMでつないだ式を、そのままSELECTに書きます。',
      explanation: 'ペン（100と100）と定規（NULLとNULL）が同じなのでfalse、それ以外は異なるのでtrueです。<>を使うとNULLが絡む行の結果がNULLになり、falseでもtrueでもなくなります。',
    },
    {
      slug: 'not-equal-drops-null', title: '<>とNULL',
      description: '旧価格と新価格の両方に値が入っていて、かつ異なる商品の全列を、不等号の比較（<>）で取得してください。NULLの行は対象外です。行順は問いません。',
      sql: 'SELECT *\nFROM product_prices\nWHERE old_price <> new_price;',
      columns: ['id', 'product', 'old_price', 'new_price'], rows: [[2, 'ノート', 200, 250]],
      hint: '<>は、どちらかがNULLの行では結果がNULLになり、WHEREで残りません。',
      explanation: '両方に値があって異なるのはノート（200と250）だけです。付箋・のり・クリップはNULLを含むため、<>では結果がNULLとなって除かれます。',
    },
    {
      slug: 'detect-changes', title: 'IS DISTINCT FROMで変更検知',
      description: '旧価格と新価格が異なる商品の全列を取得してください。一方だけがNULLの商品（新たに設定、または設定の取り消し）も、変更として含めます。行順は問いません。',
      sql: 'SELECT *\nFROM product_prices\nWHERE old_price IS DISTINCT FROM new_price;',
      columns: ['id', 'product', 'old_price', 'new_price'], rows: [[2, 'ノート', 200, 250], [4, '付箋', null, 150], [5, 'のり', 300, null], [6, 'クリップ', 0, null]],
      hint: 'WHEREの条件に、old_priceとnew_priceのIS DISTINCT FROMを書きます。',
      explanation: 'ノートの値上げに加えて、付箋（NULLから150）、のり（300からNULL）、クリップ（0からNULL）の4行が変更です。ペンと、両方NULLの定規は変わっていません。',
    },
    {
      slug: 'not-distinct-unchanged', title: 'IS NOT DISTINCT FROM',
      description: '旧価格と新価格が同じ商品（変更のない商品）の全列を取得してください。両方がNULLの商品も「同じ」として含めます。行順は問いません。',
      sql: 'SELECT *\nFROM product_prices\nWHERE old_price IS NOT DISTINCT FROM new_price;',
      columns: ['id', 'product', 'old_price', 'new_price'], rows: [[1, 'ペン', 100, 100], [3, '定規', null, null]],
      hint: '同じ値、またはNULLどうしを「同じ」とみなす比較は、IS NOT DISTINCT FROMです。',
      explanation: 'ペン（100と100）と定規（NULLとNULL）が残ります。old_price = new_priceだと、NULLとNULLの比較がNULLになるため、定規が除かれてペンだけになります。',
    },
    {
      slug: 'distinct-from-constant', title: '定数との比較',
      description: '新価格が150円ではない商品の全列を取得してください。新価格が未設定（NULL）の商品も「150円ではない」ものとして含めます。行順は問いません。',
      sql: 'SELECT *\nFROM product_prices\nWHERE new_price IS DISTINCT FROM 150;',
      columns: ['id', 'product', 'old_price', 'new_price'], rows: [[1, 'ペン', 100, 100], [2, 'ノート', 200, 250], [3, '定規', null, null], [5, 'のり', 300, null], [6, 'クリップ', 0, null]],
      hint: '比較の相手に定数150を置いても、IS DISTINCT FROMを使えます。',
      explanation: '付箋（新価格150）だけが除かれ、5行が残ります。new_price <> 150だと、NULLの定規・のり・クリップも落ちてペンとノートの2行になります。',
    },
    {
      slug: 'join-null-key', title: '結合条件のIS NOT DISTINCT FROM',
      description: '会員（members）と地域（areas）を、area_codeとcodeが同じものどうしで結合し、会員の名前（name）と地域の名前（label）をこの順に取得してください。area_codeがNULLの会員は、codeがNULLの地域（未設定）に対応させます。会員のidの昇順に並べます。',
      sql: 'SELECT members.name, areas.label\nFROM members\nJOIN areas ON members.area_code IS NOT DISTINCT FROM areas.code\nORDER BY members.id;',
      columns: ['name', 'label'],
      rows: [['青木', '東日本'], ['宮本', '東日本'], ['大橋', '東日本'], ['伊藤', '西日本'], ['上田', '未設定'], ['江口', '未設定'], ['西村', '未設定']],
      ordered: true,
      hint: 'ONの条件を=ではなく、NULLどうしも対応させる比較にします。',
      explanation: 'area_codeがNULLの上田・江口・西村が「未設定」に対応します。=で結合すると3人は消えます。加藤（コードC）は地域に存在しないため、内部結合では結果に出ません。',
    },
    {
      slug: 'chapter-review-count-changes', title: '章末問題：IS DISTINCT FROM・IS NOT DISTINCT FROM・集計',
      description: '商品の価格について、旧価格と新価格が異なる商品の件数をchanged、同じ商品の件数をunchangedという列名で、1行で取得してください。NULLは1つの値として扱い、列の順はchanged、unchangedです。',
      sql: 'SELECT\n  COUNT(*) FILTER (WHERE old_price IS DISTINCT FROM new_price) AS changed,\n  COUNT(*) FILTER (WHERE old_price IS NOT DISTINCT FROM new_price) AS unchanged\nFROM product_prices;',
      columns: ['changed', 'unchanged'], rows: [[4, 2]],
      starter: 'SELECT\n  COUNT(*) FILTER (WHERE old_price <> new_price) AS changed,\n  COUNT(*) FILTER (WHERE old_price = new_price) AS unchanged\nFROM product_prices;',
      hint: '2つのFILTERの条件に、それぞれIS DISTINCT FROMとIS NOT DISTINCT FROMを書きます。',
      explanation: '変更ありはノート・付箋・のり・クリップの4件、変更なしはペン・定規の2件で、合計6件です。<>と=で数えると1件と1件になり、合計が商品数の6件になりません。',
      review: 'chapter review',
      requirements: ['IS DISTINCT FROMで変更のある商品を数える', 'IS NOT DISTINCT FROMで変更のない商品を数える', '2つの件数を1行で返す', 'NULLの行を件数から落とさない'],
    },
    {
      slug: 'cumulative-review-join-group', title: 'まとめ問題：IS NOT DISTINCT FROM・JOIN・WHERE・GROUP BY・ORDER BY',
      description: '在籍中（activeがtrue）の会員を、地域（areas）の名前（label）ごとに数え、labelと人数をこの順に取得してください。area_codeがNULLの会員は、codeがNULLの地域（未設定）に対応させます。人数の多い順に並べます。別名は付けません。',
      sql: 'SELECT areas.label, COUNT(*)\nFROM members\nJOIN areas ON members.area_code IS NOT DISTINCT FROM areas.code\nWHERE members.active = true\nGROUP BY areas.label\nORDER BY COUNT(*) DESC;',
      columns: ['label', 'count'], rows: [['東日本', 3], ['未設定', 2], ['西日本', 1]], ordered: true,
      hint: 'NULLを対応させるJOINのあと、WHEREで在籍中に絞ってから、地域名ごとに数えます。',
      explanation: '在籍中は東日本3人（青木・宮本・大橋）、未設定2人（上田・江口）、西日本1人（伊藤）です。退会済みの西村を含めると未設定が3人になり、東日本と並びます。加藤はコードCが地域表にないため数えられません。',
      review: 'cumulative review',
      requirements: ['IS NOT DISTINCT FROMでNULLのarea_codeを「未設定」に対応させる', 'WHEREで在籍中の会員だけに絞る', 'GROUP BYで地域名ごとの人数を数える', '人数の多い順に並べる'],
    },
  ],
});
