import { deleteTopic } from './deleteSqlTopic';
import { updateTopic } from './updateSqlTopic';
import { insertTopic } from './insertSqlTopic';
import { likeTopic } from './likeSqlTopic';
import { intersectExceptTopic } from './intersectExceptSqlTopic';
import { existsTopic } from './existsSqlTopic';
import { stringFunctionsTopic } from './stringFunctionsSqlTopic';
import { dateTruncTopic } from './dateTruncSqlTopic';
import { dateFilterTopic } from './dateFilterSqlTopic';
import { unionTopic } from './unionSqlTopic';
import { withTopic } from './withSqlTopic';
import { coalesceTopic } from './coalesceSqlTopic';
import { caseTopic } from './caseSqlTopic';
import type { SqlTopic } from './sqlTopics';
import { extraTopicSlugs } from '../lib/categories';
import { joinTopics } from './joinSqlTopics';
import { groupByTopic, havingTopic, subqueryTopic, windowFunctionsTopic } from './remainingSqlTopics';

// src/data/topics/{slug}.ts は `topic` と `fixture` をexportする。ファイルを置くだけで公開され、掲載順は extraTopicSlugs に従う。
const extraModules = import.meta.glob<{ topic: SqlTopic }>('./topics/*.ts', { eager: true });
const orderOf = (slug: string) => { const index = extraTopicSlugs.indexOf(slug); return index === -1 ? extraTopicSlugs.length : index; };
export const extraSqlTopics: SqlTopic[] = Object.values(extraModules).map((module) => module.topic).sort((a, b) => orderOf(a.slug) - orderOf(b.slug));

export const advancedSqlTopics: SqlTopic[] = [
  likeTopic,
  groupByTopic,
  havingTopic,
  caseTopic,
  coalesceTopic,
  ...joinTopics,
  subqueryTopic,
  withTopic,
  unionTopic,
  dateFilterTopic,
  dateTruncTopic,
  stringFunctionsTopic,
  existsTopic,
  intersectExceptTopic,
  windowFunctionsTopic,
  insertTopic,
  updateTopic,
  deleteTopic,
  ...extraSqlTopics,
];
