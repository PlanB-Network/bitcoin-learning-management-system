import { Dependencies } from '../../../dependencies';
import { completeChapterQuery } from '../queries';

export const createCompleteChapter =
  (dependencies: Dependencies) =>
  async ({
    uid,
    courseId,
    chapter,
  }: {
    uid: string;
    courseId: string;
    chapter: number;
  }) => {
    const { postgres } = dependencies;

    return postgres.exec(completeChapterQuery(uid, courseId, chapter));
  };
