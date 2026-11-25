import type { SqlTopic } from '../sqlTopics';

export const fixture = {
  "setup": "CREATE TABLE members (id integer PRIMARY KEY, name text NOT NULL, email text, plan varchar(10), joined_year text);\nINSERT INTO members VALUES (1, '青木', 'aoki@example.com', 'free', '2023'), (2, '北野', NULL, 'pro', '2024'), (3, '中央', 'chuo@example.com', 'trial', '2025');",
  "sources": [
    "SELECT * FROM members ORDER BY id"
  ]
};

export const topic: SqlTopic = {
  "slug": "alter-table",
  "label": "ALTER TABLE",
  "title": "SQLのALTER TABLEとは？カラムの追加・削除・型変更と制約の変更を解説",
  "description": "SQLのALTER TABLEをPostgreSQLのSQLと実行結果で解説。ADD COLUMNでのカラム追加、DROP COLUMN、型や桁数の変更（USING）、列名の変更、NOT NULL・DEFAULT・制約の追加と削除を、既存の行がどうなるかとエラー例つきで学べます。",
  "lead": "ALTER TABLEは、すでにある表の定義を変えるSQLです。列（カラム）の追加や削除、データ型や桁数の変更、列名の変更、NOT NULLや制約の追加を、表を作り直さずに行えます。行が入っている表を実際に変更して、すでにある行がどうなるか、どんなときにエラーになるかまで確かめましょう。",
  "sampleIntro": "membersは、会員を記録する表です。idが主キーで、3人の会員が入っています。北野のemailはNULL、planはvarchar(10)で、中央だけが古いプラン名のtrialです。joined_yearは入会した年ですが、文字列（text）で入っています。このページの各節は、いつもこの状態から始めて、ALTER TABLEのあとに確認用のSELECTを実行します。前の節で行った変更は、次の節には残っていません。",
  "sampleTables": [
    {
      "caption": "members：会員の表（idが主キー、planはvarchar(10)、joined_yearはtext）",
      "headers": [
        "id（会員ID）",
        "name（名前）",
        "email（メール）",
        "plan（プラン）",
        "joined_year（入会年）"
      ],
      "rows": [
        [
          "1",
          "青木",
          "aoki@example.com",
          "free",
          "2023"
        ],
        [
          "2",
          "北野",
          "NULL",
          "pro",
          "2024"
        ],
        [
          "3",
          "中央",
          "chuo@example.com",
          "trial",
          "2025"
        ]
      ]
    }
  ],
  "syntax": "ALTER TABLE members\n  ADD COLUMN phone text;",
  "sections": [
    {
      "heading": "ADD COLUMNで列（カラム）を追加する",
      "body": "表に列を足すときは、ALTER TABLE 表名 ADD COLUMN 列名 データ型と書きます。下の例は、membersに電話番号を入れるphoneを追加します。すでにある3行のphoneには値がないので、NULLになります。列は足されただけで、ほかの列の値は変わりません。値を入れるには、このあとUPDATEで行ごとに設定します。",
      "code": "ALTER TABLE members\n  ADD COLUMN phone text;\n\nSELECT *\nFROM members\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "email",
          "plan",
          "joined_year",
          "phone"
        ],
        "rows": [
          [
            "1",
            "青木",
            "aoki@example.com",
            "free",
            "2023",
            "NULL"
          ],
          [
            "2",
            "北野",
            "NULL",
            "pro",
            "2024",
            "NULL"
          ],
          [
            "3",
            "中央",
            "chuo@example.com",
            "trial",
            "2025",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "DEFAULTを付けて列を追加し、既存の行に既定値を入れる",
      "body": "ADD COLUMNにDEFAULTを付けると、すでにある行にもその既定値が入ります。下の例は、ポイントを入れるpointsをDEFAULT 0で追加しています。3人ともpointsが0になり、NULLの行はできません。これから追加する行も、pointsを省略すれば0になります。",
      "code": "ALTER TABLE members\n  ADD COLUMN points integer DEFAULT 0;\n\nSELECT id, name, points\nFROM members\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "points"
        ],
        "rows": [
          [
            "1",
            "青木",
            "0"
          ],
          [
            "2",
            "北野",
            "0"
          ],
          [
            "3",
            "中央",
            "0"
          ]
        ]
      }
    },
    {
      "heading": "NOT NULLの列を追加するときは、DEFAULTも一緒に付ける",
      "body": "行がすでに入っている表に、NOT NULLの列をDEFAULTなしで追加することはできません。追加した列は既存の行でNULLになり、その時点でNOT NULLに違反するからです。DEFAULTを一緒に付ければ、既存の行に既定値が入るので追加できます。下の例は、statusをNOT NULL DEFAULT 'active'で追加しています。続けて、DEFAULTなしでNOT NULLの列を追加しようとすると、エラーになります。",
      "code": "ALTER TABLE members\n  ADD COLUMN status text NOT NULL DEFAULT 'active';\n\nSELECT id, name, status\nFROM members\nORDER BY id;",
      "failing": {
        "code": "ALTER TABLE members\n  ADD COLUMN rank text NOT NULL;",
        "error": "column \"rank\" of relation \"members\" contains null values"
      },
      "resultTable": {
        "headers": [
          "id",
          "name",
          "status"
        ],
        "rows": [
          [
            "1",
            "青木",
            "active"
          ],
          [
            "2",
            "北野",
            "active"
          ],
          [
            "3",
            "中央",
            "active"
          ]
        ]
      }
    },
    {
      "heading": "追加した列は末尾に付く（列の位置は指定できない）",
      "body": "PostgreSQLのADD COLUMNには、列を足す位置を指定する書き方がありません。追加した列は、いつも表の最後に付きます。下の例では、読みがなを入れるkanaを追加し、information_schema.columnsで列の並びを確かめています。kanaは6番目、つまり末尾です。続けて、MySQLのようにAFTERで位置を指定しようとすると、構文エラーになります。表示する順番を変えたいときは、SELECTで列を並べたい順に書きます。",
      "code": "ALTER TABLE members\n  ADD COLUMN kana text;\n\nSELECT column_name, ordinal_position\nFROM information_schema.columns\nWHERE table_name = 'members'\nORDER BY ordinal_position;",
      "failing": {
        "code": "ALTER TABLE members\n  ADD COLUMN kana2 text AFTER name;",
        "error": "syntax error at or near \"AFTER\""
      },
      "resultTable": {
        "headers": [
          "column_name",
          "ordinal_position"
        ],
        "rows": [
          [
            "id",
            "1"
          ],
          [
            "name",
            "2"
          ],
          [
            "email",
            "3"
          ],
          [
            "plan",
            "4"
          ],
          [
            "joined_year",
            "5"
          ],
          [
            "kana",
            "6"
          ]
        ]
      }
    },
    {
      "heading": "DROP COLUMNで列を削除する",
      "body": "不要になった列は、ALTER TABLE 表名 DROP COLUMN 列名で削除します。列に入っていた値も一緒に消えます。下の例はjoined_yearを削除していて、結果の表は4列になります。続けて同じ列をもう一度削除しようとすると、列がないのでエラーになります。削除した列の値は元に戻せないので、実行する前に列名を確かめます。",
      "code": "ALTER TABLE members\n  DROP COLUMN joined_year;\n\nSELECT *\nFROM members\nORDER BY id;",
      "failing": {
        "code": "ALTER TABLE members\n  DROP COLUMN joined_year;",
        "error": "column \"joined_year\" of relation \"members\" does not exist"
      },
      "resultTable": {
        "headers": [
          "id",
          "name",
          "email",
          "plan"
        ],
        "rows": [
          [
            "1",
            "青木",
            "aoki@example.com",
            "free"
          ],
          [
            "2",
            "北野",
            "NULL",
            "pro"
          ],
          [
            "3",
            "中央",
            "chuo@example.com",
            "trial"
          ]
        ]
      }
    },
    {
      "heading": "ALTER COLUMN … TYPEで桁数（文字数の上限）を変更する",
      "body": "列のデータ型や桁数を変えるときは、ALTER COLUMN 列名 TYPE 新しい型と書きます。下の例は、varchar(10)だったplanをvarchar(20)に広げ、information_schema.columnsで上限が20になったことを確かめています。上限を広げる変更は、入っている値がそのまま収まるので失敗しません。逆に狭めるときは、収まらない値が1つでもあるとエラーになります。続けてvarchar(3)に変えようとすると、4文字のfreeが入らないので失敗し、型は変わりません。",
      "code": "ALTER TABLE members\n  ALTER COLUMN plan TYPE varchar(20);\n\nSELECT column_name, data_type, character_maximum_length\nFROM information_schema.columns\nWHERE table_name = 'members'\n  AND column_name = 'plan';",
      "failing": {
        "code": "ALTER TABLE members\n  ALTER COLUMN plan TYPE varchar(3);",
        "error": "value too long for type character varying(3)"
      },
      "resultTable": {
        "headers": [
          "column_name",
          "data_type",
          "character_maximum_length"
        ],
        "rows": [
          [
            "plan",
            "character varying",
            "20"
          ]
        ]
      }
    },
    {
      "heading": "文字列の列を数値に変える型変更にはUSINGを書く",
      "body": "textからintegerのように、自動では変換されない型へ変えるときは、USINGの後ろに「いまの値を新しい型へ変換する式」を書きます。下の例は、文字列で入っていたjoined_yearを、USING joined_year::integerで整数に変えています。変更後は数として計算できるので、joined_year + 1が2024・2025・2026になります。続けて、planをUSINGなしでintegerに変えようとすると、自動では変換できないというエラーになります。USINGを書いても、freeのように数にできない値が入っている列は変換できません。",
      "code": "ALTER TABLE members\n  ALTER COLUMN joined_year TYPE integer\n  USING joined_year::integer;\n\nSELECT id, name, joined_year, joined_year + 1 AS next_year\nFROM members\nORDER BY id;",
      "failing": {
        "code": "ALTER TABLE members\n  ALTER COLUMN plan TYPE integer;",
        "error": "column \"plan\" cannot be cast automatically to type integer"
      },
      "resultTable": {
        "headers": [
          "id",
          "name",
          "joined_year",
          "next_year"
        ],
        "rows": [
          [
            "1",
            "青木",
            "2023",
            "2024"
          ],
          [
            "2",
            "北野",
            "2024",
            "2025"
          ],
          [
            "3",
            "中央",
            "2025",
            "2026"
          ]
        ]
      }
    },
    {
      "heading": "RENAME COLUMNで列名を、RENAME TOで表名を変更する",
      "body": "列の名前はRENAME COLUMN 古い名前 TO 新しい名前、表の名前はRENAME TO 新しい名前で変えます。変わるのは名前だけで、入っている値や制約はそのままです。下の例は、nameをfull_nameに、membersをusersに変えています。名前を変えたあとは、古い名前では参照できません。続けてmembersをSELECTすると、その名前の表はないというエラーになります。名前を変えるときは、その表や列を使っているSQLも一緒に直します。",
      "code": "ALTER TABLE members\n  RENAME COLUMN name TO full_name;\n\nALTER TABLE members\n  RENAME TO users;\n\nSELECT id, full_name, email\nFROM users\nORDER BY id;",
      "failing": {
        "code": "SELECT *\nFROM members;",
        "error": "relation \"members\" does not exist"
      },
      "resultTable": {
        "headers": [
          "id",
          "full_name",
          "email"
        ],
        "rows": [
          [
            "1",
            "青木",
            "aoki@example.com"
          ],
          [
            "2",
            "北野",
            "NULL"
          ],
          [
            "3",
            "中央",
            "chuo@example.com"
          ]
        ]
      }
    },
    {
      "heading": "SET NOT NULLでNOT NULL制約を付け、DROP NOT NULLで外す",
      "body": "すでにある列にNOT NULLを付けるには、ALTER COLUMN 列名 SET NOT NULLと書きます。付けられるのは、その列にNULLの行が1つもないときだけです。下の例では、3人とも値が入っているplanにNOT NULLを付け、is_nullableがNOになったことを確かめています。続けてemailにも付けようとすると、北野のemailがNULLなのでエラーになります。先にUPDATEでNULLを埋めてから付けます。NOT NULLを外すときは、ALTER COLUMN 列名 DROP NOT NULLです。",
      "code": "ALTER TABLE members\n  ALTER COLUMN plan SET NOT NULL;\n\nSELECT column_name, is_nullable\nFROM information_schema.columns\nWHERE table_name = 'members'\nORDER BY ordinal_position;",
      "failing": {
        "code": "ALTER TABLE members\n  ALTER COLUMN email SET NOT NULL;",
        "error": "column \"email\" of relation \"members\" contains null values"
      },
      "resultTable": {
        "headers": [
          "column_name",
          "is_nullable"
        ],
        "rows": [
          [
            "id",
            "NO"
          ],
          [
            "name",
            "NO"
          ],
          [
            "email",
            "YES"
          ],
          [
            "plan",
            "NO"
          ],
          [
            "joined_year",
            "YES"
          ]
        ]
      }
    },
    {
      "heading": "SET DEFAULTで既定値を決め、DROP DEFAULTで外す",
      "body": "すでにある列の既定値は、ALTER COLUMN 列名 SET DEFAULT 値で決めます。変わるのは、これから追加する行の扱いだけです。すでに入っている行の値は書き換わりません。下の例では、planの既定値をfreeにしてから、planを省略して大和を追加しています。大和のplanはfreeになり、中央のtrialはtrialのままです。既定値を外すときはALTER COLUMN 列名 DROP DEFAULTで、外したあとに省略した列はNULLになります。",
      "code": "ALTER TABLE members\n  ALTER COLUMN plan SET DEFAULT 'free';\n\nINSERT INTO members (id, name)\nVALUES (4, '大和');\n\nSELECT id, name, plan\nFROM members\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "plan"
        ],
        "rows": [
          [
            "1",
            "青木",
            "free"
          ],
          [
            "2",
            "北野",
            "pro"
          ],
          [
            "3",
            "中央",
            "trial"
          ],
          [
            "4",
            "大和",
            "free"
          ]
        ]
      }
    },
    {
      "heading": "ADD CONSTRAINTでUNIQUEやCHECKの制約をあとから追加する",
      "body": "表を作ったあとで制約を足すときは、ADD CONSTRAINT 制約名 制約の内容と書きます。下の例は、emailにUNIQUEを付け、pg_constraintで表に付いている制約を一覧にしています。最初からある主キーのmembers_pkeyに、members_email_keyが加わりました。制約を足すとき、PostgreSQLはすでにある行をすべて調べ、違反する行が1つでもあれば制約を付けません。続けて「planはfreeかproだけ」というCHECKを足そうとすると、中央のplanがtrialなのでエラーになります。先に違反している行を直してから、もう一度実行します。",
      "code": "ALTER TABLE members\n  ADD CONSTRAINT members_email_key UNIQUE (email);\n\nSELECT conname, pg_get_constraintdef(oid) AS definition\nFROM pg_constraint\nWHERE conrelid = 'members'::regclass\nORDER BY conname;",
      "failing": {
        "code": "ALTER TABLE members\n  ADD CONSTRAINT members_plan_check\n  CHECK (plan IN ('free', 'pro'));",
        "error": "check constraint \"members_plan_check\" of relation \"members\" is violated by some row"
      },
      "resultTable": {
        "headers": [
          "conname",
          "definition"
        ],
        "rows": [
          [
            "members_email_key",
            "UNIQUE (email)"
          ],
          [
            "members_pkey",
            "PRIMARY KEY (id)"
          ]
        ]
      }
    },
    {
      "heading": "DROP CONSTRAINTで制約を削除する",
      "body": "制約を外すときは、DROP CONSTRAINT 制約名と書きます。指定するのは列名ではなく制約の名前なので、名前が分からないときは、前の節のSELECTで先に調べます。下の例は、emailにUNIQUEを付けてからDROP CONSTRAINTで外しています。残っている制約は、主キーのmembers_pkeyだけです。続けてもう一度外そうとすると、その名前の制約がないのでエラーになります。",
      "code": "ALTER TABLE members\n  ADD CONSTRAINT members_email_key UNIQUE (email);\n\nALTER TABLE members\n  DROP CONSTRAINT members_email_key;\n\nSELECT conname, pg_get_constraintdef(oid) AS definition\nFROM pg_constraint\nWHERE conrelid = 'members'::regclass\nORDER BY conname;",
      "failing": {
        "code": "ALTER TABLE members\n  DROP CONSTRAINT members_email_key;",
        "error": "constraint \"members_email_key\" of relation \"members\" does not exist"
      },
      "resultTable": {
        "headers": [
          "conname",
          "definition"
        ],
        "rows": [
          [
            "members_pkey",
            "PRIMARY KEY (id)"
          ]
        ]
      }
    },
    {
      "heading": "複数の変更をカンマで区切り、1つのALTER TABLEにまとめる",
      "body": "列の追加や削除、型や既定値の変更は、カンマで区切って1つのALTER TABLEに並べられます。複数の列を一度に追加したいときも、ADD COLUMNをカンマで並べます。下の例は、phoneの追加、joined_yearの削除、planの既定値の設定を1文で行っています。1つでも失敗すると、同じ文に書いたほかの変更も行われません。RENAME COLUMNとRENAME TOは、ほかの変更と並べられないので、別の文に分けて書きます。",
      "code": "ALTER TABLE members\n  ADD COLUMN phone text,\n  DROP COLUMN joined_year,\n  ALTER COLUMN plan SET DEFAULT 'free';\n\nSELECT *\nFROM members\nORDER BY id;",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "email",
          "plan",
          "phone"
        ],
        "rows": [
          [
            "1",
            "青木",
            "aoki@example.com",
            "free",
            "NULL"
          ],
          [
            "2",
            "北野",
            "NULL",
            "pro",
            "NULL"
          ],
          [
            "3",
            "中央",
            "chuo@example.com",
            "trial",
            "NULL"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "MySQLやOracleのMODIFY・CHANGEで型や列名を変えようとする",
      "body": "PostgreSQLには、ALTER TABLE … MODIFYやCHANGEという書き方がありません。ALTER TABLE members MODIFY plan varchar(20)は「syntax error at or near \"MODIFY\"」、CHANGEは「syntax error at or near \"CHANGE\"」というエラーになります。型の変更はALTER COLUMN 列名 TYPE 型、列名の変更はRENAME COLUMN 古い名前 TO 新しい名前と書きます。"
    },
    {
      "title": "複数の列を、括弧でまとめて追加しようとする",
      "body": "ALTER TABLE members ADD (phone text, kana text)のように括弧の中へ列を並べる書き方は、PostgreSQLでは「syntax error at or near \"(\"」というエラーになります。複数の列を足すときは、ADD COLUMN phone text, ADD COLUMN kana textのように、ADD COLUMNを列ごとに書いてカンマで区切ります。"
    },
    {
      "title": "RENAMEを、ほかの変更とカンマで並べる",
      "body": "RENAME COLUMNとRENAME TOは、1つのALTER TABLEに1つしか書けません。ALTER TABLE members RENAME COLUMN name TO full_name, ADD COLUMN phone textは「syntax error at or near \",\"」というエラーになります。名前の変更と列の追加は、別々のALTER TABLEに分けます。"
    }
  ],
  "notes": [
    {
      "title": "IF NOT EXISTSとIF EXISTSで、2回実行してもエラーにしない",
      "body": "ADD COLUMN IF NOT EXISTSは、同じ名前の列がすでにあるときは何もしません。DROP COLUMN IF EXISTSは、その列がないときは何もしません。同じ変更用のSQLを何度実行してもエラーで止まらないようにしたいときに使います。IF NOT EXISTSが見るのは列名だけで、型が違っていても変更はされません。",
      "code": "ALTER TABLE members\n  ADD COLUMN IF NOT EXISTS phone text;\n\nALTER TABLE members\n  ADD COLUMN IF NOT EXISTS phone text;\n\nALTER TABLE members\n  DROP COLUMN IF EXISTS fax;\n\nSELECT *\nFROM members\nORDER BY id;"
    },
    {
      "title": "外部キーと主キーも、ADD CONSTRAINTであとから追加できる",
      "body": "外部キーはADD CONSTRAINT 制約名 FOREIGN KEY (列) REFERENCES 参照先の表 (列)、主キーはADD PRIMARY KEY (列)で足せます。UNIQUEやCHECKと同じく、すでにある行が調べられます。下の例では、membersのplanにある3つの値（free・pro・trial）がすべてplansにあるので、外部キーを付けられます。plansにtrialがなければ、外部キー違反のエラーになります。",
      "code": "CREATE TABLE plans (\n  code varchar(10) PRIMARY KEY\n);\n\nINSERT INTO plans (code)\nVALUES ('free'), ('pro'), ('trial');\n\nALTER TABLE members\n  ADD CONSTRAINT members_plan_fkey\n  FOREIGN KEY (plan) REFERENCES plans (code);\n\nSELECT conname, pg_get_constraintdef(oid) AS definition\nFROM pg_constraint\nWHERE conrelid = 'members'::regclass\nORDER BY conname;"
    },
    {
      "title": "トランザクションの中なら、ALTER TABLEをROLLBACKで取り消せる",
      "body": "PostgreSQLでは、ALTER TABLEもトランザクションの中で実行できます。BEGINのあとに列を削除しても、COMMITの前にROLLBACKすれば、列も値も元に戻ります。下の例は、emailを削除してからROLLBACKしていて、最後のSELECTにはemailが残っています。BEGINを書かずに実行したDROP COLUMNは、すぐに確定して取り消せません。",
      "code": "BEGIN;\n\nALTER TABLE members\n  DROP COLUMN email;\n\nROLLBACK;\n\nSELECT *\nFROM members\nORDER BY id;"
    }
  ],
  "faqs": [
    {
      "question": "ALTER TABLEで列を追加すると、すでにある行はどうなる？",
      "answer": "DEFAULTを付けずに追加した列は、すでにある行ではNULLになります。DEFAULTを付けて追加すると、すでにある行にもその既定値が入ります。NOT NULLの列を追加するときは、DEFAULTを一緒に付けないとエラーになります。"
    },
    {
      "question": "列を追加する位置を指定したり、列の順番を入れ替えたりできる？",
      "answer": "PostgreSQLのALTER TABLEには、列の位置を指定する書き方がなく、追加した列は末尾に付きます。表示の順番はSELECTで列を書く順で決められるので、多くの場合は並べ替える必要がありません。表そのものの列順を変えたいときは、新しい表を作ってデータを移します。"
    },
    {
      "question": "MySQLやOracleのALTER TABLEとは何が違う？",
      "answer": "列の定義を変える書き方が違います。MySQLやOracleはMODIFYを使いますが、PostgreSQLはALTER COLUMN 列名 TYPE 型、ALTER COLUMN 列名 SET NOT NULLのように、変えたい内容ごとに書きます。MySQLのAFTERやFIRSTのような列の位置の指定も、PostgreSQLにはありません。"
    },
    {
      "question": "変更したあとの表の定義を確認するには？",
      "answer": "このページの例のように、information_schema.columnsをtable_nameで絞ってSELECTすると、列名、データ型、NULLを許すかどうか、既定値を確認できます。制約はpg_constraintで一覧にできます。psqlを使っている場合は、\\d 表名でまとめて確認できます。"
    },
    {
      "question": "行が多い表でALTER TABLEを実行するときの注意は？",
      "answer": "ALTER TABLEの多くの操作は、終わるまでその表を強くロックし、ほかのSELECTや更新を待たせます。列の型の変更は、通常は表全体を書き直すので、行が多いほど時間がかかります。定数のDEFAULTを付けた列の追加は、すでにある行を書き換えずに済みます。利用の少ない時間に実行し、先にテスト用の環境で所要時間を確かめます。"
    },
    {
      "question": "DROP COLUMNで、ビューから使われている列を削除するとどうなる？",
      "answer": "その列だけに付いていた制約やインデックスは、列と一緒に削除されます。ビューやほかの表の外部キーなど、表の外から使われている列はエラーになって削除されません。DROP COLUMN 列名 CASCADEと書くと、列を使っているビューなども一緒に削除されるので、何が消えるかを確かめてから使います。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：ALTER TABLE",
      "url": "https://www.postgresql.org/docs/current/sql-altertable.html",
      "description": "ALTER TABLEの構文、USING、IF EXISTS、CASCADE、ロック、1文にまとめられる変更"
    },
    {
      "label": "PostgreSQL公式：Modifying Tables",
      "url": "https://www.postgresql.org/docs/current/ddl-alter.html",
      "description": "列の追加と削除、制約の追加と削除、既定値・データ型・名前の変更"
    },
    {
      "label": "PostgreSQL公式：Constraints",
      "url": "https://www.postgresql.org/docs/current/ddl-constraints.html",
      "description": "CHECK・NOT NULL・UNIQUE・主キー・外部キーの挙動"
    },
    {
      "label": "PostgreSQL公式：Default Values",
      "url": "https://www.postgresql.org/docs/current/ddl-default.html",
      "description": "DEFAULTと、既定値のない列がNULLになること"
    }
  ],
  "related": [
    "create-table",
    "insert",
    "update",
    "delete",
    "cast"
  ],
  "practiceCategory": "alter-table"
};
