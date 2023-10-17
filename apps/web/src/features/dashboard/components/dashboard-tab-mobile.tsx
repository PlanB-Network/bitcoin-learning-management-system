import { trpc } from '../../../utils';

import { CoursesProgressList } from './courses-progress-list';

const CoursesSectionTitle = ({ children }: { children: string }) => (
  <div className="px-2 text-center text-lg font-medium uppercase text-blue-800">
    {children}
  </div>
);

const CoursesSection = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) => <div className="flex w-full flex-col space-y-2">{children}</div>;

export const DashboardTabMobile = () => {
  const { data: progress } = trpc.user.courses.getProgress.useQuery();

  const completedCourses = progress?.filter(
    (course) => course.progress_percentage === 100,
  );

  const inProgressCourses = progress?.filter(
    (course) => course.progress_percentage !== 100,
  );

  return (
    <div className="space-y-8">
      <CoursesSection>
        <CoursesSectionTitle>Courses in progress</CoursesSectionTitle>
        <CoursesProgressList courses={inProgressCourses} />
      </CoursesSection>
      <CoursesSection>
        <CoursesSectionTitle>Completed courses</CoursesSectionTitle>
        <CoursesProgressList courses={completedCourses} />
      </CoursesSection>
    </div>
  );
};
