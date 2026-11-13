import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  setup: `CREATE TABLE contracts (id integer PRIMARY KEY, name text NOT NULL, start_date date NOT NULL, end_date date NOT NULL);
INSERT INTO contracts VALUES (1,'青木商店','2026-01-31','2026-03-15'),(2,'北野物産','2026-02-10','2026-02-24'),(3,'中央商事','2026-03-01','2026-03-31'),(4,'大和食品','2026-12-15','2027-02-10');`,
  sources: ['SELECT * FROM contracts ORDER BY id'],
};

export const topic: SqlTopic = {
  slug: 'date-arithmetic',
  label: '日付の計算・INTERVAL',
  title: 'SQLの日付の計算とは？日数の加減算・日付の差・INTERVAL・EXTRACT・age()の使い方',
  description: 'SQLの日付の計算をPostgreSQLの元の表・SQL・結果表で解説。dateへの日数の加減算、日付どうしの差、INTERVALと月末の扱い、EXTRACT、age()、月初・月末の求め方を演習で学べます。',
  lead: '日付の計算は、期限を決める、経過日数を数える、年や曜日で分けるといった場面で使います。PostgreSQLでは、dateに整数を足すと日数の加算、dateからdateを引くと日数の差になります。契約の開始日と終了日を使い、日数・月・年・曜日の扱いを順に確かめましょう。',
  sampleIntro: 'contractsは1行が契約1件です。start_dateは開始日、end_dateは終了日で、どちらもdate型です。青木商店の開始日は1月31日（月末）、大和食品は2026年から2027年にまたがります。結果の確認が日によって変わらないよう、この例では現在日付ではなく列の値だけを使います。',
  sampleTables: [
    {
      caption: 'contracts：契約4件',
      headers: ['id', 'name', 'start_date', 'end_date'],
      rows: [
        ['1', '青木商店', '2026-01-31', '2026-03-15'],
        ['2', '北野物産', '2026-02-10', '2026-02-24'],
        ['3', '中央商事', '2026-03-01', '2026-03-31'],
        ['4', '大和食品', '2026-12-15', '2027-02-10'],
      ],
    },
  ],
  syntax: "SELECT id, start_date + 7 AS due_date\nFROM contracts\nORDER BY id;",
  sections: [
    {
      heading: 'dateに整数を足すと日数を加算できる',
      body: 'date型の値に整数を足し引きすると、その日数だけ進んだ日付・戻った日付になります。結果もdate型です。開始日の7日後を求めると、青木商店は1月31日から2月7日になり、月をまたぐ繰り上がりはPostgreSQLが計算します。引くときは start_date - 7 と書きます。',
      code: "SELECT id, start_date, start_date + 7 AS due_date\nFROM contracts\nORDER BY id;",
      resultTable: {
        headers: ['id', 'start_date', 'due_date'],
        rows: [
          ['1', '2026-01-31', '2026-02-07'],
          ['2', '2026-02-10', '2026-02-17'],
          ['3', '2026-03-01', '2026-03-08'],
          ['4', '2026-12-15', '2026-12-22'],
        ],
      },
    },
    {
      heading: 'dateからdateを引くと日数の差になる',
      body: 'date - date は、間の日数をinteger（整数）で返します。終了日から開始日を引くと契約日数が分かります。青木商店は1月31日から3月15日までの43日です。2月が28日だった年でも、月の長さの違いを自分で数える必要はありません。引く順番を逆にすると負の数になります。',
      code: "SELECT id, end_date - start_date AS days\nFROM contracts\nORDER BY id;",
      resultTable: {
        headers: ['id', 'days'],
        rows: [['1', '43'], ['2', '14'], ['3', '30'], ['4', '57']],
      },
    },
    {
      heading: '+ INTERVAL \'1 month\'で月を進める（月末は丸められる）',
      body: 'INTERVALは「1 month」「2 days」のような期間を表す値です。dateにINTERVALを足すと結果はtimestamp（日時）になるため、日付だけ欲しいときは ::date で変換します。月を足すと日にちは同じまま進みますが、移動先の月にその日がなければ月末になります。青木商店の1月31日の1か月後は、2月に31日がないため2月28日です。',
      code: "SELECT id, start_date, (start_date + INTERVAL '1 month')::date AS next_month\nFROM contracts\nORDER BY id;",
      resultTable: {
        headers: ['id', 'start_date', 'next_month'],
        rows: [
          ['1', '2026-01-31', '2026-02-28'],
          ['2', '2026-02-10', '2026-03-10'],
          ['3', '2026-03-01', '2026-04-01'],
          ['4', '2026-12-15', '2027-01-15'],
        ],
      },
    },
    {
      heading: 'EXTRACTで年・月・曜日を取り出す',
      body: 'EXTRACT(フィールド FROM 日付) は、日付から年（YEAR）、月（MONTH）、曜日（DOW）などの数値を取り出します。DOWは日曜が0、月曜が1、土曜が6です。青木商店の1月31日は土曜なので6、中央商事の3月1日は日曜なので0です。結果は数値なので、GROUP BYで年別・曜日別に集計するときの区分に使えます。',
      code: "SELECT id, EXTRACT(YEAR FROM start_date) AS year,\n  EXTRACT(MONTH FROM start_date) AS month,\n  EXTRACT(DOW FROM start_date) AS dow\nFROM contracts\nORDER BY id;",
      resultTable: {
        headers: ['id', 'year', 'month', 'dow'],
        rows: [
          ['1', '2026', '1', '6'],
          ['2', '2026', '2', '2'],
          ['3', '2026', '3', '0'],
          ['4', '2026', '12', '2'],
        ],
      },
    },
    {
      heading: 'age()で年・月・日の期間を求める',
      body: 'age(新しい日付, 古い日付) は、2つの日付の差を「1 year 2 mons 3 days」のような年・月・日のintervalで返します。契約期間を「何か月と何日」と表したいときに向きます。表示を固定するため ::text で文字列にしています。青木商店は1月31日から3月15日までで、1か月と15日です。総日数が欲しいときは前の節の date - date を使います。',
      code: "SELECT id, age(end_date, start_date)::text AS period\nFROM contracts\nORDER BY id;",
      resultTable: {
        headers: ['id', 'period'],
        rows: [
          ['1', '1 mon 15 days'],
          ['2', '14 days'],
          ['3', '30 days'],
          ['4', '1 mon 26 days'],
        ],
      },
    },
    {
      heading: '月初と月末を求める',
      body: '月初は DATE_TRUNC(\'month\', 日付) で求めます。月末は、月初に1か月を足して1日を引きます。2月の契約は2月28日、1月と3月は31日になり、月ごとの日数を自分で判定せずに済みます。DATE_TRUNCはtimestampを返すので ::date で日付に戻しています。月ごとの集計での使い方は、月別集計・DATE_TRUNCのガイドで扱います。',
      code: "SELECT id, DATE_TRUNC('month', start_date)::date AS month_start,\n  (DATE_TRUNC('month', start_date) + INTERVAL '1 month' - INTERVAL '1 day')::date AS month_end\nFROM contracts\nORDER BY id;",
      resultTable: {
        headers: ['id', 'month_start', 'month_end'],
        rows: [
          ['1', '2026-01-01', '2026-01-31'],
          ['2', '2026-02-01', '2026-02-28'],
          ['3', '2026-03-01', '2026-03-31'],
          ['4', '2026-12-01', '2026-12-31'],
        ],
      },
    },
  ],
  mistakes: [
    {
      title: 'age()の結果を日数として扱わない',
      body: 'age()は年・月・日に分けた期間を返すため、青木商店の「1 mon 15 days」は43日とは別の表現です。合計日数が必要なときは end_date - start_date を使います。age()の月は月の長さで変わるので、日数の比較や合計には向きません。',
      code: "SELECT id, age(end_date, start_date)::text AS period, end_date - start_date AS days\nFROM contracts\nORDER BY id;",
    },
  ],
  notes: [
    {
      title: '現在日付はCURRENT_DATEで取得する',
      body: 'CURRENT_DATEは今日のdateを返し、now()は現在の日時を返します。どちらも実行する日によって結果が変わるため、このページの結果表では使わず、固定の列の値で説明しています。CURRENT_DATE - start_date は、開始日から今日までの経過日数になります。',
      code: "SELECT id, CURRENT_DATE - start_date AS elapsed_days\nFROM contracts\nORDER BY id;",
    },
    {
      title: 'timestampどうしの差はintervalになる',
      body: 'dateどうしの引き算は整数の日数ですが、timestampどうしの引き算はintervalになります。時刻を含むので、1日と何時間のような結果です。公式ドキュメントでも、日付・日時の引き算は日・時間ごとに調整された結果になると説明されています。',
      code: "SELECT (TIMESTAMP '2026-03-02 12:00:00' - TIMESTAMP '2026-03-01 06:30:00')::text AS diff;",
    },
  ],
  faqs: [
    {
      question: 'date - dateが整数になるのはなぜですか？',
      answer: 'PostgreSQLでは、date - date の演算子が日数をintegerで返すよう定義されています。契約日数のような日数は、そのまま数値として比較・合計できます。timestampどうしの差はintervalになる点が違います。',
    },
    {
      question: '+ INTERVAL \'1 month\'は30日を足すのと同じですか？',
      answer: '同じではありません。1 monthは暦の1か月で、日にちを保ったまま月を進めます。1月31日は2月28日になりますが、31日後は3月3日です。月単位の期限は INTERVAL、日数単位の期限は整数を使い分けます。',
    },
    {
      question: '曜日を日本語で出すにはどうしますか？',
      answer: 'EXTRACT(DOW FROM ...)で得た数値を、CASE式で「日」「月」のような文字列に変換します。DOWは日曜が0、土曜が6です。月曜を1、日曜を7にしたいときはISODOWを使います。',
    },
    {
      question: '日付で絞り込む方法と何が違いますか？',
      answer: 'このページは日付を計算して値を作る方法です。日付で行を選ぶ条件の書き方は、日付で絞り込むガイドで扱います。',
    },
  ],
  references: [
    {
      label: 'PostgreSQL公式：日付/時刻演算子（date + integer、date - date）',
      url: 'https://www.postgresql.org/docs/current/functions-datetime.html#OPERATORS-DATETIME-TABLE',
      description: 'dateと整数・intervalの演算子',
    },
    {
      label: 'PostgreSQL公式：EXTRACT',
      url: 'https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-EXTRACT',
      description: 'YEAR・MONTH・DOWなどのフィールド',
    },
    {
      label: 'PostgreSQL公式：日付/時刻関数と演算子（intervalの加算・age）',
      url: 'https://www.postgresql.org/docs/current/functions-datetime.html',
      description: '月末の扱い、age()、日付の引き算の説明',
    },
  ],
  related: ['date-filter', 'date-trunc', 'generate-series', 'cast', 'where'],
  practiceCategory: 'date-arithmetic',
};
