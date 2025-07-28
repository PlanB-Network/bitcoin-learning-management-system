import type { Dependencies } from '../../dependencies.js';
import { getCoursesWithTodoTranslationsQuery } from '../queries/get-courses-with-todo-translations.js';

export interface CourseWithTodoTranslations {
  id: string;
  index: string;
  courseName: string;
  todoLanguages: string[];
  totalLanguages: number;
  originalLanguage: string;
}

/**
 * Service to get all courses that have translations with 'todo' status
 */
export const createGetCoursesWithTodoTranslations = ({
  postgres,
}: Dependencies) => {
  return async (): Promise<CourseWithTodoTranslations[]> => {
    const results = await postgres.exec(getCoursesWithTodoTranslationsQuery());

    return results.map((row) => ({
      id: row.courseId,
      index: row.courseIndex,
      courseName: row.courseName,
      originalLanguage: row.originalLanguage,
      todoLanguages: row.todoLanguages || [],
      totalLanguages: row.totalLanguages || 0,
    }));
  };
};
