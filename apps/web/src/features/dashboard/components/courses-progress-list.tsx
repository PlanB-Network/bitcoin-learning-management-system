import { Link } from '@tanstack/react-router';
import { t } from 'i18next';

import { Button, cn } from '@sovereign-university/ui';

import OrangePill from '../../../assets/icons/orange_pill_color.svg';
import { addSpaceToCourseId } from '../../../utils/courses.ts';
import type { TRPCRouterOutput } from '../../../utils/trpc.tsx';

interface CoursesProgressListProps {
  courses?: NonNullable<TRPCRouterOutput['user']['courses']['getProgress']>;
  completed?: boolean;
}
interface ProgressBarProps {
  courseCompletedChapters: number;
  courseTotalChapters: number;
}

const ProgressBar = ({
  courseCompletedChapters,
  courseTotalChapters,
}: ProgressBarProps) => {
  const filledRectangles = courseCompletedChapters;

  return (
    <>
      <div className="flex gap-0.5 max-lg:hidden w-full max-w-[590px]">
        {Array.from({ length: courseTotalChapters }).map((_, index) => {
          const isFilled = index < filledRectangles;
          const isFirstRectangle = index === 0;
          const isLastRectangle = index === courseTotalChapters - 1;

          return (
            <div
              key={index}
              className={cn(
                'relative h-2',
                isFilled ? 'bg-darkOrange-5' : 'bg-darkOrange-1',
                isFirstRectangle && 'rounded-l',
                isLastRectangle && 'rounded-r',
              )}
              style={{ width: `${100 / courseTotalChapters}%` }}
            >
              {index === filledRectangles - 1 && (
                <img
                  src={OrangePill}
                  className={cn('absolute -top-3 -right-2  w-[13px] z-10')}
                  alt="Orange Pill"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="w-full lg:hidden relative h-2 bg-darkOrange-1">
        <div className="" />
      </div>
    </>
  );
};

export const CoursesProgressList = ({
  courses,
  completed,
}: CoursesProgressListProps) => (
  <section>
    <div className="flex flex-col gap-4 my-10">
      <h2 className="desktop-h6">
        {completed
          ? t('dashboard.myCourses.completedCoursesTitle')
          : t('dashboard.myCourses.inprogressCoursesTitle')}
      </h2>
      <h2 className="font-medium leading-relaxed font-poppins text-[rgba(5,10,20,0.75)]">
        {completed
          ? t('dashboard.myCourses.completedCoursesDescription')
          : t('dashboard.myCourses.inprogressCoursesDescription')}
      </h2>
    </div>
    <div className="flex flex-col gap-2.5 md:gap-6">
      {courses && courses.length > 0 ? (
        courses.map((course) => (
          <div
            key={course.courseId}
            className="border border-newGray-4 rounded-[1.25rem] p-1.5 xl:p-2.5 shadow-course-navigation"
          >
            <div className="flex items-center gap-4 p-3 xl:p-5">
              <span className="w-[105px] text-xl leading-snug uppercase shrink-0">
                {addSpaceToCourseId(course.courseId)}
              </span>

              <ProgressBar
                courseCompletedChapters={course.completedChaptersCount}
                courseTotalChapters={course.totalChapters}
              />
              <span className="text-xl font-medium text-darkOrange-5 leading-normal ml-auto">
                {course.progressPercentage}%
              </div>
            </div>
            <div className="relative flex h-2 w-full rounded-r-full">
              <div className="absolute h-2 w-full rounded-full bg-gray-700"></div>
              <div
                style={{ width: `${course.progressPercentage}%` }}
                className={`absolute h-2 rounded-l-full bg-darkOrange-5`}
              ></div>
              <img
                src={OrangePill}
                style={{ marginLeft: `${course.progressPercentage}%` }}
                className={compose('absolute top-[-12px] w-[14px]')}
                alt=""
              />
            </div>
          </div>
          {/* Only for courses in progress */}
          <div
            className={compose(
              'flex flex-row gap-2 pt-4 !m-0',
              course.progressPercentage === 100 ? 'hidden' : '',
            )}
          >
            <Link
              to={'/courses/$courseId/$chapterId'}
              params={{
                courseId: course.courseId,
                chapterId: course.nextChapter?.chapterId as string,
              }}
            >
              <Button variant="newPrimary" size="xs">
                {t('dashboard.myCourses.resumeLesson')}
              </Button>
            </Link>
            <Button variant="newPrimaryGhost" size="xs">
              {t('words.details')}
            </Button>
          </div>
          {/* Only for Completed course */}
          <div
            className={compose(
              'flex flex-row gap-2 pt-4 !m-0',
              course.progressPercentage === 100 ? '' : 'hidden',
            )}
          >
            <Button
              variant="newPrimaryGhost"
              size="xs"
              rounded
              className="px-3"
            >
              {t('words.details')}
            </Button>
          </div>
        </div>
      ))
    ) : (
      <div className="w-full py-6">
        <Link to={'/courses'} className="text-orange-600">
          Start a course
        </Link>
        <span> to see your progress here!</span>
      </div>
    )}
  </div>
);
