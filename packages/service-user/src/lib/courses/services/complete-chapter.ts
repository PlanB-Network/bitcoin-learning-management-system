import type { Dependencies } from '../../../dependencies.js';
import { completeChapterQuery } from '../queries/complete-chapter.js';

export const createCompleteChapter =
  (dependencies: Dependencies) =>
  async ({
    uid,
    courseId,
    chapterId,
  }: {
    uid: string;
    courseId: string;
    chapterId: string;
  }) => {
    const { postgres } = dependencies;

    return postgres.exec(completeChapterQuery(uid, courseId, chapterId));
  };
