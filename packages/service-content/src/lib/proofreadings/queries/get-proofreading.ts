import { sql } from '@blms/database';
import type { JoinedProofreading } from '@blms/types';

export const getProofreadingQuery = ({
  language,
  courseId,
  tutorialId,
  resourceId,
}: {
  language: string;
  courseId?: string;
  tutorialId?: number;
  resourceId?: number;
}) => {
  if (!courseId && !tutorialId && !resourceId) {
    throw new Error('One argument required');
  }

  const whereClauses = [];

  if (courseId !== undefined) {
    whereClauses.push(sql`p.course_id = ${courseId}`);
  }
  if (tutorialId !== undefined) {
    whereClauses.push(sql`p.tutorial_id = ${tutorialId}`);
  }
  if (resourceId !== undefined) {
    whereClauses.push(sql`p.resource_id = ${resourceId}`);
  }
  if (language !== undefined) {
    whereClauses.push(sql`p.language = ${language}`);
  }
  // eslint-disable-next-line unicorn/no-array-reduce
  const whereStatement = sql`WHERE ${whereClauses.reduce(
    (acc, clause) => sql`${acc} AND ${clause}`,
  )}`;

  return sql<JoinedProofreading[]>`
    SELECT 
      p.id, 
      p.course_id, 
      p.tutorial_id,
      p.resource_id,
      p.language,
      p.last_contribution_date,
      p.urgency,
      p.reward,
      COALESCE(c.contributors_id, ARRAY[]::text[]) AS contributors_id
    FROM content.proofreading p

    LEFT JOIN LATERAL (
      SELECT COALESCE(ARRAY_AGG(pc.contributor_id), ARRAY[]::text[]) AS contributors_id
      FROM content.proofreading_contributor pc
      WHERE p.id = pc.proofreading_id
    ) c ON TRUE

    ${whereStatement}

  `;
};
