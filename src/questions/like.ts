import type { QuestionCore, QuestionTranslation } from '@/lib/types';
import { buildExerciseEntries, type Exercise } from './exerciseEntries';

type Entry = { core: QuestionCore; translations: { ja: QuestionTranslation } };

const setup = "CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, code text NOT NULL, price integer NOT NULL);\nINSERT INTO products VALUES\n  (1, 'ボールペン黒', 'PEN-BK', 120),\n  (2, 'ボールペン赤', 'PEN-RD', 120),\n  (3, 'ノートA5', 'NOTE-A5', 300),\n  (4, 'ノートB5', 'NOTE-B5', 350),\n  (5, '蛍光ペン', 'pen-yl', 150),\n  (6, '割引券（10%）', 'SALE_10', 500),\n  (7, '割引券（10円）', 'SALE-10', 100);";

const exercises: Exercise[] = [
  {
    "slug": "prefix-match",
    "title": "LIKE・前方一致",
    "description": "商品名が「ボールペン」で始まる商品の全列を取得してください。行順は問いません。",
    "sql": "SELECT *\nFROM products\nWHERE name LIKE 'ボールペン%';",
    "hint": "先頭を固定し、後ろは%で任意の文字列にします。",
    "explanation": "ボールペン黒とボールペン赤の2行が一致します。%を付けない完全一致では0行になります。",
    "starter": "SELECT *\nFROM products\nWHERE name LIKE ;",
    "columns": [
      "id",
      "name",
      "code",
      "price"
    ],
    "rows": [
      [
        1,
        "ボールペン黒",
        "PEN-BK",
        120
      ],
      [
        2,
        "ボールペン赤",
        "PEN-RD",
        120
      ]
    ]
  },
  {
    "slug": "partial-match",
    "title": "LIKE・部分一致",
    "description": "商品名に「ペン」を含む商品の全列を取得してください。名前の先頭・途中・末尾のどこにあってもかまいません。行順は問いません。",
    "sql": "SELECT *\nFROM products\nWHERE name LIKE '%ペン%';",
    "hint": "前後を%で囲みます。",
    "explanation": "ボールペン黒、ボールペン赤、末尾が「ペン」の蛍光ペンの3行です。後ろだけに%を付けた「ペン%」では蛍光ペンが見つかりません。",
    "starter": "SELECT *\nFROM products\nWHERE name LIKE 'ペン%';",
    "columns": [
      "id",
      "name",
      "code",
      "price"
    ],
    "rows": [
      [
        1,
        "ボールペン黒",
        "PEN-BK",
        120
      ],
      [
        2,
        "ボールペン赤",
        "PEN-RD",
        120
      ],
      [
        5,
        "蛍光ペン",
        "pen-yl",
        150
      ]
    ]
  },
  {
    "slug": "single-char-wildcard",
    "title": "LIKE・_（1文字）",
    "description": "商品コードが「NOTE-」の後ろにちょうど2文字が続く形の商品の全列を取得してください。行順は問いません。",
    "sql": "SELECT *\nFROM products\nWHERE code LIKE 'NOTE-__';",
    "hint": "_は任意の1文字ちょうどを表します。",
    "explanation": "NOTE-A5とNOTE-B5の2行です。_を1つだけにすると、1文字のコードだけが対象になり0行です。",
    "starter": "SELECT *\nFROM products\nWHERE code LIKE 'NOTE-_';",
    "columns": [
      "id",
      "name",
      "code",
      "price"
    ],
    "rows": [
      [
        3,
        "ノートA5",
        "NOTE-A5",
        300
      ],
      [
        4,
        "ノートB5",
        "NOTE-B5",
        350
      ]
    ]
  },
  {
    "slug": "escape-underscore",
    "title": "LIKE・エスケープ",
    "description": "商品コードが、アンダースコアを含む「SALE_10」という文字列に一致する商品の全列を取得してください。ハイフンの「SALE-10」は含めません。",
    "sql": "SELECT *\nFROM products\nWHERE code LIKE 'SALE\\_10';",
    "hint": "_そのものを探すには、直前にバックスラッシュを付けます。",
    "explanation": "エスケープしたSALE\\_10はSALE_10の1行だけに一致します。エスケープしないとSALE-10も一致します。",
    "starter": "SELECT *\nFROM products\nWHERE code LIKE 'SALE_10';",
    "columns": [
      "id",
      "name",
      "code",
      "price"
    ],
    "rows": [
      [
        6,
        "割引券（10%）",
        "SALE_10",
        500
      ]
    ]
  },
  {
    "slug": "chapter-review-ilike-not-like",
    "title": "章末問題：ILIKE・NOT LIKE",
    "description": "商品コードが大文字小文字を区別せずに「pen-」で始まり、かつ商品名に「赤」を含まない商品の全列を取得してください。行順は問いません。",
    "sql": "SELECT *\nFROM products\nWHERE code ILIKE 'pen-%'\n  AND name NOT LIKE '%赤%';",
    "hint": "大文字小文字を区別しない比較と、一致しない条件を、ANDでつなぎます。",
    "explanation": "ILIKEでPEN-BK、PEN-RD、pen-ylの3件が候補になり、名前に「赤」を含むボールペン赤を除いて2行が残ります。LIKEだと小文字のpen-ylだけになります。",
    "starter": "SELECT *\nFROM products\nWHERE code LIKE 'pen-%'\n  AND name NOT LIKE '%赤%';",
    "review": "chapter review",
    "requirements": [
      "コードは大文字小文字を区別せずに前方一致する",
      "名前に「赤」を含む商品を除く",
      "2つの条件を両方満たす商品の全列を取得する"
    ],
    "columns": [
      "id",
      "name",
      "code",
      "price"
    ],
    "rows": [
      [
        1,
        "ボールペン黒",
        "PEN-BK",
        120
      ],
      [
        5,
        "蛍光ペン",
        "pen-yl",
        150
      ]
    ]
  },
  {
    "slug": "cumulative-review-where-order-by-like",
    "title": "まとめ問題：WHERE・ORDER BY・LIKE",
    "description": "商品名に「ペン」を含むか、「ノート」で始まる商品のうち、価格が150円以上の商品の全列を取得してください。価格の高い順、同額ならidの昇順に並べます。",
    "sql": "SELECT *\nFROM products\nWHERE (name LIKE '%ペン%' OR name LIKE 'ノート%')\n  AND price >= 150\nORDER BY price DESC, id;",
    "hint": "ORの条件をカッコでまとめてから、価格の条件をANDでつなぎます。",
    "explanation": "ノートB5（350）、ノートA5（300）、蛍光ペン（150）の順です。ボールペン2種は120円なので除外します。カッコがないと、ANDが先に評価されて結果が変わります。",
    "ordered": true,
    "review": "cumulative review",
    "requirements": [
      "名前の部分一致と前方一致をORでつなぐ",
      "価格が150円以上の条件をカッコ外でANDにする",
      "価格の降順、同額ならidの昇順に並べる"
    ],
    "columns": [
      "id",
      "name",
      "code",
      "price"
    ],
    "rows": [
      [
        4,
        "ノートB5",
        "NOTE-B5",
        350
      ],
      [
        3,
        "ノートA5",
        "NOTE-A5",
        300
      ],
      [
        5,
        "蛍光ペン",
        "pen-yl",
        150
      ]
    ]
  }
];

export function likeEntries(): Entry[] {
  return buildExerciseEntries({ category: 'like', tags: ["LIKE"], setup, exercises });
}
