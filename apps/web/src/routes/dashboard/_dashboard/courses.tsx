import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Tabs, TabsContent } from '@blms/ui';

import { TabsListUnderlined } from '#src/components/Tabs/TabsListUnderlined.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

import { CoursesProgressList } from './-components/courses-progress-list.tsx';

export const Route = createFileRoute('/dashboard/_dashboard/courses')({
  component: DashboardCourses,
});

function DashboardCourses() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }
  const { data: courses } = trpc.user.courses.getProgress.useQuery();

  const completedCourses = courses?.filter(
    (course) => course.progressPercentage === 100,
  );

  const inProgressCourses = courses?.filter(
    (course) => course.progressPercentage !== 100,
  );

  const [currentTab, setCurrentTab] = useState('inprogress');

  const onTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <div className="text-2xl">{t('dashboard.courses')}</div>
      <Tabs
        defaultValue="inprogress"
        value={currentTab}
        onValueChange={onTabChange}
        className="max-w-6xl"
      >
        <TabsListUnderlined
          tabs={[
            {
              key: 'inprogress',
              value: 'inprogress',
              text: t('dashboard.myCourses.inprogress'),
              active: 'inprogress' === currentTab,
            },
            {
              key: 'completed',
              value: 'completed',
              text: t('dashboard.myCourses.completed'),
              active: 'completed' === currentTab,
            },
          ]}
        />
        <TabsContent value="inprogress">
          <CoursesProgressList courses={inProgressCourses} showViewDetails />
        </TabsContent>
        <TabsContent value="completed">
          <CoursesProgressList
            courses={completedCourses}
            completed
            showViewDetails
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
