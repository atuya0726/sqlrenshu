import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE articles (id integer PRIMARY KEY, title text NOT NULL, tags text[] NOT NULL);
INSERT INTO articles VALUES
  (1, 'SQL入門', ARRAY['sql','beginner']),
  (2, 'JOIN解説', ARRAY['sql','join']),
  (3, 'Python入門', ARRAY['python','beginner']),
  (4, 'ウィンドウ関数', ARRAY['sql','advanced','join']),
  (5, '下書き', ARRAY[]::text[]);`,
  sources: ['SELECT id, title, tags FROM articles ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'array',
  label: '配列・unnest',
  title: 'PostgreSQLの配列とunnestとは？ANY・@>・&&での検索と行への展開',
  description: 'PostgreSQLの配列型を、元の表・SQL・実行結果で解説。ARRAY[...]と配列リテラル、添字が1始まりであること、= ANY・@>・&&での検索、array_lengthとcardinalityの違い、unnestで行に展開して集計しarray_aggで戻す方法を学べます。',
  lead: 'PostgreSQLでは、1つの列に複数の値を配列としてまとめて保存できます。記事に付けるタグのように、数が決まっていない値を別の表に分けずに持てるのが特徴です。配列の作り方、取り出し方、検索の仕方、行への展開（unnest）を、記事とタグの表で順に確認します。配列型はPostgreSQLの拡張機能が中心で、MySQLやSQLiteには配列型の列がありません。',
  sampleIntro: 'articlesは記事1件が1行で、tagsがtext[]（テキストの配列）の列です。表示では配列が{sql,beginner}のように波カッコで囲まれます。下書き（id 5）のtagsは要素が0個の空配列です。ORDER BYのないSQLの行順は保証されません。',
  sampleTables: [
    {
      caption: 'articles：記事5件',
      headers: ["id","title","tags"], rows: [["1","SQL入門","{sql,beginner}"],["2","JOIN解説","{sql,join}"],["3","Python入門","{python,beginner}"],["4","ウィンドウ関数","{sql,advanced,join}"],["5","下書き","{}"]],
    },
  ],
  syntax: "SELECT id, title, tags\nFROM articles\nWHERE tags = ARRAY['sql', 'beginner'];",
  sections: [
    {
      heading: 'ARRAY[...]と配列リテラルで配列を書く',
      body: "配列はARRAY['sql','beginner']のように書きます。文字列で'{sql,beginner}'と書く配列リテラルでも同じ値を表せ、空の配列は'{}'またはARRAY[]::text[]です。配列同士を=で比べると、要素が同じ順序で並んでいるときだけtrueです。tagsが{sql,beginner}の記事1だけが一致し、要素は同じでも順序の違う配列とは一致しません。順序を問わず含むかを調べたいときは、後で扱う@>を使います。",
      code: "SELECT id, tags\nFROM articles\nWHERE tags = ARRAY['sql', 'beginner'];",
      resultTable: { headers: ["id","tags"], rows: [["1","{sql,beginner}"]] },
    },
    {
      heading: '添字tags[1]で要素を取り出す（1始まり）',
      body: "配列の要素はtags[1]のように添字で取り出します。PostgreSQLの添字は1から始まり、0ではありません。tags[1]は最初のタグ、tags[2]は2番目のタグです。要素の数より大きい添字を指定してもエラーにはならずNULLが返るので、空配列の下書きはtags[1]もtags[2]もNULLです。",
      code: "SELECT title, tags[1] AS first_tag, tags[2] AS second_tag\nFROM articles\nORDER BY id;",
      resultTable: { headers: ["title","first_tag","second_tag"], rows: [["SQL入門","sql","beginner"],["JOIN解説","sql","join"],["Python入門","python","beginner"],["ウィンドウ関数","sql","advanced"],["下書き","NULL","NULL"]] },
    },
    {
      heading: "= ANY(配列)でタグを1つ指定して検索する",
      body: "'join' = ANY(tags)は、tagsのどれかの要素がjoinと等しいときにtrueになります。左辺に探したい値、右辺に配列を置く形です。JOIN解説とウィンドウ関数の2件が一致します。1つのタグで絞り込む場面では、この書き方が最も読みやすくなります。逆にANY(tags) = 'join'のように左右を入れ替えることはできません。",
      code: "SELECT id, title\nFROM articles\nWHERE 'join' = ANY(tags)\nORDER BY id;",
      resultTable: { headers: ["id","title"], rows: [["2","JOIN解説"],["4","ウィンドウ関数"]] },
    },
    {
      heading: '@>はすべてを含む、&&はどれかを含む',
      body: "tags @> ARRAY['sql','join']は、tagsが右の配列の要素をすべて含むときtrueです。tags && ARRAY['sql','join']は、共通する要素が1つでもあればtrueです。記事1はsqlだけを持つので、@>はfalse、&&はtrueになります。JOIN解説とウィンドウ関数は両方を持つので、どちらもtrueです。AND条件には@>、OR条件には&&と覚えると使い分けられます。",
      code: "SELECT\n  id,\n  tags @> ARRAY['sql', 'join'] AS has_all,\n  tags && ARRAY['sql', 'join'] AS has_any\nFROM articles\nORDER BY id;",
      resultTable: { headers: ["id","has_all","has_any"], rows: [["1","false","true"],["2","true","true"],["3","false","false"],["4","true","true"],["5","false","false"]] },
    },
    {
      heading: 'array_lengthとcardinalityで要素数を数える',
      body: "array_length(tags, 1)は1次元目の長さを返し、cardinality(tags)は要素の総数を返します。通常の配列では同じ値ですが、空配列では違います。空配列の下書きは、array_lengthがNULL、cardinalityが0です。タグが0個の記事を探したいときは、cardinality(tags) = 0と書けます。array_length(tags, 1) = 0では、NULLとの比較になって1行も取得できません。",
      code: "SELECT\n  title,\n  array_length(tags, 1) AS len,\n  cardinality(tags) AS card\nFROM articles\nORDER BY id;",
      resultTable: { headers: ["title","len","card"], rows: [["SQL入門","2","2"],["JOIN解説","2","2"],["Python入門","2","2"],["ウィンドウ関数","3","3"],["下書き","NULL","0"]] },
    },
    {
      heading: 'unnestで配列を行に展開して集計する',
      body: "unnest(tags)は、配列の要素を1要素1行に展開します。FROMに並べると、記事の行と展開した行が組み合わされ、SQL入門は2行、ウィンドウ関数は3行になります。展開後はGROUP BYで普通の列と同じようにタグごとの記事数を数えられます。空配列の下書きは展開すると0行になり、どのタグにも数えられません。",
      code: "SELECT tag, COUNT(*) AS n\nFROM articles, unnest(tags) AS tag\nGROUP BY tag\nORDER BY n DESC, tag;",
      resultTable: { headers: ["tag","n"], rows: [["sql","3"],["beginner","2"],["join","2"],["advanced","1"],["python","1"]] },
    },
  ],
  mistakes: [
    {
      title: '空配列やNULLの配列の要素数をarray_lengthで調べる',
      body: "array_length(tags, 1)は空配列でNULLを返すため、= 0で空配列を探すと1行も一致しません。要素数が0の行を探すときはcardinality(tags) = 0を使います。tags自体がNULLの行はcardinalityもNULLになるので、必要ならIS NULLを別に確認します。",
      code: "SELECT id, title\nFROM articles\nWHERE array_length(tags, 1) = 0;",
    },
  ],
  notes: [
    {
      title: 'array_aggで行を配列に戻す',
      body: 'unnestの反対がarray_aggです。展開して加工した行を、GROUP BYの単位ごとに配列へまとめ直せます。ORDER BYを付けると要素の順序も決められます。下のSQLは、各記事のタグを辞書順に並べ替えて配列に戻します。tagsが空の下書きは展開で0行になるため、結果に現れません。',
      code: "SELECT a.id, array_agg(tag ORDER BY tag) AS sorted_tags\nFROM articles AS a, unnest(a.tags) AS tag\nGROUP BY a.id\nORDER BY a.id;",
    },
    {
      title: '標準SQLや他のDBとの違い',
      body: '標準SQLにもARRAY型がありますが、PostgreSQLの@>や&&、= ANY(配列)、unnestなどは拡張を含む独自の書き方です。MySQLやSQLiteには配列型の列がなく、通常はタグを別の表に分けて1行1タグで持ちます。集計や結合を多用する中心のデータは、別の表に正規化するほうが外部キーを使えて扱いやすい場合も多いので、配列は補助的な値に向いています。',
    },
    {
      title: '配列に対するインデックス',
      body: '@>や&&による検索は、配列の列にGINインデックスを作ると、行数が多い表でも速くなります。一方、= ANY(tags)はインデックスを使えない書き方なので、大量のデータで使うときは、tags @> ARRAY[\'join\']と書き換えることを検討します。',
    },
  ],
  faqs: [
    {
      question: '配列の添字はなぜ0ではなく1から始まるのですか？',
      answer: 'PostgreSQLの配列は、既定で添字が1から始まります。tags[1]が最初の要素です。範囲外の添字を指定してもエラーにはならずNULLが返るので、0から数えるつもりで書くと意図しないNULLになる点に注意してください。',
    },
    {
      question: '= ANY(配列)と@>はどう使い分けますか？',
      answer: '探したい値が1つなら、= ANY(配列)が読みやすい書き方です。複数の値を「すべて含む」「どれかを含む」で調べるなら、@>と&&を使います。配列にGINインデックスを使いたい場合も、@>や&&を選びます。',
    },
    {
      question: 'array_lengthとcardinalityの違いは何ですか？',
      answer: 'array_lengthは次元を指定して長さを返し、空配列ではNULLになります。cardinalityは全要素の数を返し、空配列では0になります。1次元の配列で要素数を知りたいだけなら、cardinalityのほうが空配列の扱いで迷いません。',
    },
    {
      question: '配列の要素を1つずつ別の行にするにはどうしますか？',
      answer: 'unnest(配列)を使います。FROM articles, unnest(tags) AS tagのように並べると、記事ごとのタグが1行ずつに展開されます。展開した行はGROUP BYで集計でき、array_aggで配列に戻すこともできます。',
    },
  ],
  references: [
    { label: 'PostgreSQL公式：配列', url: 'https://www.postgresql.org/docs/current/arrays.html', description: '配列の宣言・入力、添字による参照、配列の検索' },
    { label: 'PostgreSQL公式：配列関数と演算子', url: 'https://www.postgresql.org/docs/current/functions-array.html', description: '@>、&&、array_length、cardinality、unnestの仕様' },
    { label: 'PostgreSQL公式：行と配列の比較', url: 'https://www.postgresql.org/docs/current/functions-comparisons.html', description: 'ANY(配列)による比較' },
  ],
  related: ['jsonb', 'group-by', 'where', 'string-agg', 'generate-series'],
  practiceCategory: 'array',
};
