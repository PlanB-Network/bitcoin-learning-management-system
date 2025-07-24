import { sql } from '@blms/database';
import type { Dependencies } from '../../dependencies.js';
import { getCourseProfessorsQuery } from '../queries/get-course-professors.js';

export interface CourseProfessor {
  id: string;
  name: string;
  isCoordinator: boolean;
}

/**
 * Service to get professor information for a course (voice matching)
 */
export const createGetCourseProfessors = ({ postgres }: Dependencies) => {
  return async (courseId: string): Promise<CourseProfessor[]> => {
    try {
      const professors = await postgres.exec(
        getCourseProfessorsQuery(courseId),
      );
      return professors as CourseProfessor[];
    } catch (error) {
      console.warn(`Failed to fetch professors for course ${courseId}:`, error);
      return [];
    }
  };
};

/**
 * Service to update audio generation status for a slide
 */
export const createUpdateSlideAudioStatus = ({ postgres }: Dependencies) => {
  return async (
    courseId: string,
    language: string,
    partId: string,
    chapterId: string,
    slideId: string,
    audioPath: string,
    audioTries?: number,
  ): Promise<void> => {
    await postgres.exec(sql`
      UPDATE content.course_translation_slides
      SET
        audio_resource_path = ${audioPath},
        audio_tries = COALESCE(${audioTries}, audio_tries + 1),
        audio_validated = true,
        updated_at = NOW()
      WHERE course_id = ${courseId}
        AND language = LOWER(${language})
        AND part_id = ${partId}
        AND chapter_id = ${chapterId}
        AND slide_id = ${slideId}
    `);
  };
};
