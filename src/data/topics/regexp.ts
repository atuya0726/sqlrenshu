import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE customers (id integer PRIMARY KEY, name text NOT NULL, email text NOT NULL, phone text);
INSERT INTO customers VALUES
  (1, '青木商店', 'aoki@Example.com', '03-1234-5678'),
  (2, '北野物産', 'kitano@example.co.jp', '090-1111-2222'),
  (3, '中央商事', 'info@example.com', '0120-333-444'),
  (4, '大和食品', 'yamato@EXAMPLE.COM', '06-9876-5432'),
  (5, '西村工業', 'nishimura@sample.org', '不明'),
  (6, '東西商会', 'tozai@example.com', NULL);`,
  sources: ['SELECT id, name, email, phone FROM customers ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'regexp',
  label: '正規表現',
  title: 'PostgreSQLの正規表現とは？~・~*・regexp_replace・substringの使い方',
  description: 'PostgreSQLの正規表現（POSIX正規表現）を、元の表・SQL・実行結果で解説。~と~*の大文字小文字の違い、!~、LIKEとの使い分け、regexp_replaceのgフラグ、substringやregexp_matchでの抽出、SIMILAR TOとの違いを学べます。',
  lead: 'LIKEの%と_では書けない「0で始まる2〜4桁の市外局番」「数字以外を取り除く」といった柔軟なパターンは、正規表現で書きます。PostgreSQLでは~演算子で一致を調べ、regexp_replaceで置き換え、substringで一部を取り出せます。顧客の電話番号とメールアドレスで、基本から使い分けまでを確認します。正規表現演算子（~、~*、!~）はPostgreSQLの拡張で、標準SQLのLIKE・SIMILAR TOとは別の仕組みです。',
  sampleIntro: 'customersは顧客1件が1行で、emailはメールアドレス、phoneは電話番号です。メールアドレスの大文字小文字が混在し、西村工業の電話番号は「不明」という文字列、東西商会の電話番号は未入力（NULL）です。ORDER BYのないSQLの行順は保証されません。LIKEの%・_の使い方は、LIKEのガイドで先に確認できます。',
  sampleTables: [
    {
      caption: 'customers：顧客6件',
      headers: ["id","name","email","phone"], rows: [["1","青木商店","aoki@Example.com","03-1234-5678"],["2","北野物産","kitano@example.co.jp","090-1111-2222"],["3","中央商事","info@example.com","0120-333-444"],["4","大和食品","yamato@EXAMPLE.COM","06-9876-5432"],["5","西村工業","nishimura@sample.org","不明"],["6","東西商会","tozai@example.com","NULL"]],
    },
  ],
  syntax: "SELECT id, name, phone\nFROM customers\nWHERE phone ~ '^0[36]-';",
  sections: [
    {
      heading: '~で正規表現に一致する行を選ぶ',
      body: "phone ~ '^0[36]-'は、phoneが「先頭が0で、次が3か6、そのあとハイフン」というパターンに一致するかを調べます。^は文字列の先頭、[36]は3または6のどちらか1文字です。青木商店（03-...）と大和食品（06-...）が残ります。LIKEはパターンが文字列全体に一致する必要がありますが、正規表現は文字列のどこにでも一致できるので、先頭や末尾に限定したいときは^や$を自分で書きます。NULLの電話番号は一致の結果もNULLなので、東西商会は残りません。",
      code: "SELECT id, name, phone\nFROM customers\nWHERE phone ~ '^0[36]-'\nORDER BY id;",
      resultTable: { headers: ["id","name","phone"], rows: [["1","青木商店","03-1234-5678"],["4","大和食品","06-9876-5432"]] },
    },
    {
      heading: '~*は大文字小文字を区別しない',
      body: "~は大文字小文字を区別し、~*は区別しません。メールアドレスのドメインがexample.comで終わるかを両方で調べると、~では小文字のexample.comの中央商事と東西商会だけがtrueです。~*ではExample.comの青木商店やEXAMPLE.COMの大和食品もtrueになります。example.co.jpは.comで終わらないので、どちらもfalseです。ドット（.）は任意の1文字を表すため、本物のドットは\\.と書きます。",
      code: "SELECT\n  id,\n  email ~ 'example\\.com$' AS case_sensitive,\n  email ~* 'example\\.com$' AS ignore_case\nFROM customers\nORDER BY id;",
      resultTable: { headers: ["id","case_sensitive","ignore_case"], rows: [["1","false","true"],["2","false","false"],["3","true","true"],["4","false","true"],["5","false","false"],["6","true","true"]] },
    },
    {
      heading: '!~は一致しない行を選ぶ',
      body: "!~は、パターンに一致しない行を選びます。phone !~ '^[0-9-]+$'は、数字とハイフンだけでできていない電話番号なので、「不明」と入った西村工業が残ります。ほかの行は数字とハイフンだけなので除かれます。NULLの電話番号は!~の結果もNULLになり、東西商会は選ばれません。未入力も含めたいときは、phone IS NULLを別にORでつなぎます。",
      code: "SELECT id, name, phone\nFROM customers\nWHERE phone !~ '^[0-9-]+$'\nORDER BY id;",
      resultTable: { headers: ["id","name","phone"], rows: [["5","西村工業","不明"]] },
    },
    {
      heading: 'LIKEでは書けない形式チェックは正規表現を使う',
      body: "「0で始まり、数字が1〜3桁、ハイフン、3〜4桁、ハイフン、4桁」のような桁数と文字種の指定は、LIKEでは書けません。正規表現なら[0-9]{3,4}のように繰り返し回数を指定できます。青木商店、北野物産、大和食品は形式に合いますが、中央商事の0120-333-444は最後が3桁なのでfalseです。単純な前方一致や部分一致ならLIKEのほうが短く読みやすいので、パターンが%と_で足りるかを先に考えます。",
      code: "SELECT\n  id,\n  phone,\n  phone ~ '^0[0-9]{1,3}-[0-9]{3,4}-[0-9]{4}$' AS valid_format\nFROM customers\nORDER BY id;",
      resultTable: { headers: ["id","phone","valid_format"], rows: [["1","03-1234-5678","true"],["2","090-1111-2222","true"],["3","0120-333-444","false"],["4","06-9876-5432","true"],["5","不明","false"],["6","NULL","NULL"]] },
    },
    {
      heading: "regexp_replaceで一致した部分を置き換える（gフラグ）",
      body: "regexp_replace(phone, '[^0-9]', '', 'g')は、数字以外（[^0-9]）の文字を空文字に置き換え、数字だけにします。第4引数のgは、一致した部分をすべて置き換えるフラグです。gがないと最初の1か所だけが置き換わり、03-1234-5678なら最初のハイフンだけが消えて031234-5678になります。「不明」は数字を含まないので空文字になり、NULLの電話番号は置換してもNULLです。",
      code: "SELECT id, regexp_replace(phone, '[^0-9]', '', 'g') AS digits\nFROM customers\nORDER BY id;",
      resultTable: { headers: ["id","digits"], rows: [["1","0312345678"],["2","09011112222"],["3","0120333444"],["4","0698765432"],["5",""],["6","NULL"]] },
    },
    {
      heading: "substring(文字列 from パターン)で一部を取り出す",
      body: "substring(email from '@(.+)$')は、パターンに一致した部分を取り出します。カッコ（）がある場合は、カッコの中に一致した部分だけが返り、ここでは@より後ろのドメインです。aoki@Example.comならExample.comが取り出せます。パターンに一致しない行はNULLになります。複数のカッコの部分をまとめて取り出したいときは、regexp_matchが配列で返します。",
      code: "SELECT id, substring(email from '@(.+)$') AS domain\nFROM customers\nORDER BY id;",
      resultTable: { headers: ["id","domain"], rows: [["1","Example.com"],["2","example.co.jp"],["3","example.com"],["4","EXAMPLE.COM"],["5","sample.org"],["6","example.com"]] },
    },
  ],
  mistakes: [
    {
      title: '正規表現の中でLIKEの%を使う',
      body: "正規表現では%は特別な意味を持たない普通の文字です。phone ~ '03%'は「03のあとに%がある」という意味になり、03-1234-5678には%がないので1行も一致しません。「03で始まる」は^03と書き、任意の文字列は.*で表します。",
      code: "SELECT id, phone\nFROM customers\nWHERE phone ~ '03%';",
    },
  ],
  notes: [
    {
      title: 'SIMILAR TOとの違い',
      body: 'SIMILAR TOは標準SQLの正規表現を使う演算子で、LIKEと同じく、パターンが文字列全体に一致したときだけ成功します。_と%も使えます。一方、~はPOSIX正規表現で、文字列のどこにでも一致できます。公式ドキュメントでも、SIMILAR TOはLIKEと正規表現の中間の独特な記法と説明されています。実務では、LIKEで足りなければPOSIX正規表現の~を使うのが一般的です。',
      code: "SELECT\n  phone SIMILAR TO '0(3|6)-%' AS by_similar,\n  phone ~ '^0[36]-' AS by_posix\nFROM customers\nWHERE id = 1;",
    },
    {
      title: 'regexp_matchでカッコの部分を配列で取り出す',
      body: 'regexp_matchは、パターンに一致した最初の部分を、text[]で返す関数です。カッコがあるとカッコごとの一致が配列になり、一致しなければNULLを返します。次のSQLは、電話番号を市外局番・市内局番・加入者番号の3つに分けます。全体の一致部分だけが欲しいときは、substringのほうが簡潔です。',
      code: "SELECT regexp_match(phone, '^(\\d+)-(\\d+)-(\\d+)$') AS parts\nFROM customers\nWHERE id = 1;",
    },
  ],
  faqs: [
    {
      question: 'LIKEと正規表現はどう使い分けますか？',
      answer: '前方一致・後方一致・部分一致のように%と_で書けるならLIKEを使います。桁数、文字種、複数の候補（03または06）の指定など、LIKEで書けない条件に正規表現を使います。LIKEは文字列全体に一致する必要があり、正規表現は一部に一致すれば成功する点も違います。',
    },
    {
      question: '~と~*のどちらを使えばよいですか？',
      answer: '大文字小文字を区別したいときは~、区別しないときは~*です。メールアドレスのドメインのように、大文字小文字が混在していても同じものとして扱いたい場合は~*を使います。',
    },
    {
      question: '正規表現で一致しない行を選ぶにはどうしますか？',
      answer: '!~（大文字小文字を区別しない場合は!~*）を使います。NOT (列 ~ パターン)と書いても同じです。どちらも列がNULLの行はNULLになり、選ばれない点に注意してください。',
    },
    {
      question: 'regexp_replaceで全部を置き換えるにはどうしますか？',
      answer: '第4引数のフラグにgを指定します。gがないと、最初に一致した1か所だけが置き換わります。大文字小文字を区別しないiフラグと組み合わせて、\'gi\'のようにも書けます。',
    },
  ],
  references: [
    { label: 'PostgreSQL公式：POSIX正規表現', url: 'https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-POSIX-REGEXP', description: '~、~*、!~、substring、regexp_replace、regexp_matchの仕様とフラグ' },
    { label: 'PostgreSQL公式：SIMILAR TO正規表現', url: 'https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-SIMILARTO-REGEXP', description: 'SIMILAR TOが文字列全体に一致する仕様' },
    { label: 'PostgreSQL公式：パターンマッチング', url: 'https://www.postgresql.org/docs/current/functions-matching.html', description: 'LIKE、SIMILAR TO、POSIX正規表現の3つの方式の違い' },
  ],
  related: ['like', 'string-functions', 'where', 'case', 'array'],
  practiceCategory: 'regexp',
};
