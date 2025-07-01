import { sql } from '@blms/database';
import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';

/**
 * Service to get available topics for content management
 */
export const createGetContentManagementTopics = ({
  postgres,
}: Dependencies) => {
  return async (): Promise<string[]> => {
    try {
      const result = await postgres.exec(sql`
        SELECT DISTINCT c.topic
        FROM content.courses c
        JOIN content.course_translations ct ON c.id = ct.course_id
        WHERE ct.status IN ('ready_for_review', 'under_review')
          AND c.is_archived = false
          AND c.topic IS NOT NULL
        ORDER BY c.topic
      `);

      return result.map((row) => row.topic);
    } catch (error) {
      console.error('Error fetching content management topics:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch topics for content management',
      });
    }
  };
};

/**
 * Service to get course languages for admin panel
 */
export const createGetCourseLanguages = ({ postgres }: Dependencies) => {
  return async ({ courseId }: { courseId: string }) => {
    try {
      // Get course basic information first
      const courseResult = await postgres.exec(sql`
        SELECT
          c.id AS "id",
          c.index AS "index",
          cl.name AS "name"
        FROM content.courses c
        LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
        WHERE c.id = ${courseId}
        LIMIT 1
      `);

      if (courseResult.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Course not found',
        });
      }

      // Get languages from course_translations table for this specific course
      const languagesResult = await postgres.exec(sql`
        SELECT
          ct.language AS "languageCode",
          l.name AS "languageName",
          ct.status AS "translationStatus",
          ta.assignee_id AS "assigneeId",
          ua.username AS "assigneeUsername",
          ua.display_name AS "assigneeDisplayName"
        FROM content.course_translations ct
        LEFT JOIN users.languages l ON ct.language = l.code
        LEFT JOIN users.translation_assignments ta ON (
          ta.course_id = ct.course_id
          AND ta.language = ct.language
          AND ta.status IN ('assigned', 'in_progress', 'completed')
        )
        LEFT JOIN users.accounts ua ON ta.assignee_id = ua.uid
        WHERE ct.course_id = ${courseId}
        ORDER BY l.name
      `);

      const courseInfo = courseResult[0];
      const languages = languagesResult.map((row) => ({
        code: row.languageCode,
        name: row.languageName,
        translationStatus: row.translationStatus,
        assigneeId: row.assigneeId,
        assigneeUsername: row.assigneeUsername,
        assigneeDisplayName: row.assigneeDisplayName,
      }));

      return {
        id: courseInfo.id,
        index: courseInfo.index,
        name: courseInfo.name,
        languages,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error fetching course languages:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch course languages',
      });
    }
  };
};

/**
 * Service to get course translation details for admin
 */
export const createGetCourseTranslationDetails = ({
  postgres,
}: Dependencies) => {
  return async ({
    courseId,
    language,
  }: {
    courseId: string;
    language: string;
  }) => {
    try {
      // Get course basic information
      const courseResult = await postgres.exec(sql`
        SELECT
          c.id,
          c.index,
          cl.name AS "courseName",
          ct.status AS "translationStatus",
          ct.created_at AS "translationCreatedAt",
          ct.updated_at AS "translationUpdatedAt",
          ta.assignee_id AS "assigneeId",
          ua.username AS "assigneeUsername",
          ua.display_name AS "assigneeDisplayName",
          ta.assigned_at AS "assignedAt",
          ta.status AS "assignmentStatus"
        FROM content.courses c
        LEFT JOIN content.courses_localized cl ON c.id = cl.course_id AND cl.language = 'en'
        LEFT JOIN content.course_translations ct ON (
          ct.course_id = c.id
          AND ct.language = LOWER(${language})
        )
        LEFT JOIN users.translation_assignments ta ON (
          ta.course_id = c.id
          AND ta.language = LOWER(${language})
          AND ta.status IN ('assigned', 'in_progress', 'completed')
        )
        LEFT JOIN users.accounts ua ON ta.assignee_id = ua.uid
        WHERE c.id = ${courseId}
        LIMIT 1
      `);

      if (courseResult.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Course not found',
        });
      }

      const course = courseResult[0];

      // Get parts and chapters with their translation status
      const chaptersResult = await postgres.exec(sql`
        SELECT
          cp.part_id AS "partId",
          cp.part_index AS "partIndex",
          cpl.title AS "partTitle",
          cc.chapter_id AS "chapterId",
          cc.chapter_index AS "chapterIndex",
          ccl.title AS "chapterTitle",
          COALESCE(ctc.status, 'todo') AS "status",
          ctc.updated_at AS "updatedAt"
        FROM content.course_parts cp
        LEFT JOIN content.course_parts_localized cpl ON (
          cp.part_id = cpl.part_id
          AND cpl.language = 'en'
        )
        LEFT JOIN content.course_chapters cc ON cp.part_id = cc.part_id
        LEFT JOIN content.course_chapters_localized ccl ON (
          cc.chapter_id = ccl.chapter_id
          AND ccl.language = 'en'
        )
        LEFT JOIN content.course_translation_chapters ctc ON (
          ctc.course_id = ${courseId}
          AND ctc.language = LOWER(${language})
          AND ctc.part_id = cp.part_id
          AND ctc.chapter_id = cc.chapter_id
        )
        WHERE cp.course_id = ${courseId}
        ORDER BY cp.part_index, cc.chapter_index
      `);

      // Group chapters by parts
      const partsMap = new Map();

      for (const chapter of chaptersResult) {
        if (!partsMap.has(chapter.partId)) {
          partsMap.set(chapter.partId, {
            partId: chapter.partId,
            partIndex: chapter.partIndex,
            partTitle: chapter.partTitle,
            chapters: [],
          });
        }

        partsMap.get(chapter.partId).chapters.push({
          chapterId: chapter.chapterId,
          chapterIndex: chapter.chapterIndex,
          chapterTitle: chapter.chapterTitle,
          status: chapter.status,
          updatedAt: chapter.updatedAt,
        });
      }

      const parts = Array.from(partsMap.values());

      // Calculate overall progress
      const totalChapters = chaptersResult.length;
      const completedChapters = chaptersResult.filter(
        (chapter) =>
          chapter.status === 'reviewed' || chapter.status === 'published',
      ).length;
      const progress =
        totalChapters > 0
          ? Math.round((completedChapters / totalChapters) * 100)
          : 0;

      return {
        id: course.id,
        index: course.index,
        courseName: course.courseName,
        translationStatus: course.translationStatus,
        translationCreatedAt: course.translationCreatedAt,
        translationUpdatedAt: course.translationUpdatedAt,
        assigneeId: course.assigneeId,
        assigneeUsername: course.assigneeUsername,
        assigneeDisplayName: course.assigneeDisplayName,
        assignedAt: course.assignedAt,
        assignmentStatus: course.assignmentStatus,
        parts,
        progress,
        totalChapters,
        completedChapters,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error fetching course translation details:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch course translation details',
      });
    }
  };
};
