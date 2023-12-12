import type { default as CourseChapterLocalized } from '../sql/content/CourseChaptersLocalized';
import type { default as CoursePartLocalized } from '../sql/content/CoursePartsLocalized';
import type { default as Course } from '../sql/content/Courses';
import type { default as CourseLocalized } from '../sql/content/CoursesLocalized';

export type { default as Course } from '../sql/content/Courses';
export type { default as CourseLocalized } from '../sql/content/CoursesLocalized';
export type { default as CoursePartLocalized } from '../sql/content/CoursePartsLocalized';
export type { default as CourseChapter } from '../sql/content/CourseChapters';
export type { default as CourseChapterLocalized } from '../sql/content/CourseChaptersLocalized';

export type JoinedCourse = Pick<
  Course,
  'id' | 'hours' | 'last_updated' | 'last_commit'
> &
  Pick<
    CourseLocalized,
    'language' | 'name' | 'goal' | 'objectives' | 'raw_description'
  > & {
    level: 'beginner' | 'intermediate' | 'advanced' | 'developer';
    professors: string[];
  };

export type CoursePart = Pick<
  CoursePartLocalized,
  'part' | 'language' | 'title'
>;

export type JoinedCourseChapter = Pick<
  CourseChapterLocalized,
  'part' | 'chapter' | 'language' | 'title' | 'sections' | 'raw_content'
> & { part_title: string };
