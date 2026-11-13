const employees = `
  CREATE TABLE employees (id integer PRIMARY KEY, name text, department text, salary integer);
  INSERT INTO employees VALUES
    (1, '青木', '営業', 300000),
    (2, '北野', '開発', 400000),
    (3, '中央', '営業', 350000),
    (4, '大和', '開発', 400000),
    (5, '恵比寿', 'サポート', NULL);
`;
const commerce = `
  CREATE TABLE customers (id integer PRIMARY KEY, name text NOT NULL);
  CREATE TABLE orders (id integer PRIMARY KEY, customer_id integer REFERENCES customers(id), amount integer);
  INSERT INTO customers VALUES (1, '青木商店'), (2, '北野物産'), (3, '中央商事');
  INSERT INTO orders VALUES (101, 1, 12000), (102, 1, 8000), (103, 2, 25000);
`;
const sales = `
  CREATE TABLE sales (id integer PRIMARY KEY, salesperson text, month_no integer, amount integer,
    UNIQUE (salesperson, month_no));
  INSERT INTO sales VALUES
    (1, '青木', 1, 10), (2, '青木', 2, 20), (3, '青木', 3, 20),
    (4, '北野', 1, 30), (5, '北野', 2, 40);
`;
const employeeFixture = { setup: employees, sources: ['SELECT * FROM employees ORDER BY id'] };
const commerceFixture = { setup: commerce, sources: ['SELECT * FROM customers ORDER BY id', 'SELECT * FROM orders ORDER BY id'] };
export const guideFixtures: Record<string, { setup: string; sources: string[] }> = {
  'order-by': employeeFixture,
  where: employeeFixture,
  'group-by': employeeFixture,
  having: employeeFixture,
  case: employeeFixture,
  coalesce: {
    setup: `CREATE TABLE employees (id integer PRIMARY KEY, name text, nickname text, bonus integer);
      INSERT INTO employees VALUES (1, '青木', 'アオ', 120), (2, '北野', NULL, 0),
      (3, '中央', '', NULL), (4, NULL, NULL, 240), (5, '恵比寿', 'エビ', NULL);`,
    sources: ['SELECT * FROM employees ORDER BY id'],
  },
  union: { setup: "CREATE TABLE morning_results (name text, score integer);\nCREATE TABLE evening_results (name text, score integer);\nINSERT INTO morning_results VALUES ('青木', 10), ('北野', 20), ('青木', 10);\nINSERT INTO evening_results VALUES ('青木', 10), ('中央', 30), ('北野', 25);", sources: ['SELECT * FROM morning_results', 'SELECT * FROM evening_results'] },
  'date-filter': { setup: "CREATE TABLE orders (id integer PRIMARY KEY, ordered_at timestamp without time zone, delivery_on date, amount integer);\nINSERT INTO orders VALUES\n  (1, '2026-08-31 23:59:59.999999', '2026-09-01', 1000),\n  (2, '2026-09-01 00:00:00', '2026-09-01', 2000),\n  (3, '2026-09-01 12:30:00', '2026-09-02', 3000),\n  (4, '2026-09-30 23:59:59.999999', '2026-09-30', 4000),\n  (5, '2026-10-01 00:00:00', '2026-10-01', 5000),\n  (6, NULL, NULL, 6000);", sources: ['SELECT * FROM orders ORDER BY id'] },
  'date-trunc': { setup: "CREATE TABLE orders (id integer PRIMARY KEY, ordered_at timestamp without time zone, amount integer);\nINSERT INTO orders VALUES\n  (1, '2025-09-10 10:00:00', 1000),\n  (2, '2026-09-01 00:00:00', 2000),\n  (3, '2026-09-30 23:59:59.999999', 3000),\n  (4, '2026-11-01 00:00:00', 4000),\n  (5, '2026-11-20 12:00:00', 5000),\n  (6, '2026-12-01 00:00:00', 6000);", sources: ['SELECT * FROM orders ORDER BY id'] },
  'string-functions': { setup: "CREATE TABLE registrations (id integer PRIMARY KEY, last_name text, first_name text, product_code text);\nINSERT INTO registrations VALUES\n  (1, '青木', '太郎', 'AB-001'), (2, '北野', NULL, ' CD-002 '),\n  (3, '中央', '', 'AB --003'), (4, NULL, '花子', '日用品-004'),\n  (5, NULL, NULL, NULL);", sources: ['SELECT * FROM registrations ORDER BY id'] },
  exists: { setup: "CREATE TABLE customers (id integer PRIMARY KEY, name text NOT NULL);\nCREATE TABLE orders (id integer PRIMARY KEY, customer_id integer REFERENCES customers(id), amount integer, status text);\nINSERT INTO customers VALUES (1,'青木商店'),(2,'北野物産'),(3,'中央商事'),(4,'大和食品');\nINSERT INTO orders VALUES (101,1,12000,'paid'),(102,1,20000,'paid'),(103,2,8000,'cancelled'),(104,4,30000,'paid'),(105,4,9000,'cancelled'),(106,NULL,5000,'paid');", sources: ['SELECT * FROM customers ORDER BY id', 'SELECT * FROM orders ORDER BY id'] },
  'intersect-except': { setup: "CREATE TABLE store_purchases (customer_id integer);\nCREATE TABLE online_purchases (customer_id integer);\nINSERT INTO store_purchases VALUES (1),(1),(1),(2),(3),(NULL);\nINSERT INTO online_purchases VALUES (1),(1),(4),(NULL),(NULL);", sources: ['SELECT * FROM store_purchases', 'SELECT * FROM online_purchases'] },
  with: employeeFixture,
  subquery: commerceFixture,
  'inner-join': commerceFixture,
  'left-join': commerceFixture,
  'window-functions': { setup: sales, sources: ['SELECT * FROM sales ORDER BY id'] },
  like: { setup: "CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, code text NOT NULL, price integer NOT NULL);\nINSERT INTO products VALUES\n  (1, 'ボールペン黒', 'PEN-BK', 120),\n  (2, 'ボールペン赤', 'PEN-RD', 120),\n  (3, 'ノートA5', 'NOTE-A5', 300),\n  (4, 'ノートB5', 'NOTE-B5', 350),\n  (5, '蛍光ペン', 'pen-yl', 150),\n  (6, '割引券（10%）', 'SALE_10', 500),\n  (7, '割引券（10円）', 'SALE-10', 100);", sources: ["SELECT * FROM products ORDER BY id"] },
  insert: { setup: "CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, price integer NOT NULL, stock integer NOT NULL DEFAULT 0);\nINSERT INTO products VALUES (1, 'ノート', 200, 50), (2, 'ペン', 120, 100), (3, '消しゴム', 80, 0);\nCREATE TABLE arrivals (id integer PRIMARY KEY, name text NOT NULL, price integer NOT NULL, stock integer NOT NULL);\nINSERT INTO arrivals VALUES (4, '定規', 150, 30), (5, '付箋', 100, 20);", sources: ["SELECT * FROM products ORDER BY id","SELECT * FROM arrivals ORDER BY id"] },
  update: { setup: "CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, price integer NOT NULL, stock integer NOT NULL DEFAULT 0);\nINSERT INTO products VALUES (1, 'ノート', 200, 50), (2, 'ペン', 120, 100), (3, '消しゴム', 80, 0), (4, '定規', 150, 30), (5, '付箋', 100, 0);", sources: ["SELECT * FROM products ORDER BY id"] },
  delete: { setup: "CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, price integer NOT NULL, stock integer NOT NULL DEFAULT 0);\nINSERT INTO products VALUES (1, 'ノート', 200, 50), (2, 'ペン', 120, 100), (3, '消しゴム', 80, 0), (4, '定規', 150, 30), (5, '付箋', 100, 0);\nCREATE TABLE discontinued (product_id integer PRIMARY KEY);\nINSERT INTO discontinued VALUES (2), (5);", sources: ["SELECT * FROM products ORDER BY id","SELECT * FROM discontinued ORDER BY product_id"] },
};

// src/data/topics/{slug}.ts がexportする fixture（元の表を作るSQLと、表示用の確認SELECT）を取り込む。
const extraModules = import.meta.glob<{ topic: { slug: string }; fixture: { setup: string; sources: string[] } }>('../topics/*.ts', { eager: true });
for (const module of Object.values(extraModules)) guideFixtures[module.topic.slug] = module.fixture;
