import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../src/atoms/Tabs';
import { trpc } from '../../../utils';
import { CoursesProgressList } from '../components/courses-progress-list';
import { DashboardLayout } from '../layout';

export const DashboardCourses = () => {
  const { data: courses } = trpc.user.courses.getProgress.useQuery();

  const completedCourses = courses?.filter(
    (course) => course.progress_percentage === 100,
  );

  const inProgressCourses = courses?.filter(
    (course) => course.progress_percentage !== 100,
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="text-lg font-medium">Let's check where you're at !</div>
        <Tabs defaultValue="inprogress" className="max-w-[800px]">
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
    </DashboardLayout>
  );
};
