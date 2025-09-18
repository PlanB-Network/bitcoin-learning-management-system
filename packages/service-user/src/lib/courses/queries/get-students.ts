import { sql } from '@blms/database';
import type { CourseStudent } from '@blms/types';

type Cursor = { uid: string; value: string | number | null };

export const getStudentsByCourseIdQuery = (
  search: string,
  orderField:
    | 'displayName'
    | 'amount'
    | 'courseProgress'
    | 'totalScore'
    | 'lastActive',
  orderDirection: 'asc' | 'desc',
  limit?: number,
  cursor?: Cursor | null,
  courseId?: string,
) => {
  const searchPattern = `%${search}%`;

  const orderExpr =
    orderField === 'displayName'
      ? sql`ua.display_name`
      : orderField === 'amount'
        ? sql`pay.amount`
        : orderField === 'courseProgress'
          ? sql`cp.progress_percentage`
          : orderField === 'lastActive'
            ? sql`cp.last_updated`
            : sql`COALESCE(cp.total_score, le.score)`;

  const comparisonOperator = orderDirection === 'asc' ? sql`>` : sql`<`;

  const cursorCondition = cursor
    ? sql`
      AND (
        ${orderExpr} ${comparisonOperator} ${cursor.value}
        OR (
          ${orderExpr} = ${cursor.value}
          AND cp.uid ${comparisonOperator} ${cursor.uid}
        )
      )
    `
    : sql``;

  const searchCondition = search
    ? sql`
      AND (
        ua.display_name ILIKE ${searchPattern}
      )
    `
    : sql``;

  const orderDirectionKeyword = orderDirection === 'asc' ? sql`ASC` : sql`DESC`;

  const orderByClause = sql`${orderExpr} ${orderDirectionKeyword}, cp.uid ${orderDirectionKeyword}`;

  return sql<CourseStudent[]>`
    WITH latest_exam AS (
      SELECT
        uid,
        score
      FROM (
        SELECT
          uid,
          score,
          ROW_NUMBER() OVER (PARTITION BY uid ORDER BY started_at DESC) as rn
        FROM
          users.exam_attempts
        WHERE
          course_id = ${courseId}
          AND exam_type = 'final'
          AND finalized = true
      ) AS ranked_exams
      WHERE rn = 1
    )
    SELECT
      cp.progress_percentage AS course_progress,
      cp.last_updated AS last_active,
      cp.uid AS uid,
      cp.total_score AS total_score,
      ua.display_name AS display_name,
      pay.amount AS amount,
      pay.method AS method,
      le.score AS exam_score
    FROM
      users.course_progress cp
    JOIN
      users.accounts ua ON cp.uid = ua.uid
    LEFT JOIN
      users.course_payment pay ON cp.uid = pay.uid AND cp.course_id = pay.course_id AND pay.payment_status = 'paid'
    LEFT JOIN
      latest_exam le ON cp.uid = le.uid
    WHERE
      cp.course_id = ${courseId}
      ${searchCondition}
      ${cursorCondition}
    ORDER BY ${orderByClause}
    ${limit && sql`LIMIT ${limit}`}
  `;
};
