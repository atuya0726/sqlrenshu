import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, stock integer NOT NULL);
INSERT INTO products VALUES (1,'ノート',50),(2,'ペン',100),(3,'消しゴム',0),(4,'定規',30);
CREATE TABLE arrivals (id integer PRIMARY KEY, name text NOT NULL, qty integer NOT NULL);
INSERT INTO arrivals VALUES (2,'ペン',20),(3,'消しゴム',40),(4,'定規',0),(5,'付箋',60);`,
  sources: ['SELECT * FROM products ORDER BY id', 'SELECT * FROM arrivals ORDER BY id'],
};

const mergeBoth = "MERGE INTO products\nUSING arrivals ON products.id = arrivals.id\nWHEN MATCHED THEN\n  UPDATE SET stock = products.stock + arrivals.qty\nWHEN NOT MATCHED THEN\n  INSERT (id, name, stock) VALUES (arrivals.id, arrivals.name, arrivals.qty);";
const select = "SELECT * FROM products ORDER BY id;";
const headers = ['id', 'name', 'stock'];

export const topic: SqlTopic = {
  slug: 'merge',
  label: 'MERGE',
  title: 'SQLのMERGE文とは？あれば更新・なければ追加を1文で書く使い方とON CONFLICTとの違い',
  description: 'SQLのMERGE文をPostgreSQLの元の表・SQL・結果表で解説。WHEN MATCHED THEN UPDATE、WHEN NOT MATCHED THEN INSERT、条件つきのWHEN、DELETE、INSERT ... ON CONFLICTとの使い分けを演習で学べます。',
  lead: 'MERGEは、更新元の表と突き合わせて、一致した行は更新・削除し、一致しない行は追加する文です。「あれば更新、なければ追加」を1つのSQLで書けます。商品の在庫表に入荷データを反映する例で、WHENごとの動きと、INSERT ... ON CONFLICTとの違いを確かめましょう。',
  sampleIntro: 'productsは1行が商品1件で、stockは在庫数です。arrivalsは入荷データで、qtyが入荷数です。入荷のid 2・3・4はproductsに既にあり、id 5（付箋）はproductsにまだありません。消しゴムの在庫は0、定規の入荷数も0です。以降の各例は、この更新前の状態から始め、実行後のproductsをid順に表示した結果を示します。',
  sampleTables: [
    {
      caption: 'products：商品4件（更新前）',
      headers,
      rows: [['1', 'ノート', '50'], ['2', 'ペン', '100'], ['3', '消しゴム', '0'], ['4', '定規', '30']],
    },
    {
      caption: 'arrivals：入荷4件',
      headers: ['id', 'name', 'qty'],
      rows: [['2', 'ペン', '20'], ['3', '消しゴム', '40'], ['4', '定規', '0'], ['5', '付箋', '60']],
    },
  ],
  syntax: mergeBoth,
  sections: [
    {
      heading: 'MERGEは一致すれば更新、しなければ追加する',
      body: 'MERGE INTO 更新する表 USING 更新元 ON 一致の条件 の後に、WHEN句を並べます。ON products.id = arrivals.id で、入荷の行と同じidの商品を探します。見つかった行（MATCHED）は在庫に入荷数を足し、見つからない行（NOT MATCHED）はproductsへ追加します。ペンは100に20を足して120、消しゴムは40、定規は0を足して30のまま、付箋は新しく60で追加されます。',
      code: `${mergeBoth}\n\n${select}`,
      resultTable: { headers, rows: [['1', 'ノート', '50'], ['2', 'ペン', '120'], ['3', '消しゴム', '40'], ['4', '定規', '30'], ['5', '付箋', '60']] },
    },
    {
      heading: 'WHEN MATCHED THEN UPDATEだけなら既存の行だけ更新する',
      body: 'WHEN NOT MATCHED を書かなければ、一致しない入荷行は無視されます。付箋はproductsにないため追加されず、ペンと消しゴムの在庫だけが増えます。商品表に載っていないものを勝手に増やしたくないときの書き方です。更新側のSETでは、更新前の値を products.stock、更新元の値を arrivals.qty のように表名つきで区別します。',
      code: "MERGE INTO products\nUSING arrivals ON products.id = arrivals.id\nWHEN MATCHED THEN\n  UPDATE SET stock = products.stock + arrivals.qty;\n\n" + select,
      resultTable: { headers, rows: [['1', 'ノート', '50'], ['2', 'ペン', '120'], ['3', '消しゴム', '40'], ['4', '定規', '30']] },
    },
    {
      heading: 'WHEN NOT MATCHED THEN INSERTだけなら新しい行だけ追加する',
      body: 'WHEN MATCHED を書かなければ、既にある商品は変更されません。付箋だけが追加され、ペンの在庫は100のままです。INSERTは列名を並べ、VALUESには更新元（arrivals）の列を指定します。追加する行にはまだ対応するproductsの行がないため、VALUESでは更新する表の列は使えません。',
      code: "MERGE INTO products\nUSING arrivals ON products.id = arrivals.id\nWHEN NOT MATCHED THEN\n  INSERT (id, name, stock) VALUES (arrivals.id, arrivals.name, arrivals.qty);\n\n" + select,
      resultTable: { headers, rows: [['1', 'ノート', '50'], ['2', 'ペン', '100'], ['3', '消しゴム', '0'], ['4', '定規', '30'], ['5', '付箋', '60']] },
    },
    {
      heading: 'WHEN MATCHED AND 条件で更新する行を絞る',
      body: 'WHEN句にはANDで条件を付けられ、更新する表と更新元のどちらの列も使えます。在庫が0の商品だけを補充する条件 products.stock = 0 を付けると、消しゴムだけが0から40になります。ペンは一致していても条件に合わないので100のままで、定規も30のままです。一致して条件に合わない行は何もされず、そのまま残ります。',
      code: "MERGE INTO products\nUSING arrivals ON products.id = arrivals.id\nWHEN MATCHED AND products.stock = 0 THEN\n  UPDATE SET stock = arrivals.qty\nWHEN NOT MATCHED THEN\n  INSERT (id, name, stock) VALUES (arrivals.id, arrivals.name, arrivals.qty);\n\n" + select,
      resultTable: { headers, rows: [['1', 'ノート', '50'], ['2', 'ペン', '100'], ['3', '消しゴム', '40'], ['4', '定規', '30'], ['5', '付箋', '60']] },
    },
    {
      heading: 'WHEN MATCHED THEN DELETEで一致した行を削除する',
      body: 'MERGEのアクションにはUPDATEとINSERTのほかにDELETEもあります。ここでは「入荷数0は取扱終了の連絡」として、qtyが0の定規を削除します。WHENは書いた順に調べられ、最初に条件が成り立ったものだけが実行されます。DELETEの条件を先に、条件のない更新を後に書くことで、定規は削除、ペンと消しゴムは更新になります。条件のない更新を先に書くと、後ろのWHENに届かないため、PostgreSQLはエラーにします。',
      code: "MERGE INTO products\nUSING arrivals ON products.id = arrivals.id\nWHEN MATCHED AND arrivals.qty = 0 THEN\n  DELETE\nWHEN MATCHED THEN\n  UPDATE SET stock = products.stock + arrivals.qty\nWHEN NOT MATCHED THEN\n  INSERT (id, name, stock) VALUES (arrivals.id, arrivals.name, arrivals.qty);\n\n" + select,
      resultTable: { headers, rows: [['1', 'ノート', '50'], ['2', 'ペン', '120'], ['3', '消しゴム', '40'], ['5', '付箋', '60']] },
    },
    {
      heading: 'INSERT ... ON CONFLICTとの使い分け',
      body: '追加と更新だけで済み、一意な列（主キーなど）の重複で判定できるなら、INSERT ... ON CONFLICT DO UPDATE でも同じ結果になります。この例では1つ目の節と同じ表になります。MERGEはON条件を自由に書け、DELETEや条件つきのWHENも使えますが、ON CONFLICTは一意制約・一意インデックスが前提です。公式ドキュメントでは、ON CONFLICT DO UPDATEは同時実行でも「追加か更新のどちらか」を保証すると説明されています。MERGEはこの保証を持たないため、同時に実行される追加が多い処理ではON CONFLICTを検討します。',
      code: "INSERT INTO products (id, name, stock)\nSELECT id, name, qty FROM arrivals\nON CONFLICT (id) DO UPDATE\n  SET stock = products.stock + EXCLUDED.stock;\n\n" + select,
      resultTable: { headers, rows: [['1', 'ノート', '50'], ['2', 'ペン', '120'], ['3', '消しゴム', '40'], ['4', '定規', '30'], ['5', '付箋', '60']] },
    },
  ],
  mistakes: [
    {
      title: '条件のないWHENを先に書くとエラーになる',
      body: 'WHENは書いた順に調べられ、最初に条件が成り立ったものだけが実行されます。条件のないWHEN MATCHEDを先に書くと、同じ種類の後ろのWHENには届かないため、PostgreSQLは「unreachable WHEN clause」のエラーにします。DELETEや条件つきの更新のように条件の厳しいWHENを先に、条件のないものを最後に書きます。',
    },
    {
      title: '更新元の1行が表の複数行と一致するとエラーになる',
      body: 'ONの条件で、更新する表の1行が更新元の複数行と一致すると、MERGEはエラーになります。公式ドキュメントも、更新する表の各行が更新元の1行だけと結合するようにと説明しています。入荷が同じ商品で複数行ある場合は、USINGでGROUP BYして商品ごとに1行へまとめてから突き合わせます。',
    },
  ],
  notes: [
    {
      title: 'USINGには表だけでなくVALUESやSELECTも書ける',
      body: 'USINGにはSELECTやVALUESを書けるので、更新元の表がなくても、その場の値で更新できます。次の例は、付箋の入荷を値として直接渡して追加します。',
      code: "MERGE INTO products\nUSING (VALUES (5, '付箋', 60)) AS v(id, name, qty) ON products.id = v.id\nWHEN MATCHED THEN\n  UPDATE SET stock = products.stock + v.qty\nWHEN NOT MATCHED THEN\n  INSERT (id, name, stock) VALUES (v.id, v.name, v.qty);\n\nSELECT * FROM products ORDER BY id;",
    },
    {
      title: 'MERGEはPostgreSQL 15で追加された',
      body: 'MERGEはPostgreSQL 15で追加されたコマンドです。RETURNING句と、更新元にない行を処理するWHEN NOT MATCHED BY SOURCEは17で加わりました。使うPostgreSQLのバージョンを確認してください。MERGEは標準SQLの文でもありますが、対応する構文や機能の範囲はデータベース製品ごとに異なります。',
    },
  ],
  faqs: [
    {
      question: 'MERGEとINSERT ... ON CONFLICTはどちらを使えばよいですか？',
      answer: '一意制約の重複で「あれば更新、なければ追加」を判定でき、同時実行が多いならON CONFLICTが向きます。一致しない行だけ追加する、一致した行を条件で更新・削除するなど、1つの文で複数の処理を分けたいときはMERGEが向きます。',
    },
    {
      question: 'WHENに合わない行はどうなりますか？',
      answer: '一致する行がなく、WHENの条件にも合わない行は、何もされず残ります。この例では、WHEN MATCHEDだけを書くと付箋は追加されません。エラーにはなりません。',
    },
    {
      question: 'MERGEで何行変更されたか分かりますか？',
      answer: '実行結果のコマンドタグに、追加・更新・削除した行の合計が「MERGE 件数」で返ります。PostgreSQL 17以降はRETURNING句で、変更された行の内容も取得できます。',
    },
    {
      question: 'UPDATEの条件でWHEREは使えますか？',
      answer: 'MERGEのUPDATE・DELETEの中にはWHEREを書けません。行を絞る条件は、WHEN MATCHED AND 条件 の形で書きます。',
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：MERGE',
      url: 'https://www.postgresql.org/docs/current/sql-merge.html',
      description: 'WHEN句、条件、アクション、1行と1行の対応、INSERT ... ON CONFLICTとの関係',
    },
    {
      label: 'PostgreSQL公式：INSERT（ON CONFLICT句）',
      url: 'https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT',
      description: 'ON CONFLICT DO UPDATEの仕様と同時実行時の保証',
    },
  ],
  related: ['insert', 'update', 'delete', 'insert-select', 'update-from', 'delete-using'],
  practiceCategory: 'merge',
};
