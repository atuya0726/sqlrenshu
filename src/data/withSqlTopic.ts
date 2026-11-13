import type { SqlTopic } from './sqlTopics';

export const withTopic: SqlTopic = {
  "slug": "with",
  "label": "WITH（CTE）",
  "title": "SQLのWITH句（CTE）とは？基本構文と複数のCTEの使い方",
  "description": "SQLのWITH句（CTE）をPostgreSQLの元の表・SQL・結果表で解説。検索結果への命名、集計後のWHERE、複数CTEと前のCTEの参照を演習で学べます。",
  "lead": "WITH句は、検索の途中結果に名前を付けて、同じSQL文の中で使うための構文です。この名前付きの問い合わせをCTE（共通テーブル式）と呼びます。社員5人のデータで、検索を小さな段階に分けて書く方法を学びましょう。",
  "sampleIntro": "employeesの1行は社員1人分です。salaryは月給（円）、NULLは未入力を表します。すべての例で同じ5人を使います。ORDER BYのない結果の行の並びは一例で、順序は保証されません。",
  "sampleTables": [
    {
      "caption": "employees：社員5人の月給",
      "headers": [
        "id（社員ID）",
        "name（氏名）",
        "department（部署）",
        "salary（月給・円）"
      ],
      "rows": [
        [
          "1",
          "青木",
          "営業",
          "300000"
        ],
        [
          "2",
          "北野",
          "開発",
          "400000"
        ],
        [
          "3",
          "中央",
          "営業",
          "350000"
        ],
        [
          "4",
          "大和",
          "開発",
          "400000"
        ],
        [
          "5",
          "恵比寿",
          "サポート",
          "NULL"
        ]
      ]
    }
  ],
  "syntax": "WITH employee_list AS (\n  SELECT *\n  FROM employees\n)\nSELECT *\nFROM employee_list;",
  "sections": [
    {
      "heading": "WITHとASで検索結果に名前を付ける",
      "body": "WITH employee_list AS (...)で、カッコ内の検索結果をemployee_listという名前で使えるようにします。後ろのSELECTは、その名前をFROMに書いて読み取ります。ここでは全社員をそのまま取り出すので、元の5行・4列が返ります。ASの後ろにはSELECT全体をカッコで囲んで書きます。CTEだけでは結果を表示できず、後ろのSELECTまでが1つのSQL文です。",
      "code": "WITH employee_list AS (\n  SELECT *\n  FROM employees\n)\nSELECT *\nFROM employee_list;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "department",
          "salary"
        ],
        "rows": [
          [
            "1",
            "青木",
            "営業",
            "300000"
          ],
          [
            "2",
            "北野",
            "開発",
            "400000"
          ],
          [
            "3",
            "中央",
            "営業",
            "350000"
          ],
          [
            "4",
            "大和",
            "開発",
            "400000"
          ],
          [
            "5",
            "恵比寿",
            "サポート",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "集計したCTEを外側のWHEREで絞り込む",
      "body": "部署ごとの合計をdepartment_totalsにまとめてから、合計65万円以上の部署を選びます。営業は300000 + 350000で650000円、開発は800000円なので残ります。サポートの合計はNULLのため、この条件を満たしません。CTEの結果にはSUM(salary)の既定列名sumがあり、外側では通常の列としてWHEREで参照できます。元の社員ごとのsalaryを絞る処理とは違います。",
      "code": "WITH department_totals AS (\n  SELECT department, SUM(salary)\n  FROM employees\n  GROUP BY department\n)\nSELECT *\nFROM department_totals\nWHERE sum >= 650000;",
      "resultTable": {
        "headers": [
          "department",
          "sum"
        ],
        "rows": [
          [
            "営業",
            "650000"
          ],
          [
            "開発",
            "800000"
          ]
        ]
      }
    },
    {
      "heading": "複数のCTEをカンマで区切る",
      "body": "営業の社員と開発の社員を別々のCTEにまとめ、開発の平均月給より月給が低い営業社員を選びます。WITHは先頭に1回だけ書き、CTE同士をカンマで区切ります。最後のCTEと本体のSELECTの間にはカンマを置きません。開発の平均は400000円で、営業の青木さん300000円、中央さん350000円の両方が条件を満たします。本体から2つのCTEをそれぞれ参照でき、平均の比較にはサブクエリで学んだ書き方を使います。",
      "code": "WITH sales_staff AS (\n  SELECT *\n  FROM employees\n  WHERE department = '営業'\n), development_staff AS (\n  SELECT *\n  FROM employees\n  WHERE department = '開発'\n)\nSELECT *\nFROM sales_staff\nWHERE salary < (SELECT AVG(salary) FROM development_staff);",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "department",
          "salary"
        ],
        "rows": [
          [
            "1",
            "青木",
            "営業",
            "300000"
          ],
          [
            "3",
            "中央",
            "営業",
            "350000"
          ]
        ]
      }
    },
    {
      "heading": "前のCTEを次のCTEから参照する",
      "body": "known_salaryで給与入力済みの4人を選び、次のdepartment_totalsで部署別に集計します。後ろのCTEは、前に定義したCTEをFROMに書いて使えます。サポートの恵比寿さんは集計前に除くので、この結果にはサポートの行自体がありません。前の例ではNULLの合計に条件を付けましたが、ここでは集計する前の行を選んでいます。書いた段階に沿って読むと、どこで行が変わるかを追えます。",
      "code": "WITH known_salary AS (\n  SELECT *\n  FROM employees\n  WHERE salary IS NOT NULL\n), department_totals AS (\n  SELECT department, SUM(salary)\n  FROM known_salary\n  GROUP BY department\n)\nSELECT *\nFROM department_totals;",
      "resultTable": {
        "headers": [
          "department",
          "sum"
        ],
        "rows": [
          [
            "営業",
            "650000"
          ],
          [
            "開発",
            "800000"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "CTEと本体をセミコロンで分けない",
      "body": "WITHの閉じカッコの直後にセミコロンを置くと、後ろのSELECTにつながりません。セミコロンは本体SELECTの末尾に置きます。CTE名が使えるのはその1文の中だけで、次のSQL文からは参照できません。"
    }
  ],
  "notes": [
    {
      "title": "WITHを書けば必ず高速になるわけではない",
      "body": "PostgreSQLでは、再帰しない副作用のないCTEは、参照回数などに応じて本体の問い合わせへ組み込まれることがあります。WITHの段階がそのまま物理的な実行順になるとは限りません。まずは読みやすく分けるために使い、速度は実行計画で確認します。"
    }
  ],
  "faqs": [
    {
      "question": "WITHとFROMのサブクエリの違いは？",
      "answer": "どちらも途中の検索結果を使えます。FROMのサブクエリは使う位置に書き、WITHは先頭で名前を付けてから参照します。段階が多い検索や、同じ途中結果を複数箇所から参照する検索ではWITHで意図を整理できます。"
    },
    {
      "question": "WITHはテーブルを作成しますか？",
      "answer": "永続的なテーブルは作成しません。CTE名はそのSQL文の中だけで使えます。別のSQL文から使う表を作成するCREATE TABLEとは役割が違います。"
    },
    {
      "question": "WITH RECURSIVEも必要ですか？",
      "answer": "このページのように前のCTEを後ろから参照するだけなら不要です。CTEが自分自身の結果を参照し、階層などをたどる再帰的な問い合わせではWITH RECURSIVEを使います。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：WITHとSELECT",
      "url": "https://www.postgresql.org/docs/current/queries-with.html#QUERIES-WITH-SELECT",
      "description": "CTEの基本構文、複数CTEと前のCTEの参照"
    },
    {
      "label": "PostgreSQL公式：CTEの実体化",
      "url": "https://www.postgresql.org/docs/current/queries-with.html#QUERIES-WITH-CTE-MATERIALIZATION",
      "description": "CTEの最適化と実体化"
    }
  ],
  "related": [
    "subquery",
    "group-by",
    "where",
    "window-functions"
  ],
  "practiceCategory": "with"
};
