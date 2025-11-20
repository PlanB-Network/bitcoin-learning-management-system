import type { CourseProgressExtended, CourseResponse } from '@blms/types';
import type { Tab } from '#src/components/ui/secondary-navbar.tsx';

export const getTabs = (
  course: CourseResponse,
  courseProgress: CourseProgressExtended | undefined,
): Tab[] => {
  if (!course) return [];

  const courseId = course.id;

  const nextChapterId = courseProgress?.nextChapter?.chapterId ?? null;
  const nextChapterHref = nextChapterId
    ? `/courses/${courseId}/${nextChapterId}`
    : `/courses/${courseId}/${course?.parts[0].chapters[0].chapterId}`;

  const isSelectedForSummerSchool =
    courseProgress?.isSelectedForFinalLesson ?? false;

  const reviewChapterId =
    course.parts
      .flatMap((part) => part.chapters)
      ?.find((c) => c?.isCourseReview)?.chapterId ?? null;

  const courseHaveRetakeExam = course.parts.some((p) =>
    p.chapters.some((c) => c?.isCourseExam),
  );

  const courseHaveSingleTrialExamOrAssignment =
    course.parts.some((p) => p.chapters.some((c) => c?.isSingleTrialExam)) ||
    course.hasAssignment;

  const courseHaveAssignments = course.hasAssignment;

  const isBizSchool =
    courseId === 'c762773a-9017-4129-bc0e-06adf86050ef' ||
    courseId === '576ac496-a4fd-471a-b022-e0da1ab89a29';

  const tabs: Tab[] = [
    {
      id: 'courseChapter',
      label: 'words.course',
      href: nextChapterHref,
      onlyForLoggedIn: false,
    },
    {
      id: 'syllabus',
      label: 'words.syllabus',
      href: `/courses/${courseId}/syllabus`,
      onlyForLoggedIn: false,
    },
  ];

  if (courseHaveRetakeExam) {
    tabs.push({
      id: 'retakeExam',
      label: 'courses.exam.scoreAndDiploma',
      href: `/courses/${courseId}/retake-exam`,
      onlyForLoggedIn: true,
    });
  }

  if (courseHaveSingleTrialExamOrAssignment) {
    tabs.push({
      id: 'singleTrialExam',
      label: 'courses.exam.scoreAndDiploma',
      href: `/courses/${courseId}/single-trial-exam`,
      onlyForLoggedIn: true,
    });
  }

  if (courseHaveAssignments) {
    tabs.push({
      id: 'assignment',
      label: 'dashboard.course.assignment',
      href: `/courses/${courseId}/assignment`,
    });
  }

  if (isBizSchool && isSelectedForSummerSchool) {
    tabs.push({
      id: 'summerSchool',
      label: 'dashboard.course.summerSchool',
      href: `/courses/${courseId}/summer-school`,
      onlyForLoggedIn: true,
    });
  }

  if (reviewChapterId) {
    tabs.push({
      id: 'ratings',
      label: 'words.ratings',
      href: `/courses/${courseId}/ratings`,
      onlyForLoggedIn: true,
    });
  }

  return tabs;
};
