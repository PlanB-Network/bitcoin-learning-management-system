import { useTranslation } from 'react-i18next';

export function useTranslationPanelLabels() {
  const { t } = useTranslation();

  return {
    currentContributor: t(
      'dashboard.adminPanel.translationPanel.courseDetails.currentContributor',
    ),
    noContributor: t(
      'dashboard.adminPanel.translationPanel.courseDetails.noContributor',
    ),
    language: t('dashboard.adminPanel.translationPanel.courseDetails.language'),
    progress: t('dashboard.adminPanel.translationPanel.courseDetails.progress'),
    chaptersCompleted: t(
      'dashboard.adminPanel.translationPanel.courseDetails.chaptersCompleted',
    ),
    chaptersAndProgress: t(
      'dashboard.adminPanel.translationPanel.courseDetails.chaptersAndProgress',
    ),
    noChapters: t(
      'dashboard.adminPanel.translationPanel.courseDetails.noChapters',
    ),
    partTitle: (index: number, title: string) =>
      t('dashboard.adminPanel.translationPanel.courseDetails.partTitle', {
        index,
        title,
      }),
    chapterIndex: t(
      'dashboard.adminPanel.translationPanel.courseDetails.chapterIndex',
    ),
    chapterTitle: t(
      'dashboard.adminPanel.translationPanel.courseDetails.chapterTitle',
    ),
    status: t('dashboard.adminPanel.translationPanel.courseDetails.status'),
    actions: t('dashboard.adminPanel.translationPanel.courseDetails.actions'),
    actionButtonText: t(
      'dashboard.adminPanel.translationPanel.userManagement.actions.viewDetails',
    ),
    courseNotFound: t('dashboard.adminPanel.translationPanel.courseNotFound'),
    errorLoadingDetails: t(
      'dashboard.adminPanel.translationPanel.courseDetails.errorLoadingDetails',
    ),
  };
}
