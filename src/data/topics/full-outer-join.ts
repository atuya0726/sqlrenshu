import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE april_members (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE may_members (id integer PRIMARY KEY, name text NOT NULL);
INSERT INTO april_members VALUES (1,'青木'),(2,'北野'),(3,'中央'),(4,'大和');
INSERT INTO may_members VALUES (2,'北野'),(3,'中央'),(5,'村上'),(6,'白石');`,
  sources: ['SELECT * FROM april_members ORDER BY id', 'SELECT * FROM may_members ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'full-outer-join',
  label: 'FULL OUTER JOIN',
  title: 'SQLのFULL OUTER JOINとは？両方の未一致を残す方法と差分の見つけ方',
  description: 'SQLのFULL OUTER JOIN（完全外部結合）をPostgreSQLの元の表・SQL・結果表で解説。LEFT JOIN・RIGHT JOINとの違い、COALESCEでキーをまとめる方法、IS NULLで片方にしかない行を抜く差分検出を学べます。',
  lead: 'FULL OUTER JOINは、左右どちらの表にしかない行も残す結合です。一致した行は1行にまとまり、一致しない行はもう一方の列がNULLになります。4月と5月の会員名簿を突き合わせ、継続・退会・新規を見分けながら、LEFT JOIN・RIGHT JOINとの違いを確認しましょう。',
  sampleIntro: 'april_membersは4月の会員、may_membersは5月の会員で、1行が会員1人、idは会員番号です。青木（1）と大和（4）は4月だけ、村上（5）と白石（6）は5月だけにいます。北野（2）と中央（3）は両方にいます。ORDER BYのない結果の行順は一例で、保証されません。',
  sampleTables: [
    { caption: 'april_members：4月の会員4人', headers: ['id', 'name'], rows: [['1', '青木'], ['2', '北野'], ['3', '中央'], ['4', '大和']] },
    { caption: 'may_members：5月の会員4人', headers: ['id', 'name'], rows: [['2', '北野'], ['3', '中央'], ['5', '村上'], ['6', '白石']] },
  ],
  syntax: 'SELECT a.id AS april_id, m.id AS may_id\nFROM april_members AS a\nFULL OUTER JOIN may_members AS m\n  ON a.id = m.id;',
  sections: [
    {
      heading: 'FULL OUTER JOINで両方の表の全行を並べる',
      body: 'FULL OUTER JOINは、ONで一致する行を1行にまとめたうえで、一致しない行を左右どちらも残します。北野と中央は両方に入り、青木と大和は5月側がNULL、村上と白石は4月側がNULLになります。4月と5月の会員を合わせた6人が1行ずつ並びます。',
      code: 'SELECT a.id AS april_id, a.name AS april_name, m.id AS may_id, m.name AS may_name\nFROM april_members AS a\nFULL OUTER JOIN may_members AS m\n  ON a.id = m.id\nORDER BY COALESCE(a.id, m.id);',
      resultTable: {
        headers: ['april_id', 'april_name', 'may_id', 'may_name'],
        rows: [['1', '青木', 'NULL', 'NULL'], ['2', '北野', '2', '北野'], ['3', '中央', '3', '中央'], ['4', '大和', 'NULL', 'NULL'], ['NULL', 'NULL', '5', '村上'], ['NULL', 'NULL', '6', '白石']],
      },
    },
    {
      heading: 'COALESCEで左右のキーを1列にまとめる',
      body: 'FULL OUTER JOINの結果では、会員番号が4月側と5月側の2列に分かれ、どちらかがNULLの行があります。COALESCE(a.id, m.id)は、左の値があれば左、なければ右を返すので、全員の会員番号を1列にまとめられます。名前も同じように書くと、6人の一覧になります。',
      code: 'SELECT COALESCE(a.id, m.id) AS id, COALESCE(a.name, m.name) AS name\nFROM april_members AS a\nFULL OUTER JOIN may_members AS m\n  ON a.id = m.id\nORDER BY id;',
      resultTable: { headers: ['id', 'name'], rows: [['1', '青木'], ['2', '北野'], ['3', '中央'], ['4', '大和'], ['5', '村上'], ['6', '白石']] },
    },
    {
      heading: '片方にしかない行をIS NULLで抜き出す',
      body: '結合後に5月側のidがNULLの行だけを残すと、4月にいて5月にいない会員が分かります。青木と大和の2人です。判定には、結合キーのように必ず値が入る列を使います。5月側の列がNULLなのは、結合で一致する行が見つからなかったためです。逆にa.id IS NULLなら、5月だけの会員です。',
      code: 'SELECT a.id, a.name\nFROM april_members AS a\nFULL OUTER JOIN may_members AS m\n  ON a.id = m.id\nWHERE m.id IS NULL\nORDER BY a.id;',
      resultTable: { headers: ['id', 'name'], rows: [['1', '青木'], ['4', '大和']] },
    },
    {
      heading: 'どちらか一方にしかない行を1回で取り出す',
      body: '4月だけと5月だけを一度に調べるには、WHEREでa.id IS NULL OR m.id IS NULLと書きます。両方にいる北野と中央は除かれ、青木、大和、村上、白石の4人が残ります。CASEで、どちらにいたかの区分を付けると、結果が読みやすくなります。FULL OUTER JOINだけで、2つの表の差分を両方向で検出できます。',
      code: 'SELECT COALESCE(a.id, m.id) AS id,\n       COALESCE(a.name, m.name) AS name,\n       CASE WHEN m.id IS NULL THEN \'4月のみ\' ELSE \'5月のみ\' END AS status\nFROM april_members AS a\nFULL OUTER JOIN may_members AS m\n  ON a.id = m.id\nWHERE a.id IS NULL OR m.id IS NULL\nORDER BY id;',
      resultTable: { headers: ['id', 'name', 'status'], rows: [['1', '青木', '4月のみ'], ['4', '大和', '4月のみ'], ['5', '村上', '5月のみ'], ['6', '白石', '5月のみ']] },
    },
    {
      heading: 'LEFT JOIN・RIGHT JOINとの行数の違い',
      body: 'LEFT JOINは左の表の全行、RIGHT JOINは右の表の全行を残し、FULL OUTER JOINは両方を残します。この例では、LEFT JOINが4月の4人で4行、RIGHT JOINが5月の4人で4行、FULL OUTER JOINが6行です。LEFT JOINだと5月だけの村上と白石が、RIGHT JOINだと4月だけの青木と大和が見えません。片側だけ見ると、反対側の差分を見落とします。',
      code: 'SELECT\n  (SELECT COUNT(*) FROM april_members AS a LEFT JOIN may_members AS m ON a.id = m.id) AS left_rows,\n  (SELECT COUNT(*) FROM april_members AS a RIGHT JOIN may_members AS m ON a.id = m.id) AS right_rows,\n  (SELECT COUNT(*) FROM april_members AS a FULL OUTER JOIN may_members AS m ON a.id = m.id) AS full_rows;',
      resultTable: { headers: ['left_rows', 'right_rows', 'full_rows'], rows: [['4', '4', '6']] },
    },
  ],
  mistakes: [
    {
      title: '片方の表の列でWHERE条件を書くと、未一致の行が消える',
      body: 'FULL OUTER JOINの後に、WHERE m.id >= 2のように片方の表の列で絞ると、NULLの行は条件を通りません。4月だけの青木と大和が消え、残るのは5月側に会員番号がある4人だけです。実質的にRIGHT JOINのような結果になり、差分を見失います。未一致を残したいときは、IS NULLも許す条件にするか、絞り込みを結合前に行います。',
      code: 'SELECT a.name AS april_name, m.name AS may_name\nFROM april_members AS a\nFULL OUTER JOIN may_members AS m\n  ON a.id = m.id\nWHERE m.id >= 2;',
    },
  ],
  notes: [
    {
      title: 'ON条件のNULLは一致しない',
      body: 'ONのa.id = m.idは、どちらかがNULLのとき真になりません。そのためキー列にNULLがある行は、必ず相手のない行として左右に別々に残ります。NULLどうしを同じと見なして結合したい場合は、COALESCEなどで同じ値に置き換えて比べます（本当にその値の行と混ざらないことが前提です）。なお、FULL OUTER JOINのONにIS NOT DISTINCT FROMは使えません。PostgreSQLが「FULL JOIN is only supported with merge-joinable or hash-joinable join conditions」というエラーにするためです。',
    },
    {
      title: 'FULL OUTER JOINのOUTERは省略できる',
      body: 'PostgreSQLの公式ドキュメントでは、{ LEFT | RIGHT | FULL } [OUTER] JOINとされ、OUTERは省略できます。FULL JOINとFULL OUTER JOINは同じです。このページでは、意図が分かりやすいFULL OUTER JOINと書いています。',
      code: 'SELECT COUNT(*)\nFROM april_members AS a\nFULL JOIN may_members AS m\n  ON a.id = m.id;',
    },
  ],
  faqs: [
    {
      question: 'FULL OUTER JOINはどんなときに使いますか？',
      answer: '2つの表を突き合わせて、どちらかにしかない行も含めて一覧したいときに使います。月ごとの名簿、旧システムと新システムのデータ、予算と実績の比較などです。',
    },
    {
      question: 'LEFT JOINとRIGHT JOINのどちらかで足りますか？',
      answer: '片方の向きの差分だけなら足ります。4月にいて5月にいない会員だけならLEFT JOINとIS NULLで足ります。ただし両方向を一度に調べるなら、FULL OUTER JOINの方が簡単です。',
    },
    {
      question: '結合キーを1列にまとめるにはどうしますか？',
      answer: 'COALESCE(a.id, m.id)のように、左右の列を並べて、NULLでない方を使います。一致した行は両方の値が同じなので、どちらを取っても同じ値になります。',
    },
    {
      question: 'FULL OUTER JOINの結果の行数はどう決まりますか？',
      answer: '一致した行の組と、左だけの行、右だけの行の合計です。この例では、一致が2組（北野・中央）、4月だけが2人、5月だけが2人で6行です。1対多の関係で1つの行が複数に一致するときは、その分だけ行が増えます。',
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：結合テーブル（FULL OUTER JOIN）',
      url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN',
      description: 'FULL OUTER JOINの定義、OUTERの省略、ON条件',
    },
    {
      label: 'PostgreSQL公式：SELECT（FROM句）',
      url: 'https://www.postgresql.org/docs/current/sql-select.html#SQL-FROM',
      description: 'JOINの種類とON・USINGの指定',
    },
  ],
  related: ['left-join', 'inner-join', 'coalesce', 'intersect-except', 'is-distinct-from', 'case'],
  practiceCategory: 'full-outer-join',
};
