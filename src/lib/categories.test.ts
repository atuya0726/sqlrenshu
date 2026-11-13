import { describe, expect, it } from 'vitest';
import { groupByPractice, practiceCategories, practiceGroups } from './categories';

describe('practiceGroups', () => {
  it('covers every practice category exactly once, in the practice order', () => {
    expect(practiceGroups.flatMap((group) => group.slugs)).toEqual(practiceCategories.map((category) => category.slug));
  });

  it('keeps each group contiguous so headings never repeat', () => {
    const grouped = groupByPractice(practiceCategories, (category) => category.slug);
    expect(grouped.map((entry) => entry.group.id)).toEqual(practiceGroups.map((group) => group.id));
  });
});
