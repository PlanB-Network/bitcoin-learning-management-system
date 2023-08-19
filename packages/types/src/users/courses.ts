import type { default as CourseProgress } from '../sql/users/CourseProgress';

export type { default as CourseProgress } from '../sql/users/CourseProgress';
export type { default as CourseCompletedChapters } from '../sql/users/CourseCompletedChapters';

export interface CourseProgressWithName extends CourseProgress {
  name: string;
}
