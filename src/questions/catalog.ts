import { extraTopicSlugs } from '../lib/categories';
import type { Question, QuestionCore, QuestionTranslation } from '@/lib/types';
import { advancedEntries } from './advanced';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation; en?: QuestionTranslation } };

const employees = `
CREATE TABLE employees (
  id integer PRIMARY KEY,
  name text NOT NULL,
  department text NOT NULL,
  salary integer NOT NULL,
  active boolean NOT NULL
);
INSERT INTO employees VALUES
  (1, 'Alice', 'Sales', 520000, true),
  (2, 'Bob', 'Engineering', 610000, true),
  (3, 'Chika', 'Sales', 430000, false),
  (4, 'Daichi', 'Engineering', 610000, true),
  (5, 'Emi', 'Support', 390000, true);`;

const selectBasics = `
CREATE TABLE users (
  id integer PRIMARY KEY,
  name text NOT NULL,
  city text NOT NULL,
  age integer NOT NULL
);
INSERT INTO users VALUES
  (1, 'Alice', 'Tokyo', 25),
  (2, 'Bob', 'Osaka', 32),
  (3, 'Carol', 'Tokyo', 28),
  (4, 'Dave', 'Fukuoka', 41);`;

const orderByBasics = `
CREATE TABLE staff_directory (
  id integer PRIMARY KEY,
  name text NOT NULL,
  department text NOT NULL,
  salary integer NOT NULL,
  manager_id integer,
  hired_on date NOT NULL
);
INSERT INTO staff_directory VALUES
  (1, 'Aki', 'Sales', 520000, NULL, '2023-04-01'),
  (2, 'Beni', 'Engineering', 610000, 5, '2022-10-15'),
  (3, 'Chika', 'Sales', 520000, 1, '2024-01-10'),
  (4, 'Daichi', 'Engineering', 610000, 5, '2021-07-01'),
  (5, 'Emi', 'Management', 750000, NULL, '2020-04-01'),
  (6, 'Fumi', 'Support', 430000, 5, '2024-01-10'),
  (7, 'Gen', 'Support', 430000, 6, '2023-11-20');`;

const commerce = `
CREATE TABLE customers (id integer PRIMARY KEY, name text NOT NULL, region text NOT NULL);
CREATE TABLE orders (id integer PRIMARY KEY, customer_id integer REFERENCES customers(id), ordered_on date NOT NULL, amount integer NOT NULL, status text NOT NULL);
INSERT INTO customers VALUES (1,'青木商店','東'),(2,'北野物産','西'),(3,'中央商事','東'),(4,'大和食品','西'),(5,'えびす屋','東');
INSERT INTO orders VALUES
  (101,1,'2026-01-10',12000,'paid'),(102,1,'2026-02-03',8000,'paid'),
  (103,2,'2026-01-22',25000,'paid'),(104,2,'2026-03-11',6000,'cancelled'),
  (105,3,'2026-02-14',18000,'paid'),(106,3,'2026-03-02',22000,'paid'),
  (107,4,'2026-03-18',9000,'paid');`;

const monthlySales = `
CREATE TABLE sales (id integer PRIMARY KEY, salesperson text NOT NULL, region text NOT NULL, sold_month date NOT NULL, amount integer NOT NULL);
INSERT INTO sales VALUES
  (1,'Akira','East','2026-01-01',100),(2,'Akira','East','2026-02-01',160),(3,'Akira','East','2026-03-01',130),
  (4,'Beth','East','2026-01-01',140),(5,'Beth','East','2026-02-01',140),(6,'Beth','East','2026-03-01',180),
  (7,'Carlos','West','2026-01-01',90),(8,'Carlos','West','2026-02-01',150),(9,'Carlos','West','2026-03-01',210),
  (10,'Dina','West','2026-01-01',120),(11,'Dina','West','2026-02-01',170),(12,'Dina','West','2026-03-01',160);`;


const defaults = {
  grading: { mode: 'result', compareRowOrder: true, compareColumnOrder: true, numericTolerance: 0 } as const,
  compatibility: { dialect: 'standard', postgres: true, mysql: true, sqlite: true, standardSql: true } as const,
  source: { type: 'original' } as const,
};

function entry(
  core: Omit<QuestionCore, 'grading' | 'compatibility' | 'source'> & Partial<Pick<QuestionCore, 'grading' | 'compatibility' | 'source'>>,
  copy: QuestionTranslation,
): Entry {
  return { core: { ...defaults, ...core }, translations: { ja: copy } } as Entry;
}

const solution = (title: string, description: string, solutionSql: string, hints: string[] = [], explanation = ''): QuestionTranslation => ({
  title,
  description,
  hints: hints.length ? hints : ['取得する列と、行を絞る条件を分けて考えましょう。'],
  explanation: explanation || `期待する行を作るために、${title}の条件を順番にSQLへ落とし込みます。`,
  solutionSql,
});

// src/questions/topics/{slug}.ts は `entries` をexportする。ファイルを置くだけで演習に加わり、順序は extraTopicSlugs に従う。
const extraQuestionModules = import.meta.glob<{ entries: Entry[] }>('./topics/*.ts', { eager: true });
const extraOrder = (category: string) => { const index = extraTopicSlugs.indexOf(category); return index === -1 ? extraTopicSlugs.length : index; };
const extraEntries: Entry[] = Object.values(extraQuestionModules)
  .map((module) => module.entries)
  .sort((a, b) => extraOrder(a[0]?.core.category ?? '') - extraOrder(b[0]?.core.category ?? ''))
  .flat();

export const questionEntries: Entry[] = [
  entry({ id:'select-01',slug:'select-all-columns',category:'select',level:1,setupSql:selectBasics,expectedResult:{columns:['id','name','city','age'],rows:[{id:1,name:'Alice',city:'Tokyo',age:25},{id:2,name:'Bob',city:'Osaka',age:32},{id:3,name:'Carol',city:'Tokyo',age:28},{id:4,name:'Dave',city:'Fukuoka',age:41}]},grading:{...defaults.grading,compareRowOrder:false},tags:['SELECT','*']}, solution('SELECT *で全列を取得する','usersテーブルの全列を取得してください。','SELECT *\nFROM users;',['特定の列を指定せず全列を取得したいときは*を使います。'],'*はテーブルの全列を、テーブル定義の順番で返します。特定の列だけがほしいときは、*の代わりに列名をカンマ区切りで書きます。')),
  entry({ id:'select-02',slug:'select-columns',category:'select',level:1,setupSql:selectBasics,expectedResult:{columns:['name','age'],rows:[{name:'Alice',age:25},{name:'Bob',age:32},{name:'Carol',age:28},{name:'Dave',age:41}]},grading:{...defaults.grading,compareRowOrder:false},tags:['SELECT']}, solution('列の指定','usersテーブからname列とage列を取得してください。','SELECT name, age\nFROM users;',['SELECTの後ろに取得したい列名をカンマ区切りで書きます。'],'SELECT句でnameとageを指定し、FROM句でusersテーブを指定します。')),
  entry({ id:'select-03',slug:'select-alias',category:'select',level:1,setupSql:selectBasics,expectedResult:{columns:['user_name','user_age'],rows:[{user_name:'Alice',user_age:25},{user_name:'Bob',user_age:32},{user_name:'Carol',user_age:28},{user_name:'Dave',user_age:41}]},grading:{...defaults.grading,compareRowOrder:false},tags:['SELECT','AS']}, solution('AS','usersのname列をuser_name、age列をuser_ageという列名で取得してください。','SELECT name AS user_name, age AS user_age\nFROM users;',['列名の後ろにASと表示したい別名を書きます。'],'ASは結果の列名を分かりやすい名前に変えます。元のテーブの列名は変更されません。')),
  entry({ id:'select-04',slug:'select-expression',category:'select',level:2,setupSql:employees,starterSql:'SELECT\n  -- 必要な列と計算式\nFROM employees;',expectedResult:{columns:['employee_name','monthly_salary','annual_salary'],rows:[{employee_name:'Alice',monthly_salary:520000,annual_salary:6240000},{employee_name:'Bob',monthly_salary:610000,annual_salary:7320000},{employee_name:'Chika',monthly_salary:430000,annual_salary:5160000},{employee_name:'Daichi',monthly_salary:610000,annual_salary:7320000},{employee_name:'Emi',monthly_salary:390000,annual_salary:4680000}]},grading:{...defaults.grading,compareRowOrder:false},tags:['SELECT','expression','AS']}, solution('計算式','employeesから氏名、月給、月給を12倍した年収を取得してください。列名はそれぞれemployee_name、monthly_salary、annual_salaryとします。','SELECT name AS employee_name, salary AS monthly_salary, salary * 12 AS annual_salary\nFROM employees;',['取得する元の列、計算式、結果に付ける別名を1つずつ整理しましょう。'],'必要な列だけをSELECTし、salary * 12で年収を計算します。元の列と計算結果の両方にASで意味の分かる名前を付けます。')),
  entry({ id:'select-05',slug:'select-distinct',category:'select',level:1,setupSql:selectBasics,expectedResult:{columns:['city'],rows:[{city:'Tokyo'},{city:'Osaka'},{city:'Fukuoka'}]},grading:{...defaults.grading,compareRowOrder:false},tags:['SELECT','DISTINCT']}, solution('DISTINCT','usersテーブのcity列を、重複を除いて取得してください。','SELECT DISTINCT city\nFROM users;',['DISTINCTはSELECTの直後に書きます。'],'cityにはTokyoが2件ありますが、SELECT DISTINCTを使うと同じ値は1行にまとまります。')),
  entry({ id:'select-06',slug:'chapter-review-distinct-salary-patterns',category:'select',level:2,setupSql:employees,starterSql:'SELECT DISTINCT\n  -- 重複を判定する列と式\nFROM employees;',expectedResult:{columns:['department_name','annual_salary'],rows:[{department_name:'Sales',annual_salary:6240000},{department_name:'Engineering',annual_salary:7320000},{department_name:'Sales',annual_salary:5160000},{department_name:'Support',annual_salary:4680000}]},grading:{...defaults.grading,compareRowOrder:false},tags:['SELECT','DISTINCT','expression','AS','chapter review']}, {...solution('章末問題：DISTINCT・AS・計算式','employeesから部署名と年収の組み合わせを重複なしで取得してください。列名はdepartment_nameとannual_salaryとし、年収はsalaryを12倍して求めます。','SELECT DISTINCT department AS department_name, salary * 12 AS annual_salary\nFROM employees;',['DISTINCTは、SELECTした列全体の組み合わせが同じ行を1つにまとめます。'],'departmentとsalary * 12をSELECTし、それぞれに別名を付けます。Engineeringの同じ給与の2人は選択した2列が一致するため、DISTINCTによって1行になります。'),requirements:['departmentと年収だけを取得する','salary * 12で年収を計算する','ASで2列に別名を付ける','SELECT DISTINCTで同じ部署・年収の組み合わせを除く']}),

  entry({ id:'order-by-01',slug:'name-ascending',category:'order-by',level:1,setupSql:orderByBasics,expectedResult:{columns:['id','name','department','salary','manager_id','hired_on'],rows:[{id:1,name:'Aki',department:'Sales',salary:520000,manager_id:null,hired_on:'2023-04-01'},{id:2,name:'Beni',department:'Engineering',salary:610000,manager_id:5,hired_on:'2022-10-15'},{id:3,name:'Chika',department:'Sales',salary:520000,manager_id:1,hired_on:'2024-01-10'},{id:4,name:'Daichi',department:'Engineering',salary:610000,manager_id:5,hired_on:'2021-07-01'},{id:5,name:'Emi',department:'Management',salary:750000,manager_id:null,hired_on:'2020-04-01'},{id:6,name:'Fumi',department:'Support',salary:430000,manager_id:5,hired_on:'2024-01-10'},{id:7,name:'Gen',department:'Support',salary:430000,manager_id:6,hired_on:'2023-11-20'}]},tags:['ORDER BY','ASC']}, solution('ASC','staff_directoryを、氏名の昇順で取得してください。','SELECT *\nFROM staff_directory\nORDER BY name ASC;',['低い値から高い値へ並べるにはASCを使います。'],'nameにASCを指定すると、アルファベットの早い名前から順に並びます。並べ替え条件はnameの1つだけです。')),
  entry({ id:'order-by-02',slug:'multiple-sort-columns',category:'order-by',level:2,setupSql:orderByBasics,starterSql:'SELECT *\nFROM staff_directory\nORDER BY department;',expectedResult:{columns:['id','name','department','salary','manager_id','hired_on'],rows:[{id:2,name:'Beni',department:'Engineering',salary:610000,manager_id:5,hired_on:'2022-10-15'},{id:4,name:'Daichi',department:'Engineering',salary:610000,manager_id:5,hired_on:'2021-07-01'},{id:5,name:'Emi',department:'Management',salary:750000,manager_id:null,hired_on:'2020-04-01'},{id:1,name:'Aki',department:'Sales',salary:520000,manager_id:null,hired_on:'2023-04-01'},{id:3,name:'Chika',department:'Sales',salary:520000,manager_id:1,hired_on:'2024-01-10'},{id:6,name:'Fumi',department:'Support',salary:430000,manager_id:5,hired_on:'2024-01-10'},{id:7,name:'Gen',department:'Support',salary:430000,manager_id:6,hired_on:'2023-11-20'}]},tags:['ORDER BY','multiple columns','ASC','DESC']}, solution('複数列','部署の昇順、同じ部署では給与の降順、さらに同額ならidの昇順で取得してください。','SELECT *\nFROM staff_directory\nORDER BY department ASC, salary DESC, id ASC;',['ORDER BYの条件は、優先度の高い列からカンマ区切りで並べます。'],'最初にdepartment、同じ部署の中をsalary、さらに同額の行をidで比較します。ASCとDESCは列ごとに指定します。')),
  entry({ id:'order-by-03',slug:'nulls-last',category:'order-by',level:2,setupSql:orderByBasics,starterSql:'SELECT *\nFROM staff_directory\nORDER BY manager_id ASC;',expectedResult:{columns:['id','name','department','salary','manager_id','hired_on'],rows:[{id:3,name:'Chika',department:'Sales',salary:520000,manager_id:1,hired_on:'2024-01-10'},{id:2,name:'Beni',department:'Engineering',salary:610000,manager_id:5,hired_on:'2022-10-15'},{id:4,name:'Daichi',department:'Engineering',salary:610000,manager_id:5,hired_on:'2021-07-01'},{id:6,name:'Fumi',department:'Support',salary:430000,manager_id:5,hired_on:'2024-01-10'},{id:7,name:'Gen',department:'Support',salary:430000,manager_id:6,hired_on:'2023-11-20'},{id:1,name:'Aki',department:'Sales',salary:520000,manager_id:null,hired_on:'2023-04-01'},{id:5,name:'Emi',department:'Management',salary:750000,manager_id:null,hired_on:'2020-04-01'}]},tags:['ORDER BY','NULLS LAST','ASC']}, solution('NULLS LAST','上司idの昇順で取得してください。上司idがNULLの社員は末尾にし、同じ上司idではidの昇順にします。','SELECT *\nFROM staff_directory\nORDER BY manager_id ASC NULLS LAST, id ASC;',['並べ替える列のASCまたはDESCの後ろにNULLS LASTを書きます。'],'manager_id ASC NULLS LASTでNULLの位置を明示し、同じmanager_idの行はidで安定した順序にします。')),
  entry({ id:'order-by-04',slug:'latest-hires-limit',category:'order-by',level:2,setupSql:orderByBasics,starterSql:'SELECT *\nFROM staff_directory\nORDER BY\nLIMIT 3;',expectedResult:{columns:['id','name','department','salary','manager_id','hired_on'],rows:[{id:3,name:'Chika',department:'Sales',salary:520000,manager_id:1,hired_on:'2024-01-10'},{id:6,name:'Fumi',department:'Support',salary:430000,manager_id:5,hired_on:'2024-01-10'},{id:7,name:'Gen',department:'Support',salary:430000,manager_id:6,hired_on:'2023-11-20'}]},tags:['ORDER BY','DESC','LIMIT']}, solution('LIMIT','入社日の新しい順で3人だけ取得してください。同じ入社日ではidの小さい順にします。','SELECT *\nFROM staff_directory\nORDER BY hired_on DESC, id ASC\nLIMIT 3;',['先にORDER BYで全体の順序を決め、その後LIMITで先頭3行に絞ります。'],'hired_onをDESCで並べ、同日ならidのASCで順序を固定します。その結果へLIMIT 3を適用します。')),
  entry({ id:'order-by-05',slug:'chapter-review-staff-priority',category:'order-by',level:3,setupSql:orderByBasics,starterSql:'SELECT *\nFROM staff_directory\nORDER BY\nLIMIT ;',expectedResult:{columns:['id','name','department','salary','manager_id','hired_on'],rows:[{id:3,name:'Chika',department:'Sales',salary:520000,manager_id:1,hired_on:'2024-01-10'},{id:2,name:'Beni',department:'Engineering',salary:610000,manager_id:5,hired_on:'2022-10-15'},{id:4,name:'Daichi',department:'Engineering',salary:610000,manager_id:5,hired_on:'2021-07-01'},{id:6,name:'Fumi',department:'Support',salary:430000,manager_id:5,hired_on:'2024-01-10'},{id:7,name:'Gen',department:'Support',salary:430000,manager_id:6,hired_on:'2023-11-20'}]},tags:['ORDER BY','ASC','DESC','NULLS LAST','LIMIT','chapter review']}, {...solution('章末問題：複数列・NULLS LAST・LIMIT','5人分取得してください。上司idの昇順、同じ上司では給与の降順、さらに同額なら社員idの昇順にし、上司のいない社員は末尾にします。','SELECT *\nFROM staff_directory\nORDER BY manager_id ASC NULLS LAST, salary DESC, id ASC\nLIMIT 5;',['並べ替え条件を「上司id」「給与」「社員id」の優先順に分け、NULLの位置と件数制限を最後に確認しましょう。'],'manager_idにはASCとNULLS LAST、salaryにはDESC、idにはASCを指定します。並べ替えた結果の先頭5行をLIMITで取得します。'),requirements:['manager_idは昇順、NULLは末尾にする','同じmanager_idではsalaryを降順にする','さらに同額ならidを昇順にする','並べ替えた結果を5行に制限する']}),
  entry({ id:'order-by-06',slug:'cumulative-review-select-order-by',category:'order-by',level:4,setupSql:orderByBasics,starterSql:'SELECT *\nFROM staff_directory\nORDER BY \nLIMIT ;',expectedResult:{columns:['id','name','department','salary','manager_id','hired_on'],rows:[{id:5,name:'Emi',department:'Management',salary:750000,manager_id:null,hired_on:'2020-04-01'},{id:4,name:'Daichi',department:'Engineering',salary:610000,manager_id:5,hired_on:'2021-07-01'},{id:2,name:'Beni',department:'Engineering',salary:610000,manager_id:5,hired_on:'2022-10-15'}]},tags:['SELECT','ORDER BY','LIMIT','cumulative review']}, {...solution('まとめ問題：SELECT・ORDER BY','staff_directoryから、給与の高い順に3人だけ表示してください。同額なら入社日(hired_on)が古い順にします。','SELECT *\nFROM staff_directory\nORDER BY salary DESC, hired_on ASC\nLIMIT 3;',['複数条件での並べ替えとLIMITはORDER BYの章で学んだ内容です。','同額のときの並び順はORDER BYに2つ目の条件を追加して決めます。'],'ORDER BYで給与の高い順、同額なら入社日の古い順に並べてからLIMITで3件に絞ります。複数の条件を組み合わせて安定した順序を作る問題です。'),requirements:['salaryの降順で並べる','同額の場合は入社日(hired_on)の昇順にする','結果を3件に制限する']}),

  entry({ id:'where-01',slug:'name-filter',category:'where',level:1,setupSql:employees,starterSql:'SELECT *\nFROM employees\nWHERE ;',expectedResult:{columns:['id','name','department','salary','active'],rows:[{id:2,name:'Bob',department:'Engineering',salary:610000,active:true}]},grading:{...defaults.grading,compareRowOrder:false},tags:['WHERE','=']}, solution('=で絞り込む','名前がBobの社員を取得してください。',"SELECT *\nFROM employees\nWHERE name = 'Bob';",['文字列を比較するときは=を使い、値はシングルクォートで囲みます。'],"WHERE name = 'Bob'と書くと、name列がBobと完全に一致する行だけが残ります。")),
  entry({ id:'where-02',slug:'and-conditions',category:'where',level:1,setupSql:employees,starterSql:'SELECT *\nFROM employees\nWHERE ;',expectedResult:{columns:['id','name','department','salary','active'],rows:[{id:1,name:'Alice',department:'Sales',salary:520000,active:true},{id:3,name:'Chika',department:'Sales',salary:430000,active:false}]},grading:{...defaults.grading,compareRowOrder:false},tags:['WHERE','AND']}, solution('AND','Sales部署に所属し、給与が400000より大きく600000未満の社員を取得してください。',"SELECT *\nFROM employees\nWHERE department = 'Sales' AND salary > 400000 AND salary < 600000;",['複数の条件をすべて満たす行だけを残すにはANDでつなげます。'],"department = 'Sales'、salary > 400000、salary < 600000という3つの条件をすべて満たす行だけが残ります。ANDはすべての条件を同時に満たす行を選びます。")),
  entry({ id:'where-03',slug:'salary-range',category:'where',level:1,setupSql:employees,starterSql:'SELECT *\nFROM employees\nWHERE ;',expectedResult:{columns:['id','name','department','salary','active'],rows:[{id:1,name:'Alice',department:'Sales',salary:520000,active:true},{id:3,name:'Chika',department:'Sales',salary:430000,active:false}]},grading:{...defaults.grading,compareRowOrder:false},tags:['WHERE','BETWEEN']}, solution('BETWEEN','給与が400000以上600000以下の社員を取得してください。','SELECT *\nFROM employees\nWHERE salary BETWEEN 400000 AND 600000;',['範囲の絞り込みにはBETWEEN ... AND ...、または>=と<=の組み合わせを使います。'],'BETWEEN 400000 AND 600000は、400000以上600000以下（両端を含む）という条件です。')),
  entry({ id:'where-04',slug:'department-in-list',category:'where',level:2,setupSql:employees,starterSql:'SELECT *\nFROM employees\nWHERE ;',expectedResult:{columns:['id','name','department','salary','active'],rows:[{id:1,name:'Alice',department:'Sales',salary:520000,active:true},{id:3,name:'Chika',department:'Sales',salary:430000,active:false},{id:5,name:'Emi',department:'Support',salary:390000,active:true}]},grading:{...defaults.grading,compareRowOrder:false},tags:['WHERE','IN']}, solution('IN','部署がSalesまたはSupportの社員を取得してください。',"SELECT *\nFROM employees\nWHERE department IN ('Sales', 'Support');",['候補が複数あるときはORを重ねるよりINのほうが簡潔に書けます。'],"department IN ('Sales', 'Support')は、departmentがSalesかSupportのどちらかに一致する行を返します。")),
  entry({ id:'where-05',slug:'name-pattern-search',category:'where',level:2,setupSql:employees,starterSql:"SELECT *\nFROM employees\nWHERE name LIKE 'A%';",expectedResult:{columns:['id','name','department','salary','active'],rows:[{id:1,name:'Alice',department:'Sales',salary:520000,active:true},{id:5,name:'Emi',department:'Support',salary:390000,active:true}]},grading:{...defaults.grading,compareRowOrder:false},tags:['WHERE','LIKE','OR']}, solution('LIKEとOR','名前がAまたはEで始まる社員を取得してください。',"SELECT *\nFROM employees\nWHERE name LIKE 'A%' OR name LIKE 'E%';")),
  entry({ id:'where-06',slug:'no-manager-employees',category:'where',level:2,setupSql:orderByBasics,starterSql:'SELECT *\nFROM staff_directory\nWHERE manager_id = NULL;',expectedResult:{columns:['id','name','department','salary','manager_id','hired_on'],rows:[{id:1,name:'Aki',department:'Sales',salary:520000,manager_id:null,hired_on:'2023-04-01'},{id:5,name:'Emi',department:'Management',salary:750000,manager_id:null,hired_on:'2020-04-01'}]},grading:{...defaults.grading,compareRowOrder:false},tags:['WHERE','IS NULL']}, solution('IS NULL','上司id(manager_id)が設定されていない社員を取得してください。','SELECT *\nFROM staff_directory\nWHERE manager_id IS NULL;',['NULLかどうかは = ではなくIS NULLで判定します。'],'NULLは「値がない」ことを表すため、manager_id = NULLは常にtrueになりません。IS NULLを使うと正しく判定できます。')),
  entry({ id:'where-07',slug:'chapter-review-active-department-salary',category:'where',level:3,setupSql:employees,starterSql:'SELECT *\nFROM employees\nWHERE ;',expectedResult:{columns:['id','name','department','salary','active'],rows:[{id:1,name:'Alice',department:'Sales',salary:520000,active:true},{id:2,name:'Bob',department:'Engineering',salary:610000,active:true},{id:4,name:'Daichi',department:'Engineering',salary:610000,active:true}]},grading:{...defaults.grading,compareRowOrder:false},tags:['WHERE','AND','OR','chapter review']}, {...solution('章末問題：AND・OR・カッコ','employeesから、activeがtrueかつSalesまたはEngineering部署に所属し、給与が500000以上の社員を取得してください。',"SELECT *\nFROM employees\nWHERE active = true\n  AND (department = 'Sales' OR department = 'Engineering')\n  AND salary >= 500000;",['ANDとORが混ざるときは、優先させたいOR条件を括弧でくくります。','条件を「稼働中」「部署」「給与」の3つに分けて考えましょう。'],'ANDはORより先に評価されるため、department = \'Sales\' OR department = \'Engineering\'は括弧で囲んでからANDと組み合わせます。'),requirements:['activeがtrueの社員に絞る','部署はSalesまたはEngineeringのどちらかにする','給与が500000以上の社員に絞る','括弧でOR条件をまとめてからANDと組み合わせる']}),
  entry({ id:'where-08',slug:'cumulative-review-select-order-by-where',category:'where',level:4,setupSql:orderByBasics,starterSql:'SELECT *\nFROM staff_directory\nWHERE \nORDER BY ;',expectedResult:{columns:['id','name','department','salary','manager_id','hired_on'],rows:[{id:2,name:'Beni',department:'Engineering',salary:610000,manager_id:5,hired_on:'2022-10-15'},{id:4,name:'Daichi',department:'Engineering',salary:610000,manager_id:5,hired_on:'2021-07-01'},{id:3,name:'Chika',department:'Sales',salary:520000,manager_id:1,hired_on:'2024-01-10'}]},tags:['SELECT','ORDER BY','WHERE','cumulative review']}, {...solution('まとめ問題：SELECT・ORDER BY・WHERE','staff_directoryから、上司がいて(manager_idがNULLでない)給与が500000以上の社員を取得してください。部署名の昇順、同じ部署内では給与の降順、さらに同額なら社員idの昇順で並べてください。','SELECT *\nFROM staff_directory\nWHERE manager_id IS NOT NULL AND salary >= 500000\nORDER BY department ASC, salary DESC, id ASC;',['絞り込みはWHEREの章、複数条件での並べ替えはORDER BYの章で学んだ内容です。','manager_idがNULLでないことはIS NOT NULLで判定します。'],'WHEREで上司の有無と給与を絞り込み、ORDER BYで部署→給与→idの優先順に並べます。複数の章の要素を1つのSQLにまとめる問題です。'),requirements:['manager_idがNULLでない社員に絞る','給与が500000以上の社員に絞る','部署名の昇順で並べる','同じ部署内は給与の降順にする','さらに同額なら社員idの昇順にする']}),

  ...advancedEntries({ employees, commerce, orderByBasics, monthlySales }),
  ...extraEntries,
];

export const questions: Question[] = questionEntries.map(({ core, translations }) => ({ ...core, ...translations.ja }));

export function getQuestionsByCategory(category: string): Question[] {
  return questions.filter((question) => question.category === category);
}

export function getQuestion(id: string): Question | undefined {
  return questions.find((question) => question.id === id);
}
