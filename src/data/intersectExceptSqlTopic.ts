import type { SqlTopic } from './sqlTopics';

export const intersectExceptTopic: SqlTopic = {
  "slug": "intersect-except",
  "label": "INTERSECT・EXCEPT",
  "title": "SQLのINTERSECTとEXCEPTとは？共通行・差分・ALLの重複件数を解説",
  "description": "PostgreSQLのINTERSECT・EXCEPTを店舗と通販の購入記録で解説。共通行、左側だけの差分、INTERSECT ALL・EXCEPT ALLの件数、NULLと比較方向をSQLと結果表で学べます。",
  "lead": "INTERSECTは、2つの検索結果に共通する行を取り出します。EXCEPTは、左側の検索結果にだけある行を取り出します。店舗と通販の記録を使い、ALLの有無で重複件数の扱いがどう変わるかを確認しましょう。",
  "sampleIntro": "store_purchasesは店舗、online_purchasesは通販の購入記録です。1行が購入1回分で、customer_idは顧客IDです。顧客1は店舗3件・通販2件、顧客2・3は店舗のみ、顧客4は通販のみです。NULLは顧客ID未入力の記録です。集合演算でNULLの行が一致しても、同じ顧客の購入と確認できたわけではありません。ORDER BYなしの結果の並びは一例で、保証されません。",
  "sampleTables": [
    {
      "caption": "store_purchases：店舗の購入6件",
      "headers": [
        "customer_id"
      ],
      "rows": [
        [
          "1"
        ],
        [
          "1"
        ],
        [
          "1"
        ],
        [
          "2"
        ],
        [
          "3"
        ],
        [
          "NULL"
        ]
      ]
    },
    {
      "caption": "online_purchases：通販の購入5件",
      "headers": [
        "customer_id"
      ],
      "rows": [
        [
          "1"
        ],
        [
          "1"
        ],
        [
          "4"
        ],
        [
          "NULL"
        ],
        [
          "NULL"
        ]
      ]
    }
  ],
  "syntax": "SELECT *\nFROM store_purchases\nINTERSECT\nSELECT *\nFROM online_purchases;",
  "sections": [
    {
      "heading": "INTERSECTで両方にある行を選ぶ",
      "body": "INTERSECTは、両方のSELECTの結果に含まれる行を返し、重複を除きます。顧客1は店舗にも通販にもあるので1行だけ残ります。両方にNULLの行もあるので、NULLも1行残ります。顧客2・3は店舗だけ、4は通販だけなので入りません。この比較対象は購入記録のcustomer_id列で、両方に同じ値の行があるかを調べています。",
      "code": "SELECT *\nFROM store_purchases\nINTERSECT\nSELECT *\nFROM online_purchases;",
      "resultTable": {
        "headers": [
          "customer_id"
        ],
        "rows": [
          [
            "1"
          ],
          [
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "EXCEPTで左側だけにある行を選ぶ",
      "body": "EXCEPTは、左側の結果から右側にもある行を除き、残った行の重複も除きます。店舗から通販の行を除くと、店舗だけにある顧客2と3が残ります。顧客1とNULLは右にもあるので残りません。左右を逆にすれば通販だけの顧客4となり、結果が変わります。",
      "code": "SELECT *\nFROM store_purchases\nEXCEPT\nSELECT *\nFROM online_purchases;",
      "resultTable": {
        "headers": [
          "customer_id"
        ],
        "rows": [
          [
            "2"
          ],
          [
            "3"
          ]
        ]
      }
    },
    {
      "heading": "INTERSECT ALLは両側の少ない件数だけ残す",
      "body": "ALLを付けると重複件数も考慮します。顧客1は店舗3件、通販2件なので、少ない方の2行が残ります。NULLは店舗1件、通販2件なので1行です。普通のINTERSECTのように同じ値を1行にまとめる処理ではありません。同じ行が左右に何回あるかを照合する用途に使えます。",
      "code": "SELECT *\nFROM store_purchases\nINTERSECT ALL\nSELECT *\nFROM online_purchases;",
      "resultTable": {
        "headers": [
          "customer_id"
        ],
        "rows": [
          [
            "1"
          ],
          [
            "1"
          ],
          [
            "NULL"
          ]
        ]
      }
    },
    {
      "heading": "EXCEPT ALLは左の件数から右の件数を差し引く",
      "body": "EXCEPT ALLでは、左側の件数から右側の件数を引き、正の残数だけを出力します。顧客1は店舗3件から通販2件を引いて1行、顧客2・3は各1行です。NULLは1件から2件を引いても正の残数がないので出ません。ALLなしのEXCEPTは右に1件でもある値をすべて除くため、顧客1が残らない点で異なります。",
      "code": "SELECT *\nFROM store_purchases\nEXCEPT ALL\nSELECT *\nFROM online_purchases;",
      "resultTable": {
        "headers": [
          "customer_id"
        ],
        "rows": [
          [
            "1"
          ],
          [
            "2"
          ],
          [
            "3"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "EXCEPTの左右を逆にしない",
      "body": "店舗だけの行を探すときは店舗を左にします。通販を左にすると通販だけの顧客4が返ります。差分は方向があるので、どちらからどちらを除くのかを決めて書きます。"
    },
    {
      "title": "ALLを外すと残数ではなく行の有無になる",
      "body": "EXCEPT ALLでは顧客1が1行残りますが、EXCEPTでは通販側にもあるため1行も残りません。重複する記録を1件ずつ差し引くならALLが必要です。"
    }
  ],
  "notes": [
    {
      "title": "INTERSECTはUNION・EXCEPTより先に評価される",
      "body": "3つ以上の結果を組み合わせるときは優先順位に注意します。INTERSECTはUNIONやEXCEPTより先に評価されます。意図する単位をカッコで囲むと、比較する結果のまとまりを明示できます。"
    }
  ],
  "faqs": [
    {
      "question": "列数・型・列の順序はそろえる必要がありますか？",
      "answer": "UNIONと同じく、両方の結果は同じ列数で、同じ位置の列は互換性のある型にします。複数列なら行全体の組み合わせで比較し、列名ではなく位置で対応します。"
    },
    {
      "question": "INTERSECTとEXISTSはどう違いますか？",
      "answer": "INTERSECTは2つの結果の行全体を比較し、通常は重複を除きます。EXISTSは相関条件などで対応する行の有無を調べ、外側の元の行を残します。何を比較するか、重複を残すか、NULLをどう扱うかを決めて使い分けます。"
    },
    {
      "question": "NULLも共通する行として扱われますか？",
      "answer": "このページのような集合演算の重複・行の比較では、同じ位置のNULL同士も同じ行として扱われます。通常のWHERE customer_id = NULLとは異なります。未入力の記録を比較対象にしたくないなら、両方のSELECTにIS NOT NULLを付けます。"
    },
    {
      "question": "結果全体を並べ替えるには？",
      "answer": "最後にORDER BY customer_idのように出力列名や列番号を書きます。NULLの位置まで決めたい場合はNULLS FIRST・NULLS LASTも指定できます。集合演算そのものは出力順を保証しません。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：問い合わせの集合演算",
      "url": "https://www.postgresql.org/docs/current/queries-union.html",
      "description": "INTERSECT・EXCEPTと列の対応、優先順位"
    },
    {
      "label": "PostgreSQL公式：INTERSECT",
      "url": "https://www.postgresql.org/docs/current/sql-select.html#SQL-INTERSECT",
      "description": "ALLの場合の最小件数"
    },
    {
      "label": "PostgreSQL公式：EXCEPT",
      "url": "https://www.postgresql.org/docs/current/sql-select.html#SQL-EXCEPT",
      "description": "ALLの場合の件数差"
    }
  ],
  "related": [
    "union",
    "exists",
    "where",
    "order-by"
  ],
  "practiceCategory": "intersect-except"
};
