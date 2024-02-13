import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../src/atoms/Tabs';
import { trpc } from '../../../utils';

import { CoursesProgressList } from './courses-progress-list';

export const DashboardTab = () => {
  const { data: courses } = trpc.user.courses.getProgress.useQuery();

  const completedCourses = courses?.filter(
    (course) => course.progress_percentage === 100,
  );

  const inProgressCourses = courses?.filter(
    (course) => course.progress_percentage !== 100,
  );

  return (
    <div className="space-y-8">
      <div className="text-lg font-medium">Let's check where you're at !</div>
      <Tabs defaultValue="inprogress" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="inprogress">Courses in progress</TabsTrigger>
          <TabsTrigger value="completed">Completed courses</TabsTrigger>
        </TabsList>
        <TabsContent value="inprogress">
          <CoursesProgressList courses={inProgressCourses} />
        </TabsContent>
        <TabsContent value="completed">
          <CoursesProgressList courses={completedCourses} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
