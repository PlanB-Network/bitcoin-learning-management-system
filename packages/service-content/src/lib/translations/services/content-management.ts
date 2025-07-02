import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';
import {
  getContentManagementTopicsQuery,
  getCourseBasicInfoQuery,
  getCourseLanguagesQuery,
  getCourseTranslationChaptersQuery,
  getCourseTranslationDetailsQuery,
} from '../queries/content-management.js';

/**
 * Service to get available topics for content management
 */
export const createGetContentManagementTopics = ({
  postgres,
}: Dependencies) => {
  return async (): Promise<string[]> => {
    try {
      const result = await postgres.exec(getContentManagementTopicsQuery());

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
      const courseResult = await postgres.exec(
        getCourseBasicInfoQuery(courseId),
      );

      if (courseResult.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Course not found',
        });
      }

      // Get languages from course_translations table for this specific course
      const languagesResult = await postgres.exec(
        getCourseLanguagesQuery(courseId),
      );

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
      const courseResult = await postgres.exec(
        getCourseTranslationDetailsQuery(courseId, language),
      );

      if (courseResult.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Course not found',
        });
      }

      const course = courseResult[0];

      // Get parts and chapters with their translation status
      const chaptersResult = await postgres.exec(
        getCourseTranslationChaptersQuery(courseId, language),
      );

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
