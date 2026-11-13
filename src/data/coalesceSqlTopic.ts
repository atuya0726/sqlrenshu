import type { SqlTopic } from './sqlTopics';

export const coalesceTopic: SqlTopic = {
  "slug": "coalesce",
  "label": "NULL・COALESCE",
  "title": "SQLのNULLとCOALESCEとは？0・空文字との違いと平均への影響",
  "description": "SQLのNULLとCOALESCEをPostgreSQLの元の表・SQL・結果表で解説。IS NULL・IS NOT NULL、0と空文字、複数候補の優先順位、AVGの内側と外側の違いを演習で学べます。",
  "lead": "NULLは、値がない、または分からないことを表します。COALESCEを使うと、NULLの代わりに表示する値を選べます。社員5人の賞与と名前を使い、未入力を補うと結果や平均がどう変わるかを見ていきましょう。",
  "sampleIntro": "employeesの1行が社員1人分です。nameは氏名、nicknameは表示用の名前、bonusは賞与（万円）です。社員ID4は氏名も表示名も未入力です。NULLは未入力、0は数値のゼロ、''（空文字）は文字が0個の文字列を表します。表の空文字は見分けやすいように注記します。結果表の行の並びは一例で、ORDER BYなしでは保証されません。",
  "sampleTables": [
    {
      "caption": "employees：社員5人の名前と賞与",
      "headers": [
        "id（社員ID）",
        "name（氏名）",
        "nickname（表示名）",
        "bonus（賞与・万円）"
      ],
      "rows": [
        [
          "1",
          "青木",
          "アオ",
          "120"
        ],
        [
          "2",
          "北野",
          "NULL",
          "0"
        ],
        [
          "3",
          "中央",
          "",
          "NULL"
        ],
        [
          "4",
          "NULL",
          "NULL",
          "240"
        ],
        [
          "5",
          "恵比寿",
          "エビ",
          "NULL"
        ]
      ]
    }
  ],
  "syntax": "SELECT id, bonus, COALESCE(bonus, 0) AS displayed_bonus\nFROM employees;",
  "sections": [
    {
      "heading": "IS NULLで未入力を探す：NULLは0とは違う",
      "body": "NULLは値がない、または分からないことを表します。この表のbonusは賞与（万円）です。0は「賞与0万円と分かっている」、NULLは「金額が未入力」です。WHERE bonus IS NULLで未入力の社員を選ぶと、中央さんと恵比寿さんが残ります。0万円の北野さんは入りません。",
      "code": "SELECT *\nFROM employees\nWHERE bonus IS NULL;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "nickname",
          "bonus"
        ],
        "rows": [
          [
            "3",
            "中央",
            "",
            "NULL"
          ],
          [
            "5",
            "恵比寿",
            "エビ",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "IS NOT NULLなら0も入力済みに含まれる",
      "body": "入力済みの賞与を持つ社員はIS NOT NULLで選べます。120万円の青木さん、0万円の北野さん、240万円の社員ID4が残ります。金額が0かどうかではなく、NULLかどうかの判定です。NULLを探すときに= NULL、除くときに<> NULLとは書きません。",
      "code": "SELECT *\nFROM employees\nWHERE bonus IS NOT NULL;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "nickname",
          "bonus"
        ],
        "rows": [
          [
            "1",
            "青木",
            "アオ",
            "120"
          ],
          [
            "2",
            "北野",
            "NULL",
            "0"
          ],
          [
            "4",
            "NULL",
            "NULL",
            "240"
          ]
        ]
      }
    },
    {
      "heading": "空文字はNULLではない",
      "body": "空文字は文字が0個の文字列で、SQLではシングルクォート2つの''と書きます。PostgreSQLではNULLと別の値です。nickname = ''で検索すると中央さんだけが残り、nicknameがNULLの北野さんと社員ID4は入りません。表の「''（空文字）」は空文字の表示用の表記です。",
      "code": "SELECT *\nFROM employees\nWHERE nickname = '';",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "nickname",
          "bonus"
        ],
        "rows": [
          [
            "3",
            "中央",
            "",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "COALESCEで未入力の賞与だけを0表示にする",
      "body": "COALESCE(bonus, 0)は、bonusがNULLなら0、そうでなければbonusを返します。中央さんと恵比寿さんの表示値が0になり、もともと0の北野さんも0のままです。元のbonus列を書き換える処理ではありません。元の値と並べると、置き換えた箇所を確認できます。",
      "code": "SELECT id, bonus, COALESCE(bonus, 0) AS displayed_bonus\nFROM employees;",
      "resultTable": {
        "headers": [
          "id",
          "bonus",
          "displayed_bonus"
        ],
        "rows": [
          [
            "1",
            "120",
            "120"
          ],
          [
            "2",
            "0",
            "0"
          ],
          [
            "3",
            "NULL",
            "0"
          ],
          [
            "4",
            "240",
            "240"
          ],
          [
            "5",
            "NULL",
            "0"
          ]
        ]
      }
    },
    {
      "heading": "複数候補から最初のNULLでない値を選ぶ",
      "body": "表示名をnickname、name、最後に「名前なし」の順で選びます。青木さんはnicknameのアオ、北野さんはnameの北野です。両方NULLの社員ID4は名前なしになります。中央さんの空文字はNULLではないので、そのまま採用されます。左から順に確認するため、候補の並び順が優先順位です。",
      "code": "SELECT id, nickname, name,\n  COALESCE(nickname, name, '名前なし') AS display_name\nFROM employees;",
      "resultTable": {
        "headers": [
          "id",
          "nickname",
          "name",
          "display_name"
        ],
        "rows": [
          [
            "1",
            "アオ",
            "青木",
            "アオ"
          ],
          [
            "2",
            "NULL",
            "北野",
            "北野"
          ],
          [
            "3",
            "",
            "中央",
            ""
          ],
          [
            "4",
            "NULL",
            "NULL",
            "名前なし"
          ],
          [
            "5",
            "エビ",
            "恵比寿",
            "エビ"
          ]
        ]
      }
    },
    {
      "heading": "AVGはNULLを除いて平均を計算する",
      "body": "まずCOALESCEを使わずに賞与の平均を求めます。入力されている値は120、0、240の3件なので、(120 + 0 + 240) ÷ 3で120万円です。0は計算に含めますが、NULLの2件は合計にも件数にも含めません。",
      "code": "SELECT AVG(bonus) AS average_bonus\nFROM employees;",
      "resultTable": {
        "headers": [
          "average_bonus"
        ],
        "rows": [
          [
            "120"
          ]
        ]
      }
    },
    {
      "heading": "AVGの内側でCOALESCEを使うと平均が変わる",
      "body": "未入力を0万円として5人全員の平均を求める場合は、AVGの内側にCOALESCEを書きます。120、0、0、240、0の5件となり、360 ÷ 5で72万円です。これは表示を整えるだけではなく、平均の意味を変えています。不明な賞与を0と見なしてよい場合にだけ使います。",
      "code": "SELECT AVG(COALESCE(bonus, 0)) AS average_bonus\nFROM employees;",
      "resultTable": {
        "headers": [
          "average_bonus"
        ],
        "rows": [
          [
            "72"
          ]
        ]
      }
    },
    {
      "heading": "AVGの外側なら平均結果がNULLのときだけ補う",
      "body": "COALESCE(AVG(bonus), 0)は、先にNULLを除いた平均を計算し、その結果がNULLのときだけ0にします。この表ではAVG(bonus)が120なので、結果は120のままです。内側に置いた例の72とは違います。対象の賞与がすべてNULL、または対象行が0件なら、平均がNULLになるため0を返します。",
      "code": "SELECT COALESCE(AVG(bonus), 0) AS average_bonus\nFROM employees;",
      "resultTable": {
        "headers": [
          "average_bonus"
        ],
        "rows": [
          [
            "120"
          ]
        ]
      }
    }
  ],
  "mistakes": [],
  "notes": [
    {
      "title": "COALESCEの候補は共通の型にそろえる",
      "body": "CASEと同じく、候補は共通の型に変換できる必要があります。整数のbonusと文字列の'未入力'をそのまま混ぜると変換エラーになります。金額を数値として返すならCOALESCE(bonus, 0)、名前を文字列で返すなら本文のように文字列同士を組み合わせます。"
    }
  ],
  "faqs": [
    {
      "question": "COALESCEで0や空文字も置き換えられますか？",
      "answer": "COALESCEが読み飛ばすのはNULLだけです。0や空文字はそのまま採用されます。空文字も未設定として扱いたい場合は、CASE WHEN nickname IS NULL OR nickname = '' THEN ... ENDのように、その条件を明示します。"
    },
    {
      "question": "候補がすべてNULLの場合は？",
      "answer": "結果もNULLになります。必ず表示値が欲しい場合は、最後に0や'名前なし'のようなNULLでない既定値を置きます。"
    },
    {
      "question": "COALESCEを使うと元のデータも変わりますか？",
      "answer": "このガイドのSELECTは取得する結果の値を変えるだけで、表のデータは更新しません。元のNULLと0を後から区別したい場合は、元の列も一緒に表示します。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：比較とNULL判定",
      "url": "https://www.postgresql.org/docs/current/functions-comparison.html",
      "description": "比較とNULL判定の仕様"
    },
    {
      "label": "PostgreSQL公式：COALESCE",
      "url": "https://www.postgresql.org/docs/current/functions-conditional.html#FUNCTIONS-COALESCE",
      "description": "COALESCEの仕様"
    },
    {
      "label": "PostgreSQL公式：集約関数",
      "url": "https://www.postgresql.org/docs/current/functions-aggregate.html",
      "description": "集約関数の仕様"
    }
  ],
  "related": [
    "case",
    "where",
    "group-by",
    "left-join"
  ],
  "practiceCategory": "coalesce"
};
