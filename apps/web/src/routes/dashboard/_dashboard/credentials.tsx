import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Tabs, TabsContent } from '@blms/ui';

import { TabsListUnderlined } from '#src/components/Tabs/TabsListUnderlined.js';
import { AppContext } from '#src/providers/context.js';

import { CourseDiplomas } from './-components/course-diplomas.tsx';
import { GlobalCertifications } from './-components/global-certifications.tsx';

export const Route = createFileRoute('/dashboard/_dashboard/credentials')({
  component: DashboardCredentials,
});

function DashboardCredentials() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }

  const [currentTab, setCurrentTab] = useState('certifications');

  const onTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <div className="text-2xl">{t('words.credentials')}</div>
      <Tabs
        value={currentTab}
        onValueChange={onTabChange}
        className="max-w-[1100px]"
      >
        <TabsListUnderlined
          tabs={[
            {
              key: 'certifications',
              value: 'certifications',
              text: t('dashboard.credentials.globalCertifications'),
              active: 'certifications' === currentTab,
            },
            {
              key: 'diplomas',
              value: 'diplomas',
              text: t('dashboard.credentials.courseDiplomas'),
              active: 'diplomas' === currentTab,
            },
          ]}
        />
        <TabsContent value="certifications">
          <GlobalCertifications />
        </TabsContent>
        <TabsContent value="diplomas">
          <CourseDiplomas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
