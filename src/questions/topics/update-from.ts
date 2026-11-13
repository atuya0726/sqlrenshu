import { buildExerciseEntries, type Exercise } from '../exerciseEntries';

const setup = "CREATE TABLE departments (id integer PRIMARY KEY, name text NOT NULL, allowance integer NOT NULL);\nINSERT INTO departments VALUES (10, '営業', 5000), (20, '開発', 8000), (30, '総務', 3000);\nCREATE TABLE employees (id integer PRIMARY KEY, name text NOT NULL, dept_id integer NOT NULL, salary integer NOT NULL, allowance integer NOT NULL DEFAULT 0, overtime_hours integer NOT NULL DEFAULT 0, status text NOT NULL);\nINSERT INTO employees (id, name, dept_id, salary, status) VALUES (1, '佐藤', 10, 300000, 'active'), (2, '鈴木', 10, 280000, 'active'), (3, '田中', 20, 250000, 'active'), (4, '高橋', 20, 320000, 'leave'), (5, '伊藤', 30, 270000, 'active'), (6, '渡辺', 99, 260000, 'active');\nCREATE TABLE salary_revisions (emp_id integer PRIMARY KEY, new_salary integer NOT NULL);\nINSERT INTO salary_revisions VALUES (1, 320000), (2, 270000), (3, 265000), (4, 310000), (9, 400000);\nCREATE TABLE overtime (emp_id integer NOT NULL, hours integer NOT NULL);\nINSERT INTO overtime VALUES (1, 10), (1, 5), (3, 20), (5, 8);";

const exercises: Exercise[] = [
  {
    "slug": "update-from-basic",
    "title": "UPDATE FROM",
    "description": "salary_revisions の新しい給与（new_salary）で、employees の給与（salary）を更新してください。社員は emp_id と id で対応します。",
    "sql": "UPDATE employees\nSET salary = r.new_salary\nFROM salary_revisions AS r\nWHERE employees.id = r.emp_id;",
    "hint": "更新先とsalary_revisionsを結ぶ条件を、WHEREに書きます。",
    "explanation": "id 1・2・3・4の給与が改定額に変わります（id 2は270000円への減額も含みます）。id 5と6は一致する改定が無く、emp_idが9の行もemployeesに社員がいないので、どちらも影響しません。",
    "starter": "UPDATE employees\nSET salary = r.new_salary\nFROM salary_revisions AS r\n",
    "columns": [
      "id",
      "name",
      "dept_id",
      "salary",
      "allowance",
      "overtime_hours",
      "status"
    ],
    "rows": [
      [
        1,
        "佐藤",
        10,
        320000,
        0,
        0,
        "active"
      ],
      [
        2,
        "鈴木",
        10,
        270000,
        0,
        0,
        "active"
      ],
      [
        3,
        "田中",
        20,
        265000,
        0,
        0,
        "active"
      ],
      [
        4,
        "高橋",
        20,
        310000,
        0,
        0,
        "leave"
      ],
      [
        5,
        "伊藤",
        30,
        270000,
        0,
        0,
        "active"
      ],
      [
        6,
        "渡辺",
        99,
        260000,
        0,
        0,
        "active"
      ]
    ]
  },
  {
    "slug": "update-from-filter",
    "title": "UPDATE FROM・結合条件への絞り込み",
    "description": "salary_revisions の新しい給与で、在職中（status が active）の社員だけ給与を更新してください。",
    "sql": "UPDATE employees\nSET salary = r.new_salary\nFROM salary_revisions AS r\nWHERE employees.id = r.emp_id\n  AND employees.status = 'active';",
    "hint": "結合条件にANDで、更新先の列を使った条件を足します。",
    "explanation": "改定があるのはid 1・2・3・4ですが、休職中（leave）のid 4は条件を満たさないので、320000円のままです。在職中ならid 2の減額（270000円）も反映されます。絞り込みを忘れるとid 4が310000円に変わってしまいます。",
    "columns": [
      "id",
      "name",
      "dept_id",
      "salary",
      "allowance",
      "overtime_hours",
      "status"
    ],
    "rows": [
      [
        1,
        "佐藤",
        10,
        320000,
        0,
        0,
        "active"
      ],
      [
        2,
        "鈴木",
        10,
        270000,
        0,
        0,
        "active"
      ],
      [
        3,
        "田中",
        20,
        265000,
        0,
        0,
        "active"
      ],
      [
        4,
        "高橋",
        20,
        320000,
        0,
        0,
        "leave"
      ],
      [
        5,
        "伊藤",
        30,
        270000,
        0,
        0,
        "active"
      ],
      [
        6,
        "渡辺",
        99,
        260000,
        0,
        0,
        "active"
      ]
    ]
  },
  {
    "slug": "update-from-correlated",
    "title": "UPDATE・相関サブクエリでの更新",
    "description": "FROMを使わずに、employees の手当（allowance）を所属する部署の手当（departments.allowance）に更新してください。所属部署が departments に無い社員は変更しないでください。",
    "sql": "UPDATE employees\nSET allowance = (\n  SELECT d.allowance\n  FROM departments AS d\n  WHERE d.id = employees.dept_id\n)\nWHERE EXISTS (\n  SELECT 1\n  FROM departments AS d\n  WHERE d.id = employees.dept_id\n);",
    "hint": "SETの右辺にサブクエリを書き、一致する部署がある社員だけに絞るWHEREを付けます。",
    "explanation": "id 1・2は営業の5000、id 3・4は開発の8000、id 5は総務の3000になります。id 6は部署99がdepartmentsに無く、WHEREが無いとサブクエリがNULLを返し、NOT NULLの列なのでエラーで全体が失敗します。",
    "starter": "UPDATE employees\nSET allowance = (\n  SELECT d.allowance\n  FROM departments AS d\n  WHERE d.id = employees.dept_id\n);",
    "columns": [
      "id",
      "name",
      "dept_id",
      "salary",
      "allowance",
      "overtime_hours",
      "status"
    ],
    "rows": [
      [
        1,
        "佐藤",
        10,
        300000,
        5000,
        0,
        "active"
      ],
      [
        2,
        "鈴木",
        10,
        280000,
        5000,
        0,
        "active"
      ],
      [
        3,
        "田中",
        20,
        250000,
        8000,
        0,
        "active"
      ],
      [
        4,
        "高橋",
        20,
        320000,
        8000,
        0,
        "leave"
      ],
      [
        5,
        "伊藤",
        30,
        270000,
        3000,
        0,
        "active"
      ],
      [
        6,
        "渡辺",
        99,
        260000,
        0,
        0,
        "active"
      ]
    ]
  },
  {
    "slug": "update-from-aggregate",
    "title": "UPDATE FROM・集計した表",
    "description": "overtime（残業記録）を社員ごとに合計し、その合計時間を employees の overtime_hours に反映してください。記録の無い社員は0のままにします。",
    "sql": "UPDATE employees\nSET overtime_hours = t.total_hours\nFROM (\n  SELECT emp_id, SUM(hours) AS total_hours\n  FROM overtime\n  GROUP BY emp_id\n) AS t\nWHERE employees.id = t.emp_id;",
    "hint": "先にovertimeを社員ごとにSUMでまとめたサブクエリをFROMに書きます。",
    "explanation": "id 1は10+5で15時間、id 3は20時間、id 5は8時間になり、記録の無い社員は0のままです。集計せずに直接結合すると、id 1は10時間か5時間のどちらかになり、結果が決まりません。",
    "columns": [
      "id",
      "name",
      "dept_id",
      "salary",
      "allowance",
      "overtime_hours",
      "status"
    ],
    "rows": [
      [
        1,
        "佐藤",
        10,
        300000,
        0,
        15,
        "active"
      ],
      [
        2,
        "鈴木",
        10,
        280000,
        0,
        0,
        "active"
      ],
      [
        3,
        "田中",
        20,
        250000,
        0,
        20,
        "active"
      ],
      [
        4,
        "高橋",
        20,
        320000,
        0,
        0,
        "leave"
      ],
      [
        5,
        "伊藤",
        30,
        270000,
        0,
        8,
        "active"
      ],
      [
        6,
        "渡辺",
        99,
        260000,
        0,
        0,
        "active"
      ]
    ]
  },
  {
    "slug": "update-from-alias",
    "title": "UPDATE FROM・別名と比較",
    "description": "別名 e を employees に付けて、salary_revisions（別名 r）の新しい給与で更新してください。ただし、現在の給与より高くなる社員だけを更新します。",
    "sql": "UPDATE employees AS e\nSET salary = r.new_salary\nFROM salary_revisions AS r\nWHERE e.id = r.emp_id\n  AND r.new_salary > e.salary;",
    "hint": "SETの左側には別名を付けず、WHEREで新しい給与と現在の給与を比べます。",
    "explanation": "id 1は300000から320000、id 3は250000から265000に上がるので更新されます。id 2は270000、id 4は310000へ下がるので、どちらも変わりません。",
    "columns": [
      "id",
      "name",
      "dept_id",
      "salary",
      "allowance",
      "overtime_hours",
      "status"
    ],
    "rows": [
      [
        1,
        "佐藤",
        10,
        320000,
        0,
        0,
        "active"
      ],
      [
        2,
        "鈴木",
        10,
        280000,
        0,
        0,
        "active"
      ],
      [
        3,
        "田中",
        20,
        265000,
        0,
        0,
        "active"
      ],
      [
        4,
        "高橋",
        20,
        320000,
        0,
        0,
        "leave"
      ],
      [
        5,
        "伊藤",
        30,
        270000,
        0,
        0,
        "active"
      ],
      [
        6,
        "渡辺",
        99,
        260000,
        0,
        0,
        "active"
      ]
    ]
  },
  {
    "slug": "review-revision-allowance",
    "title": "章末問題：UPDATE FROM・複数の表・複数列",
    "description": "在職中（status が active）の社員のうち、salary_revisions の新しい給与が現在の給与より高い社員について、給与（salary）を新しい給与に、手当（allowance）を所属部署の手当に同時に更新してください。",
    "sql": "UPDATE employees AS e\nSET salary = r.new_salary,\n    allowance = d.allowance\nFROM salary_revisions AS r, departments AS d\nWHERE e.id = r.emp_id\n  AND d.id = e.dept_id\n  AND e.status = 'active'\n  AND r.new_salary > e.salary;",
    "hint": "FROMにsalary_revisionsとdepartmentsの2表を並べ、それぞれの結合条件を書きます。",
    "explanation": "条件を満たすのはid 1（300000から320000）とid 3（250000から265000）です。手当は営業の5000と開発の8000が入ります。id 2は減額、id 4は休職中かつ減額のため、どちらも変わりません。",
    "starter": "UPDATE employees AS e\nSET salary = r.new_salary\nFROM salary_revisions AS r\nWHERE e.id = r.emp_id;",
    "review": "chapter review",
    "requirements": [
      "FROMに2つの表を並べ、それぞれ結合条件を書く",
      "SETで給与と手当の2列を同時に更新する",
      "在職中の社員だけに絞る",
      "現在の給与より高い改定だけに絞る"
    ],
    "columns": [
      "id",
      "name",
      "dept_id",
      "salary",
      "allowance",
      "overtime_hours",
      "status"
    ],
    "rows": [
      [
        1,
        "佐藤",
        10,
        320000,
        5000,
        0,
        "active"
      ],
      [
        2,
        "鈴木",
        10,
        280000,
        0,
        0,
        "active"
      ],
      [
        3,
        "田中",
        20,
        265000,
        8000,
        0,
        "active"
      ],
      [
        4,
        "高橋",
        20,
        320000,
        0,
        0,
        "leave"
      ],
      [
        5,
        "伊藤",
        30,
        270000,
        0,
        0,
        "active"
      ],
      [
        6,
        "渡辺",
        99,
        260000,
        0,
        0,
        "active"
      ]
    ]
  },
  {
    "slug": "cumulative-below-average",
    "title": "まとめ問題：UPDATE FROM・GROUP BY・HAVING・WHERE",
    "description": "部署ごとの平均給与を求め、在職中（status が active）で、所属部署の平均給与より給与が低い社員の給与を、その平均給与に引き上げてください。平均給与と人数は、休職中の社員も含めた部署の全社員で数えます。社員が1人しかいない部署は対象外とします。",
    "sql": "UPDATE employees AS e\nSET salary = a.avg_salary\nFROM (\n  SELECT dept_id, AVG(salary) AS avg_salary\n  FROM employees\n  GROUP BY dept_id\n  HAVING COUNT(*) >= 2\n) AS a\nWHERE e.dept_id = a.dept_id\n  AND e.status = 'active'\n  AND e.salary < a.avg_salary;",
    "hint": "部署ごとの平均をGROUP BYで求めたサブクエリをFROMに置き、人数の条件はHAVINGに書きます。",
    "explanation": "営業は(300000+280000)/2で平均290000円なので、鈴木が280000円から引き上がります。開発は(250000+320000)/2で平均285000円なので、田中が250000円から上がり、高橋は平均より上で休職中です。総務と部署99は1人だけでHAVINGで除かれ、伊藤と渡辺は変わりません。",
    "review": "cumulative review",
    "requirements": [
      "FROMにGROUP BYで集計したサブクエリを置く",
      "HAVINGで2人以上の部署に絞る",
      "在職中かつ平均より低い社員だけに絞る",
      "結合条件で更新先と集計結果を部署で対応づける"
    ],
    "columns": [
      "id",
      "name",
      "dept_id",
      "salary",
      "allowance",
      "overtime_hours",
      "status"
    ],
    "rows": [
      [
        1,
        "佐藤",
        10,
        300000,
        0,
        0,
        "active"
      ],
      [
        2,
        "鈴木",
        10,
        290000,
        0,
        0,
        "active"
      ],
      [
        3,
        "田中",
        20,
        285000,
        0,
        0,
        "active"
      ],
      [
        4,
        "高橋",
        20,
        320000,
        0,
        0,
        "leave"
      ],
      [
        5,
        "伊藤",
        30,
        270000,
        0,
        0,
        "active"
      ],
      [
        6,
        "渡辺",
        99,
        260000,
        0,
        0,
        "active"
      ]
    ]
  }
];

export const entries = buildExerciseEntries({ category: 'update-from', tags: ["update-from","UPDATE"], setup, stateQuery: "SELECT * FROM employees ORDER BY id", exercises });
