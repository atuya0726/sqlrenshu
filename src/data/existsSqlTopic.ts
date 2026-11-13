import type { SqlTopic } from './sqlTopics';

export const existsTopic: SqlTopic = {
  "slug": "exists",
  "label": "EXISTS・NOT EXISTS",
  "title": "SQLのEXISTSとNOT EXISTSとは？相関条件・注文の有無・NOT INとの違い",
  "description": "SQLのEXISTS・NOT EXISTSをPostgreSQLの元の表・SQL・結果表で解説。相関条件、支払済み注文の存在、未注文顧客、JOINの重複とNOT INのNULLの違いを演習で学べます。",
  "lead": "EXISTSは、サブクエリの結果が1行でもあるかを調べる式です。NOT EXISTSは、対応する行がないかを調べます。顧客と注文を使い、注文がある顧客、支払済みの注文がある顧客、未注文の顧客を選び分けましょう。",
  "sampleIntro": "customersは1行が顧客1件、ordersは1行が注文1件です。customer_idが顧客のidに対応し、amountは金額（円）、statusはpaid（支払済み）またはcancelled（取消）です。青木商店は支払済み2件、北野物産は取消1件、中央商事は未注文、大和食品は支払済みと取消が各1件です。注文106は顧客未入力です。ORDER BYなしの結果の行順は一例で、保証されません。",
  "sampleTables": [
    {
      "caption": "customers：顧客4件",
      "headers": [
        "id",
        "name"
      ],
      "rows": [
        [
          "1",
          "青木商店"
        ],
        [
          "2",
          "北野物産"
        ],
        [
          "3",
          "中央商事"
        ],
        [
          "4",
          "大和食品"
        ]
      ]
    },
    {
      "caption": "orders：注文6件",
      "headers": [
        "id",
        "customer_id",
        "amount",
        "status"
      ],
      "rows": [
        [
          "101",
          "1",
          "12000",
          "paid"
        ],
        [
          "102",
          "1",
          "20000",
          "paid"
        ],
        [
          "103",
          "2",
          "8000",
          "cancelled"
        ],
        [
          "104",
          "4",
          "30000",
          "paid"
        ],
        [
          "105",
          "4",
          "9000",
          "cancelled"
        ],
        [
          "106",
          "NULL",
          "5000",
          "paid"
        ]
      ]
    }
  ],
  "syntax": "SELECT EXISTS (\n  SELECT 1\n  FROM orders\n);",
  "sections": [
    {
      "heading": "EXISTSは1行でもあればtrueを返す",
      "body": "EXISTSは、カッコ内のSELECTが1行以上返すとtrue、0行ならfalseを返す式です。まず顧客別の条件を付けず、ordersに注文があるかを1列で確認します。この表には6件あるのでtrueです。SELECT 1の1は件数ではなく、存在確認に使う値です。2件でも6件でも、EXISTSの結果はtrueのままです。",
      "code": "SELECT EXISTS (\n  SELECT 1\n  FROM orders\n);",
      "resultTable": {
        "headers": [
          "exists"
        ],
        "rows": [
          [
            "true"
          ]
        ]
      }
    },
    {
      "heading": "相関条件で「その顧客の注文」を調べる",
      "body": "顧客ごとの注文の有無は、orders.customer_id = customers.idで外側の顧客に対応させます。青木商店は2件、北野物産は1件、大和食品は2件の注文があるので残ります。中央商事は0件なので入りません。条件が成立した顧客の元の行を残すため、青木商店に2件あっても顧客は1行です。相関条件を外すと全顧客について同じ注文表の存在を調べることになり、未注文の中央商事も残ってしまいます。",
      "code": "SELECT *\nFROM customers\nWHERE EXISTS (\n  SELECT 1\n  FROM orders\n  WHERE orders.customer_id = customers.id\n);",
      "resultTable": {
        "headers": [
          "id",
          "name"
        ],
        "rows": [
          [
            "1",
            "青木商店"
          ],
          [
            "2",
            "北野物産"
          ],
          [
            "4",
            "大和食品"
          ]
        ]
      }
    },
    {
      "heading": "条件付きEXISTSで支払済みの注文がある顧客を選ぶ",
      "body": "相関条件にorders.status = 'paid'をANDで加えると、その顧客の支払済み注文だけを存在確認できます。青木商店と大和食品が残ります。北野物産には取消注文しかないので対象外です。大和食品には取消注文もありますが、支払済みが1件あるのでこの条件を満たします。EXISTSはすべての注文が支払済みかを調べる条件ではありません。顧客IDがNULLの支払済み注文は、どの顧客にも対応しません。",
      "code": "SELECT *\nFROM customers\nWHERE EXISTS (\n  SELECT 1\n  FROM orders\n  WHERE orders.customer_id = customers.id\n    AND orders.status = 'paid'\n);",
      "resultTable": {
        "headers": [
          "id",
          "name"
        ],
        "rows": [
          [
            "1",
            "青木商店"
          ],
          [
            "4",
            "大和食品"
          ]
        ]
      }
    },
    {
      "heading": "NOT EXISTSで対応する注文がない顧客を選ぶ",
      "body": "NOT EXISTSは、内側のSELECTが0行の場合にtrueになります。同じ相関条件で調べると、注文が1件もない中央商事だけが残ります。取消しかない北野物産も、注文自体は存在するので入りません。注文のcustomer_idにNULLがあっても、それは中央商事のIDと一致する行にはならず、中央商事の未注文判定を妨げません。",
      "code": "SELECT *\nFROM customers\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM orders\n  WHERE orders.customer_id = customers.id\n);",
      "resultTable": {
        "headers": [
          "id",
          "name"
        ],
        "rows": [
          [
            "3",
            "中央商事"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "NOT INへ置き換えるとNULLで結果が変わる",
      "body": "この表でid NOT IN (SELECT customer_id FROM orders)とすると、候補にNULLがあるため中央商事も条件を通らず、結果は0行になります。NOT EXISTSは顧客に対応する行の不在を調べ、中央商事を返します。両者は常に同じ結果になるわけではありません。",
      "code": "SELECT *\nFROM customers\nWHERE id NOT IN (SELECT customer_id FROM orders);"
    },
    {
      "title": "1つの注文の条件と、別の注文の不在を混同しない",
      "body": "「支払済み注文がある、かつ取消注文がない」を選ぶには、支払済みのEXISTSと取消のNOT EXISTSを分けます。paid AND status <> 'cancelled'を同じ注文に指定しても、別の取消注文がある大和食品を除外できません。"
    }
  ],
  "notes": [
    {
      "title": "この例のSELECT 1はSELECT NULLでも存在確認できる",
      "body": "このページの単純な存在確認では、返す値ではなく行があるかを調べます。SELECT NULLにしても注文行があればEXISTSはtrueです。SELECT COUNT(*)は、GROUP BYのない集計だと注文0件でも件数0の行を返すため、存在確認の内側にそのまま置かないでください。",
      "code": "SELECT EXISTS (\n  SELECT NULL\n  FROM orders\n);"
    }
  ],
  "faqs": [
    {
      "question": "EXISTSとJOINはどう使い分けますか？",
      "answer": "注文の列も一緒に取得するならJOIN、注文の有無だけで顧客を選ぶならEXISTSが使えます。この表を単純にINNER JOINすると青木商店は注文2件分の2行になります。EXISTSは条件を満たす元の顧客行を1行のまま残します。"
    },
    {
      "question": "相関条件はどこに書きますか？",
      "answer": "この例では、内側のWHEREにorders.customer_id = customers.idを書きます。外側のcustomersの行に対応する注文を選ぶ条件です。省くと、顧客ごとの注文ではなく注文表全体の存在を調べます。"
    },
    {
      "question": "支払済み注文がない顧客と、注文がない顧客は同じですか？",
      "answer": "違います。NOT EXISTSの内側でpaidに絞ると、未注文の中央商事に加えて取消しかない北野物産も該当します。注文そのものがない顧客を探すなら、内側で支払状態を限定しません。"
    },
    {
      "question": "EXISTSはすべての注文を数えますか？",
      "answer": "件数を返す式ではありません。行があるかが分かれば判定でき、実際の処理方法はPostgreSQLが決めます。件数そのものを取得するにはCOUNTを使います。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：EXISTS",
      "url": "https://www.postgresql.org/docs/current/functions-subquery.html#FUNCTIONS-SUBQUERY-EXISTS",
      "description": "EXISTSの真偽値、相関、出力列と行数"
    },
    {
      "label": "PostgreSQL公式：NOT IN",
      "url": "https://www.postgresql.org/docs/current/functions-subquery.html#FUNCTIONS-SUBQUERY-NOTIN",
      "description": "NULLが候補に含まれる場合のNOT IN"
    }
  ],
  "related": [
    "intersect-except",
    "subquery",
    "inner-join",
    "left-join",
    "where",
    "coalesce"
  ],
  "practiceCategory": "exists"
};
