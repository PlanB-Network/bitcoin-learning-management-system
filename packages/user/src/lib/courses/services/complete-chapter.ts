import type { Dependencies } from '../../../dependencies.js';
import { completeChapterQuery } from '../queries/index.js';

export const createCompleteChapter =
  (dependencies: Dependencies) =>
  async ({
    uid,
    courseId,
    chapterId,
    part,
    chapter,
  }: {
    uid: string;
    courseId: string;
    chapterId: string;
    part: number;
    chapter: number;
  }) => {
    const { postgres } = dependencies;

    return postgres.exec(
      completeChapterQuery(uid, courseId, chapterId, part, chapter),
    );
  };
