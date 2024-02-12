import type { default as CourseChapterLocalized } from '../sql/content/CourseChaptersLocalized.js';
import type { default as CoursePartLocalized } from '../sql/content/CoursePartsLocalized.js';
import type { default as Course } from '../sql/content/Courses.js';
import type { default as CourseLocalized } from '../sql/content/CoursesLocalized.js';

export type { default as Course } from '../sql/content/Courses.js';
export type { default as CourseLocalized } from '../sql/content/CoursesLocalized.js';
export type { default as CoursePartLocalized } from '../sql/content/CoursePartsLocalized.js';
export type { default as CourseChapter } from '../sql/content/CourseChapters.js';
export type { default as CourseChapterLocalized } from '../sql/content/CourseChaptersLocalized.js';

export type JoinedCourse = Pick<
  Course,
  | 'id'
  | 'hours'
  | 'requires_payment'
  | 'paid_price_euros'
  | 'paid_description'
  | 'paid_video_link'
  | 'paid_start_date'
  | 'paid_end_date'
  | 'last_updated'
  | 'last_commit'
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
