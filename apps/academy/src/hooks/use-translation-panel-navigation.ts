import { useNavigate } from '@tanstack/react-router';

interface UseTranslationPanelNavigationOptions {
  courseId?: string;
  language?: string;
}

export function useTranslationPanelNavigation({
  courseId,
  language,
}: UseTranslationPanelNavigationOptions = {}) {
  const navigate = useNavigate();

  const navigateToMain = (tab?: string) => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel',
      search: tab ? { tab } : undefined,
    });
  };

  const navigateToContentManagement = () => navigateToMain('content');

  const navigateToCourse = (targetCourseId: string, targetLanguage: string) => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel/course/$courseId',
      params: { courseId: targetCourseId },
      search: { language: targetLanguage },
    });
  };

  const navigateToLanguage = (newLanguage: string) => {
    if (!courseId)
      throw new Error('courseId is required for navigateToLanguage');
    navigateToCourse(courseId, newLanguage);
  };

  const navigateToChapter = (chapterId: string, slide?: number) => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel/chapter/$chapterId',
      params: { chapterId },
      search: {
        courseId: courseId!,
        language: language!,
        ...(slide && { slide }),
      },
    });
  };

  const navigateToComparison = (
    slideId: string,
    partId: string,
    chapterId: string,
  ) => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel/compare/$slideId',
      params: { slideId },
      search: {
        courseId: courseId!,
        language: language!,
        chapterId,
        partId,
      },
    });
  };

  return {
    navigateToMain,
    navigateToContentManagement,
    navigateToCourse,
    navigateToLanguage,
    navigateToChapter,
    navigateToComparison,
  };
}
