import type { CourseChapterResponse } from '@blms/types';

export function addSpaceToCourseIndex(courseIndex?: string | null) {
  if (!courseIndex) return '';

  return `${courseIndex.match(/\D+/)?.[0] || ''} ${
    courseIndex.match(/\d+/)?.[0] || ''
  }`;
}

export const BTC101ID = '2b7dc507-81e3-4b70-88e6-41ed44239966';

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
      courseId: chapter.course.id,
      chapterId: gotoChapter.chapterId,
      chapterName: gotoChapter.title,
    };
  }
  if (currentChapterPosition === allChapters.length - 1) {
    return { courseId: chapter.course.id };
  }

  const gotoChapter = allChapters[currentChapterPosition + 1];

  return {
    courseId: chapter.course.id,
    chapterId: gotoChapter.chapterId,
    chapterName: gotoChapter.title,
  };
};

export const COURSES_WITH_INLINE_LATEX_SUPPORT = ['btc204', 'cyp201', 'cyp302'];
