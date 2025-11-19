import type { CourseChapterResponse } from '@blms/types';

export function addSpaceToCourseIndex(courseIndex?: string | null) {
  if (!courseIndex) return '';

  return `${courseIndex.match(/\D+/)?.[0] || ''} ${
    courseIndex.match(/\d+/)?.[0] || ''
  }`;
}

export const EXAM_QUESTION_DURATION_SECONDS = 30;

export const goToChapterParameters = (
  chapter: CourseChapterResponse,
  type: 'previous' | 'next',
) => {
  const allChapters = chapter.course.parts.flatMap((part) => part.chapters);

  const currentChapterPosition = allChapters.findIndex(
    (chap) => chap.chapterId === chapter.chapterId,
  );

  if (type === 'previous') {
    if (currentChapterPosition < 1) {
      return { courseId: chapter.course.id };
    }

    const gotoChapter = allChapters[currentChapterPosition - 1];
    return {
      chapterId: gotoChapter.chapterId,
      chapterName: gotoChapter.title,
      courseId: chapter.course.id,
    };
  }
  if (currentChapterPosition === allChapters.length - 1) {
    return { courseId: chapter.course.id };
  }

  const gotoChapter = allChapters[currentChapterPosition + 1];

  return {
    chapterId: gotoChapter.chapterId,
    chapterName: gotoChapter.title,
    courseId: chapter.course.id,
  };
};

export const COURSES_WITH_INLINE_LATEX_SUPPORT = [
  '65c138b0-4161-4958-bbe3-c12916bc959c',
  '46b0ced2-9028-4a61-8fbc-3b005ee8d70f',
  'd2fd9fc0-d9ed-4a87-9fa3-0fdbb3937e28',
];
