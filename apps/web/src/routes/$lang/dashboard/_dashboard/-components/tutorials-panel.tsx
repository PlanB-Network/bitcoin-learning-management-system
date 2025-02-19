import { useTranslation } from 'react-i18next';

import { TextTag } from '@blms/ui';

import { useSmaller } from '#src/hooks/use-smaller.ts';

import { DashboardTutorialsTable } from './tutorials-table.tsx';

export const DashboardTutorialsPanel = ({
  professorId,
}: {
  professorId?: string;
}) => {
  const { t } = useTranslation();

  const isTablet = useSmaller('lg');

  return (
    <>
      <div className="flex max-lg:flex-col lg:items-center gap-2 lg:gap-5">
        <h1 className="display-small-32px">
          {professorId
            ? t('dashboard.teacher.tutorials.yourTutorials')
            : t('dashboard.adminPanel.tutorialsManagementPanel')}
        </h1>
        <TextTag
          size={isTablet ? 'verySmall' : 'small'}
          className="uppercase w-fit"
        >
          {professorId ? t('words.teacher') : t('words.admin')}
        </TextTag>
      </div>

      <div className="w-full max-w-[1070px]">
        <h2 className="mb-4 text-dashboardSectionTitle title-large-sb-24px">
          {t('dashboard.adminPanel.tutorialAnalytics')}
        </h2>
        <p className="text-dashboardSectionText/75 body-16px">
          {professorId
            ? t('dashboard.teacher.tutorials.tutorialAnalyticsDescription')
            : t('dashboard.adminPanel.tutorialAnalyticsDescription')}
        </p>

        <DashboardTutorialsTable professorId={professorId} />
      </div>
    </>
  );
};
