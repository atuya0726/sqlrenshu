#!/usr/bin/env python3
"""SQL練習室の定期運用を、Claude Code の非対話モードで1回実行する。

launchd から呼ばれる。月曜と木曜に1回ずつ実行し、失敗したら Discord に知らせる。
Mac が止まっていて実行日を逃したときは、前回の成功から5日以上あいた時点で実行する。

  pdca.py              実行日でまだなら実行する（launchd 用）
  pdca.py --force      実行日でなくても、実行済みでも実行する
  pdca.py --dry-run    数字の取得と施策の選定までを行い、何も変更しない
"""
import argparse
import datetime as dt
import fcntl
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOGS = Path.home() / "Library/Logs/sqlrenshu-pdca"
STATE = LOGS / "state.json"
NOTIFY = Path.home() / ".claude/bin/discord-notify"
RUN_WEEKDAYS = {0, 3}   # 月曜と木曜
CATCHUP_DAYS = 5        # 前回の成功からこの日数あいたら、実行日でなくても実行する
START_HOUR = 7          # この時刻より前は実行しない
MAX_ATTEMPTS = 2        # 1日に試す回数の上限
TIMEOUT = 90 * 60       # 秒

PROMPT = (
    "スケジュール実行です。pdca スキル（.claude/skills/pdca/SKILL.md）に従い、"
    "今回の運用を無人で1周実行してください。途中で質問はできません。"
)
DRY_PROMPT = (
    "試運転です。pdca スキル（.claude/skills/pdca/SKILL.md）の手順1〜3だけを行ってください。"
    "数字の取得と施策の選定までで止め、ファイルの変更、git の操作、デプロイ、Discord への送信はしないでください。"
    "取得できた数字、選んだ施策とその理由、途中で拒否された操作があればその内容を報告してください。"
)


def notify(title, body):
    try:
        subprocess.run([str(NOTIFY), "-t", title, body], timeout=30, cwd=ROOT)
    except Exception as e:  # 通知の失敗で本体を落とさない
        print(f"notify failed: {e}", file=sys.stderr)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--force", action="store_true")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    LOGS.mkdir(parents=True, exist_ok=True)
    lock = open(LOGS / "lock", "w")
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        return  # 実行中

    now = dt.datetime.now()
    today = now.date().isoformat()
    state = json.loads(STATE.read_text()) if STATE.exists() else {}
    scheduled = not (args.force or args.dry_run)
    if scheduled:
        if now.hour < START_HOUR:
            return
        last_ok = state.get("lastOk")
        overdue = last_ok is not None and (now.date() - dt.date.fromisoformat(last_ok)).days >= CATCHUP_DAYS
        if now.weekday() not in RUN_WEEKDAYS and not overdue:
            return
        if state.get("date") == today and (
            state.get("status") == "ok" or state.get("attempts", 0) >= MAX_ATTEMPTS
        ):
            return

    attempts = state.get("attempts", 0) + 1 if state.get("date") == today else 1
    if not args.dry_run:
        STATE.write_text(json.dumps({**state, "date": today, "status": "running", "attempts": attempts}))

    cmd = ["claude", "-p", DRY_PROMPT if args.dry_run else PROMPT,
           "--permission-mode", "auto", "--permission-prompts", "none",
           "--output-format", "json"]
    if os.environ.get("PDCA_MODEL"):
        cmd += ["--model", os.environ["PDCA_MODEL"]]
    log = LOGS / f"{today}{'-dry' if args.dry_run else ''}-{now:%H%M}.json"

    status, detail = "ok", ""
    try:
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=TIMEOUT)
        log.write_text(r.stdout + ("\n--- stderr ---\n" + r.stderr if r.stderr else ""))
        try:
            out = json.loads(r.stdout)
        except Exception:
            out = {}
        if r.returncode != 0 or out.get("is_error"):
            status, detail = "failed", f"終了コード {r.returncode}"
        if args.dry_run:
            print(out.get("result", r.stdout))
    except subprocess.TimeoutExpired:
        status, detail = "failed", f"{TIMEOUT // 60}分で打ち切り"
    except FileNotFoundError:
        status, detail = "failed", "claude コマンドが見つからない"

    if not args.dry_run:
        last_ok = today if status == "ok" else state.get("lastOk")
        STATE.write_text(json.dumps({"date": today, "status": status, "attempts": attempts, "lastOk": last_ok}))
        if status != "ok":
            retry = "1時間以内にもう一度試します。" if attempts < MAX_ATTEMPTS else "今日はもう再試行しません。"
            notify("SQL練習室 運用 失敗", f"無人実行が失敗しました（{detail}、{attempts}回目）。{retry}\nログ: {log}")
    sys.exit(0 if status == "ok" else 1)


if __name__ == "__main__":
    main()
