import type { SqlTopic } from './sqlTopics';

export const likeTopic: SqlTopic = {
  "slug": "like",
  "label": "LIKE",
  "title": "SQLのLIKEとは？%と_であいまい検索する書き方",
  "description": "SQLのLIKEをPostgreSQLの元の表・SQL・結果表で解説。%と_の意味、前方一致・部分一致、NOT LIKE、ILIKEでの大文字小文字、%と_のエスケープを演習付きで学べます。",
  "lead": "LIKEは、文字列がパターンに一致するかを調べるWHEREの条件です。「ボールペンで始まる」「ペンを含む」のように、完全一致では書けないあいまいな検索ができます。%と_の2つの記号を、商品名と商品コードで確かめましょう。",
  "sampleIntro": "productsは1行が商品1件です。nameは商品名、codeは商品コード、priceは価格（円）です。ペンはボールペン2種と蛍光ペン、ノートは2種、割引券は2種あります。蛍光ペンのコードだけ小文字のpen-ylで、割引券のコードは「SALE_10」と「SALE-10」で記号だけが違います。ORDER BYなしの結果の行順は一例で、保証されません。",
  "sampleTables": [
    {
      "caption": "products：商品7件",
      "headers": [
        "id",
        "name",
        "code",
        "price"
      ],
      "rows": [
        [
          "1",
          "ボールペン黒",
          "PEN-BK",
          "120"
        ],
        [
          "2",
          "ボールペン赤",
          "PEN-RD",
          "120"
        ],
        [
          "3",
          "ノートA5",
          "NOTE-A5",
          "300"
        ],
        [
          "4",
          "ノートB5",
          "NOTE-B5",
          "350"
        ],
        [
          "5",
          "蛍光ペン",
          "pen-yl",
          "150"
        ],
        [
          "6",
          "割引券（10%）",
          "SALE_10",
          "500"
        ],
        [
          "7",
          "割引券（10円）",
          "SALE-10",
          "100"
        ]
      ]
    }
  ],
  "syntax": "SELECT *\nFROM products\nWHERE name LIKE 'ボールペン%';",
  "sections": [
    {
      "heading": "LIKEと%で名前の先頭が同じ行を探す（前方一致）",
      "body": "LIKEは、列の値がパターンに一致する行を選ぶ条件です。パターンの%は、0文字以上の任意の文字列を表します。'ボールペン%'は「ボールペンで始まる名前」を意味するため、ボールペン黒とボールペン赤の2行が一致します。LIKEのパターンは文字列全体に一致する必要があります。%を付けずに'ボールペン'とだけ書くと、名前がちょうどボールペンの行だけが対象になり、この表では0行です。",
      "code": "SELECT *\nFROM products\nWHERE name LIKE 'ボールペン%';",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "code",
          "price"
        ],
        "rows": [
          [
            "1",
            "ボールペン黒",
            "PEN-BK",
            "120"
          ],
          [
            "2",
            "ボールペン赤",
            "PEN-RD",
            "120"
          ]
        ]
      }
    },
    {
      "heading": "%で囲んで名前のどこかに含まれる行を探す（部分一致）",
      "body": "パターンの前後を%で囲むと、その文字列が名前のどこにあっても一致します。'%ペン%'はボールペン黒、ボールペン赤、蛍光ペンの3行を返します。蛍光ペンは「ペン」が末尾にあるため、後ろだけに%を付けた'ペン%'では見つかりません。先頭にだけ%を付けた'%A5'のようなパターンは、A5で終わる値を探す後方一致になります。",
      "code": "SELECT *\nFROM products\nWHERE name LIKE '%ペン%';",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "code",
          "price"
        ],
        "rows": [
          [
            "1",
            "ボールペン黒",
            "PEN-BK",
            "120"
          ],
          [
            "2",
            "ボールペン赤",
            "PEN-RD",
            "120"
          ],
          [
            "5",
            "蛍光ペン",
            "pen-yl",
            "150"
          ]
        ]
      }
    },
    {
      "heading": "_で任意の1文字を表して文字数をそろえる",
      "body": "パターンの_は、任意の1文字ちょうどを表します。%が0文字以上なのに対し、_は文字数を固定できます。'NOTE-__'は「NOTE-」の後ろがちょうど2文字のコードなので、NOTE-A5とNOTE-B5が一致します。1文字だけの'NOTE-_'は、この表では0行です。",
      "code": "SELECT *\nFROM products\nWHERE code LIKE 'NOTE-__';",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "code",
          "price"
        ],
        "rows": [
          [
            "3",
            "ノートA5",
            "NOTE-A5",
            "300"
          ],
          [
            "4",
            "ノートB5",
            "NOTE-B5",
            "350"
          ]
        ]
      }
    },
    {
      "heading": "NOT LIKEでパターンに一致しない行を選ぶ",
      "body": "NOT LIKEは、パターンに一致しない行を選びます。名前に「ペン」を含まない商品は、ノートA5、ノートB5と2種類の割引券の4行です。NOT LIKEもLIKEと同じくNULLとは比べられないため、対象の列がNULLの行は結果に出ません。この表のnameはNOT NULLなので該当しません。",
      "code": "SELECT *\nFROM products\nWHERE name NOT LIKE '%ペン%';",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "code",
          "price"
        ],
        "rows": [
          [
            "3",
            "ノートA5",
            "NOTE-A5",
            "300"
          ],
          [
            "4",
            "ノートB5",
            "NOTE-B5",
            "350"
          ],
          [
            "6",
            "割引券（10%）",
            "SALE_10",
            "500"
          ],
          [
            "7",
            "割引券（10円）",
            "SALE-10",
            "100"
          ]
        ]
      }
    },
    {
      "heading": "ILIKEで大文字小文字を区別せずに探す",
      "body": "PostgreSQLのLIKEは、大文字小文字を区別します。code LIKE 'pen-%'だとpen-ylの1行だけで、PEN-BKやPEN-RDは一致しません。ILIKEにすると大文字小文字を区別せずに比べ、蛍光ペンとボールペン2種の3行が一致します。ILIKEはPostgreSQLの拡張で、標準SQLにはありません。",
      "code": "SELECT *\nFROM products\nWHERE code ILIKE 'pen-%';",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "code",
          "price"
        ],
        "rows": [
          [
            "1",
            "ボールペン黒",
            "PEN-BK",
            "120"
          ],
          [
            "2",
            "ボールペン赤",
            "PEN-RD",
            "120"
          ],
          [
            "5",
            "蛍光ペン",
            "pen-yl",
            "150"
          ]
        ]
      }
    },
    {
      "heading": "%や_そのものを探すにはバックスラッシュでエスケープする",
      "body": "%や_を記号として探したいときは、直前にバックスラッシュ（\\）を付けます。標準では\\がエスケープ文字です。code LIKE 'SALE\\_10'は「_」という文字を含むSALE_10だけに一致します。エスケープせずにSALE_10と書くと、_が任意の1文字になり、SALE-10も一致してしまいます。",
      "code": "SELECT *\nFROM products\nWHERE code LIKE 'SALE\\_10';",
      "resultTable": {
        "headers": [
          "id",
          "name",
          "code",
          "price"
        ],
        "rows": [
          [
            "6",
            "割引券（10%）",
            "SALE_10",
            "500"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "_を文字として探すつもりでエスケープしない",
      "body": "code LIKE 'SALE_10'は、SALE_10だけでなくSALE-10にも一致します。_は任意の1文字を表す記号だからです。記号そのものを探すときは\\_と書きます。",
      "code": "SELECT *\nFROM products\nWHERE code LIKE 'SALE_10';"
    },
    {
      "title": "%を付けずに部分一致のつもりで書く",
      "body": "name LIKE 'ペン'は完全一致と同じで、名前がちょうど「ペン」の行しか返しません。この表では0行です。含む行を探すなら'%ペン%'にします。",
      "code": "SELECT *\nFROM products\nWHERE name LIKE 'ペン';"
    }
  ],
  "notes": [
    {
      "title": "ESCAPE句でエスケープ文字を変えられる",
      "body": "バックスラッシュが使いにくい場合は、ESCAPEでエスケープ文字を指定できます。次の例は!を指定し、!_を文字としての_として扱います。結果はcode LIKE 'SALE\\_10'と同じ1行です。",
      "code": "SELECT *\nFROM products\nWHERE code LIKE 'SALE!_10' ESCAPE '!';"
    }
  ],
  "faqs": [
    {
      "question": "LIKEと=はどう使い分けますか？",
      "answer": "=は値が完全に同じ行を探し、LIKEは%や_を含むパターンで探します。パターンに%も_も含まなければ、LIKEは=と同じ完全一致として働きます。完全一致なら=のほうが意図が明確です。"
    },
    {
      "question": "大文字小文字を区別せずに探すには？",
      "answer": "PostgreSQLのLIKEは区別するため、ILIKEを使います。この表ではcode ILIKE 'pen-%'が3行を返し、code LIKE 'pen-%'は1行です。"
    },
    {
      "question": "NULLの値はLIKEで見つかりますか？",
      "answer": "見つかりません。NULLにLIKEを適用した結果はNULLで、WHEREでは真にならないためです。NULLの行を探すにはIS NULLを使います。"
    },
    {
      "question": "日本語の名前でも_は使えますか？",
      "answer": "使えます。_は1バイトではなく1文字を表します。name LIKE 'ノート__'は、ノートの後ろがちょうど2文字のノートA5とノートB5に一致します。"
    },
    {
      "question": "LIKEより複雑な条件を書きたいときは？",
      "answer": "PostgreSQLにはLIKEのほかに、SIMILAR TOとPOSIX正規表現（~演算子など）があります。まずは%と_で足りるかを考え、複雑な規則が必要なときに公式のパターンマッチングの章を読むと整理できます。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：LIKE",
      "url": "https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-LIKE",
      "description": "%と_の意味、ILIKE、エスケープ文字、ESCAPE句"
    },
    {
      "label": "PostgreSQL公式：POSIX正規表現",
      "url": "https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-POSIX-REGEXP",
      "description": "LIKEで足りない場合の正規表現によるパターンマッチ"
    }
  ],
  "related": [
    "where",
    "order-by",
    "string-functions",
    "coalesce"
  ],
  "practiceCategory": "like"
};
