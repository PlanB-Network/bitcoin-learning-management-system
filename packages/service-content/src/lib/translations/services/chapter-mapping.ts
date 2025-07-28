import { TRPCError } from '@trpc/server';
import type { Dependencies } from '../../dependencies.js';
import { getPartAndChapterIdsQuery } from '../queries/chapter-mapping.js';

export const createGetPartAndChapterIds = ({ postgres }: Dependencies) => {
  return async (
    courseId: string,
    partIndex: number,
    chapterIndex: number,
  ): Promise<{ partId: string; chapterId: string }> => {
    const result = await postgres.exec(
      getPartAndChapterIdsQuery(courseId, partIndex, chapterIndex),
    );

    if (result.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid mapping for part ${partIndex} and chapter ${chapterIndex}`,
      });
    }

    return result[0];
  };
};
