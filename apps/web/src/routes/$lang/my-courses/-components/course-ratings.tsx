import { useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { CourseReviewComponent } from '#src/routes/$lang/_content/courses/$courseId/-components/course-review-component.tsx';
import { trpc } from '#src/utils/trpc.ts';

export const CourseRatings = ({
  courseId,
  reviewChapterId,
}: {
  courseId: string;
  reviewChapterId: string;
}) => {
  const { data: previousCourseReview, isFetched: isReviewFetched } = useQuery(
    trpc.user.courses.getCourseReview.queryOptions({
      courseId: courseId,
    }),
  );

  return (
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
  );
};
