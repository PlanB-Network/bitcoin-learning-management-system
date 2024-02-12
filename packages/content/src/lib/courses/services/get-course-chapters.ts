import { Dependencies } from '../../dependencies.js';
import { getCourseChaptersQuery } from '../queries/index.js';

export const createGetCourseChapters =
  (dependencies: Dependencies) =>
  async (courseId: string, language?: string) => {
    const { postgres } = dependencies;

    const chapters = await postgres.exec(
      getCourseChaptersQuery({ courseId, language }),
    );

    return chapters;
  };
