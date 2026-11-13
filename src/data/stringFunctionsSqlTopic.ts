import type { SqlTopic } from './sqlTopics';

export const stringFunctionsTopic: SqlTopic = {
  "slug": "string-functions",
  "label": "文字列の連結・切り出し",
  "title": "SQLの文字列操作：連結・SUBSTRING・TRIM・REPLACEの使い方",
  "description": "PostgreSQLの文字列操作を元の表・SQL・結果表で解説。||とCONCATのNULLの違い、SUBSTRINGの位置と文字数、TRIMの空白除去、REPLACEの置換を演習で学べます。",
  "lead": "SQLでは、文字列をつないだり、一部を取り出したり、余分な空白や区切り文字を取り除いたりできます。名前と商品コードを使い、元の値と加工後の値を並べて確認します。NULLや空文字がある場合の違いも見ていきましょう。",
  "sampleIntro": "registrationsの1行は登録1件です。last_nameは姓、first_nameは名、product_codeは登録した商品コードです。姓・名がNULLの場合、名が空文字の場合、コードに前後の半角スペースがある場合を含めています。ID2のコードは先頭と末尾に各1個の空白があり、ID3のコードには内部の空白があります。表の空白も値の一部で、空文字は「''（空文字）」と表示します。ORDER BYなしの結果の行順は一例で、保証されません。",
  "sampleTables": [
    {
      "caption": "registrations：名前と商品コード5件",
      "headers": [
        "id",
        "last_name",
        "first_name",
        "product_code"
      ],
      "rows": [
        [
          "1",
          "青木",
          "太郎",
          "AB-001"
        ],
        [
          "2",
          "北野",
          "NULL",
          " CD-002 "
        ],
        [
          "3",
          "中央",
          "",
          "AB --003"
        ],
        [
          "4",
          "NULL",
          "花子",
          "日用品-004"
        ],
        [
          "5",
          "NULL",
          "NULL",
          "NULL"
        ]
      ]
    }
  ],
  "syntax": "SELECT *, last_name || first_name, CONCAT(last_name, first_name)\nFROM registrations;",
  "sections": [
    {
      "heading": "||とCONCATで姓と名をつなぐ：NULLの扱いを比較する",
      "body": "||は左右の文字列を連結します。青木さんの姓と名は青木太郎になります。ただし、片方がNULLなら結果もNULLです。PostgreSQLのCONCATはNULLの引数を読み飛ばすため、名がNULLの北野さんは北野になります。空文字の名を持つ中央さんはどちらも中央です。両方NULLのID5は||ならNULL、CONCATなら空文字です。区切り文字は自動では入らず、必要なら引数に書きます。",
      "code": "SELECT *, last_name || first_name, CONCAT(last_name, first_name)\nFROM registrations;",
      "resultTable": {
        "headers": [
          "id",
          "last_name",
          "first_name",
          "product_code",
          "?column?",
          "concat"
        ],
        "rows": [
          [
            "1",
            "青木",
            "太郎",
            "AB-001",
            "青木太郎",
            "青木太郎"
          ],
          [
            "2",
            "北野",
            "NULL",
            " CD-002 ",
            "NULL",
            "北野"
          ],
          [
            "3",
            "中央",
            "",
            "AB --003",
            "中央",
            "中央"
          ],
          [
            "4",
            "NULL",
            "花子",
            "日用品-004",
            "NULL",
            "花子"
          ],
          [
            "5",
            "NULL",
            "NULL",
            "NULL",
            "NULL",
            ""
          ]
        ]
      }
    },
    {
      "heading": "SUBSTRINGで指定位置から文字を切り出す",
      "body": "SUBSTRING(product_code FROM 1 FOR 2)は、1文字目から2文字を取り出します。先頭は0ではなく1です。AB-001はAB、日本語の日用品-004は日用になります。位置と長さはバイト数ではなく文字数です。ID2は先頭に空白があるので、結果は空白とCの2文字です。この段階では前後の空白を削っていません。NULLのコードは結果もNULLです。",
      "code": "SELECT *, SUBSTRING(product_code FROM 1 FOR 2)\nFROM registrations;",
      "resultTable": {
        "headers": [
          "id",
          "last_name",
          "first_name",
          "product_code",
          "substring"
        ],
        "rows": [
          [
            "1",
            "青木",
            "太郎",
            "AB-001",
            "AB"
          ],
          [
            "2",
            "北野",
            "NULL",
            " CD-002 ",
            " C"
          ],
          [
            "3",
            "中央",
            "",
            "AB --003",
            "AB"
          ],
          [
            "4",
            "NULL",
            "花子",
            "日用品-004",
            "日用"
          ],
          [
            "5",
            "NULL",
            "NULL",
            "NULL",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "TRIMで前後の空白を取り除く",
      "body": "TRIM(product_code)は、既定では前後の半角スペースを取り除きます。ID2の「 CD-002 」はCD-002になります。中央のハイフンや文字を削る処理ではありません。内部の空白も残ります。元のproduct_codeは変わらず、加工した値だけが追加されます。NULLを渡すと結果もNULLです。",
      "code": "SELECT *, TRIM(product_code)\nFROM registrations;",
      "resultTable": {
        "headers": [
          "id",
          "last_name",
          "first_name",
          "product_code",
          "btrim"
        ],
        "rows": [
          [
            "1",
            "青木",
            "太郎",
            "AB-001",
            "AB-001"
          ],
          [
            "2",
            "北野",
            "NULL",
            " CD-002 ",
            "CD-002"
          ],
          [
            "3",
            "中央",
            "",
            "AB --003",
            "AB --003"
          ],
          [
            "4",
            "NULL",
            "花子",
            "日用品-004",
            "日用品-004"
          ],
          [
            "5",
            "NULL",
            "NULL",
            "NULL",
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "REPLACEで指定した文字列をすべて置き換える",
      "body": "REPLACE(product_code, '-', '')は、コード中のハイフンをすべて空文字に置き換えます。AB-001はAB001、ハイフンが2つあるAB --003もAB 003になります。ID2はハイフンだけが消え、前後の空白は残ります。置換先に空文字を指定すると、対象の部分文字列を削除できます。NULLのコードは結果もNULLです。",
      "code": "SELECT *, REPLACE(product_code, '-', '')\nFROM registrations;",
      "resultTable": {
        "headers": [
          "id",
          "last_name",
          "first_name",
          "product_code",
          "replace"
        ],
        "rows": [
          [
            "1",
            "青木",
            "太郎",
            "AB-001",
            "AB001"
          ],
          [
            "2",
            "北野",
            "NULL",
            " CD-002 ",
            " CD002 "
          ],
          [
            "3",
            "中央",
            "",
            "AB --003",
            "AB 003"
          ],
          [
            "4",
            "NULL",
            "花子",
            "日用品-004",
            "日用品004"
          ],
          [
            "5",
            "NULL",
            "NULL",
            "NULL",
            "NULL"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "TRIMで内部の空白まで消えると思わない",
      "body": "TRIMは指定した文字を前後から取り除きます。TRIM(' A B ')の結果はA Bで、内部の空白は残ります。すべての半角スペースを消すならREPLACEで明示的に置き換えます。人名の区切りなど、残すべき空白まで消さないよう、加工の目的を決めます。"
    }
  ],
  "notes": [
    {
      "title": "CONCAT_WSはNULLの項目を飛ばして区切れる",
      "body": "姓と名の間にスペースを入れ、未入力の項目の区切りは付けたくない場合はCONCAT_WSが使えます。NULLの項目は読み飛ばしますが、空文字は残すので、名が空文字の中央さんには末尾の区切りが付きます。",
      "code": "SELECT id, CONCAT_WS(' ', last_name, first_name)\nFROM registrations;"
    }
  ],
  "faqs": [
    {
      "question": "SELECTで文字列を加工すると元の値も変わりますか？",
      "answer": "変わりません。このページのSELECTは、検索結果に加工した値を表示しているだけです。元の姓・名や商品コードはそのまま残ります。"
    },
    {
      "question": "TRIMの結果列がbtrimと表示されるのはなぜですか？",
      "answer": "この例のTRIM(product_code)は、PostgreSQLでは前後を取り除くbtrim関数に対応します。別名を付けない場合、結果の列名はbtrimです。||の連結式は?column?と表示されます。"
    },
    {
      "question": "TRIMでタブや全角スペースも消えますか？",
      "answer": "既定で削るのは半角スペースです。タブや全角スペースなども対象にするなら、取り除きたい文字を明示します。この教材の前後の空白は半角スペースにそろえています。"
    },
    {
      "question": "NULLと空文字は同じですか？",
      "answer": "PostgreSQLでは別です。NULLは値がないことを表し、空文字は文字が0個の値です。CONCATはNULLを飛ばしますが、||ではNULLがあると連結結果もNULLになります。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：文字列関数・演算子",
      "url": "https://www.postgresql.org/docs/current/functions-string.html",
      "description": "連結、CONCAT・CONCAT_WS、SUBSTRING、TRIM、REPLACEの仕様"
    }
  ],
  "related": [
    "select",
    "coalesce",
    "where",
    "group-by"
  ],
  "practiceCategory": "string-functions"
};
