import { CourseChapter } from '../content';
import type { default as CourseCompletedChapter } from '../sql/users/CourseCompletedChapters';
import type { default as CourseProgress } from '../sql/users/CourseProgress';

export type { default as CoursePayment } from '../sql/users/CoursePayment';
export type { default as CourseProgress } from '../sql/users/CourseProgress';
export type { default as CourseCompletedChapter } from '../sql/users/CourseCompletedChapters';

export interface CourseProgressExtended extends CourseProgress {
  name: string;
  total_chapters: number;
  chapters: Pick<CourseCompletedChapter, 'part' | 'chapter' | 'completed_at'>[];
  nextChapter: Pick<CourseChapter, 'part' | 'chapter'>;
  lastCompletedChapter: Pick<
    CourseCompletedChapter,
    'part' | 'chapter' | 'completed_at'
  >;
}
