import { TeachingFormat } from '@blms/constants';
import { getCountryForFlagFromAddress } from '@blms/shared';
import type { CourseResponse, JoinedCourse } from '@blms/types';
import { Button, cn, Flag, Image, Loader, Progress } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TbCalendarEvent, TbChevronRight, TbClock } from 'react-icons/tb';
import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import programMainImage from '#src/assets/programs/program-main.webp';
import { PageLayout } from '#src/components/page-layout.js';
import { CourseCardBig } from '#src/patterns/course-card-big.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { formatShortDateRange } from '#src/utils/date.ts';
import { resourceImgUrl } from '#src/utils/index.ts';
import { normalizeString } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute('/$lang/_content/live-classes/')({
  component: AllCourses,
});

function AllCourses() {
  const { courses, session } = useContext(AppContext);
  const { t, i18n } = useTranslation();

  const isLoggedIn = !!session?.user;

  const { data: coursesProgress } = useQuery(
    trpc.user.courses.getProgress.queryOptions(
      { teachingFormat: TeachingFormat.ProfessorLed },
      {
        enabled: isLoggedIn,
      },
    ),
  );

  const inProgressCourses = !coursesProgress
    ? []
    : coursesProgress
        .filter(
          (course) =>
            course.progressPercentage > 0 && course.progressPercentage < 100,
        )
        .sort((a, b) => {
          if (b.lastUpdated && a.lastUpdated) {
            return (
              new Date(b.lastUpdated).getTime() -
              new Date(a.lastUpdated).getTime()
            );
          }
          if (b.lastUpdated) return 1;
          if (a.lastUpdated) return -1;
          return 0;
        });

  const planbCourses = !courses
    ? []
    : courses.filter(
        (course) =>
          course.isArchived === false &&
          course.isPlanbSchool === true &&
          (course.endDate ? course.endDate.getTime() > Date.now() : true),
      );

  const otherCourses = !courses
    ? []
    : courses
        .filter(
          (course) =>
            course.isArchived === false &&
            course.isPlanbSchool === false &&
            (normalizeString(course.language) ===
              normalizeString(i18n.language) ||
              normalizeString(course.language) === 'en') &&
            course.teachingFormat === 'professor_led' &&
            (!course.paymentExpirationDate ||
              course.paymentExpirationDate > new Date()) &&
            (course.endDate ? course.endDate.getTime() > Date.now() : true),
        )
        .sort((a, b) => a.index.slice(3).localeCompare(b.index.slice(3)));

  if (!courses) {
    return (
      <PageLayout
        title={t('courses.liveClasses.liveClasses')}
        layoutSize="wide"
      >
        <Loader size="s" />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={t('courses.liveClasses.liveClasses')} layoutSize="wide">
      {inProgressCourses.length !== 0 && (
        <div className="flex flex-col w-full gap-4 mb-6 md:mb-12">
          <p className="text-black title-base md:title-medium">
            {t('courses.continueLeftOff')}
          </p>
          <div className="flex flex-col gap-1 md:gap-4 w-full">
            {inProgressCourses.slice(0, 2).map((courseProgress) => {
              const course = courses.find(
                (c) => c.id === courseProgress.courseId,
              );
              if (!course) return null;
              return (
                <article
                  className="flex items-center justify-between w-full border border-neutral-100 rounded-2xl p-3 md:p-8 gap-2"
                  key={course.id}
                >
                  <span className="body-small-bold md:subtitle-base text-black">
                    {course.name}
                  </span>
                  <div className="flex items-center gap-3 md:gap-12 xl:w-full xl:max-w-[463px]">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-full max-w-[272px] relative max-xl:hidden">
                        <Progress
                          total={courseProgress.totalChapters}
                          completed={courseProgress.completedChaptersCount}
                          pillImage={OrangePill}
                        />
                      </div>
                      <span className="body-extra-small-bold md:subtitle-base text-orange-500">
                        {courseProgress.progressPercentage}%
                      </span>
                    </div>
                    <Link
                      to={`/courses/${course.id}/${courseProgress?.nextChapter?.chapterId}`}
                    >
                      <Button
                        rounded
                        variant="primary"
                        className="w-full"
                        size={'m'}
                      >
                        {t('words.resume')}
                      </Button>
                    </Link>
                  </div>
                </article>
              );
            })}
            {inProgressCourses.length > 2 && (
              <div className="ml-auto">
                <Link
                  to="/my-courses"
                  className="body-small-bold text-black pr-8"
                >
                  {t('courses.plusXMore', {
                    count: inProgressCourses.length - 2,
                  })}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <h2 className="lg:hidden title-large-sb-24px font-semibold mb-2 lg:mb-6">
        {t('courses.liveClasses.title')}
      </h2>

      <div className="bg-vertical-orange-gradient border border-orange-200 rounded-2xl">
        <div className="max-lg:hidden flex flex-col">
          <div className=" py-6 px-6 w-full">
            <h2 className="display-base">{t('courses.liveClasses.title')}</h2>
          </div>
          <Link to={'/programs'} />
        </div>

        <div className="flex flex-wrap gap-4 lg:gap-8 mt-2 lg:mt-4 px-2 lg:px-6 pb-2 lg:pb-6">
          <div className="w-full">
            <ProgramCard course={planbCourses.at(0)!} />
          </div>
        </div>
      </div>

      {otherCourses.length === 0 ? null : (
        <>
          <h2 className="mt-6 lg:mt-12 max-lg:title-large-sb-24px lg:display-medium font-semibold">
            {t('courses.liveClasses.allOtherTitle')}
          </h2>

          <div className="mt-2 lg:mt-8">
            <div className="flex flex-wrap gap-4 lg:gap-8">
              {otherCourses.map((course) => (
                <div key={course.id} className="w-full">
                  <CourseCardBig course={course} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}

const ProgramCard = ({ course }: { course: JoinedCourse | CourseResponse }) => {
  const dateString = formatShortDateRange(course.startDate, course.endDate);

  return (
    <Link
      key={course.id}
      to={'/programs'}
      className={cn(
        'flex w-full max-lg:mx-auto max-lg:max-w-[340px] bg-white rounded-2xl',
      )}
    >
      <article
        className={
          'flex flex-row w-full border border-neutral-50 rounded-2xl hover:bg-neutral-50'
        }
      >
        <DesktopCourseThumbnail />
        <div className="grow min-w-0 w-full">
          <MobileCourseThumbnail />

          <div className="flex flex-col p-4 h-full w-full">
            <span className="mt-4 flex flex-col w-full line-clamp-2 title-medium align-top mb-2 lg:mb-0">
              {t('courses.liveClasses.program.title')}
            </span>
            <p className="text-neutral-600 body-small lg:line-clamp-4">
              {t('courses.liveClasses.program.goal')}
            </p>

            <div className="flex flex-row my-4 items-center">
              {course.mainProfessors.map((professor) => (
                <Image
                  key={professor.id}
                  src={resourceImgUrl(professor, 'profile.webp')}
                  alt={professor.name}
                  breakpoints={{ default: 100, lg: 150 }}
                  className={cn(
                    'size-6 rounded-full z-10 object-cover [overflow-clip-margin:_unset]',
                  )}
                />
              ))}

              <span className="ml-2 max-lg:body-small">
                {course.mainProfessors.map((professor) => professor.name)}
              </span>
            </div>

            <div className="w-full lg:mt-auto flex flex-col flex-wrap lg:flex-row gap-5 lg:gap-2 text-nowrap justify-between overflow-hidden border-t-1 border-neutral-50 pt-5">
              <div className="grow-3 body-base-bold flex flew-row gap-1 mx-2">
                {course.format === 'online' || course.format === 'hybrid' ? (
                  <span>{t('accessType.online')}</span>
                ) : null}
                {course.format === 'hybrid' ? (
                  <span className="text-neutral-100">|</span>
                ) : null}
                {course.format === 'inperson' || course.format === 'hybrid' ? (
                  <div className="flex flex-row gap-2">
                    <Flag
                      code={getCountryForFlagFromAddress(
                        course.addressLine1 || '',
                      )}
                      size="s"
                      className="self-center"
                      isRound={true}
                    />
                    <span>{course.addressLine1}</span>
                  </div>
                ) : null}
              </div>
              <div className="grow flex flex-row gap-2 items-center mx-2">
                <TbCalendarEvent className="h-5 w-5 text-brown-400" />
                <span className="body-base-bold text-brown-800 ">
                  {dateString}
                </span>
              </div>
              <div className="max-lg:hidden flex flex-row gap-2 items-center mx-2">
                <TbClock className="h-5 w-5 text-brown-400" />
                <span className="body-base-bold text-brown-800">
                  {t('courses.liveClasses.program.semester')}
                </span>
              </div>

              <Button
                variant="primary"
                className="lg:hidden w-full mt-2"
                size={'m'}
              >
                {t('words.discover')}
                <span className="ml-2">{'>'}</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="max-lg:hidden self-center mx-4 w-fit">
          <TbChevronRight className="h-5 w-5 text-neutral-300" />
        </div>
      </article>
    </Link>
  );
};

const DesktopCourseThumbnail = () => {
  return (
    <img
      className={
        'max-lg:hidden w-[230px] xl:w-[338px] rounded-l-2xl object-cover'
      }
      src={programMainImage}
      alt=""
    />
  );
};

const MobileCourseThumbnail = () => {
  return (
    <div className="w-full">
      <img
        className={'lg:hidden rounded-t-2xl h-[172px] w-full object-cover'}
        src={programMainImage}
        alt=""
      />
    </div>
  );
};
