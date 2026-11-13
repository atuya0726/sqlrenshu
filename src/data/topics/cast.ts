import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE raw_orders (id integer PRIMARY KEY, qty text NOT NULL, price text NOT NULL, ordered text NOT NULL);
INSERT INTO raw_orders VALUES (1,'12','1200.50','2026-01-05'),(2,'7','300','2026-02-10'),(3,'100','80.25','2026-01-20');
CREATE TABLE exam (id integer PRIMARY KEY, name text NOT NULL, correct integer NOT NULL, total integer NOT NULL);
INSERT INTO exam VALUES (1,'青木',7,10),(2,'北野',8,9),(3,'中央',1,3),(4,'大和',10,10);`,
  sources: ['SELECT * FROM raw_orders ORDER BY id', 'SELECT * FROM exam ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'cast',
  label: 'CAST・型変換',
  title: 'SQLのCASTとは？::による型変換・整数の割り算・文字列から数値や日付への変換',
  description: 'SQLのCAST(x AS type)とPostgreSQLの::による型変換を、元の表・SQL・結果表で解説。文字列から数値・日付への変換、整数どうしの割り算が切り捨てになる問題とnumericへの変換、ROUNDとの組み合わせ、変換できない文字列がエラーになる理由を学べます。',
  lead: 'CASTは、値を別のデータ型に変換する式です。CSVの取り込みなどで文字列として入った数量や日付を、数値や日付として計算・比較したいときに使います。整数どうしの割り算が小数にならない問題も、numericへ変換することで解決できます。',
  sampleIntro: 'raw_ordersは、文字列（text）として取り込まれた注文です。qtyは数量、priceは単価（円）、orderedは注文日で、どれも見た目は数値や日付ですが型はtextです。examは試験結果で、correctは正解数、totalは問題数（どちらも整数）、1行が受験者1人です。',
  sampleTables: [
    {
      caption: 'raw_orders：注文3件（qty・price・orderedはすべてtext）',
      headers: ['id', 'qty', 'price', 'ordered'],
      rows: [['1', '12', '1200.50', '2026-01-05'], ['2', '7', '300', '2026-02-10'], ['3', '100', '80.25', '2026-01-20']],
    },
    {
      caption: 'exam：試験結果4件（correctは正解数、totalは問題数）',
      headers: ['id', 'name', 'correct', 'total'],
      rows: [['1', '青木', '7', '10'], ['2', '北野', '8', '9'], ['3', '中央', '1', '3'], ['4', '大和', '10', '10']],
    },
  ],
  syntax: 'SELECT CAST(qty AS integer)\nFROM raw_orders;',
  sections: [
    {
      heading: 'CAST(値 AS 型)で文字列を整数に変換する',
      body: 'CAST(値 AS 型)は標準SQLの書き方で、値を指定した型に変換します。textの数量12・7・100を整数に変換すると、計算や数値としての比較に使えるようになります。元の列のままでは文字列なので、たとえば足し算はできません。変換できる値だけが対象で、整数として読めない文字列はエラーになります。',
      code: 'SELECT id, CAST(qty AS integer) AS qty_int\nFROM raw_orders\nORDER BY id;',
      resultTable: { headers: ['id', 'qty_int'], rows: [['1', '12'], ['2', '7'], ['3', '100']] },
    },
    {
      heading: '::演算子でnumericに変換する',
      body: '値::型は、PostgreSQL独自の短い書き方で、CASTと同じ変換をします。単価のtextを小数が扱えるnumericに変換すると、1200.50は1200.5、80.25は80.25の数値になります（numericの値は末尾の0を省いて表示しています）。::はPostgreSQLの書き方なので、他のDBでも動かしたいSQLにはCASTを使います。',
      code: 'SELECT id, price::numeric AS price_num\nFROM raw_orders\nORDER BY id;',
      resultTable: { headers: ['id', 'price_num'], rows: [['1', '1200.5'], ['2', '300'], ['3', '80.25']] },
    },
    {
      heading: '文字列を日付に変換して日付の計算をする',
      body: 'orderedはtextなので、そのままでは日数を足せません。::dateでdate型に変換すると、日付 + 30で30日後を計算できます。1月5日は2月4日、2月10日は3月12日、1月20日は2月19日です。2026-01-05のようにPostgreSQLが日付として読める形式の文字列は、変換できます。',
      code: "SELECT id, ordered::date + 30 AS due_on\nFROM raw_orders\nORDER BY id;",
      resultTable: { headers: ['id', 'due_on'], rows: [['1', '2026-02-04'], ['2', '2026-03-12'], ['3', '2026-02-19']] },
    },
    {
      heading: '整数どうしの割り算は小数点以下が切り捨てになる',
      body: '正解数÷問題数の割合を求めるときに、integerどうしの割り算は整数の結果になり、小数点以下が切り捨てられます。7÷10も8÷9も1÷3も0になり、10÷10だけが1です。エラーにはならないため、気付かずに間違った割合を使いがちです。',
      code: 'SELECT name, correct / total AS ratio\nFROM exam\nORDER BY id;',
      resultTable: { headers: ['name', 'ratio'], rows: [['青木', '0'], ['北野', '0'], ['中央', '0'], ['大和', '1']] },
    },
    {
      heading: 'numericへ変換してからROUNDで丸める',
      body: '割られる側または割る側のどちらかをnumericに変換すると、割り算が小数の計算になります。correct::numeric / totalとすると青木は0.7、北野は0.888…、中央は0.333…です。そのままでは桁が長いため、ROUND(値, 2)で小数第2位に丸めます。結果は0.7、0.89、0.33、1です。',
      code: 'SELECT name, ROUND(correct::numeric / total, 2) AS ratio\nFROM exam\nORDER BY id;',
      resultTable: { headers: ['name', 'ratio'], rows: [['青木', '0.7'], ['北野', '0.89'], ['中央', '0.33'], ['大和', '1']] },
    },
    {
      heading: '文字列のまま並べ替えると順序が変わる',
      body: 'textは辞書順で比較されるため、数量を文字列のまま降順にすると、先頭の文字が大きい7が先になり、7、12、100の順になります。CASTで整数にしてから並べると、数としての100、12、7の順です。ORDER BYに式を書けるので、表示は元の列のまま、並べ替えだけを変換した値で行えます。',
      code: 'SELECT id, qty\nFROM raw_orders\nORDER BY CAST(qty AS integer) DESC;',
      resultTable: { headers: ['id', 'qty'], rows: [['3', '100'], ['1', '12'], ['2', '7']] },
    },
  ],
  mistakes: [
    {
      title: '割り算のあとでnumericに変換しても小数にならない',
      body: 'CAST(correct / total AS numeric)は、先に整数の割り算をしてから変換します。7÷10は0になった後にnumericへ変換されるため、結果は0のままです。変換は割り算の前、割られる数か割る数に付けます。',
      code: 'SELECT name, CAST(correct / total AS numeric) AS ratio\nFROM exam\nORDER BY id;',
    },
  ],
  notes: [
    {
      title: 'type \'文字列\'の書き方と、numericの桁指定',
      body: 'DATE \'2026-01-05\'のように、型名の後ろに文字列定数を書く方法もあります。これは定数にそのまま型を与える書き方で、文字列が型の入力形式として正しければ成り立ちます。列の値を変換するCASTは実行時の変換で、対応する変換が定義されている必要があります。numeric(4,2)のように桁数と小数点以下の桁数を指定すると、小数点以下を丸めて収めます。この例では2.567が2.57になります。',
      code: 'SELECT DATE \'2026-01-05\' AS d, 2.567::numeric(4,2) AS n;',
    },
    {
      title: '変換できない文字列はエラーになる',
      body: 'CAST(\'abc\' AS integer)のように、整数として読めない文字列を変換すると、PostgreSQLはエラーを返して実行を止めます。表の1行でも変換できない値があれば、その問い合わせ全体が失敗します。取り込み前に値の形式を確認するか、元のデータ側で直してください。同様に、\'2026-13-45\'のように存在しない日付もdateへ変換できません。',
    },
  ],
  faqs: [
    {
      question: 'CASTと::はどちらを使えばよいですか？',
      answer: '結果は同じです。CASTは標準SQLの書き方で、::はPostgreSQLの書き方です。他のDBでも使うSQLにはCASTが向きます。PostgreSQLだけで使うなら::で短く書けます。',
    },
    {
      question: '文字列の列を数値と比較するとき、CASTは必要ですか？',
      answer: '比較する相手が文字列の定数なら辞書順の比較になり、数としての大小は判断されません。数として比べたいときは、列をCASTで数値にします。整数の列と数字だけの定数を比べる場合は、定数が自動的に変換されるため、通常は不要です。',
    },
    {
      question: '整数を割るとき、どちらをnumericにすればよいですか？',
      answer: 'どちらか一方で構いません。片方がnumericなら、もう片方も自動的にnumericとして計算されます。慣れたら、割られる側に::numericを付けるのが読みやすい書き方です。',
    },
    {
      question: '変換できない値をNULLにして処理を続けられますか？',
      answer: 'CASTにそのための指定はなく、エラーになります。変換できない値が混じるデータは、先にCASE式などで形式を判定するか、元データを整えてから変換します。',
    },
  ],
  references: [
    { label: 'PostgreSQL公式：型キャスト', url: 'https://www.postgresql.org/docs/current/sql-expressions.html#SQL-SYNTAX-TYPE-CASTS', description: 'CAST(x AS type)と::の書き方、実行時の変換' },
    { label: 'PostgreSQL公式：数学関数と演算子', url: 'https://www.postgresql.org/docs/current/functions-math.html', description: '整数の除算、ROUND' },
  ],
  related: ['coalesce', 'nullif', 'case', 'date-filter', 'order-by', 'date-arithmetic'],
  practiceCategory: 'cast',
};
