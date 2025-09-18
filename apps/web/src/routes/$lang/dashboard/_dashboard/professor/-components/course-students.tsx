import type { JoinedCourse } from '@blms/types';
import { useTranslation } from 'react-i18next';
import { CourseStudentsTable } from './course-students-table.tsx';

export const CourseStudentsList = ({ course }: { course: JoinedCourse }) => {
  const { t } = useTranslation();

  return (
    <>
      <h1 className="display-base md:display-large mt-6">
        {t('dashboard.teacher.courses.studentsList')}
      </h1>

      <div className="w-full max-w-[1070px]">
        <CourseStudentsTable course={course} />
      </div>
    </>
  );
};
