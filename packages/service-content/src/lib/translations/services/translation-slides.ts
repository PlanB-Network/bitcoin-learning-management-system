import type { TranslationStatus } from '@blms/constants';
import { TRPCError } from '@trpc/server';
import type { Dependencies } from '../../dependencies.js';

import {
  type CourseTranslationSlide,
  getChapterTranslationContextQuery,
  getCourseTranslationChapterProgressQuery,
  getCourseTranslationSlidesQuery,
  updateCourseTranslationSlideQuery,
} from '../queries/get-translation-slides.js';

export interface ChapterTranslationContext {
  id: string;
  courseId: string;
  courseIndex: string;
  courseName: string;
  partId: string;
  partIndex: number;
  partTitle: string;
  chapterId: string;
  chapterIndex: number;
  chapterTitle: string;
  translationStatus: string;
  chapterTranslationStatus: string;
}

export interface ChapterTranslationData {
  context: ChapterTranslationContext;
  slides: CourseTranslationSlide[];
}

export interface ChapterProgress {
  chapterId: string;
  chapterIndex: number;
  chapterTitle: string;
  partIndex: number;
  partId: string;
  totalSlides: number;
  completedSlides: number;
  inProgressSlides: number;
  todoSlides: number;
  status: 'completed' | 'in-progress' | 'not-started';
}

/**
 * Service to get course translation slides for a specific chapter
 */
export const createGetCourseTranslationSlides = ({
  postgres,
}: Dependencies) => {
  return async ({
    courseId,
    language,
    chapterId,
  }: {
    courseId: string;
    language: string;
    chapterId: string;
  }): Promise<ChapterTranslationData> => {
    try {
      // Get chapter context
      const contextResult = await postgres.exec(
        getChapterTranslationContextQuery(courseId, chapterId, language),
      );

      if (contextResult.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chapter not found',
        });
      }

      const context = contextResult[0] as ChapterTranslationContext;

      // Get slides for the chapter
      const slides = await postgres.exec(
        getCourseTranslationSlidesQuery(courseId, language, chapterId),
      );

      return {
        context,
        slides,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error fetching course translation slides:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch course translation slides',
      });
    }
  };
};

/**
 * Service to update a course translation slide
 */
export const createUpdateCourseTranslationSlide = ({
  postgres,
}: Dependencies) => {
  return async ({
    courseId,
    language,
    chapterId,
    slideId,
    translatedContent,
    status,
  }: {
    courseId: string;
    language: string;
    chapterId: string;
    slideId: string;
    translatedContent: string;
    status: TranslationStatus;
  }): Promise<CourseTranslationSlide> => {
    try {
      const result = await postgres.exec(
        updateCourseTranslationSlideQuery(
          courseId,
          language,
          chapterId,
          slideId,
          translatedContent,
          status,
        ),
      );

      if (result.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Translation slide not found',
        });
      }

      return result[0] as CourseTranslationSlide;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error updating course translation slide:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update course translation slide',
      });
    }
  };
};

/**
 * Service to get chapter progress for course translation overview
 */
export const createGetCourseTranslationChapterProgress = ({
  postgres,
}: Dependencies) => {
  return async ({
    courseId,
    language,
  }: {
    courseId: string;
    language: string;
  }): Promise<ChapterProgress[]> => {
    try {
      const result = await postgres.exec(
        getCourseTranslationChapterProgressQuery(courseId, language),
      );

      return result as ChapterProgress[];
    } catch (error) {
      console.error(
        'Error fetching course translation chapter progress:',
        error,
      );
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch course translation chapter progress',
      });
    }
  };
};
