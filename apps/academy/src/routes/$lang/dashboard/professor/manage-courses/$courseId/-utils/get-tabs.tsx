import type { JoinedCourse } from '@blms/types';
import type { Tab } from '#src/components/ui/secondary-navbar.tsx';

export const getTabs = (courseId: string, courses: JoinedCourse[]): Tab[] => {
  if (!courses) {
    return [];
  }

  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return [];
  }

  return [
    {
      id: 'overview',
      label: 'dashboard.teacher.courses.overview',
      href: `/dashboard/professor/manage-courses/${courseId}/overview`,
    },
    {
      id: 'students',
      label: 'words.students',
      href: `/dashboard/professor/manage-courses/${courseId}/students`,
    },
    {
      id: 'review',
      label: 'dashboard.teacher.courses.reviews',
      href: `/dashboard/professor/manage-courses/${courseId}/review`,
    },
    ...(course.teachingFormat === 'professor_led'
      ? [
          {
            id: 'announcement',
            label: 'dashboard.teacher.courses.announcements',
            href: `/dashboard/professor/manage-courses/${courseId}/announcement`,
          },
        ]
      : []),
    ...(course.hasAssignment
      ? [
          {
            id: 'assignment',
            label: 'dashboard.teacher.courses.assignment',
            href: `/dashboard/professor/manage-courses/${courseId}/assignment`,
          },
        ]
      : []),
    {
      id: 'examResults',
      label: 'courses.exam.examResults',
      href: `/dashboard/professor/manage-courses/${courseId}/results`,
    },
    ...(course.requiresPayment
      ? [
          {
            id: 'discount',
            label: 'dashboard.adminPanel.discountCodes',
            href: `/dashboard/professor/manage-courses/${courseId}/discount`,
          },
        ]
      : []),
    {
      id: 'details',
      label: 'dashboard.teacher.courses.courseDetails',
      href: `/dashboard/professor/manage-courses/${courseId}/details`,
    },
  ];
};
