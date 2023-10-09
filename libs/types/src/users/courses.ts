import type { default as CourseCompletedChapter } from '../sql/users/CourseCompletedChapters';
import type { default as CourseProgress } from '../sql/users/CourseProgress';

export type { default as CourseProgress } from '../sql/users/CourseProgress';
export type { default as CourseCompletedChapter } from '../sql/users/CourseCompletedChapters';

export interface CourseProgressExtended extends CourseProgress {
  name: string;
  total_chapters: number;
  chapters: Pick<CourseCompletedChapter, 'chapter' | 'completed_at'>[];
  lastCompletedChapter: Pick<
    CourseCompletedChapter,
    'chapter' | 'completed_at'
  >;
}
