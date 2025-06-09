import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader, Tabs, TabsContent, TabsListUnderlined } from '@blms/ui';

import { AppContext } from '#src/providers/context.js';

import { useSmaller } from '#src/hooks/use-smaller.ts';
import { CourseDiplomas } from './-components/course-diplomas.tsx';
import { GlobalCertifications } from './-components/global-certifications.tsx';

export const Route = createFileRoute('/$lang/dashboard/_dashboard/credentials')(
  {
    component: DashboardCredentials,
  },
);

function DashboardCredentials() {
  const isMobile = useSmaller('md');
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { session } = useContext(AppContext);

  const [currentTab, setCurrentTab] = useState('certifications');

  const onTabChange = (value: string) => {
    setCurrentTab(value);
  };

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

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
          size={isMobile ? 's' : 'm'}
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
