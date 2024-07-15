import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../atoms/Tabs/index.tsx';

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

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <div className="text-2xl">{t('dashboard.courses')}</div>
      <Tabs defaultValue="inprogress" className="max-w-6xl">
        <TabsList>
          <TabsTrigger
            value="inprogress"
            className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
          >
            {t('dashboard.myCourses.inprogress')}
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
          >
            {t('dashboard.myCourses.completed')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inprogress">
          <CoursesProgressList courses={inProgressCourses} />
        </TabsContent>
        <TabsContent value="completed">
          <CoursesProgressList courses={completedCourses} completed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
