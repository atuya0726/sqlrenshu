import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE employees (id integer PRIMARY KEY, name text NOT NULL, department text NOT NULL, manager_id integer REFERENCES employees(id), salary integer NOT NULL);
INSERT INTO employees VALUES (1,'青木','営業',NULL,600000),(2,'北野','営業',1,450000),(3,'中央','開発',1,480000),(4,'大和','営業',2,470000),(5,'村上','開発',3,400000);`,
  sources: ['SELECT * FROM employees ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'self-join',
  label: '自己結合',
  title: 'SQLの自己結合（セルフジョイン）とは？上司と部下・同じ部署のペアを求める',
  description: 'SQLの自己結合（セルフジョイン）をPostgreSQLの元の表・SQL・結果表で解説。同じ表に別名を付けて上司名を取得する方法、LEFT JOINで上司のいない行を残す方法、a.id < b.idで重複ペアを避ける方法を学べます。',
  lead: '自己結合は、同じ表を2回使って、行どうしを結び付ける書き方です。社員表のmanager_idは同じ表の社員idを指すので、上司の名前を取るには社員表を「部下側」と「上司側」の2役として扱います。上司と部下、同じ部署のペア、上司より給与が高い社員を同じ5人の表で確認しましょう。',
  sampleIntro: 'employeesは1行が社員1人です。manager_idは直属の上司の社員idで、青木は上司がいないのでNULLです。salaryは月給（円）です。青木は営業、北野は営業で青木の部下、中央は開発で青木の部下、大和は営業で北野の部下、村上は開発で中央の部下です。ORDER BYのない結果の行順は一例で、保証されません。',
  sampleTables: [
    {
      caption: 'employees：社員5人',
      headers: ['id', 'name', 'department', 'manager_id', 'salary'],
      rows: [
        ['1', '青木', '営業', 'NULL', '600000'],
        ['2', '北野', '営業', '1', '450000'],
        ['3', '中央', '開発', '1', '480000'],
        ['4', '大和', '営業', '2', '470000'],
        ['5', '村上', '開発', '3', '400000'],
      ],
    },
  ],
  syntax: 'SELECT e.name, m.name AS manager\nFROM employees AS e\nLEFT JOIN employees AS m\n  ON e.manager_id = m.id;',
  sections: [
    {
      heading: '同じ表を2回使って上司の名前を取り出す',
      body: '同じ表をFROMとJOINの両方に書くので、eとmという別名で区別します。eは部下側、mは上司側です。ONのe.manager_id = m.idは「部下の上司idが、上司側の社員idと一致する」という対応です。INNER JOINでは、青木のようにmanager_idがNULLの行は一致する上司がなく、結果に残りません。このため5人のうち4人だけが表示されます。',
      code: 'SELECT e.name, m.name AS manager\nFROM employees AS e\nINNER JOIN employees AS m\n  ON e.manager_id = m.id\nORDER BY e.id;',
      resultTable: { headers: ['name', 'manager'], rows: [['北野', '青木'], ['中央', '青木'], ['大和', '北野'], ['村上', '中央']] },
    },
    {
      heading: 'LEFT JOINで上司がいない社員も残す',
      body: '部下側の社員を全員表示したいときは、INNER JOINをLEFT JOINに変えます。青木は上司がいないため、managerがNULLの行として残ります。5人全員が1行ずつ表示されるので、上司のいない最上位の社員を見落としません。ONの条件は変わりません。',
      code: 'SELECT e.name, m.name AS manager\nFROM employees AS e\nLEFT JOIN employees AS m\n  ON e.manager_id = m.id\nORDER BY e.id;',
      resultTable: { headers: ['name', 'manager'], rows: [['青木', 'NULL'], ['北野', '青木'], ['中央', '青木'], ['大和', '北野'], ['村上', '中央']] },
    },
    {
      heading: '上司ごとの部下の人数を数える',
      body: '自己結合した結果は普通の結合結果なので、上司側の列でGROUP BYできます。上司側のmを基準に部下の行を数えると、青木は2人、北野と中央は1人です。部下がいない大和と村上は、上司側として現れないため結果に出ません。部下0人の社員も表示したい場合は、上司側を左にしたLEFT JOINにします。',
      code: 'SELECT m.name, COUNT(*) AS subordinates\nFROM employees AS e\nINNER JOIN employees AS m\n  ON e.manager_id = m.id\nGROUP BY m.id, m.name\nORDER BY m.id;',
      resultTable: { headers: ['name', 'subordinates'], rows: [['青木', '2'], ['北野', '1'], ['中央', '1']] },
    },
    {
      heading: '同じ部署のペアを重複なしで作る',
      body: '同じ部署の2人を組にするには、ONでdepartmentの一致を指定します。さらにa.id < b.idを加えると、同じ人どうしの組と、順序だけが違う同じ組を除けます。営業は青木・北野・大和の3人で3組、開発は中央・村上で1組、合計4組です。a.id < b.idがないと、営業は3人×3人の9組、開発は2人×2人の4組で、合計13組になります。',
      code: 'SELECT a.name AS first_name, b.name AS second_name, a.department\nFROM employees AS a\nINNER JOIN employees AS b\n  ON a.department = b.department\n AND a.id < b.id\nORDER BY a.id, b.id;',
      resultTable: { headers: ['first_name', 'second_name', 'department'], rows: [['青木', '北野', '営業'], ['青木', '大和', '営業'], ['北野', '大和', '営業'], ['中央', '村上', '開発']] },
    },
    {
      heading: '部下と上司の値を比べて絞り込む',
      body: '自己結合の利点は、部下の列と上司の列を同じ行に並べられることです。WHEREでe.salary > m.salaryと書けば、上司より給与が高い社員を選べます。大和は470,000円で、上司の北野の450,000円より高いので該当します。北野は450,000円で青木の600,000円より低く、中央の480,000円は青木より低いので除かれます。',
      code: 'SELECT e.name, e.salary, m.name AS manager, m.salary AS manager_salary\nFROM employees AS e\nINNER JOIN employees AS m\n  ON e.manager_id = m.id\nWHERE e.salary > m.salary\nORDER BY e.id;',
      resultTable: { headers: ['name', 'salary', 'manager', 'manager_salary'], rows: [['大和', '470000', '北野', '450000']] },
    },
    {
      heading: '上司の上司まで2段階でたどる',
      body: '上司の上司を知るには、同じ表をもう1回結合して、e、m、gの3役にします。mは直属の上司、gはその上司です。大和は北野の部下で、北野の上司は青木なので、2段階上は青木です。青木と、青木の直属の部下である北野と中央は、2段階上がいないのでNULLになります。段階が増えるたびに結合を足すため、深さが決まっていない階層は再帰CTEが向きます。',
      code: 'SELECT e.name, m.name AS manager, g.name AS grand_manager\nFROM employees AS e\nLEFT JOIN employees AS m\n  ON e.manager_id = m.id\nLEFT JOIN employees AS g\n  ON m.manager_id = g.id\nORDER BY e.id;',
      resultTable: { headers: ['name', 'manager', 'grand_manager'], rows: [['青木', 'NULL', 'NULL'], ['北野', '青木', 'NULL'], ['中央', '青木', 'NULL'], ['大和', '北野', '青木'], ['村上', '中央', '青木']] },
    },
  ],
  mistakes: [
    {
      title: 'a.id <> b.idだと同じペアが2回出る',
      body: 'ペアを作るときに重複を避けるつもりでa.id <> b.idと書くと、同じ人どうしは消えても、青木と北野、北野と青木のように順序違いが両方残ります。この表では営業が6組、開発が2組の8行になり、組み合わせの数が2倍になります。順序を区別しない組には、a.id < b.idのように片方向だけにします。',
      code: 'SELECT a.name AS first_name, b.name AS second_name\nFROM employees AS a\nINNER JOIN employees AS b\n  ON a.department = b.department\n AND a.id <> b.id;',
    },
    {
      title: 'LEFT JOINの後に上司側の列をWHEREで絞ると、上司のいない行が消える',
      body: '上司のいない青木はm.departmentがNULLです。LEFT JOINの後にWHERE m.department = \'営業\'を書くと、NULLとの比較は真にならず、青木の行が消えて実質INNER JOINになります。上司がいない行を残したまま上司側の値で絞るなら、条件をONに書くか、IS NULLも許す条件にします。',
      code: 'SELECT e.name, m.name AS manager\nFROM employees AS e\nLEFT JOIN employees AS m\n  ON e.manager_id = m.id\nWHERE m.department = \'営業\';',
    },
  ],
  notes: [
    {
      title: '重複なしのペア数はn×(n-1)÷2',
      body: '同じグループにn人いるとき、a.id < b.idで作るペアはn×(n-1)÷2組です。営業3人なら3組、開発2人なら1組で、合計4組になります。人数が増えると組み合わせは急に増えるため、全員のペアを作る前にONやWHEREで範囲を絞ります。',
      code: 'SELECT COUNT(*)\nFROM employees AS a\nINNER JOIN employees AS b\n  ON a.department = b.department\n AND a.id < b.id;',
    },
    {
      title: '同じ表を複数回使うときは別名が必須',
      body: '公式ドキュメントでは、別名は自己結合のように同じ表を複数回走査するときのあいまいさをなくす手段として説明されています。別名を付けた表は元の表名では参照できません。eとmのように、役割が分かる短い名前を付けると、ONの対応を読み間違えにくくなります。',
    },
  ],
  faqs: [
    {
      question: '自己結合は特別なJOINの種類ですか？',
      answer: '別の種類ではなく、INNER JOINやLEFT JOINに同じ表を2回指定する使い方です。表に別名を付けて、1つを部下側、もう1つを上司側のように別の役割で使います。',
    },
    {
      question: '上司がいない社員を残すにはどうしますか？',
      answer: '部下側を左にしたLEFT JOINにします。この表では青木のmanager_idがNULLなので、INNER JOINでは消えますが、LEFT JOINならmanagerがNULLの行として残ります。',
    },
    {
      question: 'ペアの重複を避ける条件はa.id < b.idだけですか？',
      answer: '順序を区別しないペアなら、主キーのような一意な列でa.id < b.idにするのが基本です。a.id <> b.idでは、順序違いの組が両方残ります。同じ人どうしを除くだけでよい場合に限って使います。',
    },
    {
      question: '階層が何段あるか分からない場合も自己結合で書けますか？',
      answer: '段数が決まっていれば、結合を段数分だけ足せます。この表の上司の上司は2回結合です。段数が不定の場合は、再帰CTE（WITH RECURSIVE）で上司をたどる方が書きやすくなります。',
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：結合テーブル（JOIN）',
      url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN',
      description: 'INNER・LEFT・FULL・CROSS JOINの定義とON条件',
    },
    {
      label: 'PostgreSQL公式：テーブルとカラムの別名',
      url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-TABLE-ALIASES',
      description: '同じ表を複数回参照するための別名（自己結合）',
    },
  ],
  related: ['inner-join', 'left-join', 'cross-join', 'with-recursive', 'group-by', 'where'],
  practiceCategory: 'self-join',
};
