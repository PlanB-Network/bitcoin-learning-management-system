import { TeachingFormat } from '@blms/constants';
import { Button, EmptyState, Loader, Progress } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext } from 'react';
import { TbBooksOff } from 'react-icons/tb';
import banner from '#src/assets/courses/live-classes-banner.webp';
import OrangePill from '#src/assets/icons/orange_pill_color.svg';
import { PageLayout } from '#src/components/page-layout.js';
import { CourseCardBig } from '#src/patterns/course-card-big.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute('/$lang/_content/live-classes/')({
  component: AllCourses,
});

function AllCourses() {
  const { courses, session } = useContext(AppContext);

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

  console.log('planbCourses', planbCourses);

  const otherCourses = !courses
    ? []
    : courses
        .filter(
          (course) =>
            course.isArchived === false &&
            // normalizeString(course.language) === normalizeString(i18n.language) &&
            course.teachingFormat === 'professor_led' &&
            (!course.paymentExpirationDate ||
              course.paymentExpirationDate > new Date()) &&
            (course.endDate ? course.endDate.getTime() > Date.now() : true),
        )
        .sort((a, b) => a.index.slice(3).localeCompare(b.index.slice(3)));

  if (!courses) {
    return (
      <PageLayout title={t('courses.allCourses')}>
        <Loader size="s" />
      </PageLayout>
    );
  }

  return (
    <PageLayout className=" max-w-[1067px]">
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
                  to="/dashboard/my-courses"
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
      <div className="relative h-[254px]">
        <img className="absolute" src={banner} alt="A professor on stage" />

        <div className="absolute bottom-8">
          <h1 className="display-large-med-48px">
            {t('courses.learnAnytime.title')}
          </h1>
          <h2 className="title-large-24px text-neutral-600">
            {t('courses.learnAnytime.secondaryTitle')}
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-4">
        {planbCourses.map((course) => (
          <div key={course.id}>
            <CourseCardBig course={course} />
          </div>
        ))}
      </div>

      <h1 className="mt-12 display-medium-40px font-semibold ">
        {t('courses.learnAnytime.allOtherTitle')}
      </h1>

      <div className="mt-8">
        {otherCourses.length === 0 ? (
          <EmptyState
            title={t('courses.noCoursesFound')}
            description={t('courses.tryAdjustingFilters')}
            icon={TbBooksOff}
          />
        ) : (
          <div className="flex flex-wrap gap-2 md:gap-4">
            {otherCourses.map((course) => (
              <CourseCardBig key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
