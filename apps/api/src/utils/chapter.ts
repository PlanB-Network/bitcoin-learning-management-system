import type { JoinedCourseChapter } from '@blms/types';

export function isSpecialChapter(chapter: JoinedCourseChapter) {
  return (
    chapter.isSingleTrialExam ||
    chapter.isCourseExam ||
    chapter.isCourseConclusion ||
    chapter.isCourseReview
  );
}
