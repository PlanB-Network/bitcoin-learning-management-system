import type { CourseChapter } from '../content/index.js';
import type { default as CourseCompletedChapter } from '../sql/users/CourseCompletedChapters.js';
import type { default as CourseProgress } from '../sql/users/CourseProgress.js';

export type { default as CoursePayment } from '../sql/users/CoursePayment.js';
export type { default as CourseProgress } from '../sql/users/CourseProgress.js';
export type { default as CourseCompletedChapter } from '../sql/users/CourseCompletedChapters.js';

export interface CourseProgressExtended extends CourseProgress {
  name: string;
  total_chapters: number;
  chapters: Array<
    Pick<CourseCompletedChapter, 'part' | 'chapter' | 'completed_at'>
  >;
  nextChapter: Pick<CourseChapter, 'part' | 'chapter'>;
  lastCompletedChapter: Pick<
    CourseCompletedChapter,
    'part' | 'chapter' | 'completed_at'
  >;
}
