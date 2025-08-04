import type { ChapterTranslationData } from '@blms/types';

/**
 * Calculate slide index from slide parameter
 */
export const calculateSlideIndex = (slide: string | undefined): number => {
  const num = Number(slide);
  return Number.isNaN(num) || num <= 0 ? 0 : num - 1;
};

/**
 * Generate file base name for audio/PPTX resources (e.g. 1.2_0)
 */
export const generateFileBaseName = (
  data: ChapterTranslationData | null,
  slideIndex: number,
): string => {
  if (!data) return '';
  const partIdx = data.context.partIndex;
  const chapIdx = data.context.chapterIndex;
  const current = data.slides?.[slideIndex];
  if (!current) return '';
  const idx = current.slideNumber ? current.slideNumber - 1 : slideIndex;
  return `${partIdx}.${chapIdx}_${idx}`;
};

/**
 * Find slide index by ID in slides array
 */
export const findSlideIndexById = (slides: any[], slideId: string): number => {
  return slides.findIndex((slide) => slide.slideId === slideId);
};

/**
 * Find slide by ID in slides array
 */
export const findSlideById = (slides: any[], slideId: string) => {
  return slides.find((slide) => slide.slideId === slideId);
};

/**
 * Get original language from context with fallback
 */
export const getOriginalLanguage = (context: any): string => {
  return context.originalLanguage || 'en';
};

/**
 * Transform course language response to CourseLanguageInfo
 */
export const transformCourseLanguageInfo = (response: any) => ({
  id: response.id,
  index: response.index,
  name: response.name || 'Unknown Course',
  languages: response.languages.map((l: any) => ({
    code: l.code,
    name: l.name ?? '',
    translationStatus: l.translationStatus,
    assigneeId: l.assigneeId,
    assigneeUsername: l.assigneeUsername,
    assigneeDisplayName: l.assigneeDisplayName,
  })),
});

/**
 * Transform course details response to CourseDetails
 */
export const transformCourseDetails = (response: any) => ({
  id: response.id,
  index: response.index,
  courseName: response.courseName,
  translationStatus: response.translationStatus,
  assigneeDisplayName: response.assigneeDisplayName,
  progress: response.progress,
  totalChapters: response.totalChapters,
  completedChapters: response.completedChapters,
  parts: response.parts,
});
