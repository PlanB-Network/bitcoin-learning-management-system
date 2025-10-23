import { formatNameForURL } from '@blms/shared';
import type { CourseProgressExtended, JoinedCourse } from '@blms/types';
import { ButtonWithArrow, cn, Progress, TextTag } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import { useGreater } from '#src/hooks/use-greater.ts';
import { LANGUAGES_WITH_NATIVE_VERTICAL_SCRIPT } from '#src/utils/i18n.ts';
import { assetUrl } from '#src/utils/index.ts';

export const CourseDashboardCard = ({
  course,
  progress,
}: {
  course: JoinedCourse;
  progress: CourseProgressExtended | null;
}) => {
  const isScreenLg = useGreater('1440px');

  const { t, i18n } = useTranslation();
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
        bgColor: 'bg-newGray-5',
        text: t('dashboard.myCourses.notStarted'),
      };

    const { progressPercentage } = progress;
    if (progressPercentage === 100) {
      return {
        bgColor: 'bg-green-300',
        text: t('dashboard.myCourses.completed'),
      };
    }
    if (progressPercentage > 0 || progressPercentage === 0) {
      return {
        bgColor: 'bg-darkOrange-4',
        text: t('dashboard.myCourses.inProgress'),
      };
    }
    return {
      bgColor: 'bg-newGray-5',
      text: t('dashboard.myCourses.notStarted'),
    };
  };

  const { text, bgColor } = getStatusStyles(progress);
  const beginnerFriendlyCourses = new Set(['btc101', 'btc102', 'scu101']);

  return (
    <article className="flex flex-row md:max-h-fit min-[1440px]:max-h-fit size-full min-[1440px]:flex-col rounded-[10px] border border-black bg-white">
      <span
        className={cn(
          'p-1 md:p-4 title-small-med-16px md:display-small-bold-caps-22px uppercase text-black max-[1440px]:[writing-mode:vertical-rl] min-[1440px]:border-b min-[1440px]:rounded-t-[10px] border-black text-center text-sm',
          bgColor,
          !LANGUAGES_WITH_NATIVE_VERTICAL_SCRIPT.includes(i18n.language)
            ? 'max-[1440px]:transform-[rotate(180deg)] max-[1440px]:rounded-r-[10px] max-[1440px]:border-l'
            : 'max-[1440px]:rounded-l-[10px] max-[1440px]:border-r',
        )}
      >
        {text}
      </span>
      <div className="flex flex-col justify-between w-full max-md:items-start pt-1 md:p-2.5 min-[1440px]:pb-7 px-2.5 pb-2.5 gap-2 md:gap-4">
        <div className="flex flex-row min-[1440px]:flex-col min-[1440px]:gap-2 max-xl:items-center justify-between">
          <div className="flex flex-wrap gap-2 max-[1440px]:order-2 max-md:hidden shrink-0 h-fit">
            <TextTag size={'small'} variant="grey" className="uppercase">
              {course.index}
            </TextTag>
            <TextTag size={'small'} variant="orange" className="uppercase">
              {course.requiresPayment
                ? t('courses.details.paidCourse')
                : t('words.free')}
            </TextTag>
            <TextTag size={'small'} className="uppercase">
              {t(`courses.format.${course.format}`)}
            </TextTag>
            {beginnerFriendlyCourses.has(course.index) && (
              <TextTag size={'small'} variant="green" className="uppercase">
                {t('words.level.beginner')}
              </TextTag>
            )}
          </div>

          <div className="flex text-start title-small-med-16px md:title-medium-sb-18px max-xl:order-1">
            <span className="line-clamp-2">{course.name}</span>
          </div>
        </div>
        <div className=" w-full flex flex-row min-[1440px]:flex-col gap-4">
          <img
            src={assetUrl(
              `courses/${course.index}`,
              'thumbnail.webp',
              course.lastCommit,
            )}
            alt={course.name}
            className="max-md:hidden rounded-md object-cover [overflow-clip-margin:unset] object-center max-h-[183px] max-w-[255px]"
          />
          <div className="flex flex-col gap-2 md:gap-3 min-[1440px]:gap-4! w-full">
            {!isInProgress && (
              <div className="flex flex-col md:gap-2.5">
                <div className="flex items-center md:justify-between gap-1">
                  <span className="body-14px shrink-0 md:mr-2 font-normal text-newBlack-4 md:body-16px">
                    {t('dashboard.myCourses.professor')} {''}
                  </span>
                  <span className="body-14px font-normal text-newBlack-4  line-clamp-1 md:text-black md:label-medium-med-16px">
                    {course.mainProfessors
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
                    <div className="max-[1440px]:hidden min-[1440px]:flex items-center md:justify-between gap-1">
                      <span className="body-14px font-normal text-newBlack-4 md:body-16px">
                        {t('dashboard.myCourses.price')} {''}
                      </span>
                      <span className="body-14px font-normal text-newBlack-4 md:text-black md:label-medium-med-16px">
                        {course.onlinePriceDollars === null
                          ? `$${course.inpersonPriceDollars || 5300}`
                          : `$${course.onlinePriceDollars}`}
                      </span>
                    </div>
                    <hr className="max-[1440px]:hidden" />
                  </>
                )}
              </div>
            )}
            <div className="max-md:hidden flex flex-col gap-4 order-2 min-[1440px]:order-1">
              <span className="body-14px text-newBlack-4 line-clamp-2 min-[1440px]:line-clamp-4">
                {course.goal}
              </span>
              <hr className="max-[1440px]:hidden" />
            </div>

            {isInProgress && (
              <div className="flex flex-col gap-3 min-[1440px]:gap-4 min-[1440px]:order-2">
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
                    total={progress.totalChapters}
                    completed={progress.completedChaptersCount}
                    pillImage={OrangePill}
                  />
                </div>

                <hr className="max-[1440px]:hidden" />
              </div>
            )}

            <div className="w-full order-3">
              {renderStartButton && (
                <div className="w-full">
                  <Link
                    className="w-full"
                    to={`/courses/${formatNameForURL(course.name)}-${course.id}`}
                  >
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
                <div className="flex flex-row min-[1440px]:flex-col gap-2.5 items-center w-full mt-auto">
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
                  <Link className="w-full" to={`/my-courses/${course.id}`}>
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
                    // TODO: remove the condition when the course completion page for professor led course is ready
                    to={`/my-courses/${course.id}`}
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
