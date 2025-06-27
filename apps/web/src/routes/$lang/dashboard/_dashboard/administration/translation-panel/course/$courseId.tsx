import { CourseDetailsPage } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { CourseDetails, CourseInfo } from '@blms/types';
import { trpcClient } from '#src/utils/trpc.js';
import { TranslationPanelHeader } from '../-components/translation-panel-header.tsx';

const courseDetailsSearchSchema = z.object({
  language: z.string().optional(),
});

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/translation-panel/course/$courseId',
)({
  validateSearch: courseDetailsSearchSchema,
  component: CourseDetailsComponent,
});

function CourseDetailsComponent() {
  const { courseId } = Route.useParams();
  const { language = 'fr' } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const queries = {
    getCourseLanguages: async (params: {
      courseId: string;
    }): Promise<CourseInfo> => {
      const response: any =
        await trpcClient.content.getCourseLanguages.query(params);
      return {
        courseId: response.id || response.courseId,
        courseIndex: response.index || response.courseIndex,
        courseName: response.courseName,
        languages: response.languages,
      } as CourseInfo;
    },
    getCourseDetails: async (params: {
      courseId: string;
      language: string;
    }): Promise<CourseDetails> => {
      const response: any =
        await trpcClient.content.getCourseDetails.query(params);
      return {
        id: response.id,
        courseIndex: response.courseIndex,
        courseName: response.courseName,
        translationStatus: response.translationStatus,
        assigneeDisplayName: response.assigneeDisplayName,
        progress: response.progress,
        totalChapters: response.totalChapters,
        completedChapters: response.completedChapters,
        parts: response.parts,
      } as CourseDetails;
    },
  };

  const options = {
    courseId,
    language,
  };

  const handleLanguageChange = (courseId: string, newLanguage: string) => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel/course/$courseId',
      params: { courseId },
      search: { language: newLanguage },
    });
  };

  const handleChapterAction = (chapterId: string) => {
    console.log('View chapter details:', chapterId);
    // TODO: Implement navigation to chapter details
  };

  // Navigation breadcrumb
  const handleBackToContentManagement = () => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel',
      search: { tab: 'content' },
    });
  };

  const breadcrumbItems = [
    {
      label: t(
        'dashboard.adminPanel.translationPanel.contentManagement.actions.backToContentManagement',
      ),
      onClick: handleBackToContentManagement,
    },
  ];

  const labels = {
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

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <TranslationPanelHeader activeTab="content" showTabs={false}>
        <CourseDetailsPage
          options={options}
          queries={queries}
          onLanguageChange={handleLanguageChange}
          onChapterAction={handleChapterAction}
          breadcrumbItems={breadcrumbItems}
          labels={labels}
          t={t}
        />
      </TranslationPanelHeader>
    </div>
  );
}
