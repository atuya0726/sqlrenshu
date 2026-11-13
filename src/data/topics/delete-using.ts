import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  "setup": "CREATE TABLE members (id integer PRIMARY KEY, name text NOT NULL, plan text NOT NULL);\nINSERT INTO members VALUES (1, '佐藤', 'free'), (2, '鈴木', 'pro'), (3, '田中', 'free'), (4, '高橋', 'pro'), (5, '伊藤', 'free');\nCREATE TABLE withdrawals (member_id integer NOT NULL, reason text NOT NULL);\nINSERT INTO withdrawals VALUES (2, '転居'), (3, '料金'), (3, '不満'), (9, '不明');\nCREATE TABLE logins (member_id integer NOT NULL, channel text NOT NULL);\nINSERT INTO logins VALUES (1, 'web'), (1, 'app'), (2, 'web'), (4, 'app');",
  "sources": [
    "SELECT * FROM members ORDER BY id",
    "SELECT * FROM withdrawals ORDER BY member_id, reason",
    "SELECT * FROM logins ORDER BY member_id, channel"
  ]
};

export const topic: SqlTopic = {
  "slug": "delete-using",
  "label": "DELETE … USING",
  "title": "PostgreSQLのDELETE … USINGとは？別の表の条件で行を削除する書き方",
  "description": "PostgreSQLのDELETE … USINGを元の表・SQL・結果表で解説。別の表を使った削除の書き方、EXISTS・INとの比較、結合条件の書き忘れで全行が消える危険、未一致の行をNOT EXISTSで削除する方法を演習付きで学べます。",
  "lead": "DELETE … USINGは、別の表を結合して、その表の値を条件に行を削除するPostgreSQLの書き方です。退会申請のある会員を消す、特定の理由の申請を持つ行だけを消す、といった削除を、結合条件とあわせて書けます。標準SQLではなくPostgreSQLの拡張なので、EXISTSやINでの書き方との使い分けも合わせて覚えます。",
  "sampleIntro": "membersは会員1人が1行で、idは会員番号、nameは名前、planは契約プラン（free・pro）です。withdrawalsは退会申請で、member_idがmembersのidに対応します。田中（id 3）は申請が2件あり、member_idが9の行はmembersに該当者がいません。loginsは会員のログイン記録で、ログインのない会員は行がありません。各節では実行前の状態から削除し、残ったmembersをid順に表示します。",
  "sampleTables": [
    {
      "caption": "members：会員5件（削除前）",
      "headers": [
        "id",
        "name",
        "plan"
      ],
      "rows": [
        [
          "1",
          "佐藤",
          "free"
        ],
        [
          "2",
          "鈴木",
          "pro"
        ],
        [
          "3",
          "田中",
          "free"
        ],
        [
          "4",
          "高橋",
          "pro"
        ],
        [
          "5",
          "伊藤",
          "free"
        ]
      ]
    },
    {
      "caption": "withdrawals：退会申請4件",
      "headers": [
        "member_id",
        "reason"
      ],
      "rows": [
        [
          "2",
          "転居"
        ],
        [
          "3",
          "不満"
        ],
        [
          "3",
          "料金"
        ],
        [
          "9",
          "不明"
        ]
      ]
    },
    {
      "caption": "logins：ログイン記録4件",
      "headers": [
        "member_id",
        "channel"
      ],
      "rows": [
        [
          "1",
          "app"
        ],
        [
          "1",
          "web"
        ],
        [
          "2",
          "web"
        ],
        [
          "4",
          "app"
        ]
      ]
    }
  ],
  "syntax": "DELETE FROM members\nUSING withdrawals AS w\nWHERE members.id = w.member_id;",
  "sections": [
    {
      "heading": "USINGで別の表を指定して、一致する行を削除する",
      "body": "DELETE FROMの後ろにUSINGで別の表を並べ、結合条件をWHEREに書きます。結合に一致した行だけが削除されます。ここでは退会申請のある鈴木（id 2）と田中（id 3）が消え、佐藤・高橋・伊藤の3人が残ります。田中は申請が2件ありますが、削除されるのは1行です。member_idが9の申請は、一致する会員がいないので何も起きません。",
      "code": "DELETE FROM members\nUSING withdrawals AS w\nWHERE members.id = w.member_id;\n\nSELECT * FROM members ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "plan"
        ],
        "rows": [
          [
            "1",
            "佐藤",
            "free"
          ],
          [
            "4",
            "高橋",
            "pro"
          ],
          [
            "5",
            "伊藤",
            "free"
          ]
        ]
      }
    },
    {
      "heading": "別の表の値で絞って削除する",
      "body": "USINGにした表の列は、WHEREの条件に使えます。結合条件にANDで足すと、「理由が料金の申請がある会員」のように、別の表の値で削除対象を絞れます。ここでは理由が料金の田中だけが消え、転居の申請がある鈴木は残ります。別の表の値を条件に使えることが、USINGを使う主な理由です。",
      "code": "DELETE FROM members\nUSING withdrawals AS w\nWHERE members.id = w.member_id\n  AND w.reason = '料金';\n\nSELECT * FROM members ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "plan"
        ],
        "rows": [
          [
            "1",
            "佐藤",
            "free"
          ],
          [
            "2",
            "鈴木",
            "pro"
          ],
          [
            "4",
            "高橋",
            "pro"
          ],
          [
            "5",
            "伊藤",
            "free"
          ]
        ]
      }
    },
    {
      "heading": "EXISTSで同じ削除を書いて比べる",
      "body": "WHEREにEXISTSを書く方法でも、最初の節と同じ会員が削除されます。EXISTSは「一致する行があるか」だけを見る標準SQLの書き方で、他のDBでも使えます。結合先の値を使わず、存在だけで決まる削除ならEXISTSで十分です。USINGは結合先の列も条件に使いたいときに向いています。",
      "code": "DELETE FROM members\nWHERE EXISTS (\n  SELECT 1\n  FROM withdrawals AS w\n  WHERE w.member_id = members.id\n);\n\nSELECT * FROM members ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "plan"
        ],
        "rows": [
          [
            "1",
            "佐藤",
            "free"
          ],
          [
            "4",
            "高橋",
            "pro"
          ],
          [
            "5",
            "伊藤",
            "free"
          ]
        ]
      }
    },
    {
      "heading": "INのサブクエリで条件に合う申請者を削除する",
      "body": "INを使うと、サブクエリが返したid一覧に含まれる行を削除できます。サブクエリの中で理由を転居に絞れば、鈴木だけが消えます。INは一覧に入るかどうかだけを判定し、結合先の列を外側で使えません。結合条件を書き忘れる心配は無い一方、サブクエリが返す値にNULLがあるとNOT INでは結果が変わるため、否定の条件では次の節の書き方にします。",
      "code": "DELETE FROM members\nWHERE id IN (\n  SELECT member_id\n  FROM withdrawals\n  WHERE reason = '転居'\n);\n\nSELECT * FROM members ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "plan"
        ],
        "rows": [
          [
            "1",
            "佐藤",
            "free"
          ],
          [
            "3",
            "田中",
            "free"
          ],
          [
            "4",
            "高橋",
            "pro"
          ],
          [
            "5",
            "伊藤",
            "free"
          ]
        ]
      }
    },
    {
      "heading": "一致しない行を削除するにはNOT EXISTSを使う",
      "body": "USINGは結合に一致した行を削除するため、「別の表に行が無い会員」を消す書き方には向きません。この場合はNOT EXISTSを使います。ここではloginsに記録の無い田中（id 3）と伊藤（id 5）が消え、ログインのある佐藤・鈴木・高橋が残ります。佐藤は2回ログインしていますが、NOT EXISTSは存在するかどうかだけを見るので、重複は問題になりません。",
      "code": "DELETE FROM members\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM logins AS l\n  WHERE l.member_id = members.id\n);\n\nSELECT * FROM members ORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "plan"
        ],
        "rows": [
          [
            "1",
            "佐藤",
            "free"
          ],
          [
            "2",
            "鈴木",
            "pro"
          ],
          [
            "4",
            "高橋",
            "pro"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "結合条件を書き忘れると、全会員が削除される",
      "body": "USINGに表を書いてWHEREを省くと、結合条件が無いため、すべての会員とすべての申請の組み合わせが対象になります。withdrawalsに1行でもあれば、membersの全行が削除されます。エラーも警告も出ません。USINGを書いたら、更新先との結合条件が必ずあるかを確認し、実行前に同じ条件のSELECTで対象を確かめます。",
      "code": "DELETE FROM members\nUSING withdrawals AS w;\n\nSELECT * FROM members ORDER BY id;"
    },
    {
      "title": "NOT INのサブクエリにNULLが混じると、1行も削除されない",
      "body": "NOT INは、比較する一覧にNULLが1つでもあると、どの行に対してもtrueにならず、0行を返します。NULLを許す列に対して「一覧にない行を削除する」と書くと、削除件数が0件になっても気づきにくい誤りです。次の例では、一覧に1とNULLが入るだけで、どの会員も選ばれません。未一致の行はNOT EXISTSで書きます。",
      "code": "SELECT *\nFROM members\nWHERE id NOT IN (\n  SELECT 1\n  UNION ALL\n  SELECT NULL\n);"
    }
  ],
  "notes": [
    {
      "title": "申請が複数あっても、1つの行は1回しか削除されない",
      "body": "USINGの表に一致する行が複数あっても、削除される会員の行は1行です。下の例では田中の申請が2件ありますが、RETURNINGに出る田中は1行です。DELETEの結果の件数は、結合した行数ではなく削除した行数です。",
      "code": "DELETE FROM members\nUSING withdrawals AS w\nWHERE members.id = w.member_id\nRETURNING members.id, members.name;"
    },
    {
      "title": "削除する前に、同じ条件のSELECTで対象を確かめる",
      "body": "DELETEは実行すると行が消えるため、まず同じ条件のSELECTで対象の行を確認する習慣が安全です。USINGをSELECTに書き換えるときは、更新先の表をFROMに、USINGの表を続けて書きます。申請が複数ある会員は同じ行が何度も出るので、DISTINCTで1行にまとめています。確認したあとで、SELECTの部分をDELETEとUSINGに置き換えます。",
      "code": "SELECT DISTINCT members.*\nFROM members, withdrawals AS w\nWHERE members.id = w.member_id\nORDER BY members.id;"
    },
    {
      "title": "MySQLやSQL Serverとは書き方が異なる",
      "body": "DELETE … USINGは標準SQLではなく、PostgreSQLの拡張です。公式ドキュメントも、USING句とRETURNING句はPostgreSQLの拡張だと説明しています。MySQLにはDELETE 削除対象 FROM 表（JOIN可）の形と、DELETE FROM 削除対象 USING 表（JOIN可）の形があり、SQL ServerはDELETE 別名 FROM 表 JOIN … の形です。どれもFROMやUSINGに削除対象の表自身を含める点がPostgreSQLと異なります。PostgreSQLへ移すときは、結合条件をWHEREに書き換えるか、EXISTSで書き直します。"
    }
  ],
  "faqs": [
    {
      "question": "USINGの中でJOIN … ONは使えますか？",
      "answer": "USINGにはSELECTのFROMと同じ書き方ができるので、JOINを使えます。ただし、JOINのONの中から削除先の表を参照することはできないため、削除先との結合条件はWHEREに書きます。"
    },
    {
      "question": "USINGとEXISTSはどちらを使うべきですか？",
      "answer": "他の表の存在だけで決まる削除なら、標準SQLで他のDBへも移せるEXISTSが向いています。他の表の列の値を条件に使いたいときや、RETURNINGで他の表の列も返したいときは、USINGが書きやすくなります。"
    },
    {
      "question": "別の表に一致しない行を削除するにはどう書きますか？",
      "answer": "USINGは一致した行を対象にするので、NOT EXISTSで「一致する行が存在しない」条件を書きます。NOT INは一覧にNULLが混じると結果が変わるため、NULLを許す列では使いません。"
    },
    {
      "question": "うっかり全行を削除してしまったら戻せますか？",
      "answer": "トランザクションの中でBEGINから実行していれば、COMMITの前ならROLLBACKで取り消せます。COMMIT後は戻せないため、削除前に同じ条件のSELECTで件数を確かめる、バックアップを取る、といった準備が必要です。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：DELETE",
      "url": "https://www.postgresql.org/docs/current/sql-delete.html",
      "description": "USING句の仕様、WHEREを省いたときの動作、削除件数、標準SQLとの互換性を確認しました。"
    },
    {
      "label": "PostgreSQL公式：データの削除",
      "url": "https://www.postgresql.org/docs/current/dml-delete.html",
      "description": "DELETEの基本的な考え方を確認しました。"
    }
  ],
  "related": [
    "delete",
    "update-from",
    "exists",
    "not-in",
    "subquery",
    "inner-join"
  ],
  "practiceCategory": "delete-using"
};
