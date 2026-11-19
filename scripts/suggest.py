#!/usr/bin/env python3
"""Google のサジェストを取る。主題に続く語から、求められている論点を知るために使う。

  suggest.py "sql case文" "sql 結合"     主題ごとのサジェスト
  suggest.py --expand "sql case文"       主題のあとに五十音の頭文字を足して広げる

分かるのは語の並びだけで、検索の量は分からない。
"""
import argparse
import json
import sys
import time
import urllib.parse
import urllib.request

URL = "https://www.google.com/complete/search?client=firefox&hl=ja&ie=utf-8&oe=utf-8&q="
KANA = "あかさたなはまやらわ"


def fetch(q):
    req = urllib.request.Request(URL + urllib.parse.quote(q), headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode("utf-8"))[1]


def main():
    p = argparse.ArgumentParser()
    p.add_argument("seeds", nargs="+")
    p.add_argument("--expand", action="store_true")
    args = p.parse_args()

    for seed in args.seeds:
        queries = [seed, seed + " "]
        if args.expand:
            queries += [f"{seed} {k}" for k in KANA]
        seen = []
        for q in queries:
            try:
                for s in fetch(q):
                    if s not in seen and s != seed:
                        seen.append(s)
            except Exception as e:
                print(f"# 取得できず: {q}（{e}）", file=sys.stderr)
            time.sleep(0.5)
        print(f"# {seed}  {len(seen)} 件")
        for s in seen:
            print(s)
        print()


if __name__ == "__main__":
    main()
