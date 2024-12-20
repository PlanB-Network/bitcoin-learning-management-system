import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import type { CourseProgressExtended, JoinedCourse } from '@blms/types';
import { Progress, TextTag } from '@blms/ui';

import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import { useGreater } from '#src/hooks/use-greater.ts';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { assetUrl } from '#src/utils/index.ts';

export const CourseDashboardCard = ({
  course,
  progress,
}: {
  course: JoinedCourse;
  progress: CourseProgressExtended | null;
}) => {
  const isScreenLg = useGreater('2xl');

  const { t } = useTranslation();
  const isInProgress =
    progress &&
    progress.progressPercentage >= 0 &&
    progress.progressPercentage < 100;

  const renderStartButton = !progress;
  const renderCompletionButton =
    progress && progress.progressPercentage === 100;

  const getStatusStyles = (progress: CourseProgressExtended | null) => {
    if (!progress)
      return {
        text: t('dashboard.myCourses.notStarted'),
        bgColor: 'bg-newGray-5',
      };

    const { progressPercentage } = progress;
    if (progressPercentage === 100) {
      return {
        text: t('dashboard.myCourses.completed'),
        bgColor: 'bg-brightGreen-4',
      };
    }
    if (progressPercentage > 0 || progressPercentage === 0) {
      return {
        text: t('dashboard.myCourses.inprogress'),
        bgColor: 'bg-darkOrange-4',
      };
    }
    return {
      text: t('dashboard.myCourses.notStarted'),
      bgColor: 'bg-newGray-5',
    };
  };

  const { text, bgColor } = getStatusStyles(progress);
  const beginnerFriendlyCourses = new Set(['btc101', 'btc102', 'scu101']);

  return (
    <article className="flex flex-row md:max-h-[242px] 2xl:max-h-[697px] size-full 2xl:flex-col rounded-[10px] border border-black">
      <span
        className={`p-[5px] md:p-[15px] title-small-med-16px md:display-small-bold-caps-22px uppercase text-black max-2xl:[writing-mode:vertical-rl] max-2xl:[transform:rotate(180deg)] max-2xl:border-l 2xl:border-b max-2xl:rounded-r-[10px] 2xl:rounded-t-[10px] border-black text-center text-sm ${bgColor}`}
      >
        {text}
      </span>
      <div className="flex flex-col justify-between w-full max-md:items-start pt-[5px] md:p-2.5 2xl:pb-[30px] px-2.5 pb-2.5 gap-2 md:gap-4">
        <div className="flex flex-row 2xl:flex-col 2xl:gap-2 max-xl:items-center justify-between">
          <div className="flex gap-2 max-2xl:order-2 max-md:hidden">
            <TextTag size={'verySmall'} variant="grey" className="uppercase">
              {course.id}
            </TextTag>
            <TextTag size={'verySmall'} variant="orange" className="uppercase">
              {course.requiresPayment
                ? t('courses.details.paidCourse')
                : t('words.free')}
            </TextTag>
            <TextTag size={'verySmall'} className="uppercase">
              {t(`words.${course.format}`)}
            </TextTag>
            {beginnerFriendlyCourses.has(course.id) && (
              <TextTag size={'verySmall'} variant="green" className="uppercase">
                {t('words.level.beginner')}
              </TextTag>
            )}
          </div>

          <div className="flex text-start title-small-med-16px md:title-medium-sb-18px max-xl:order-1">
            <span className="line-clamp-2 md:line-clamp-1 2xl:line-clamp-2">
              {course.name}
            </span>
          </div>
        </div>
        <div className=" w-full flex flex-row 2xl:flex-col gap-4">
          <img
            src={assetUrl(`courses/${course.id}`, 'thumbnail.webp')}
            alt={course.name}
            className="max-md:hidden rounded-md object-cover [overflow-clip-margin:_unset] object-center max-h-[183px] max-w-[255px]"
          />
          <div className="flex flex-col gap-2 md:gap-3 2xl:gap-4 w-full">
            {!isInProgress && (
              <div className="flex flex-col md:gap-2.5">
                <div className="flex items-center md:justify-between gap-1">
                  <span className="body-14px shrink-0 md:mr-2 font-normal text-newBlack-4 md:body-16px">
                    {t('dashboard.myCourses.professor')} {''}
                  </span>
                  <span className="body-14px font-normal text-newBlack-4  line-clamp-1 md:text-black md:label-medium-med-16px">
                    {course.professors
                      .map((professor) => professor.name)
                      .join(', ')}
                  </span>
                </div>

                <hr className="max-md:hidden" />
                <div className="flex items-center md:justify-between gap-1">
                  <span className="body-14px font-normal text-newBlack-4 md:body-16px">
                    {t('dashboard.myCourses.duration')} {''}
                  </span>
                  <span className="body-14px font-normal text-newBlack-4 md:text-black md:label-medium-med-16px">{`${course.hours} hours`}</span>
                </div>

                <hr className="max-md:hidden" />

                {!progress && course.requiresPayment && (
                  <>
                    <div className="max-2xl:hidden 2xl:flex items-center md:justify-between gap-1">
                      <span className="body-14px font-normal text-newBlack-4 md:body-16px">
                        {t('dashboard.myCourses.price')} {''}
                      </span>
                      <span className="body-14px font-normal text-newBlack-4 md:text-black md:label-medium-med-16px">
                        {course.onlinePriceDollars === null
                          ? `$${course.inpersonPriceDollars || 5300}`
                          : `$${course.onlinePriceDollars}`}
                      </span>
                    </div>
                    <hr className="max-2xl:hidden" />
                  </>
                )}
              </div>
            )}
            <div className="max-md:hidden flex flex-col gap-4 order-2 2xl:order-1">
              <span className="body-14px text-newBlack-4 line-clamp-2 2xl:line-clamp-4">
                {course.goal}
              </span>
              <hr className="max-2xl:hidden" />
            </div>

            {isInProgress && (
              <div className="flex flex-col gap-3 2xl:gap-4 2xl:order-2">
                <div className="hidden md:flex flex-row items-center justify-between">
                  <span className="label-medium-med-16px text-black">
                    {t('dashboard.myCourses.yourProgress')}
                  </span>
                  <span className="text-darkOrange-5 label-medium-med-16px">
                    {progress.progressPercentage}%
                  </span>
                </div>
                <div className="relative w-full my-4">
                  <Progress
                    value={progress.progressPercentage}
                    totalChapters={progress.totalChapters}
                    completedChapters={progress.completedChaptersCount}
                    pillImage={OrangePill}
                  />
                </div>

                <hr className="max-2xl:hidden" />
              </div>
            )}

            <div className="w-full order-3">
              {renderStartButton && (
                <div className="w-full">
                  <Link className="w-full" to={`/courses/${course.id}`}>
                    <ButtonWithArrow
                      variant="primary"
                      className="w-full"
                      size={isScreenLg ? 'm' : 's'}
                    >
                      {t('dashboard.myCourses.seeTheCourse')}
                    </ButtonWithArrow>
                  </Link>
                </div>
              )}

              {isInProgress && (
                <div className="flex flex-row 2xl:flex-col gap-2.5 items-center w-full mt-auto">
                  <Link
                    className="w-full"
                    to={`/courses/${course.id}/${progress?.nextChapter?.chapterId}`}
                  >
                    <ButtonWithArrow
                      variant="primary"
                      className="w-full"
                      size={isScreenLg ? 'm' : 's'}
                    >
                      {t('dashboard.myCourses.resumeLesson')}
                    </ButtonWithArrow>
                  </Link>
                  <Link
                    className="w-full"
                    to={`/dashboard/course/${course.id}`}
                  >
                    <ButtonWithArrow
                      variant="outline"
                      size={isScreenLg ? 'm' : 's'}
                      className="w-full"
                    >
                      {t('dashboard.myCourses.seeDetails')}
                    </ButtonWithArrow>
                  </Link>
                </div>
              )}

              {renderCompletionButton && (
                <div className="w-full">
                  <Link
                    className="w-full"
                    to={`/dashboard/course/completed#${course.id}`}
                  >
                    <ButtonWithArrow
                      variant="primary"
                      className="w-full"
                      size={isScreenLg ? 'm' : 's'}
                    >
                      {t('dashboard.myCourses.detailsAndCertificate')}
                    </ButtonWithArrow>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
