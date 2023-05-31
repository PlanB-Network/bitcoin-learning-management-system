import type { default as CourseChapterLocalized } from '../sql/content/CourseChaptersLocalized';
import type { default as Course } from '../sql/content/Courses';
import type { default as CourseLocalized } from '../sql/content/CoursesLocalized';

export type { default as Course } from '../sql/content/Courses';
export type { default as CourseLocalized } from '../sql/content/CoursesLocalized';
export type { default as CourseChapterLocalized } from '../sql/content/CourseChaptersLocalized';

export type JoinedCourse = Pick<
  Course,
  'id' | 'hours' | 'teacher' | 'last_updated' | 'last_commit'
> &
  Pick<
    CourseLocalized,
    'language' | 'name' | 'goal' | 'objectives' | 'raw_description'
  > & {
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };

export type CourseChapter = Pick<
  CourseChapterLocalized,
  'chapter' | 'language' | 'title' | 'sections' | 'raw_content'
>;
