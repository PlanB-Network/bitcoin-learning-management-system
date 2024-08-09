import type { TRPCRouterOutput } from './trpc.ts';

export function addSpaceToCourseId(courseId?: string) {
  if (!courseId) return '';

  return `${courseId.match(/\D+/)?.[0] || ''} ${
    courseId.match(/\d+/)?.[0] || ''
  }`;
}

type Chapter = NonNullable<TRPCRouterOutput['content']['getCourseChapter']>;

export const goToChapterParameters = (
  chapter: Chapter,
  type: 'previous' | 'next',
) => {
  const allChapters = chapter.course.parts.flatMap((part) => part.chapters);

  const currentChapterPosition = allChapters.findIndex(
    (chap) => chap.chapterId === chapter.chapterId,
  );

  if (type === 'previous') {
    if (currentChapterPosition < 1) {
      return { courseId: chapter.course.id };
    } else {
      const gotoChapter = allChapters[currentChapterPosition - 1];
      return {
        courseId: chapter.course.id,
        chapterId: gotoChapter.chapterId,
        chapterName: gotoChapter.title,
      };
    }
  } else {
    if (currentChapterPosition === allChapters.length - 1) {
      return { courseId: chapter.course.id };
    }
    const gotoChapter = allChapters[currentChapterPosition + 1];
    return {
      courseId: chapter.course.id,
      chapterId: gotoChapter.chapterId,
      chapterName: gotoChapter.title,
    };
  }
};
