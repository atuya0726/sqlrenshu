import { buildExerciseEntries, type Exercise } from '../exerciseEntries';

const setup = "CREATE TABLE authors (id integer PRIMARY KEY, name text NOT NULL, status text NOT NULL);\nINSERT INTO authors VALUES (1, '佐藤', 'active'), (2, '鈴木', 'banned'), (3, '田中', 'active'), (4, '高橋', 'banned'), (5, '伊藤', 'active');\nCREATE TABLE posts (id integer PRIMARY KEY, author_id integer, title text NOT NULL, views integer NOT NULL);\nINSERT INTO posts VALUES (1, 1, 'はじめに', 500), (2, 2, '特売', 30), (3, 2, '再入荷', 150), (4, 3, 'レビュー', 80), (5, 4, '広告', 20), (6, NULL, '匿名', 60), (7, 1, '続き', 40), (8, 3, '質問', 200);\nCREATE TABLE reports (post_id integer NOT NULL, reason text NOT NULL);\nINSERT INTO reports VALUES (2, 'スパム'), (2, '不適切'), (3, '誤情報'), (3, '不適切'), (4, 'スパム'), (5, 'スパム'), (6, '誤情報'), (9, 'スパム');";

const exercises: Exercise[] = [
  {
    "slug": "delete-using-basic",
    "title": "DELETE USING",
    "description": "reports に報告が1件でもある投稿を、posts から削除してください。投稿は post_id と id で対応します。",
    "sql": "DELETE FROM posts\nUSING reports AS r\nWHERE posts.id = r.post_id;",
    "hint": "USINGにreportsを書き、削除先との結合条件をWHEREに書きます。",
    "explanation": "報告があるのはid 2・3・4・5・6の投稿で、これらが削除されて1・7・8が残ります。id 2や3のように報告が2件ある投稿も1行として削除されます。post_idが9の報告に対応する投稿はありません。",
    "starter": "DELETE FROM posts\nUSING reports AS r\n",
    "columns": [
      "id",
      "author_id",
      "title",
      "views"
    ],
    "rows": [
      [
        1,
        1,
        "はじめに",
        500
      ],
      [
        7,
        1,
        "続き",
        40
      ],
      [
        8,
        3,
        "質問",
        200
      ]
    ]
  },
  {
    "slug": "delete-using-other-column",
    "title": "DELETE USING・別の表の値で絞る",
    "description": "authors を使って、凍結中（status が banned）の著者が書いた投稿を posts から削除してください。投稿は author_id と authors の id で対応します。",
    "sql": "DELETE FROM posts\nUSING authors AS a\nWHERE posts.author_id = a.id\n  AND a.status = 'banned';",
    "hint": "結合条件にANDで、authorsの列を使った条件を足します。",
    "explanation": "凍結中の著者は鈴木（id 2）と高橋（id 4）で、その投稿のid 2・3・5が削除されます。著者が不明（author_idがNULL）のid 6は結合に一致しないので残ります。",
    "columns": [
      "id",
      "author_id",
      "title",
      "views"
    ],
    "rows": [
      [
        1,
        1,
        "はじめに",
        500
      ],
      [
        4,
        3,
        "レビュー",
        80
      ],
      [
        6,
        null,
        "匿名",
        60
      ],
      [
        7,
        1,
        "続き",
        40
      ],
      [
        8,
        3,
        "質問",
        200
      ]
    ]
  },
  {
    "slug": "delete-using-exists",
    "title": "DELETE・EXISTS",
    "description": "USINGを使わず、reports に理由が「スパム」の報告がある投稿を、EXISTSを使って posts から削除してください。",
    "sql": "DELETE FROM posts\nWHERE EXISTS (\n  SELECT 1\n  FROM reports AS r\n  WHERE r.post_id = posts.id\n    AND r.reason = 'スパム'\n);",
    "hint": "サブクエリで、同じ投稿を指す報告のうち理由がスパムのものを探します。",
    "explanation": "スパムの報告があるのはid 2・4・5の投稿です。id 3は報告がありますが、理由が誤情報と不適切でスパムではないので残ります。post_idが9の報告は対応する投稿が無く、何も起きません。",
    "columns": [
      "id",
      "author_id",
      "title",
      "views"
    ],
    "rows": [
      [
        1,
        1,
        "はじめに",
        500
      ],
      [
        3,
        2,
        "再入荷",
        150
      ],
      [
        6,
        null,
        "匿名",
        60
      ],
      [
        7,
        1,
        "続き",
        40
      ],
      [
        8,
        3,
        "質問",
        200
      ]
    ]
  },
  {
    "slug": "delete-using-in",
    "title": "DELETE・IN",
    "description": "凍結中（status が banned）の著者が書いた投稿のうち、閲覧数が100以上の投稿を、INのサブクエリを使って posts から削除してください。",
    "sql": "DELETE FROM posts\nWHERE author_id IN (\n  SELECT id\n  FROM authors\n  WHERE status = 'banned'\n)\n  AND views >= 100;",
    "hint": "著者の一覧をサブクエリで作り、閲覧数の条件はANDで外側に足します。",
    "explanation": "凍結中の著者の投稿はid 2（30）・3（150）・5（20）で、閲覧数が100以上のid 3だけが削除されます。閲覧数が100未満のid 2と5は残ります。",
    "columns": [
      "id",
      "author_id",
      "title",
      "views"
    ],
    "rows": [
      [
        1,
        1,
        "はじめに",
        500
      ],
      [
        2,
        2,
        "特売",
        30
      ],
      [
        4,
        3,
        "レビュー",
        80
      ],
      [
        5,
        4,
        "広告",
        20
      ],
      [
        6,
        null,
        "匿名",
        60
      ],
      [
        7,
        1,
        "続き",
        40
      ],
      [
        8,
        3,
        "質問",
        200
      ]
    ]
  },
  {
    "slug": "delete-using-not-exists",
    "title": "DELETE・NOT EXISTS",
    "description": "1件も投稿していない著者を、authors から削除してください。",
    "sql": "DELETE FROM authors\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM posts AS p\n  WHERE p.author_id = authors.id\n);",
    "hint": "著者ごとに、同じauthor_idの投稿が存在しないことをNOT EXISTSで確かめます。",
    "explanation": "投稿があるのは佐藤・鈴木・田中・高橋で、投稿が無い伊藤（id 5）だけが削除されます。postsのauthor_idにはNULLの行があり、NOT INで書くと一覧のNULLのために誰も削除されません。",
    "stateQuery": "SELECT * FROM authors ORDER BY id",
    "columns": [
      "id",
      "name",
      "status"
    ],
    "rows": [
      [
        1,
        "佐藤",
        "active"
      ],
      [
        2,
        "鈴木",
        "banned"
      ],
      [
        3,
        "田中",
        "active"
      ],
      [
        4,
        "高橋",
        "banned"
      ]
    ]
  },
  {
    "slug": "review-spam-banned",
    "title": "章末問題：DELETE USING・複数の表・絞り込み",
    "description": "理由が「スパム」の報告があり、かつ書いた著者が凍結中（status が banned）の投稿を、posts から削除してください。",
    "sql": "DELETE FROM posts\nUSING reports AS r, authors AS a\nWHERE posts.id = r.post_id\n  AND posts.author_id = a.id\n  AND r.reason = 'スパム'\n  AND a.status = 'banned';",
    "hint": "USINGにreportsとauthorsを並べ、それぞれの結合条件と絞り込みをWHEREに書きます。",
    "explanation": "スパムの報告があるのはid 2・4・5で、このうち著者が凍結中なのはid 2（鈴木）とid 5（高橋）です。id 4の著者の田中は有効、id 3は凍結中の著者ですが報告の理由がスパムではないので残ります。",
    "starter": "DELETE FROM posts\nUSING reports AS r\nWHERE posts.id = r.post_id\n  AND r.reason = 'スパム';",
    "review": "chapter review",
    "requirements": [
      "USINGに2つの表を並べ、それぞれ結合条件を書く",
      "報告の理由がスパムのものに絞る",
      "著者が凍結中のものに絞る"
    ],
    "columns": [
      "id",
      "author_id",
      "title",
      "views"
    ],
    "rows": [
      [
        1,
        1,
        "はじめに",
        500
      ],
      [
        3,
        2,
        "再入荷",
        150
      ],
      [
        4,
        3,
        "レビュー",
        80
      ],
      [
        6,
        null,
        "匿名",
        60
      ],
      [
        7,
        1,
        "続き",
        40
      ],
      [
        8,
        3,
        "質問",
        200
      ]
    ]
  },
  {
    "slug": "cumulative-many-reports",
    "title": "まとめ問題：DELETE USING・GROUP BY・HAVING・WHERE",
    "description": "報告が2件以上ある投稿のうち、閲覧数が100未満の投稿を posts から削除してください。報告の件数は reports を投稿ごとに数えて求めます。",
    "sql": "DELETE FROM posts\nUSING (\n  SELECT post_id\n  FROM reports\n  GROUP BY post_id\n  HAVING COUNT(*) >= 2\n) AS r\nWHERE posts.id = r.post_id\n  AND posts.views < 100;",
    "hint": "報告を投稿ごとにGROUP BYで数えたサブクエリをUSINGに置き、件数の条件はHAVINGに書きます。",
    "explanation": "報告が2件以上ある投稿はid 2（スパム・不適切）とid 3（誤情報・不適切）です。このうち閲覧数が100未満のid 2（30）だけが削除され、150のid 3は残ります。報告が1件のid 4・5・6も残ります。",
    "review": "cumulative review",
    "requirements": [
      "USINGにGROUP BYで集計したサブクエリを置く",
      "HAVINGで報告が2件以上の投稿に絞る",
      "WHEREで閲覧数が100未満に絞る"
    ],
    "columns": [
      "id",
      "author_id",
      "title",
      "views"
    ],
    "rows": [
      [
        1,
        1,
        "はじめに",
        500
      ],
      [
        3,
        2,
        "再入荷",
        150
      ],
      [
        4,
        3,
        "レビュー",
        80
      ],
      [
        5,
        4,
        "広告",
        20
      ],
      [
        6,
        null,
        "匿名",
        60
      ],
      [
        7,
        1,
        "続き",
        40
      ],
      [
        8,
        3,
        "質問",
        200
      ]
    ]
  }
];

export const entries = buildExerciseEntries({ category: 'delete-using', tags: ["delete-using","DELETE"], setup, stateQuery: "SELECT * FROM posts ORDER BY id", exercises });
