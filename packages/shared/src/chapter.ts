interface ChapterWithSpecialFlags {
  isSingleTrialExam: boolean;
  isCourseExam: boolean;
  isCourseConclusion: boolean;
  isCourseReview: boolean;
}

export function isSpecialChapter(chapter: ChapterWithSpecialFlags): boolean {
  return (
    chapter.isSingleTrialExam ||
    chapter.isCourseExam ||
    chapter.isCourseConclusion ||
    chapter.isCourseReview
  );
}
