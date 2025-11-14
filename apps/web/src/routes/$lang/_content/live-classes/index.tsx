import { TeachingFormat } from '@blms/constants';
import { Button, Loader, Progress } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import banner from '#src/assets/courses/live-classes-banner.webp';
import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import { PageLayout } from '#src/components/page-layout.js';
import { CourseCardBig } from '#src/patterns/course-card-big.tsx';
import { AppContext } from '#src/providers/context.tsx';
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

      <div className="bg-vertical-orange-gradient border-1 border-orange-200 rounded-2xl">
        <div className="max-lg:hidden flex flex-col">
          <img
            className="w-full object-cover"
            src={banner}
            alt="A professor on stage"
          />

          <div className="bottom-2 px-6 w-full self-end z-10 -mt-16">
            <h2 className="display-base">{t('courses.liveClasses.title')}</h2>
            <h3 className="label-18px text-neutral-600">
              {t('courses.liveClasses.secondaryTitle')}
            </h3>
          </div>
          <Link to={'/programs'}>
            <Button className="ml-6">Learn more</Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 lg:gap-8 mt-2 lg:mt-4 px-2 lg:px-6 pb-2 lg:pb-6">
          {planbCourses.map((course) => (
            <div key={course.id} className="w-full">
              <CourseCardBig course={course} />
            </div>
          ))}
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
