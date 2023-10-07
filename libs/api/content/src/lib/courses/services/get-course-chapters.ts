import { Dependencies } from '../../dependencies';
import { getCourseChaptersQuery } from '../queries';

export const createGetCourseChapters =
  (dependencies: Dependencies) =>
  async (courseId: string, language?: string) => {
    const { postgres } = dependencies;

    const chapters = await postgres.exec(
      getCourseChaptersQuery(courseId, language),
    );

    return chapters;
  };
