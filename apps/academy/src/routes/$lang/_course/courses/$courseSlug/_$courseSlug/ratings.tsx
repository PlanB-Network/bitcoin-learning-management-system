import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { CourseContext } from '#src/providers/courseContext.tsx';
import { trpc } from '#src/utils/trpc.ts';
import { CourseReviewComponent } from '../-components/course-review-component.tsx';
import { CourseTitle } from '../-components/course-title.tsx';
import { getTabs } from '../-utils/get-tabs.tsx';

export const Route = createFileRoute(
  '/$lang/_course/courses/$courseSlug/_$courseSlug/ratings',
)({
  component: Ratings,
});

function Ratings() {
  const { t } = useTranslation();

  const params = Route.useParams();

  const { course, courseProgress, isLoggedIn } = useContext(CourseContext);

  const courseId = params.courseSlug;

  const { data: previousCourseReview, isFetched: isReviewFetched } = useQuery(
    trpc.user.courses.getCourseReview.queryOptions({
      courseId,
    }),
  );

  const reviewChapterId =
    course?.parts
      .flatMap((part) => part.chapters)
      ?.find((c) => c?.isCourseReview)?.chapterId ?? null;

  return (
    <PageLayout
      title={t('words.ratings')}
      hideTitle
      layoutSize="max"
      overTitle={course ? <CourseTitle course={course} /> : undefined}
      tabs={course ? getTabs(course, courseProgress?.[0]) : []}
    >
      {course && reviewChapterId && (
        <section className="flex flex-col mt-4 md:mt-10 w-full">
          <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
            {t('dashboard.course.ratingsAndFeedbacks')}
          </h2>

          {isReviewFetched && !previousCourseReview && (
            <p className="body-14px md:subtitle-large-med-20px text-dashboardSectionText/75 md:text-newBlack-1 mt-4 md:mt-10">
              {t('dashboard.course.submitReviewInfo')}
            </p>
          )}

          {isReviewFetched && previousCourseReview && (
            <p className="desktop-typo-1 md:body-16px text-dashboardSectionText/75 mt-4">
              {t('dashboard.course.feedbacks')}
            </p>
          )}

          <div className="w-full mt-5 md:mt-10">
            <div className="w-full max-w-[716px]">
              {isReviewFetched && !previousCourseReview && (
                <CourseReviewComponent
                  courseId={courseId}
                  chapterId={reviewChapterId}
                  isLockedReview
                />
              )}

              {previousCourseReview && (
                <CourseReviewComponent
                  courseId={courseId}
                  chapterId={reviewChapterId}
                  existingReview={previousCourseReview}
                  isDashboardReview
                />
              )}
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
