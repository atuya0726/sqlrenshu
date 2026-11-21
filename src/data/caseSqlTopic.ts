import type { SqlTopic } from './sqlTopics';

export const caseTopic: SqlTopic = {
  "slug": "case",
  "label": "CASE",
  "title": "SQLのCASE文とは？CASE WHENの書き方・NULL判定・AS別名を結果表で解説",
  "description": "SQLのCASE文（CASE WHEN）の書き方をPostgreSQLの実行結果つきで解説。複数条件、IS NULL・IS NOT NULLによるNULL判定、ENDの後ろのAS列名、SUMとの条件付き集計まで学べます。",
  "lead": "CASEは、条件に応じて返す値を変える式です。「CASE文」とも呼ばれますが、SELECTの中では1つの値を作るCASE式として使います。社員5人の表で、月給によって表示する文字や数値を変えてみましょう。",
  "sampleIntro": "employeesの1行が社員1人分です。salaryは月給（円）で、NULLは未入力を表します。35万円と40万円ちょうどの社員もいるので、条件の境界を確認できます。すべての例でこの5人を使います。結果表の行の並びは一例です。ORDER BYを指定しない場合、表示順は保証されません。",
  "sampleTables": [
    {
      "caption": "employees：社員5人の一覧（salaryは月給・円）",
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
  "syntax": "SELECT name, salary,\n  CASE\n    WHEN salary >= 350000 THEN '対象'\n    ELSE '対象外'\n  END AS label\nFROM employees;",
  "sections": [
    {
      "heading": "WHEN・THEN・ELSE・ENDで表示する値を変える",
      "body": "月給35万円以上なら「対象」、それ以外なら「対象外」を表示します。WHENに条件、THENに条件を満たすときの値、ELSEにそれ以外の値を書き、ENDで閉じます。AS labelは結果の列名です。社員の5行はそのまま残り、判定の列が増えます。NULLの月給は条件がtrueにならないため、ここでは対象外です。",
      "code": "SELECT name, salary,\n  CASE\n    WHEN salary >= 350000 THEN '対象'\n    ELSE '対象外'\n  END AS label\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "salary",
          "label"
        ],
        "rows": [
          [
            "青木",
            "300000",
            "対象外"
          ],
          [
            "北野",
            "400000",
            "対象"
          ],
          [
            "中央",
            "350000",
            "対象"
          ],
          [
            "大和",
            "400000",
            "対象"
          ],
          [
            "恵比寿",
            "NULL",
            "対象外"
          ]
        ]
      }
    },
    {
      "heading": "WHENを増やして3段階に分ける",
      "body": "40万円以上を「高」、35万円以上40万円未満を「中」、それ以外を「その他」とします。上から最初に成立したWHENの値が採用されるため、40万円以上を先に書きます。北野さんと大和さんは「高」で決まり、中央さんは次の条件で「中」になります。35万円以上を先に書くと、40万円の人も「中」になってしまいます。",
      "code": "SELECT name, salary,\n  CASE\n    WHEN salary >= 400000 THEN '高'\n    WHEN salary >= 350000 THEN '中'\n    ELSE 'その他'\n  END AS band\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "salary",
          "band"
        ],
        "rows": [
          [
            "青木",
            "300000",
            "その他"
          ],
          [
            "北野",
            "400000",
            "高"
          ],
          [
            "中央",
            "350000",
            "中"
          ],
          [
            "大和",
            "400000",
            "高"
          ],
          [
            "恵比寿",
            "NULL",
            "その他"
          ]
        ]
      }
    },
    {
      "heading": "ANDで複数の条件をすべて満たす行を分ける",
      "body": "WHENの条件は、ANDでつないで複数書けます。ここでは部署と月給の2つの列を見て、「営業で、月給35万円以上」の人だけを「対象」にします。条件を両方満たすのは中央さんだけです。青木さんは営業ですが30万円、北野さんと大和さんは40万円ですが開発なので、どちらもELSEの「対象外」になります。",
      "code": "SELECT name, department, salary,\n  CASE\n    WHEN department = '営業' AND salary >= 350000 THEN '対象'\n    ELSE '対象外'\n  END AS label\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "department",
          "salary",
          "label"
        ],
        "rows": [
          [
            "青木",
            "営業",
            "300000",
            "対象外"
          ],
          [
            "北野",
            "開発",
            "400000",
            "対象外"
          ],
          [
            "中央",
            "営業",
            "350000",
            "対象"
          ],
          [
            "大和",
            "開発",
            "400000",
            "対象外"
          ],
          [
            "恵比寿",
            "サポート",
            "NULL",
            "対象外"
          ]
        ]
      }
    },
    {
      "heading": "ORでどちらかの条件を満たす行を分ける",
      "body": "ORでつなぐと、条件のどちらか一方でも満たせば、そのWHENが採用されます。「開発、または月給35万円以上」とすると、開発の北野さんと大和さんに加えて、営業で35万円の中央さんも「対象」になります。ANDとORを1つの条件に混ぜるときは、ANDが先に評価されます。意図した組み合わせになるように、ORの部分を括弧で囲みます。",
      "code": "SELECT name, department, salary,\n  CASE\n    WHEN department = '開発' OR salary >= 350000 THEN '対象'\n    ELSE '対象外'\n  END AS label\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "department",
          "salary",
          "label"
        ],
        "rows": [
          [
            "青木",
            "営業",
            "300000",
            "対象外"
          ],
          [
            "北野",
            "開発",
            "400000",
            "対象"
          ],
          [
            "中央",
            "営業",
            "350000",
            "対象"
          ],
          [
            "大和",
            "開発",
            "400000",
            "対象"
          ],
          [
            "恵比寿",
            "サポート",
            "NULL",
            "対象外"
          ]
        ]
      }
    },
    {
      "heading": "ELSEを省略すると未一致はNULLになる",
      "body": "ELSEを書かずに35万円以上だけに「対象」を付けます。どのWHENにも一致しない青木さんと恵比寿さんの結果はNULLです。CASEがNULLを返しても、その社員の行が消えるわけではありません。行を取り除くWHEREとの違いを結果表で確認してください。",
      "code": "SELECT name, salary,\n  CASE\n    WHEN salary >= 350000 THEN '対象'\n  END AS label\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "salary",
          "label"
        ],
        "rows": [
          [
            "青木",
            "300000",
            "NULL"
          ],
          [
            "北野",
            "400000",
            "対象"
          ],
          [
            "中央",
            "350000",
            "対象"
          ],
          [
            "大和",
            "400000",
            "対象"
          ],
          [
            "恵比寿",
            "NULL",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "IS NULLで未入力を別の表示にする",
      "body": "未入力の月給をほかの値と区別したい場合は、WHEN salary IS NULLと書きます。恵比寿さんは「未入力」、ほかの4人は「入力済み」です。salary = NULLではtrueにならないため、NULLの確認にはIS NULLを使います。",
      "code": "SELECT name, salary,\n  CASE\n    WHEN salary IS NULL THEN '未入力'\n    ELSE '入力済み'\n  END AS entry_status\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "salary",
          "entry_status"
        ],
        "rows": [
          [
            "青木",
            "300000",
            "入力済み"
          ],
          [
            "北野",
            "400000",
            "入力済み"
          ],
          [
            "中央",
            "350000",
            "入力済み"
          ],
          [
            "大和",
            "400000",
            "入力済み"
          ],
          [
            "恵比寿",
            "NULL",
            "未入力"
          ]
        ]
      }
    },
    {
      "heading": "IS NOT NULLで入力済みの人だけ別の値にする",
      "body": "NULLでないことを条件にするときは、WHEN salary IS NOT NULLと書きます。入力済みの4人は「入力済み」、恵比寿さんはELSEの「未入力」になります。IS NULLとIS NOT NULLのどちらを使っても同じ分類ができるので、読みやすいほうを選びます。salary <> NULLのような比較はtrueにならず、全員がELSEへ回ってしまいます。",
      "code": "SELECT name, salary,\n  CASE\n    WHEN salary IS NOT NULL THEN '入力済み'\n    ELSE '未入力'\n  END AS entry_status\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "salary",
          "entry_status"
        ],
        "rows": [
          [
            "青木",
            "300000",
            "入力済み"
          ],
          [
            "北野",
            "400000",
            "入力済み"
          ],
          [
            "中央",
            "350000",
            "入力済み"
          ],
          [
            "大和",
            "400000",
            "入力済み"
          ],
          [
            "恵比寿",
            "NULL",
            "未入力"
          ]
        ]
      }
    },
    {
      "heading": "CASEの結果にASで列名を付ける",
      "body": "CASE式の結果にASで名前を付けないと、PostgreSQLは列名をcaseにします。ここではAS行を省いた例を実行しています。結果の列を後から指定したり、読む人に意味を伝えたりするには、END AS 列名と書きます。ENDの直後にASを置く点がポイントです。",
      "code": "SELECT name,\n  CASE\n    WHEN salary IS NULL THEN '未入力'\n    ELSE '入力済み'\n  END\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "case"
        ],
        "rows": [
          [
            "青木",
            "入力済み"
          ],
          [
            "北野",
            "入力済み"
          ],
          [
            "中央",
            "入力済み"
          ],
          [
            "大和",
            "入力済み"
          ],
          [
            "恵比寿",
            "未入力"
          ]
        ]
      }
    },
    {
      "heading": "単純CASEで部署名をコードに変える",
      "body": "同じ列の値を比べるだけなら、CASE departmentの後ろにWHENの候補を書けます。営業をS、開発をD、それ以外をOと表示します。この形は等しいかどうかの比較です。月給の大小やIS NULLのような条件には、これまでのCASE WHEN 条件の形を使います。",
      "code": "SELECT name, department,\n  CASE department\n    WHEN '営業' THEN 'S'\n    WHEN '開発' THEN 'D'\n    ELSE 'O'\n  END AS department_code\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "department",
          "department_code"
        ],
        "rows": [
          [
            "青木",
            "営業",
            "S"
          ],
          [
            "北野",
            "開発",
            "D"
          ],
          [
            "中央",
            "営業",
            "S"
          ],
          [
            "大和",
            "開発",
            "D"
          ],
          [
            "恵比寿",
            "サポート",
            "O"
          ]
        ]
      }
    },
    {
      "heading": "LIKEで文字列の一部が一致する行を分ける",
      "body": "WHENの条件にはLIKEも書けます。名前が「北」で始まる人を「北で始まる」、それ以外を「その他」と表示します。%は0文字以上の任意の文字列を表すので、'北%'は北野さんに一致します。LIKEを使えるのは、このCASE WHEN 条件の形です。CASE name WHEN '北%'のような単純CASEは等しいかどうかだけを比べるので、パターンとしては働きません。",
      "code": "SELECT name,\n  CASE\n    WHEN name LIKE '北%' THEN '北で始まる'\n    ELSE 'その他'\n  END AS name_group\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "name_group"
        ],
        "rows": [
          [
            "青木",
            "その他"
          ],
          [
            "北野",
            "北で始まる"
          ],
          [
            "中央",
            "その他"
          ],
          [
            "大和",
            "その他"
          ],
          [
            "恵比寿",
            "その他"
          ]
        ]
      }
    },
    {
      "heading": "CASEを入れ子にして、条件を2段階で分ける",
      "body": "THENやELSEの値として、別のCASEを書けます。ここでは、まず部署が営業かどうかで分け、営業の人だけを月給でさらに分けます。青木さんは「営業・対象外」、中央さんは「営業・対象」、営業でない3人は「営業以外」です。入れ子が深くなると読みにくくなります。同じ分類は、WHEN department = '営業' AND salary >= 350000のようにANDを使ったWHENを並べても書けます。",
      "code": "SELECT name, department, salary,\n  CASE\n    WHEN department = '営業' THEN\n      CASE\n        WHEN salary >= 350000 THEN '営業・対象'\n        ELSE '営業・対象外'\n      END\n    ELSE '営業以外'\n  END AS label\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "department",
          "salary",
          "label"
        ],
        "rows": [
          [
            "青木",
            "営業",
            "300000",
            "営業・対象外"
          ],
          [
            "北野",
            "開発",
            "400000",
            "営業以外"
          ],
          [
            "中央",
            "営業",
            "350000",
            "営業・対象"
          ],
          [
            "大和",
            "開発",
            "400000",
            "営業以外"
          ],
          [
            "恵比寿",
            "サポート",
            "NULL",
            "営業以外"
          ]
        ]
      }
    },
    {
      "heading": "THEN・ELSEで数値の1と0を返す",
      "body": "CASEは文字列だけでなく数値も返せます。35万円以上なら1、それ以外なら0にすると、北野さん・中央さん・大和さんの3人が1になります。次の節ではこの列を足して人数を求めます。数値の1と0は、シングルクォートで囲まずに書きます。",
      "code": "SELECT name, department, salary,\n  CASE\n    WHEN salary >= 350000 THEN 1\n    ELSE 0\n  END AS eligible\nFROM employees;",
      "resultTable": {
        "headers": [
          "name",
          "department",
          "salary",
          "eligible"
        ],
        "rows": [
          [
            "青木",
            "営業",
            "300000",
            "0"
          ],
          [
            "北野",
            "開発",
            "400000",
            "1"
          ],
          [
            "中央",
            "営業",
            "350000",
            "1"
          ],
          [
            "大和",
            "開発",
            "400000",
            "1"
          ],
          [
            "恵比寿",
            "サポート",
            "NULL",
            "0"
          ]
        ]
      }
    },
    {
      "heading": "SUMとCASEで条件に合う人数を集計する",
      "body": "前の1と0を部署ごとにSUMで足します。営業は青木さんの0と中央さんの1で1人、開発は1 + 1で2人、サポートは0人です。WHEREで対象者だけに絞っていないので、対象者が0人のサポートも結果に残ります。GROUP BYを学んでから、この組み合わせを試してみましょう。",
      "code": "SELECT department,\n  SUM(CASE\n    WHEN salary >= 350000 THEN 1\n    ELSE 0\n  END) AS eligible_people\nFROM employees\nGROUP BY department;",
      "resultTable": {
        "headers": [
          "department",
          "eligible_people"
        ],
        "rows": [
          [
            "サポート",
            "0"
          ],
          [
            "営業",
            "1"
          ],
          [
            "開発",
            "2"
          ]
        ]
      }
    },
    {
      "heading": "WHEREの中でCASEを使い、行ごとに条件を変える",
      "body": "CASEはSELECTの列だけでなく、WHEREの条件にも書けます。ここでは部署によって基準を変え、営業は35万円以上、それ以外の部署は40万円以上の人だけを残します。残るのは中央さん、北野さん、大和さんの3人です。月給がNULLの恵比寿さんは、比較の結果がtrueにならないので残りません。条件が2〜3個なら、ANDとORを組み合わせたWHEREのほうが読みやすいこともあります。",
      "code": "SELECT name, department, salary\nFROM employees\nWHERE\n  CASE\n    WHEN department = '営業' THEN salary >= 350000\n    ELSE salary >= 400000\n  END;",
      "resultTable": {
        "headers": [
          "name",
          "department",
          "salary"
        ],
        "rows": [
          [
            "北野",
            "開発",
            "400000"
          ],
          [
            "中央",
            "営業",
            "350000"
          ],
          [
            "大和",
            "開発",
            "400000"
          ]
        ]
      }
    },
    {
      "heading": "ORDER BYの中でCASEを使い、決めた順番に並べる",
      "body": "部署を「開発、営業、それ以外」の順に並べたいとき、部署名の文字の順ではこの並びになりません。ORDER BYにCASEを書いて、開発に1、営業に2、それ以外に3を割り当てると、その数の小さい順に並びます。同じ部署の中はidの順にしています。CASEが返す1・2・3は並べ替えにだけ使われ、結果の列には出ません。",
      "code": "SELECT name, department\nFROM employees\nORDER BY\n  CASE department\n    WHEN '開発' THEN 1\n    WHEN '営業' THEN 2\n    ELSE 3\n  END,\n  id;",
      "resultTable": {
        "headers": [
          "name",
          "department"
        ],
        "rows": [
          [
            "北野",
            "開発"
          ],
          [
            "大和",
            "開発"
          ],
          [
            "青木",
            "営業"
          ],
          [
            "中央",
            "営業"
          ],
          [
            "恵比寿",
            "サポート"
          ]
        ]
      }
    },
    {
      "heading": "UPDATEでCASEを使い、行ごとに違う値へ更新する",
      "body": "UPDATEのSETにCASEを書くと、1回のUPDATEで行ごとに違う値を設定できます。ここでは営業の月給を1万円、開発の月給を2万円上げます。ELSE salaryは「それ以外の行は今の値のまま」という意味です。ELSEを省くと、どのWHENにも一致しない行のsalaryがNULLで上書きされてしまいます。RETURNINGは更新後の行を表示するPostgreSQLの書き方です。恵比寿さんの月給は元からNULLで、そのまま残ります。",
      "code": "UPDATE employees\nSET salary =\n  CASE\n    WHEN department = '営業' THEN salary + 10000\n    WHEN department = '開発' THEN salary + 20000\n    ELSE salary\n  END\nRETURNING name, department, salary;",
      "resultTable": {
        "headers": [
          "name",
          "department",
          "salary"
        ],
        "rows": [
          [
            "青木",
            "営業",
            "310000"
          ],
          [
            "北野",
            "開発",
            "420000"
          ],
          [
            "中央",
            "営業",
            "360000"
          ],
          [
            "大和",
            "開発",
            "420000"
          ],
          [
            "恵比寿",
            "サポート",
            "NULL"
          ]
        ]
      }
    }
  ],
  "mistakes": [],
  "notes": [
    {
      "title": "返す値の型をそろえる",
      "body": "THENとELSEの値は、共通の型に変換できる必要があります。たとえばTHEN salaryとELSE '未入力'を混ぜると、PostgreSQLでは文字列を整数へ変換しようとしてエラーになります。文字で分類する例は文字列同士、人数を数える例は数値同士にそろえます。"
    }
  ],
  "faqs": [
    {
      "question": "CASE文とCASE式は違いますか？",
      "answer": "このガイドで扱うSELECT内のCASEは、条件に応じて1つの値を返す式です。SQLの検索では「CASE文」と呼ばれることもありますが、SQL文全体の実行を分岐する手続き言語の命令とは区別します。"
    },
    {
      "question": "WHENの条件を複数満たすとどうなりますか？",
      "answer": "上から最初にtrueになったWHENの値が返ります。40万円以上と35万円以上のように範囲が重なる場合は、優先したい条件を先に書きます。"
    },
    {
      "question": "CASE WHENで複数条件を書くにはどうしますか？",
      "answer": "1つのWHENの中で、条件をANDやORでつなぎます。WHEN department = '営業' AND salary >= 350000のように、別々の列を見る条件も組み合わせられます。分類を3つ以上に分けたいときは、WHENそのものを増やします。"
    },
    {
      "question": "CASE salary WHEN NULLで未入力を判定できますか？",
      "answer": "できません。単純CASEは等値比較なのでNULLには一致しません。CASE WHEN salary IS NULL THEN ... ENDの形で判定します。"
    },
    {
      "question": "CASE WHENでIS NOT NULLは使えますか？",
      "answer": "使えます。WHENには真偽値になる条件を書けるので、WHEN salary IS NOT NULL THEN ... のように書けます。NULLかどうかの判定に = や <> は使えません。"
    },
    {
      "question": "CASEの結果の列名はどう付けますか？",
      "answer": "ENDの後ろにAS 列名を書きます。ASを付けないと、PostgreSQLでは列名がcaseになります。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：CASE",
      "url": "https://www.postgresql.org/docs/current/functions-conditional.html#FUNCTIONS-CASE",
      "description": "条件分岐、単純CASE、ELSE省略、返す値の型"
    },
    {
      "label": "PostgreSQL公式：CASEなどの型解決",
      "url": "https://www.postgresql.org/docs/current/typeconv-union-case.html",
      "description": "共通の出力型への変換"
    },
    {
      "label": "PostgreSQL公式：集約関数",
      "url": "https://www.postgresql.org/docs/current/functions-aggregate.html",
      "description": "SUMによる数値の合計"
    },
    {
      "label": "PostgreSQL公式：UPDATE",
      "url": "https://www.postgresql.org/docs/current/sql-update.html",
      "description": "SETに書ける式とRETURNING"
    }
  ],
  "related": [
    "coalesce",
    "select",
    "where",
    "group-by",
    "having",
    "like",
    "update",
    "order-by"
  ],
  "practiceCategory": "case"
};
