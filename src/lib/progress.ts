import type { ProgressState } from './types';

const STORAGE_KEY = 'sqlrenshu:progress:v1';
/** 同じタブ内で進捗が変わったことを知らせるイベント名（storageイベントは他タブにしか届かない）。 */
export const PROGRESS_EVENT = 'sqlrenshu:progress';
const emptyState = (): ProgressState => ({ version: 1, lastSqlByQuestion: {}, solvedIds: [], solvedAt: {} });

export function loadProgress(): ProgressState {
  if (typeof localStorage === 'undefined') return emptyState();
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as Partial<ProgressState>;
    if (parsed.version !== 1) return emptyState();
    return {
      ...emptyState(),
      ...parsed,
      lastSqlByQuestion: parsed.lastSqlByQuestion && typeof parsed.lastSqlByQuestion === 'object'
        ? parsed.lastSqlByQuestion
        : {},
      solvedIds: Array.isArray(parsed.solvedIds)
        ? parsed.solvedIds.filter((id): id is string => typeof id === 'string')
        : [],
      solvedAt: parsed.solvedAt && typeof parsed.solvedAt === 'object' ? parsed.solvedAt : {},
    };
  } catch {
    return emptyState();
  }
}

function write(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 保存できない環境（プライベートモードや容量超過）でも演習自体は続けられるようにする。
  }
}

export function saveDraft(questionId: string, sql: string): void {
  const state = loadProgress();
  write({ ...state, lastSqlByQuestion: { ...state.lastSqlByQuestion, [questionId]: sql } });
}

/** 端末のローカル日付（YYYY-MM-DD）。連続日数は利用者の暦日で数える。 */
export function localDay(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function markSolved(questionId: string): void {
  const state = loadProgress();
  if (state.solvedIds.includes(questionId)) return;
  write({
    ...state,
    solvedIds: [...state.solvedIds, questionId],
    solvedAt: { ...state.solvedAt, [questionId]: localDay() },
  });
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
}

/** 今日または昨日まで途切れずに新しい問題を解いた日数。今日まだ解いていなくても昨日までの記録は残す。 */
export function currentStreak(state: ProgressState, today: Date = new Date()): number {
  const days = new Set(Object.values(state.solvedAt ?? {}));
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!days.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDay(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
