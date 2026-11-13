import type { SqlTopic } from './sqlTopics';

export const dateTruncTopic: SqlTopic = {
  "slug": "date-trunc",
  "label": "月別集計・DATE_TRUNC",
  "title": "SQLのDATE_TRUNCで月別集計する方法：注文件数・売上と期間指定",
  "description": "PostgreSQLのDATE_TRUNCで月別集計する方法を、注文の元の表・SQL・結果表で解説。月初への切り詰め、GROUP BY・COUNT・SUM、WHEREの期間指定とORDER BYを演習で学べます。",
  "lead": "DATE_TRUNCは、日時を月や日などの単位にそろえるPostgreSQLの関数です。月初にそろえた値でGROUP BYすると、月別の注文件数や売上を求められます。1件ずつの注文日時が月ごとの結果に変わる様子を見ていきましょう。",
  "sampleIntro": "ordersの1行は注文1件です。ordered_atは注文日時（timestamp without time zone）、amountは金額（円）です。すべて同じ店舗の現地時刻として扱います。2025年と2026年の9月、2026年11月・12月の注文を使い、年の違いも確認します。2026年10月には注文がありません。ORDER BYなしの結果の行順は一例で、保証されません。",
  "sampleTables": [
    {
      "caption": "orders：月別集計に使う注文6件",
      "headers": [
        "id",
        "ordered_at",
        "amount"
      ],
      "rows": [
        [
          "1",
          "2025-09-10 10:00:00",
          "1000"
        ],
        [
          "2",
          "2026-09-01 00:00:00",
          "2000"
        ],
        [
          "3",
          "2026-09-30 23:59:59.999999",
          "3000"
        ],
        [
          "4",
          "2026-11-01 00:00:00",
          "4000"
        ],
        [
          "5",
          "2026-11-20 12:00:00",
          "5000"
        ],
        [
          "6",
          "2026-12-01 00:00:00",
          "6000"
        ]
      ]
    }
  ],
  "syntax": "SELECT *, DATE_TRUNC('month', ordered_at)\nFROM orders;",
  "sections": [
    {
      "heading": "DATE_TRUNCで注文日時を月初にそろえる",
      "body": "DATE_TRUNC('month', ordered_at)は、注文日時をその月の1日0時にそろえます。'month'は月単位の指定です。ID2の9月1日0時とID3の9月30日の夜は、ともに2026年9月1日0時になります。元のordered_atを書き換えず、結果の末尾に月を表す列を追加しています。timestamp without time zoneを渡しているので、返る値も同じ型の日時です。2025年9月は2026年9月と別の値になります。",
      "code": "SELECT *, DATE_TRUNC('month', ordered_at)\nFROM orders;",
      "resultTable": {
        "headers": [
          "id",
          "ordered_at",
          "amount",
          "date_trunc"
        ],
        "rows": [
          [
            "1",
            "2025-09-10 10:00:00",
            "1000",
            "2025-09-01 00:00:00"
          ],
          [
            "2",
            "2026-09-01 00:00:00",
            "2000",
            "2026-09-01 00:00:00"
          ],
          [
            "3",
            "2026-09-30 23:59:59.999999",
            "3000",
            "2026-09-01 00:00:00"
          ],
          [
            "4",
            "2026-11-01 00:00:00",
            "4000",
            "2026-11-01 00:00:00"
          ],
          [
            "5",
            "2026-11-20 12:00:00",
            "5000",
            "2026-11-01 00:00:00"
          ],
          [
            "6",
            "2026-12-01 00:00:00",
            "6000",
            "2026-12-01 00:00:00"
          ]
        ]
      }
    },
    {
      "heading": "GROUP BYとCOUNTで月別の件数を求める",
      "body": "月初にそろえた値をGROUP BYに書くと、同じ月の注文を1グループにできます。2026年9月はID2・3で2件、11月はID4・5で2件です。2025年9月と2026年9月は別々の行になります。元の注文日時をそのままGROUP BYにすると、違う日の注文は別グループになってしまいます。結果列date_truncは月初の日時、countはその月の件数です。",
      "code": "SELECT DATE_TRUNC('month', ordered_at), COUNT(*)\nFROM orders\nGROUP BY DATE_TRUNC('month', ordered_at);",
      "resultTable": {
        "headers": [
          "date_trunc",
          "count"
        ],
        "rows": [
          [
            "2025-09-01 00:00:00",
            "1"
          ],
          [
            "2026-09-01 00:00:00",
            "2"
          ],
          [
            "2026-11-01 00:00:00",
            "2"
          ],
          [
            "2026-12-01 00:00:00",
            "1"
          ]
        ]
      }
    },
    {
      "heading": "SUMで月別の売上を合計する",
      "body": "件数の代わりにSUM(amount)を使うと、月別の金額合計になります。2026年9月は2000 + 3000で5000円、11月は4000 + 5000で9000円です。月のグループを作る式は同じDATE_TRUNCのままで、求める指標だけを変えています。ここではすべての注文金額を売上として扱います。",
      "code": "SELECT DATE_TRUNC('month', ordered_at), SUM(amount)\nFROM orders\nGROUP BY DATE_TRUNC('month', ordered_at);",
      "resultTable": {
        "headers": [
          "date_trunc",
          "sum"
        ],
        "rows": [
          [
            "2025-09-01 00:00:00",
            "1000"
          ],
          [
            "2026-09-01 00:00:00",
            "5000"
          ],
          [
            "2026-11-01 00:00:00",
            "9000"
          ],
          [
            "2026-12-01 00:00:00",
            "6000"
          ]
        ]
      }
    },
    {
      "heading": "WHEREで期間を絞り、月順に集計結果を表示する",
      "body": "2026年9月から11月までの注文を集計するには、注文日時を9月1日0時以上、12月1日0時未満で選んでから月別に集計します。2025年9月のID1と12月1日ちょうどのID6は入りません。最後のORDER BYに月初へそろえる式を書くと、9月5000円、11月9000円の順になります。10月には注文がないので、10月0円の行は自動では作られません。",
      "code": "SELECT DATE_TRUNC('month', ordered_at), SUM(amount)\nFROM orders\nWHERE ordered_at >= TIMESTAMP '2026-09-01 00:00:00'\n  AND ordered_at < TIMESTAMP '2026-12-01 00:00:00'\nGROUP BY DATE_TRUNC('month', ordered_at)\nORDER BY DATE_TRUNC('month', ordered_at);",
      "resultTable": {
        "headers": [
          "date_trunc",
          "sum"
        ],
        "rows": [
          [
            "2026-09-01 00:00:00",
            "5000"
          ],
          [
            "2026-11-01 00:00:00",
            "9000"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "元の注文日時でGROUP BYしない",
      "body": "SELECTだけをDATE_TRUNCにして、GROUP BY ordered_atとすると、異なる日時の注文が別グループのままになります。同じ月初を持つ行が複数表示され、月別の合計になりません。SELECTとGROUP BYの両方に、月を表す同じ式を使います。"
    }
  ],
  "notes": [
    {
      "title": "'day'なら日別にそろえられる",
      "body": "DATE_TRUNCの第1引数を'day'にすると、その日の0時にそろえられます。月単位の集計と同じ考え方で日単位の集計にも使えます。",
      "code": "SELECT id, ordered_at, DATE_TRUNC('day', ordered_at)\nFROM orders;"
    }
  ],
  "faqs": [
    {
      "question": "注文がない月も0件・0円で表示できますか？",
      "answer": "このページのGROUP BYだけでは表示されません。入力行がない月にはグループが作られないためです。すべての月を表示するには、月の一覧を別途用意して集計結果とLEFT JOINし、未一致の集計値をCOALESCEで0にする構成が必要です。"
    },
    {
      "question": "月の番号だけで集計してもよいですか？",
      "answer": "年をまたぐデータでは、月の番号だけをキーにすると異なる年の同じ月を混ぜてしまいます。DATE_TRUNCの月初には年も含まれるので、2025年9月と2026年9月を別々に集計できます。"
    },
    {
      "question": "DATE型の列を月別集計するには？",
      "answer": "この教材と同じくタイムゾーンを持たない日時として扱うなら、DATE_TRUNC('month', ordered_on::timestamp)のように日時型への変換を明示できます。::timestampはPostgreSQLの型変換の書き方です。"
    },
    {
      "question": "タイムゾーン付きの注文日時でも同じですか？",
      "answer": "timestamp with time zoneを渡した場合は、どの地域の時刻で月初を決めるかに注意します。タイムゾーンを指定しなければセッションのTimeZoneが使われます。このページではtimestamp without time zoneにそろえ、タイムゾーン変換は扱っていません。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：DATE_TRUNC",
      "url": "https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-TRUNC",
      "description": "日時の切り詰め単位、戻り値とタイムゾーン"
    },
    {
      "label": "PostgreSQL公式：GROUP BYとHAVING",
      "url": "https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP",
      "description": "式でのグループ化と集約"
    },
    {
      "label": "PostgreSQL公式：集約関数",
      "url": "https://www.postgresql.org/docs/current/functions-aggregate.html",
      "description": "COUNT・SUMの集計"
    }
  ],
  "related": [
    "date-filter",
    "group-by",
    "having",
    "order-by",
    "left-join"
  ],
  "practiceCategory": "date-trunc"
};
