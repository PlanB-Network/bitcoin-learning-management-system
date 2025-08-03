import { TRPCError } from '@trpc/server';

import type { Dependencies } from '../../dependencies.js';
import { getSlideProfessorQuery } from '../queries/get-slide-professor.js';

/**
 * Service to get the professor name for a specific course translation slide
 */
export const createGetSlideProfessor = ({ postgres }: Dependencies) => {
  return async ({
    courseId,
    language,
    partId,
    chapterId,
    slideId,
  }: {
    courseId: string;
    language: string;
    partId: string;
    chapterId: string;
    slideId: string;
  }): Promise<string | null> => {
    try {
      const result = await postgres.exec(
        getSlideProfessorQuery(courseId, language, partId, chapterId, slideId),
      );

      if (result.length === 0) {
        // Slide not found, return null
        return null;
      }

      return result[0].professorName;
    } catch (error) {
      console.error('Error fetching slide professor:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch slide professor',
      });
    }
  };
};
