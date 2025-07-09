import { sql } from '@blms/database';
import type { Dependencies } from '#src/dependencies.js';
import { assignRankingToAllUsersQuery } from '../queries/assign-ranking.js';
import { calculateCourseScoreForAllUsers } from '../queries/calculate-score.js';

export const createProcessTeacherLedCoursesWithConclusionIn24Hours = ({
  postgres,
}: Dependencies) => {
  return async (): Promise<void> => {
    const teacherLedCourseIdsWithConclusionIn24Hours = await postgres.exec(
      sql<Array<{ id: string }>>`
            SELECT DISTINCT
                c.id
            FROM
                content.courses c
            LEFT JOIN content.course_chapters_localized ccl
                ON ccl.course_id = c.id
                AND ccl.language = c.original_language
                AND ccl.is_course_conclusion = TRUE
            WHERE
                c.teaching_format = 'professor_led'
                AND c.are_scores_calculated = FALSE
                AND ccl.release_date IS NOT NULL
                AND ccl.release_date > NOW()
                AND ccl.release_date <= NOW() + INTERVAL '24 hours';
        `,
    );

    console.log(
      '[cron] Recalculate course scores for teacher-led courses and assign ranking: ',
      teacherLedCourseIdsWithConclusionIn24Hours,
    );

    if (teacherLedCourseIdsWithConclusionIn24Hours.length > 0) {
      for (const course of teacherLedCourseIdsWithConclusionIn24Hours) {
        try {
          await postgres.exec(calculateCourseScoreForAllUsers(course.id));
          await postgres.exec(assignRankingToAllUsersQuery(course.id));
          await postgres.exec(
            sql`UPDATE content.courses SET are_scores_calculated = TRUE WHERE id = ${course.id};`,
          );
        } catch (err) {
          console.error(
            'Failed to calculate course score or assign ranking for course',
            course.id,
            err,
          );
        }
      }
    }
  };
};
