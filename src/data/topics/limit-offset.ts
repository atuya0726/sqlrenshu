import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE items (id integer PRIMARY KEY, name text NOT NULL, price integer NOT NULL);
INSERT INTO items VALUES (1,'ノート',300),(2,'ペン',150),(3,'定規',300),(4,'消しゴム',100),(5,'付箋',200),(6,'鉛筆',150),(7,'ファイル',400),(8,'ハサミ',300);`,
  sources: ['SELECT * FROM items ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'limit-offset',
  label: 'LIMIT・OFFSET',
  title: 'SQLのLIMITとOFFSETとは？上位N件・ページング・同値の並び順を解説',
  description: 'SQLのLIMIT・OFFSETとFETCH FIRSTをPostgreSQLの元の表・SQL・結果表で解説。上位N件の取得、ページング、ORDER BYがないと結果が不定になる理由、同値のタイブレーク、大きなOFFSETが遅い理由とキーセット方式を学べます。',
  lead: 'LIMITは返す行数の上限を決め、OFFSETは先頭から何行を飛ばすかを決めます。上位N件の取得や、1ページ3件ずつの一覧表示に使います。文房具8件の表で、ORDER BYとの組み合わせ、同額の商品があるときに順序を一意にする方法、標準SQLのFETCH FIRSTまで確認しましょう。',
  sampleIntro: 'itemsは商品を保存した表で、1行が商品1件です。priceは価格（円）です。300円の商品が3件（ノート・定規・ハサミ）、150円の商品が2件（ペン・鉛筆）あり、同額の行をどう並べるかが後半の論点になります。この表のidは重複しない値です。',
  sampleTables: [
    {
      caption: 'items：商品8件（priceは価格・円）',
      headers: ['id', 'name', 'price'],
      rows: [
        ['1', 'ノート', '300'],
        ['2', 'ペン', '150'],
        ['3', '定規', '300'],
        ['4', '消しゴム', '100'],
        ['5', '付箋', '200'],
        ['6', '鉛筆', '150'],
        ['7', 'ファイル', '400'],
        ['8', 'ハサミ', '300'],
      ],
    },
  ],
  syntax: 'SELECT *\nFROM items\nORDER BY id\nLIMIT 3;',
  sections: [
    {
      heading: 'LIMITで先頭の3件だけ取り出す',
      body: 'LIMITの後ろに件数を書くと、結果の先頭からその件数までに絞れます。idの昇順に並べてLIMIT 3とすると、idが1・2・3の3行が返ります。表に8件あっても返るのは3件です。表の件数がLIMITより少ない場合は、ある分だけが返ります。LIMITは必ずORDER BYの後ろに書きます。',
      code: 'SELECT *\nFROM items\nORDER BY id\nLIMIT 3;',
      resultTable: { headers: ['id', 'name', 'price'], rows: [['1', 'ノート', '300'], ['2', 'ペン', '150'], ['3', '定規', '300']] },
    },
    {
      heading: 'OFFSETで先頭の行を飛ばしてページングする',
      body: 'OFFSETは、返す前に飛ばす行数です。1ページ3件とすると、1ページ目はOFFSET 0、2ページ目はOFFSET 3、3ページ目はOFFSET 6です。ここではLIMIT 3 OFFSET 3で、idが4・5・6の行を取り出します。OFFSETで飛ばした行はLIMITの件数に含まれません。ページ番号pのOFFSETは（p - 1）× 件数で求められます。',
      code: 'SELECT *\nFROM items\nORDER BY id\nLIMIT 3 OFFSET 3;',
      resultTable: { headers: ['id', 'name', 'price'], rows: [['4', '消しゴム', '100'], ['5', '付箋', '200'], ['6', '鉛筆', '150']] },
    },
    {
      heading: '価格の高い上位3件を取り出し、同額はidで順序を決める',
      body: '上位N件は、ORDER BYで並べ替えてからLIMITで切ります。ところがpriceの降順だけだと、300円の3件（ノート・定規・ハサミ）の順序が決まりません。400円のファイルの次に、この3件のうちどれが2位と3位に入るかが実行ごとに変わる可能性があります。ORDER BY price DESC, idのように重複しない列を最後に足すと、順序が一意になります。結果はファイル、ノート、定規です。',
      code: 'SELECT *\nFROM items\nORDER BY price DESC, id\nLIMIT 3;',
      resultTable: { headers: ['id', 'name', 'price'], rows: [['7', 'ファイル', '400'], ['1', 'ノート', '300'], ['3', '定規', '300']] },
    },
    {
      heading: '標準SQLのFETCH FIRST n ROWS ONLYで書く',
      body: 'LIMITはPostgreSQLなどで使える書き方で、標準SQLでは OFFSET n ROWS と FETCH FIRST n ROWS ONLY を使います。PostgreSQLは両方に対応しています。次のSQLは、価格の高い順（同額はid順）に並べた4番目から3件を取り、8（ハサミ）、5（付箋）、2（ペン）を返します。LIMIT 3 OFFSET 3と同じ意味で、標準SQLの書き方なので、ほかのDBへ移す場合の候補になります（対応状況はDBごとに確認が必要です）。',
      code: 'SELECT *\nFROM items\nORDER BY price DESC, id\nOFFSET 3 ROWS\nFETCH FIRST 3 ROWS ONLY;',
      resultTable: { headers: ['id', 'name', 'price'], rows: [['8', 'ハサミ', '300'], ['5', '付箋', '200'], ['2', 'ペン', '150']] },
    },
    {
      heading: '最後のページは件数が足りなくなる',
      body: '8件を3件ずつ表示すると、3ページ目は2件しかありません。LIMIT 3 OFFSET 6は、7番目と8番目の行だけを返します。OFFSETが総件数以上だと、0行が返ります。ページング画面では、件数が足りないページや空のページが出ることを想定しておきます。ORDER BYで順序を固定していないと、ページをまたいで同じ行が重複したり、行が抜けたりする原因になります。',
      code: 'SELECT *\nFROM items\nORDER BY id\nLIMIT 3 OFFSET 6;',
      resultTable: { headers: ['id', 'name', 'price'], rows: [['7', 'ファイル', '400'], ['8', 'ハサミ', '300']] },
    },
  ],
  mistakes: [
    {
      title: 'ORDER BYなしのLIMITは、どの行が返るか保証されない',
      body: 'ORDER BYがないSELECTは行の順序が決まらないため、LIMITで切ると「どの3件か」も不定です。手元で毎回同じ結果に見えても、データの更新やプランの変化で変わります。ページングでLIMITやOFFSETの値を変えると、別の実行計画になり、行の重複や抜けが起きることもあります。必ずORDER BYを付け、同値がありうる列だけで並べるときは重複しない列を最後に足します。',
      code: 'SELECT *\nFROM items\nLIMIT 3;',
    },
  ],
  notes: [
    {
      title: '大きなOFFSETが遅い理由とキーセット方式',
      body: 'OFFSETで飛ばす行も、サーバーはいったん計算してから捨てるため、OFFSETが大きいほど処理が増えます（公式ドキュメントに記載があります）。深いページを何度も読む画面では、前のページの最後の値を覚えておき、それより後ろだけを取るキーセット方式がよく使われます。次の例は、前のページの最後のidが3だったとして、その続きの3件を取ります。この方式には並べる列が重複しないことが必要で、価格順など複数列で並べる場合は条件も複数列で書きます。キーセット方式の説明は公式ドキュメントの仕様ではなく、一般的な実装手法です。',
      code: 'SELECT *\nFROM items\nWHERE id > 3\nORDER BY id\nLIMIT 3;',
    },
    {
      title: 'FETCH FIRST ... WITH TIESで同値を打ち切らずに含める',
      body: '標準SQLのFETCH FIRSTには、最後の行と同値の行も含めるWITH TIESがあります。ORDER BYが必須です。priceの降順で2件を指定すると、400円のファイルに加えて、2番目と同額の300円の3件も返り、合計4行になります。同値の行は件数の上限を超えて返る点に注意してください。',
      code: 'SELECT *\nFROM items\nORDER BY price DESC\nFETCH FIRST 2 ROWS WITH TIES;',
    },
  ],
  faqs: [
    {
      question: 'LIMITとFETCH FIRSTのどちらを使えばよいですか？',
      answer: 'PostgreSQLでは同じ意味で、どちらも使えます。LIMITは短く書け、FETCH FIRSTは標準SQLなので他のDBへ移しやすい書き方です。DBによって使える構文が異なるため、移行先の対応を確認してください。',
    },
    {
      question: 'ORDER BYを付けずにLIMIT 1を使うとどうなりますか？',
      answer: '1行は返りますが、どの行かは保証されません。最新の1件や最大の1件が欲しいときは、ORDER BYで並べ替えてからLIMIT 1にします。同値がありうる場合は、idなど重複しない列も並べ替えに足します。',
    },
    {
      question: 'OFFSETを使わずに次のページを取るにはどうしますか？',
      answer: '前のページの最後の行の値を使い、WHEREでそれより後ろの行に絞る方法があります。ノート記載のキーセット方式です。OFFSETで飛ばす行の処理が不要になるため、深いページでも速度が落ちにくくなります。',
    },
    {
      question: 'LIMIT 0やLIMIT NULLはどうなりますか？',
      answer: 'LIMIT 0は0行を返します。LIMIT NULLとLIMIT ALLは、LIMITを書かないのと同じで制限なしになります。OFFSET 0とOFFSET NULLは、OFFSETを書かないのと同じです。',
    },
  ],
  references: [
    { label: 'PostgreSQL公式：LIMITとOFFSET', url: 'https://www.postgresql.org/docs/current/queries-limit.html', description: 'LIMIT・OFFSETの動作、ORDER BYの必要性、OFFSETの処理コスト' },
    { label: 'PostgreSQL公式：SELECT（LIMIT句）', url: 'https://www.postgresql.org/docs/current/sql-select.html#SQL-LIMIT', description: 'FETCH FIRST、OFFSET ROWS、WITH TIESの構文' },
  ],
  related: ['order-by', 'select', 'where', 'window-functions', 'group-by'],
  practiceCategory: 'limit-offset',
};
