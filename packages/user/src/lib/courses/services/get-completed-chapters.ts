import type { Dependencies } from '../../../dependencies.js';
import { completeChapterQuery } from '../queries/index.js';

export const createCompleteChapter =
  (dependencies: Dependencies) =>
  async ({
    uid,
    courseId,
    part,
    chapter,
  }: {
    uid: string;
    courseId: string;
    part: number;
    chapter: number;
  }) => {
    const { postgres } = dependencies;

    return postgres.exec(completeChapterQuery(uid, courseId, part, chapter));
  };
