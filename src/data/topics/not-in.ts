import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE teams (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE employees (id integer PRIMARY KEY, name text NOT NULL, team_id integer);
INSERT INTO teams VALUES (1,'営業'),(2,'開発'),(3,'総務');
INSERT INTO employees VALUES (1,'青木',1),(2,'北野',1),(3,'中央',2),(4,'大和',NULL);`,
  sources: ['SELECT * FROM teams ORDER BY id', 'SELECT * FROM employees ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'not-in',
  label: 'NOT INとNULL',
  title: 'SQLのNOT INとは？NULLが混ざると0件になる理由とNOT EXISTSへの書き換え',
  description: 'SQLのNOT INにNULLが混ざると結果が0件になる理由を、PostgreSQLの三値論理と実行結果で解説。IS NOT NULLで除く方法、左辺がNULLの行の扱い、NOT EXISTSへの書き換えを演習で学べます。',
  lead: 'NOT INは「候補のどれとも等しくない」行を選ぶ条件ですが、候補にNULLが1つでも混ざると、1行も返らなくなることがあります。チームと社員の表を使い、なぜ0件になるのかを三値論理の結果で確かめ、IS NOT NULLとNOT EXISTSで安全に書き直します。',
  sampleIntro: 'teamsは1行がチーム1件、employeesは1行が社員1人です。employees.team_idが所属チームのidに対応し、大和は未配属なのでNULLです。営業には2人、開発には1人が所属し、総務には所属社員がいません。ORDER BYを付けた例は行順が決まっています。',
  sampleTables: [
    {
      caption: 'teams：チーム3件',
      headers: ['id', 'name'],
      rows: [['1', '営業'], ['2', '開発'], ['3', '総務']],
    },
    {
      caption: 'employees：社員4人（大和のteam_idはNULL）',
      headers: ['id', 'name', 'team_id'],
      rows: [['1', '青木', '1'], ['2', '北野', '1'], ['3', '中央', '2'], ['4', '大和', 'NULL']],
    },
  ],
  syntax: 'SELECT *\nFROM teams\nWHERE id NOT IN (\n  SELECT team_id\n  FROM employees\n  WHERE team_id IS NOT NULL\n);',
  sections: [
    {
      heading: 'NOT INは候補のどれとも等しくない行を選ぶ',
      body: 'NOT INは、左辺の値が括弧内の候補のどれとも等しくないときに真になります。候補が(1, 2)なら、idが3の総務だけが残ります。営業と開発は候補に含まれるので外れます。候補がNULLを含まない限り、直感どおりの結果です。',
      code: 'SELECT *\nFROM teams\nWHERE id NOT IN (1, 2)\nORDER BY id;',
      resultTable: { headers: ['id', 'name'], rows: [['3', '総務']] },
    },
    {
      heading: '候補にNULLが混ざるとtrueにならない',
      body: 'NULLは「不明な値」なので、3 = NULLの結果はtrueでもfalseでもなくNULL（不明）です。3 NOT IN (1, 2)はtrueですが、候補にNULLを足すと、1でも2でもない上にNULLとの比較が不明のため、全体がNULLになります。一方、候補に等しい値があれば、NULLが混ざっていてもfalseで確定します。WHEREはtrueの行だけを残すので、NULLの行も落ちます。',
      code: 'SELECT\n  3 NOT IN (1, 2) AS without_null,\n  3 NOT IN (1, 2, NULL) AS with_null,\n  1 NOT IN (1, 2, NULL) AS found;',
      resultTable: { headers: ['without_null', 'with_null', 'found'], rows: [['true', 'NULL', 'false']] },
    },
    {
      heading: 'サブクエリの結果にNULLがあると全行が落ちる',
      body: '社員がいないチームを探すつもりで、候補をサブクエリで作ります。employees.team_idは1、1、2、NULLなので、候補にNULLが入ります。総務のid 3は、1とも2とも等しくありませんが、NULLとの比較が不明になるため条件がtrueにならず、結果は0行です。総務に社員がいないという事実は変わっていません。',
      code: 'SELECT *\nFROM teams\nWHERE id NOT IN (\n  SELECT team_id\n  FROM employees\n)\nORDER BY id;',
      resultTable: { headers: ['id', 'name'], rows: [] },
    },
    {
      heading: 'サブクエリ側でIS NOT NULLを付けて除く',
      body: '候補からNULLを取り除けば、NOT INは直感どおり動きます。内側のWHEREにteam_id IS NOT NULLを付けると、候補は1、1、2だけになり、総務が返ります。大和の未配属はどのチームのidとも対応しないので、候補から外しても意味は変わりません。条件は外側ではなく、候補を作るサブクエリの内側に置きます。',
      code: 'SELECT *\nFROM teams\nWHERE id NOT IN (\n  SELECT team_id\n  FROM employees\n  WHERE team_id IS NOT NULL\n)\nORDER BY id;',
      resultTable: { headers: ['id', 'name'], rows: [['3', '総務']] },
    },
    {
      heading: '左辺がNULLの行はNOT INでも返らない',
      body: '候補にNULLがなくても、左辺の値がNULLだと結果はNULLです。team_id NOT IN (2, 3)では、青木と北野（チーム1）が返りますが、未配属の大和はNULL NOT IN (2, 3)がNULLになるため外れます。「開発と総務に所属していない社員」に大和を含めたいなら、OR team_id IS NULLを明示します。',
      code: 'SELECT *\nFROM employees\nWHERE team_id NOT IN (2, 3)\nORDER BY id;',
      resultTable: { headers: ['id', 'name', 'team_id'], rows: [['1', '青木', '1'], ['2', '北野', '1']] },
    },
    {
      heading: 'NOT EXISTSならNULLを気にせず書ける',
      body: 'NOT EXISTSは、相関条件に合う行が1行もないかを調べます。teams.idとemployees.team_idが等しい社員を探し、見つからなければ残すので、総務が返ります。NULLとの比較は「見つからない」扱いになるだけで、全体をNULLにしません。候補にNULLが入りうる列では、IS NOT NULLを付け忘れる心配のないNOT EXISTSが安全な選択です。',
      code: 'SELECT *\nFROM teams\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM employees\n  WHERE employees.team_id = teams.id\n)\nORDER BY id;',
      resultTable: { headers: ['id', 'name'], rows: [['3', '総務']] },
    },
  ],
  mistakes: [
    {
      title: '外側にIS NOT NULLを付けてもNOT INのNULLは消えない',
      body: '候補のNULLが原因なのに、外側にid IS NOT NULLを足しても直りません。teams.idはNULLではなく、問題は内側のteam_idです。この例も結果は0行のままです。IS NOT NULLはサブクエリの中に書きます。',
      code: 'SELECT *\nFROM teams\nWHERE id NOT IN (\n  SELECT team_id\n  FROM employees\n)\n  AND id IS NOT NULL;',
    },
  ],
  notes: [
    {
      title: 'INはNULLが混ざっても、一致する行は返る',
      body: 'IN（= ANYと同じ）は、候補に等しい値が1つでもあればtrueが確定します。そのため候補にNULLが混ざっても、チーム1と2は返ります。困るのは、否定のNOT INで「等しい値がない」ことを確かめる場面です。',
      code: 'SELECT *\nFROM teams\nWHERE id IN (\n  SELECT team_id\n  FROM employees\n)\nORDER BY id;',
    },
    {
      title: 'NOT INは<> ALLと同じ意味',
      body: 'PostgreSQLの公式ドキュメントでは、NOT INは<> ALLと同等と説明されています。ALLの空集合やNULLの扱いはANY・ALLのガイドで詳しく見られます。',
      code: 'SELECT *\nFROM teams\nWHERE id <> ALL (\n  SELECT team_id\n  FROM employees\n  WHERE team_id IS NOT NULL\n)\nORDER BY id;',
    },
    {
      title: '左辺のNULLを含めたいときはORで足す',
      body: '未配属も「開発・総務ではない」に含めるなら、IS NULLを別の条件として足します。三値論理でNULLの行が落ちるのは自然な仕様で、含めるかどうかは業務の意味で決めます。',
      code: 'SELECT *\nFROM employees\nWHERE team_id NOT IN (2, 3)\n  OR team_id IS NULL\nORDER BY id;',
    },
  ],
  faqs: [
    {
      question: 'NOT INの結果が0件になるのはバグですか？',
      answer: 'バグではなく、SQLの三値論理（true・false・NULL）の仕様です。候補にNULLが1つでもあり、等しい値がなければ、NOT INの結果はNULLになりWHEREで落ちます。PostgreSQLの公式ドキュメントにも同じ説明があります。',
    },
    {
      question: 'NOT INとNOT EXISTSはどちらを使うべきですか？',
      answer: '候補を作る列にNULLが入りうるならNOT EXISTSが安全です。NOT NULL制約がある列や、固定の値リストならNOT INでも問題ありません。NULLの有無で結果が変わらないか、一度確認してから選びます。',
    },
    {
      question: 'NULLを含む候補で「含まれない」をtrueにしたいときは？',
      answer: '候補側のNULLは、サブクエリのWHEREでIS NOT NULLを付けて除きます。左辺のNULLをtrue側に含めたいときは、OR 左辺 IS NULLを足します。どちらも、NULLを扱う方針を条件として書く考え方です。',
    },
    {
      question: '左辺がNULLのときのNOT INはどうなりますか？',
      answer: '候補が空でない限り、NULL NOT IN (...)の結果はNULLで、WHEREでは残りません。候補が0行のサブクエリなら、左辺がNULLでもNOT INはtrueになります。',
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：NOT IN（サブクエリ）',
      url: 'https://www.postgresql.org/docs/current/functions-subquery.html#FUNCTIONS-SUBQUERY-NOTIN',
      description: 'NULLが混ざる場合のNOT INの結果と、空のサブクエリの扱い',
    },
    {
      label: 'PostgreSQL公式：EXISTS',
      url: 'https://www.postgresql.org/docs/current/functions-subquery.html#FUNCTIONS-SUBQUERY-EXISTS',
      description: 'EXISTSと、相関する外側の値の扱い',
    },
    {
      label: 'PostgreSQL公式：NOT IN（値のリスト）',
      url: 'https://www.postgresql.org/docs/current/functions-comparisons.html#FUNCTIONS-COMPARISONS-NOT-IN',
      description: '値のリストに対するNOT INとNULLの結果',
    },
  ],
  related: ['exists', 'subquery', 'where', 'coalesce', 'left-join', 'any-all', 'correlated-subquery'],
  practiceCategory: 'not-in',
};
