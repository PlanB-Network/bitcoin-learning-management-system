import { Link } from '@tanstack/react-router';
import { t } from 'i18next';

import type { CourseProgressExtended } from '@blms/types';
import { cn } from '@blms/ui';

import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { addSpaceToCourseId } from '#src/utils/courses.js';

interface CoursesProgressListProps {
  courses?: CourseProgressExtended[];
  completed?: boolean;
  showViewDetails?: boolean;
}
interface ProgressBarProps {
  courseCompletedChapters: number;
  courseTotalChapters: number;
}

export const ProgressBar = ({
  courseCompletedChapters,
  courseTotalChapters,
}: ProgressBarProps) => {
  const filledRectangles = courseCompletedChapters;

  return (
    <>
      <div className="flex gap-0.5 max-md:hidden w-full max-w-[590px]">
        {Array.from({ length: courseTotalChapters }).map((_, index) => {
          const isFilled = index < filledRectangles;
          const isFirstRectangle = index === 0;
          const isLastRectangle = index === courseTotalChapters - 1;

          return (
            <div
              key={index}
              className={cn(
                'relative h-2 flex justify-end items-center',
                isFilled ? 'bg-darkOrange-5' : 'bg-darkOrange-1',
                isFirstRectangle && 'rounded-l',
                isLastRectangle && 'rounded-r',
              )}
              style={{ width: `${100 / courseTotalChapters}%` }}
            >
              {index === filledRectangles - 1 && (
                <img
                  src={OrangePill}
                  className={cn('absolute min-w-3 w-3 -right-1 z-10')}
                  alt="Orange Pill"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="w-full md:hidden relative h-2 bg-darkOrange-1 rounded flex items-center mb-7">
        <div
          className="bg-darkOrange-5 h-full rounded"
          style={{
            width: `${(courseCompletedChapters / courseTotalChapters) * 100}%`,
          }}
        />
        <img
          src={OrangePill}
          className={cn(
            'absolute z-10 aspect-auto min-w-3 w-3',
            courseCompletedChapters / courseTotalChapters > 1 && 'hidden',
          )}
          style={{
            left: `${(courseCompletedChapters / courseTotalChapters) * 100 - 2}%`,
          }}
          alt="Orange Pill"
        />
      </div>
    </>
  );
};

export const CoursesProgressList = ({
  courses,
  completed,
  showViewDetails,
}: CoursesProgressListProps) => (
  <section>
    <div className="flex flex-col gap-2.5 md:gap-4 mt-5 mb-2.5 md:my-10">
      <h2 className="mobile-h3 md:desktop-h6">
        {completed
          ? t('dashboard.myCourses.completedCoursesTitle')
          : t('dashboard.myCourses.inprogressCoursesTitle')}
      </h2>
      <h2 className="desktop-typo1 md:font-medium md:leading-relaxed md:font-poppins text-newBlack-4">
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
            className="border border-newGray-4 rounded-[1.25rem] md:p-1.5 xl:p-2.5 shadow-course-navigation"
          >
            <div className="flex max-md:flex-col md:items-center md:gap-4 p-2 md:p-3 xl:p-5">
              <div className="flex justify-between items-center w-full md:w-[105px] md:shrink-0 max-md:mb-5">
                <span className="max-md:mobile-subtitle1 md:text-xl uppercase">
                  {addSpaceToCourseId(course.courseId)}
                </span>
                <span className="mobile-subtitle1 text-darkOrange-5 md:hidden">
                  {course.progressPercentage}%
                </span>
              </div>

              <ProgressBar
                courseCompletedChapters={course.completedChaptersCount}
                courseTotalChapters={course.totalChapters}
              />
              <span className="text-xl font-medium text-darkOrange-5 leading-normal ml-auto w-[52px] shrink-0 text-end max-md:hidden">
                {course.progressPercentage}%
              </span>

              <div
                className={cn(
                  course.progressPercentage >= 100 && !showViewDetails
                    ? 'hidden'
                    : '',
                )}
              >
                <Link
                  to={
                    showViewDetails
                      ? '/dashboard/course/$courseId'
                      : '/courses/$courseId/$chapterId'
                  }
                  params={{
                    courseId: course.courseId,
                    chapterId: course.nextChapter?.chapterId as string,
                  }}
                >
                  <ButtonWithArrow variant="outline" size="s">
                    {showViewDetails
                      ? t('dashboard.myCourses.viewDetails')
                      : t('dashboard.myCourses.resumeLesson')}
                  </ButtonWithArrow>
                </Link>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="w-full">
          <Link to={'/courses'} className="text-darkOrange-5">
            {t('dashboard.myCourses.startCourse')}
          </Link>
          <span> {t('dashboard.myCourses.seeProgress')}</span>
        </div>
      )}
    </div>
  </section>
);
