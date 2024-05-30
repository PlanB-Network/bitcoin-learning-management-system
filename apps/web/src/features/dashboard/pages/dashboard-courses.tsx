import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../src/atoms/Tabs/index.tsx';
import { trpc } from '../../../utils/index.ts';
import { CoursesProgressList } from '../components/courses-progress-list.tsx';
import { DashboardLayout } from '../layout.tsx';

export const DashboardCourses = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { data: session } = trpc.user.getSession.useQuery();
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
    <DashboardLayout>
      <div className="flex flex-col gap-8">
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
    </DashboardLayout>
  );
};
