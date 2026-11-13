import { orderByTopic, whereTopic } from './remainingSqlTopics';
import { advancedSqlTopics } from './advancedSqlTopics';

export type GuideTable = { headers: string[]; rows: string[][] };

export type SqlTopic = {
  slug: string;
  label: string;
  title: string;
  description: string;
  lead: string;
  sampleIntro?: string;
  sampleTables?: (GuideTable & { caption: string })[];
  syntax: string;
  sections: { heading: string; body: string; code: string; table?: GuideTable; resultTable?: GuideTable }[];
  mistakes: { title: string; body: string; code?: string }[];
  notes: { title: string; body: string; code?: string }[];
  faqs: { question: string; answer: string }[];
  references: { label: string; url: string; description: string }[];
  related: string[];
  practiceCategory?: string;
};

export const sqlTopics: SqlTopic[] = [
  {
    "slug": "select",
    "label": "SELECT",
    "title": "SQLのSELECT文とは？列の選び方を元の表と実行結果で解説",
    "description": "SQLのSELECT文を、社員3人の表とPostgreSQLの実行結果で解説。SELECTとFROM、複数列、全列の取得、ASによる別名、計算、DISTINCTを順に学べます。",
    "lead": "SELECTは、表から見たいデータを取り出すSQLです。たとえば社員の表から、名前だけを表示したり、名前と月給を並べたりできます。小さな表を使って、SQLを書くと何が表示されるのかを見ていきましょう。",
    "sampleIntro": "employeesは社員の情報を保存した表（テーブル）です。横の1行が社員1人分、縦の列が名前や月給といった項目です。このページでは、次の3人をすべての例で使います。結果表の行の並びは一例です。SQLで並び順を指定しない場合、表示順が変わることがあります。",
    "sampleTables": [
      {
        "caption": "employees：社員の一覧（salaryは月給・円）",
        "headers": [
          "id（社員ID）",
          "name（名前）",
          "department（部署）",
          "salary（月給）"
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
          ]
        ]
      }
    ],
    "syntax": "SELECT name\nFROM employees;",
    "sections": [
      {
        "heading": "SELECTとFROMで社員名だけを取り出す",
        "body": "社員の名前だけを見たいときは、SELECTの後ろにname、FROMの後ろにemployeesと書きます。SELECTは「どの列を表示するか」、FROMは「どの表から取り出すか」です。元の表のname列が取り出され、3人の名前が表示されます。末尾のセミコロン（;）はSQL文の終わりを示します。",
        "code": "SELECT name\nFROM employees;",
        "resultTable": {
          "headers": [
            "name"
          ],
          "rows": [
            [
              "青木"
            ],
            [
              "北野"
            ],
            [
              "中央"
            ]
          ]
        }
      },
      {
        "heading": "複数の列をカンマで並べる",
        "body": "名前と月給を一緒に見たいときは、name, salaryのように列名をカンマで区切ります。結果の列はSELECTに書いた順に並びます。この例では左が名前、右が月給です。社員は3人のままで、表示する列が1つから2つに増えます。",
        "code": "SELECT name, salary\nFROM employees;",
        "resultTable": {
          "headers": [
            "name",
            "salary"
          ],
          "rows": [
            [
              "青木",
              "300000"
            ],
            [
              "北野",
              "400000"
            ],
            [
              "中央",
              "350000"
            ]
          ]
        }
      },
      {
        "heading": "SELECT *で全列を表示する",
        "body": "列を1つずつ書く代わりに*を書くと、表の全列を表示できます。この表ではid・name・department・salaryの4列です。まず表にどんなデータがあるかを確認するときに使えます。",
        "code": "SELECT *\nFROM employees;",
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
            ]
          ]
        }
      },
      {
        "heading": "ASで結果の列名を変える",
        "body": "salaryを「月給」と表示したいときは、salary AS \"月給\"と書きます。ASの後ろが結果の列名です。下の例では見出しだけが変わり、金額は変わりません。元のemployeesの列名もsalaryのままです。",
        "code": "SELECT name, salary AS \"月給\"\nFROM employees;",
        "resultTable": {
          "headers": [
            "name",
            "月給"
          ],
          "rows": [
            [
              "青木",
              "300000"
            ],
            [
              "北野",
              "400000"
            ],
            [
              "中央",
              "350000"
            ]
          ]
        }
      },
      {
        "heading": "SELECTに計算式を書いて12か月分の給与を求める",
        "body": "SELECTには列名だけでなく計算式も書けます。salary * 12は月給を12倍する式です。ここでは毎月同じ月給とし、賞与を含まない12か月分の給与を求めます。青木さんは300000 × 12で3600000円です。ASで計算結果の列に名前を付けています。",
        "code": "SELECT name, salary * 12 AS \"12か月分の給与\"\nFROM employees;",
        "resultTable": {
          "headers": [
            "name",
            "12か月分の給与"
          ],
          "rows": [
            [
              "青木",
              "3600000"
            ],
            [
              "北野",
              "4800000"
            ],
            [
              "中央",
              "4200000"
            ]
          ]
        }
      },
      {
        "heading": "部署だけを表示すると同じ値もそのまま出る",
        "body": "部署の一覧を作る前に、department列だけを取り出してみます。青木さんと中央さんはどちらも営業なので、営業が2回表示されます。通常のSELECTは、表示する値が同じでも社員それぞれの行を残します。",
        "code": "SELECT department\nFROM employees;",
        "resultTable": {
          "headers": [
            "department"
          ],
          "rows": [
            [
              "営業"
            ],
            [
              "開発"
            ],
            [
              "営業"
            ]
          ]
        }
      },
      {
        "heading": "DISTINCTで部署の重複を除く",
        "body": "どんな部署があるかを知りたいときは、SELECTの直後にDISTINCTを付けます。前の結果に2回出ていた営業が1行にまとまり、営業と開発の2行になります。社員データを削除する処理ではなく、検索結果の重複を除く指定です。",
        "code": "SELECT DISTINCT department\nFROM employees;",
        "resultTable": {
          "headers": [
            "department"
          ],
          "rows": [
            [
              "営業"
            ],
            [
              "開発"
            ]
          ]
        }
      }
    ],
    "mistakes": [],
    "notes": [
      {
        "title": "SELECTは表がなくても計算できる",
        "body": "PostgreSQLでは、表の列を使わない計算ならFROMを省略できます。次のSQLは、1行1列の結果として3を返します。",
        "code": "SELECT 1 + 2 AS result;"
      }
    ],
    "faqs": [
      {
        "question": "SELECT *と列名の指定はどう使い分けますか？",
        "answer": "表の中身をひとまず確認するならSELECT *が便利です。使う列が決まっている処理では列名を書いておくと、表に列が増えても結果の列構成が変わりません。"
      },
      {
        "question": "DISTINCTで複数の列を指定するとどうなりますか？",
        "answer": "指定した列の組み合わせが同じ行を1行にまとめます。たとえばdepartmentとnameを指定すると、この例は部署と名前の組み合わせがすべて違うため、3行のままです。"
      }
    ],
    "references": [
      {
        "label": "PostgreSQL公式：テーブルへの問い合わせ",
        "url": "https://www.postgresql.org/docs/current/tutorial-select.html",
        "description": "SELECT、全列の取得、計算、行順とDISTINCTの基本"
      },
      {
        "label": "PostgreSQL公式：選択リスト",
        "url": "https://www.postgresql.org/docs/current/queries-select-lists.html",
        "description": "列の指定、列ラベル、DISTINCTの仕様"
      },
      {
        "label": "PostgreSQL公式：SELECT",
        "url": "https://www.postgresql.org/docs/current/sql-select.html",
        "description": "FROMを省略したSELECT文の仕様"
      }
    ],
    "related": [
      "where",
      "order-by",
      "inner-join"
    ],
    "practiceCategory": "select"
  },
  orderByTopic,
  whereTopic,
  ...advancedSqlTopics,
];

export const sqlTopicBySlug = Object.fromEntries(sqlTopics.map((topic) => [topic.slug, topic]));
