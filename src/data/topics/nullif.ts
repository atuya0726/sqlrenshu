import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE shops (id integer PRIMARY KEY, name text NOT NULL, sales integer NOT NULL, visitors integer NOT NULL);
INSERT INTO shops VALUES (1,'青木店',120000,40),(2,'北野店',90000,0),(3,'中央店',60000,17),(4,'大和店',50000,20),(5,'富士店',0,25);
CREATE TABLE contacts (id integer PRIMARY KEY, name text NOT NULL, phone text);
INSERT INTO contacts VALUES (1,'青木','090-1111-2222'),(2,'北野',''),(3,'中央',NULL),(4,'大和','不明');`,
  sources: ['SELECT * FROM shops ORDER BY id', 'SELECT * FROM contacts ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'nullif',
  label: 'NULLIF',
  title: 'SQLのNULLIFとは？ゼロ除算の回避・空文字をNULLにする使い方とCASEとの違い',
  description: 'SQLのNULLIFをPostgreSQLの元の表・SQL・結果表で解説。特定の値をNULLに変える基本、x / NULLIF(y, 0)によるゼロ除算の回避、空文字をNULLにしてCOALESCEと組み合わせる方法、CASE式での書き換え、COUNTとの組み合わせを学べます。',
  lead: 'NULLIF(a, b)は、aとbが等しければNULLを、等しくなければaをそのまま返す関数です。空文字や「不明」のような意味のない値をNULLに揃えたり、割り算の分母が0のときだけNULLにしてエラーを避けたりするのに使います。COALESCEの逆向きの働きをする関数として、使い方を確認しましょう。',
  sampleIntro: 'shopsは店舗、contactsは連絡先です。shopsのsalesは売上（円）、visitorsは来店者数で、北野店の来店者数は0です。富士店の売上は0円です。contactsのphoneは電話番号で、北野は空文字（\'\'）、中央はNULL、大和は「不明」という文字が入っています。',
  sampleTables: [
    {
      caption: 'shops：店舗5件（salesは売上・円、visitorsは来店者数）',
      headers: ['id', 'name', 'sales', 'visitors'],
      rows: [['1', '青木店', '120000', '40'], ['2', '北野店', '90000', '0'], ['3', '中央店', '60000', '17'], ['4', '大和店', '50000', '20'], ['5', '富士店', '0', '25']],
    },
    {
      caption: 'contacts：連絡先4件（北野は空文字、中央はNULL）',
      headers: ['id', 'name', 'phone'],
      rows: [['1', '青木', '090-1111-2222'], ['2', '北野', ''], ['3', '中央', 'NULL'], ['4', '大和', '不明']],
    },
  ],
  syntax: "SELECT id, name, NULLIF(phone, '') AS phone\nFROM contacts;",
  sections: [
    {
      heading: 'NULLIFで空文字をNULLに変える',
      body: "NULLIF(phone, '')は、phoneが空文字のときだけNULLを返し、それ以外はphoneをそのまま返します。北野の空文字はNULLになります。中央はもともとNULL、青木の電話番号と大和の「不明」は空文字ではないので変わりません。空文字は「入力済み」として扱われ、IS NULLでは見つからないため、NULLに揃えたいときに使います。",
      code: "SELECT id, name, NULLIF(phone, '') AS phone\nFROM contacts\nORDER BY id;",
      resultTable: { headers: ['id', 'name', 'phone'], rows: [['1', '青木', '090-1111-2222'], ['2', '北野', 'NULL'], ['3', '中央', 'NULL'], ['4', '大和', '不明']] },
    },
    {
      heading: 'NULLIFで0除算のエラーを避ける',
      body: '整数や数値を0で割ると、PostgreSQLはエラーを返して問い合わせ全体を止めます。分母をNULLIF(visitors, 0)にすると、visitorsが0の行だけ分母がNULLになり、結果もNULLになります。来店者1人あたりの売上は、青木店3000、北野店NULL、中央店3529、大和店2500、富士店0です。中央店の60000÷17は、整数どうしの割り算なので小数点以下が切り捨てられます。',
      code: 'SELECT name, sales / NULLIF(visitors, 0) AS per_visitor\nFROM shops\nORDER BY id;',
      resultTable: { headers: ['name', 'per_visitor'], rows: [['青木店', '3000'], ['北野店', 'NULL'], ['中央店', '3529'], ['大和店', '2500'], ['富士店', '0']] },
    },
    {
      heading: 'COALESCEと組み合わせて空文字を既定値に置き換える',
      body: "COALESCEはNULLを別の値に置き換えますが、空文字はNULLではないため置き換わりません。先にNULLIFで空文字をNULLにしてから、COALESCEで「未登録」に置き換えます。北野（空文字）と中央（NULL）は未登録になり、青木の電話番号と大和の「不明」はそのまま残ります。NULLIFが「値をNULLにする」側、COALESCEが「NULLを値にする」側です。",
      code: "SELECT id, name, COALESCE(NULLIF(phone, ''), '未登録') AS phone\nFROM contacts\nORDER BY id;",
      resultTable: { headers: ['id', 'name', 'phone'], rows: [['1', '青木', '090-1111-2222'], ['2', '北野', '未登録'], ['3', '中央', '未登録'], ['4', '大和', '不明']] },
    },
    {
      heading: 'CASE式で同じ処理を書き換える',
      body: 'NULLIF(a, b)は、CASE WHEN a = b THEN NULL ELSE a ENDと同じ意味です。次のSQLは、来店者数が0のときNULLにする2つの書き方を並べて、結果が一致することを示します。NULLIFのほうが短く、分母を2回書かなくて済みます。条件が「visitorsが0」のように等しいかどうかだけならNULLIF、「visitorsが0または売上が0」のような複数の条件ならCASE式を使います。',
      code: 'SELECT name,\n  sales / NULLIF(visitors, 0) AS by_nullif,\n  CASE WHEN visitors = 0 THEN NULL ELSE sales / visitors END AS by_case\nFROM shops\nORDER BY id;',
      resultTable: { headers: ['name', 'by_nullif', 'by_case'], rows: [['青木店', '3000', '3000'], ['北野店', 'NULL', 'NULL'], ['中央店', '3529', '3529'], ['大和店', '2500', '2500'], ['富士店', '0', '0']] },
    },
    {
      heading: 'COUNTと組み合わせて入力済みの件数を数える',
      body: "COUNT(列)はNULLを数えないため、空文字は件数に入ります。COUNT(phone)は青木、北野（空文字）、大和の3件です。NULLIF(phone, '')で空文字をNULLにしてから数えると、青木と大和の2件になります。「不明」という文字は空文字ではないので、どちらの数え方でも件数に含まれます。",
      code: "SELECT COUNT(phone) AS not_null, COUNT(NULLIF(phone, '')) AS not_empty\nFROM contacts;",
      resultTable: { headers: ['not_null', 'not_empty'], rows: [['3', '2']] },
    },
  ],
  mistakes: [
    {
      title: 'NULLIFで0除算を避けても、整数の割り算は切り捨てのまま',
      body: 'sales / NULLIF(visitors, 0)は、どちらも整数なので結果も整数で、中央店は3529.41…ではなく3529になります。小数で求めたいときは、片方をnumericに変換してからROUNDで丸めます。NULLIFは0除算のエラーを避けるだけで、割り算の型は変えません。',
      code: 'SELECT name, ROUND(sales::numeric / NULLIF(visitors, 0), 1) AS per_visitor\nFROM shops\nORDER BY id;',
    },
  ],
  notes: [
    {
      title: 'NULLIFは入れ子にして複数の値をNULLにできる',
      body: "NULLIFは2つの値しか比べられません。空文字と「不明」の両方をNULLにしたいときは、NULLIFを入れ子にします。内側が先に評価され、空文字ならNULL、次に外側が「不明」ならNULLにします。NULLIF(NULL, 値)はNULLを返します。値が多いときは、WHENを並べたCASE式やINのほうが読みやすくなります。",
      code: "SELECT id, name, NULLIF(NULLIF(phone, ''), '不明') AS phone\nFROM contacts\nORDER BY id;",
    },
    {
      title: 'NULLIFの比較は=と同じ規則で、結果の型は第1引数に合わせる',
      body: 'NULLIF(a, b)は、a = bと書いたときと同じ規則で2つの値を比べます。結果の型は第1引数の型で、比較のために型が変わった場合はその型になります。たとえば整数の1とnumericの2.2を比べると、結果はnumericです。比べられない型の組み合わせはエラーになります。',
      code: 'SELECT NULLIF(5, 5) AS same, NULLIF(5, 0) AS different, NULLIF(1, 2.2) AS numeric_result;',
    },
  ],
  faqs: [
    {
      question: 'NULLIFとCOALESCEは何が違いますか？',
      answer: 'NULLIFは「ある値のときだけNULLにする」関数で、COALESCEは「NULLのときに別の値にする」関数です。逆向きの働きなので、空文字を未登録に置き換えるときのようにCOALESCE(NULLIF(列, \'\'), \'未登録\')と組み合わせます。',
    },
    {
      question: 'ゼロ除算を避けるのにNULLIFとCASEのどちらがよいですか？',
      answer: '分母が0のときだけNULLにするなら、NULLIFのほうが短く書けます。分母が0のとき0を返したいなら、COALESCEを組み合わせます。条件が複数ある場合や、NULL以外の値を返したいときはCASE式にします。',
    },
    {
      question: '0除算でNULLになった行は、結果から除かれますか？',
      answer: '除かれません。その行は結果に残り、割り算の結果の列だけがNULLになります。NULLの行を除きたいときは、WHEREで分母が0でない行に絞るか、結果がNULLでない行だけを選びます。',
    },
    {
      question: 'NULLIFで比べる値の型が違うとどうなりますか？',
      answer: '=で比べられる組み合わせなら、型が自動的にそろえられて比べられます。比べられない組み合わせ（たとえば整数と、数字ではない文字列）はエラーになります。型を明示したいときはCASTで変換します。',
    },
  ],
  references: [
    { label: 'PostgreSQL公式：NULLIF', url: 'https://www.postgresql.org/docs/current/functions-conditional.html#FUNCTIONS-NULLIF', description: 'NULLIFの動作、比較規則と結果の型' },
    { label: 'PostgreSQL公式：COALESCE', url: 'https://www.postgresql.org/docs/current/functions-conditional.html#FUNCTIONS-COALESCE-NVL-IFNULL', description: 'NULLでない最初の値を返す関数' },
  ],
  related: ['coalesce', 'case', 'cast', 'where', 'group-by'],
  practiceCategory: 'nullif',
};
