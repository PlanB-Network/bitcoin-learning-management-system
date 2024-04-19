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
        <Tabs defaultValue="inprogress" className="max-w-[800px]">
          <TabsList>
            <TabsTrigger value="inprogress" variant="light">
              {t('dashboard.myCourses.inprogress')}
            </TabsTrigger>
            <TabsTrigger value="completed" variant="light">
              {t('dashboard.myCourses.completed')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="inprogress">
            <CoursesProgressList courses={inProgressCourses} />
          </TabsContent>
          <TabsContent value="completed">
            <CoursesProgressList courses={completedCourses} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};
