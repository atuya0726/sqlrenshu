import type { SqlTopic } from './sqlTopics';

export const dateFilterTopic: SqlTopic = {
  "slug": "date-filter",
  "label": "日付で絞り込む",
  "title": "SQLで日付を絞り込む方法：DATE・TIMESTAMPと1日・1か月の期間指定",
  "description": "PostgreSQLのSQLで日付を絞り込む方法を、注文の元の表・SQL・結果表で解説。DATEとTIMESTAMP、指定日以降・以前、当日と1か月の範囲、月末・翌月0時の境界を演習で学べます。",
  "lead": "日付の条件をWHEREに書くと、指定日や期間に合うデータを取り出せます。日付だけの列と、時刻も入っている列では、1日分を選ぶ条件が違います。注文データを使い、当日や1か月分を取りこぼさず選ぶ方法を学びましょう。",
  "sampleIntro": "ordersの1行は注文1件です。ordered_atは注文日時（timestamp without time zone）、delivery_onは配送予定日（date）、amountは金額（円）です。日時はすべて同じ店舗の現地時刻として扱い、タイムゾーン変換はしません。ID6の日時・配送日は未入力です。小数点以下6桁は秒の端数です。ORDER BYなしの結果の行順は一例で、保証されません。",
  "sampleTables": [
    {
      "caption": "orders：注文日時と配送予定日",
      "headers": [
        "id",
        "ordered_at",
        "delivery_on",
        "amount"
      ],
      "rows": [
        [
          "1",
          "2026-08-31 23:59:59.999999",
          "2026-09-01",
          "1000"
        ],
        [
          "2",
          "2026-09-01 00:00:00",
          "2026-09-01",
          "2000"
        ],
        [
          "3",
          "2026-09-01 12:30:00",
          "2026-09-02",
          "3000"
        ],
        [
          "4",
          "2026-09-30 23:59:59.999999",
          "2026-09-30",
          "4000"
        ],
        [
          "5",
          "2026-10-01 00:00:00",
          "2026-10-01",
          "5000"
        ],
        [
          "6",
          "NULL",
          "NULL",
          "6000"
        ]
      ]
    }
  ],
  "syntax": "SELECT *\nFROM orders\nWHERE delivery_on = DATE '2026-09-01';",
  "sections": [
    {
      "heading": "DATEとTIMESTAMPの書き方：日付だけなら等値で選べる",
      "body": "DATEは日付だけ、TIMESTAMPは日付と時刻を表します。この表のdelivery_onはDATE、ordered_atはタイムゾーンを持たないTIMESTAMPです。DATE '2026-09-01'のように、型名の後ろにシングルクォートで囲んだ値を書きます。日付は年-月-日の順です。配送予定日が9月1日の注文はID1と2で、注文時刻が8月31日でも配送日が条件に合えば残ります。",
      "code": "SELECT *\nFROM orders\nWHERE delivery_on = DATE '2026-09-01';",
      "resultTable": {
        "headers": [
          "id",
          "ordered_at",
          "delivery_on",
          "amount"
        ],
        "rows": [
          [
            "1",
            "2026-08-31 23:59:59.999999",
            "2026-09-01",
            "1000"
          ],
          [
            "2",
            "2026-09-01 00:00:00",
            "2026-09-01",
            "2000"
          ]
        ]
      }
    },
    {
      "heading": "指定日以降・以前は>=と<=で選ぶ",
      "body": "配送予定日が9月2日以降、9月30日以前の注文を選びます。>=と<=は指定した日を含むので、9月2日のID3と9月30日のID4が残ります。>や<に変えると、その日ちょうどのデータは入りません。ここは時刻を持たないDATE列なので、9月30日を上限にしてその日を含められます。未入力のNULLはこれらの比較条件を満たさないため入りません。",
      "code": "SELECT *\nFROM orders\nWHERE delivery_on >= DATE '2026-09-02'\n  AND delivery_on <= DATE '2026-09-30';",
      "resultTable": {
        "headers": [
          "id",
          "ordered_at",
          "delivery_on",
          "amount"
        ],
        "rows": [
          [
            "3",
            "2026-09-01 12:30:00",
            "2026-09-02",
            "3000"
          ],
          [
            "4",
            "2026-09-30 23:59:59.999999",
            "2026-09-30",
            "4000"
          ]
        ]
      }
    },
    {
      "heading": "時刻付きデータの1日は当日0時以上・翌日0時未満",
      "body": "9月1日に注文されたデータは、9月1日0時以上、9月2日0時未満で選びます。ID2の0時とID3の12時30分が残ります。ordered_atを9月1日0時と等しい条件にすると、昼のID3は入りません。開始を含め、次の日の開始を含めない範囲にすると、秒以下の時刻があってもその日の注文を取得できます。",
      "code": "SELECT *\nFROM orders\nWHERE ordered_at >= TIMESTAMP '2026-09-01 00:00:00'\n  AND ordered_at < TIMESTAMP '2026-09-02 00:00:00';",
      "resultTable": {
        "headers": [
          "id",
          "ordered_at",
          "delivery_on",
          "amount"
        ],
        "rows": [
          [
            "2",
            "2026-09-01 00:00:00",
            "2026-09-01",
            "2000"
          ],
          [
            "3",
            "2026-09-01 12:30:00",
            "2026-09-02",
            "3000"
          ]
        ]
      }
    },
    {
      "heading": "1か月は月初以上・翌月初未満で選ぶ",
      "body": "9月分の注文は、9月1日0時以上、10月1日0時未満で選びます。ID2・3・4の3件で合計9000円です。ID4は9月30日の23時59分59秒999999なので残り、ID5の10月1日0時は入りません。月末を9月30日0時にするとID4を落とし、上限を<=10月1日0時にするとID5まで含めてしまいます。月末の最終時刻を作らず、翌月初を上限にする書き方を使います。",
      "code": "SELECT *\nFROM orders\nWHERE ordered_at >= TIMESTAMP '2026-09-01 00:00:00'\n  AND ordered_at < TIMESTAMP '2026-10-01 00:00:00';",
      "resultTable": {
        "headers": [
          "id",
          "ordered_at",
          "delivery_on",
          "amount"
        ],
        "rows": [
          [
            "2",
            "2026-09-01 00:00:00",
            "2026-09-01",
            "2000"
          ],
          [
            "3",
            "2026-09-01 12:30:00",
            "2026-09-02",
            "3000"
          ],
          [
            "4",
            "2026-09-30 23:59:59.999999",
            "2026-09-30",
            "4000"
          ]
        ]
      }
    }
  ],
  "mistakes": [
    {
      "title": "BETWEENの上限は含まれる",
      "body": "BETWEENは両端を含む条件です。注文日時を9月1日0時から10月1日0時までのBETWEENにすると、翌月最初のID5も入ります。月末日だけを上限にするとその日の0時までとなり、夜のID4を落とします。時刻付きの期間には開始以上・次の期間の開始未満を使います。"
    }
  ],
  "notes": [
    {
      "title": "TIMESTAMPとタイムゾーン付きの日時を区別する",
      "body": "PostgreSQLのTIMESTAMPだけの指定はtimestamp without time zoneを意味します。timestamp with time zoneは、表示やタイムゾーンを持たない日時との比較にセッションのTimeZone設定が関係します。この教材はタイムゾーンを持たない同じ店舗の時刻にそろえています。タイムゾーン付きの実データでは、対象の1日をどの地域の時刻で区切るかを先に決めます。"
    }
  ],
  "faqs": [
    {
      "question": "DATE列でも開始以上・終了未満で書けますか？",
      "answer": "書けます。たとえばdelivery_on >= DATE '2026-09-01' AND delivery_on < DATE '2026-10-01'でも9月分を選べます。日付だけの列は当日と等しい条件で1日分を選べますが、時刻付きの列は時刻まで等しいかを比較します。"
    },
    {
      "question": "9月30日23:59:59までにすればよいですか？",
      "answer": "秒以下の時刻を持つデータを落とす可能性があります。この表のID4は23:59:59.999999です。10月1日0時未満という上限なら、時刻の細かさに合わせて月末の最終時刻を作る必要がありません。"
    },
    {
      "question": "注文日時がNULLの行は期間指定に入りますか？",
      "answer": "入りません。日時の比較はNULLに対して真にならないため、WHEREの対象から外れます。未入力の注文を探す場合はordered_at IS NULLを使います。"
    }
  ],
  "references": [
    {
      "label": "PostgreSQL公式：日付・時刻型",
      "url": "https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-DATETIME-INPUT",
      "description": "DATE・TIMESTAMPの値の書き方とタイムゾーン"
    },
    {
      "label": "PostgreSQL公式：比較演算子",
      "url": "https://www.postgresql.org/docs/current/functions-comparison.html",
      "description": "比較演算子、BETWEENの両端、NULLの比較"
    }
  ],
  "related": [
    "date-trunc",
    "where",
    "order-by",
    "group-by",
    "with"
  ],
  "practiceCategory": "date-filter"
};
