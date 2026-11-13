import { questions } from '@/questions/catalog';
import { categoryLabels, practiceCategories } from '@/lib/categories';
import type { Question } from '@/lib/types';

// 演習一覧の並び（教える順）で全問題を1本の学習パスにする。カテゴリ内の順序はカタログの定義順。
const categoryOrder = new Map(practiceCategories.map((category, index) => [category.slug, index]));

/** 問題が1問以上あるカテゴリだけを、演習一覧の並び順で返す。 */
export const activePracticeCategories = practiceCategories.filter((category) => questions.some((question) => question.category === category.slug));

export const orderedQuestions: Question[] = [...questions].sort(
  (a, b) => (categoryOrder.get(a.category) ?? 999) - (categoryOrder.get(b.category) ?? 999),
);

export function questionHref(question: Pick<Question, 'category' | 'id'>): string {
  return `/practice/${question.category}/${question.id}/`;
}

export type PathStep = { href: string; label: string };

/** カテゴリの最後の問題では、次のカテゴリの1問目へ送る。 */
export function nextStep(question: Question): PathStep {
  const index = orderedQuestions.findIndex((item) => item.id === question.id);
  const next = orderedQuestions[index + 1];
  if (!next) return { href: '/practice/', label: '演習一覧へ戻る' };
  if (next.category === question.category) return { href: questionHref(next), label: `次の問題：${next.title}` };
  return { href: questionHref(next), label: `次のカテゴリ：${categoryLabels[next.category] ?? next.category}` };
}

export function previousInCategory(question: Question): PathStep | undefined {
  const index = orderedQuestions.findIndex((item) => item.id === question.id);
  const previous = orderedQuestions[index - 1];
  if (!previous || previous.category !== question.category) return undefined;
  return { href: questionHref(previous), label: `前の問題：${previous.title}` };
}
