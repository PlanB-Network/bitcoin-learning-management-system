import type {
  CourseDetails,
  CourseLanguageInfo,
  CourseTranslationDetailsServiceResponse,
} from '@blms/types';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { CourseDetailsPage } from '#src/components/CourseDetails/course-details-page.tsx';
import { useTranslationPanelLabels } from '#src/hooks/use-translation-panel-labels.ts';
import { useTranslationPanelNavigation } from '#src/hooks/use-translation-panel-navigation.ts';
import {
  transformCourseDetails,
  transformCourseLanguageInfo,
} from '#src/utils/translation-panel.ts';
import { trpcClient } from '#src/utils/trpc.js';
import { TranslationPanelHeader } from '../-components/translation-panel-header.tsx';

const courseDetailsSearchSchema = z.object({
  language: z.string().optional(),
});

export const Route = createFileRoute(
  '/$lang/dashboard/administration/translation-panel/course/$courseId',
)({
  validateSearch: courseDetailsSearchSchema,
  component: CourseDetailsComponent,
});

function CourseDetailsComponent() {
  const { courseId } = Route.useParams();
  const { language = 'fr' } = Route.useSearch();
  const { t } = useTranslation();
  const { navigateToContentManagement, navigateToLanguage, navigateToChapter } =
    useTranslationPanelNavigation({ courseId, language });
  const labels = useTranslationPanelLabels();

  const queries = {
    getCourseLanguages: async (params: {
      id: string;
    }): Promise<CourseLanguageInfo> => {
      const response =
        await trpcClient.content.getCourseLanguages.query(params);
      return transformCourseLanguageInfo(response);
    },

    getCourseDetails: async (params: {
      id: string;
      language: string;
    }): Promise<CourseDetails> => {
      const response: CourseTranslationDetailsServiceResponse =
        await trpcClient.content.getCourseDetails.query(params);
      return transformCourseDetails(response);
    },
  };

  const options = {
    courseId,
    language,
  };

  const handleLanguageChange = (_: string, newLanguage: string) => {
    navigateToLanguage(newLanguage);
  };

  const handleChapterAction = (chapterId: string) => {
    navigateToChapter(chapterId);
  };

  const breadcrumbItems = [
    {
      label: t(
        'dashboard.adminPanel.translationPanel.contentManagement.actions.backToContentManagement',
      ),
      onClick: navigateToContentManagement,
    },
  ];

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
