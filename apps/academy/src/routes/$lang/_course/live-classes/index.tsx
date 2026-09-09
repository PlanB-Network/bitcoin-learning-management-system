import { TeachingFormat } from '@blms/constants';
import { getCountryForFlagFromAddress } from '@blms/shared';
import type { CourseResponse, JoinedCourse } from '@blms/types';
import { Button, cn, EmptyState, Flag, Image, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TbCalendarEvent,
  TbCalendarOff,
  TbChevronDown,
  TbChevronRight,
  TbClock,
} from 'react-icons/tb';
import programMainImage from '#src/assets/programs/program-main.webp';
import { PageLayout } from '#src/components/page-layout.js';
import { CourseCardBig } from '#src/patterns/course-card-big.tsx';
import { InProgressCourseCard } from '#src/patterns/in-progress-course-card.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { formatShortDateRange } from '#src/utils/date.ts';
import { resourceImgUrl } from '#src/utils/index.ts';
import { getSystemLanguage, isLanguageMatch } from '#src/utils/language.ts';
import { trpc } from '#src/utils/trpc.ts';
import { findActivePlanbSchoolCourse } from './-utils.ts';

export const Route = createFileRoute('/$lang/_course/live-classes/')({
  component: AllCourses,
});

function AllCourses() {
  const { courses, session } = useContext(AppContext);
  const { t, i18n } = useTranslation();

  const [showAllInProgress, setShowAllInProgress] = useState(false);

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
        .filter((course) => course.progressPercentage < 100)
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

  const planbCourse = findActivePlanbSchoolCourse(courses ?? []);

  const systemLanguage = useMemo(() => getSystemLanguage(), []);

  const otherCourses = useMemo(() => {
    if (!courses) return [];

    return courses
      .filter(
        (course) =>
          course.isArchived === false &&
          course.isPlanbSchool === false &&
          isLanguageMatch(course.language, i18n.language, systemLanguage, [
            'en',
          ]) &&
          course.teachingFormat === 'professor_led' &&
          (!course.paymentExpirationDate ||
            course.paymentExpirationDate > new Date()) &&
          (course.endDate ? course.endDate.getTime() > Date.now() : true),
      )
      .sort((a, b) => a.index.slice(3).localeCompare(b.index.slice(3)));
  }, [courses, i18n.language, systemLanguage]);

  if (!courses) {
    return (
      <PageLayout
        title={t('courses.liveClasses.liveClasses')}
        layoutSize="wide"
        showBecomeTeacherButton
      >
        <Loader size="s" />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t('courses.liveClasses.liveClasses')}
      layoutSize="wide"
      showBecomeTeacherButton
    >
      {inProgressCourses.length !== 0 && (
        <div className="flex flex-col w-full mb-6 md:mb-12">
          <p className="text-black title-base md:title-medium mb-4">
            {t('courses.continueLeftOff')}
          </p>
          <div className="flex flex-col w-full border border-neutral-100 rounded-2xl overflow-hidden mb-2 md:mb-4">
            {inProgressCourses
              .slice(0, showAllInProgress ? undefined : 2)
              .map((courseProgress) => {
                const course = courses.find(
                  (c) => c.id === courseProgress.courseId,
                );
                if (!course) return null;
                return (
                  <InProgressCourseCard
                    key={course.id}
                    course={course}
                    courseProgress={courseProgress}
                  />
                );
              })}
          </div>
          {inProgressCourses.length > 2 && (
            <div className="ml-auto">
              <button
                type="button"
                onClick={() => setShowAllInProgress(!showAllInProgress)}
                className="flex items-center gap-0.5 text-neutral-300 body-small-bold pr-3 md:pr-8"
              >
                {showAllInProgress
                  ? t('words.hide')
                  : t('courses.plusXMore', {
                      count: inProgressCourses.length - 2,
                    })}
                <TbChevronDown
                  size={20}
                  className={cn(
                    'transition-transform',
                    showAllInProgress && 'rotate-180',
                  )}
                />
              </button>
            </div>
          )}
        </div>
      )}

      {planbCourse && (
        <div className="bg-vertical-orange-gradient border border-orange-200 rounded-2xl">
          <div className="max-lg:hidden flex flex-col">
            <div className=" py-6 px-6 w-full">
              <h2 className="display-base">{t('courses.liveClasses.title')}</h2>
            </div>
            <Link to={'/programs'} />
          </div>

          <div className="flex flex-wrap gap-4 lg:gap-8 mt-2 lg:mt-4 px-2 lg:px-6 pb-2 lg:pb-6">
            <div className="w-full">
              <ProgramCard course={planbCourse} />
            </div>
          </div>
        </div>
      )}

      {!planbCourse && otherCourses.length === 0 && (
        <EmptyState
          title={t('courses.liveClasses.emptyState.title')}
          description={t('courses.liveClasses.emptyState.description')}
          icon={TbCalendarOff}
          linkButton={{
            href: '/learn-anytime',
            label: t('courses.liveClasses.emptyState.action'),
          }}
          className="mt-6 lg:mt-8"
        />
      )}

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
  const { t } = useTranslation();
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
                    'size-6 rounded-full z-10 object-cover [overflow-clip-margin:unset]',
                  )}
                />
              ))}

              <span className="ml-2 max-lg:body-small">
                {course.mainProfessors.map((professor) => professor.name)}
              </span>
            </div>

            <div className="w-full lg:mt-auto flex flex-col flex-wrap lg:flex-row gap-5 lg:gap-2 text-nowrap justify-between overflow-hidden border-t border-neutral-50 pt-5">
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
