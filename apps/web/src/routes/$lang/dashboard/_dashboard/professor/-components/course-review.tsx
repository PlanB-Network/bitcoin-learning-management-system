import type { CourseReviewsExtended } from '@blms/types';
import { Button, Loader, Slider, TextTag } from '@blms/ui';
import { t } from 'i18next';
import { useState } from 'react';
import { RatingChart } from '#src/components/Chart/rating-chart.tsx';
import { CollapsibleDropdown } from '#src/components/Dropdown/collapsible-dropdown.tsx';
import { StarRating } from '#src/components/Stars/star-rating.tsx';
import { trpc } from '#src/utils/trpc.ts';

export const CourseReview = ({ courseId }: { courseId: string }) => {
  const { data: reviews, isFetched } =
    trpc.content.getTeacherCourseReviews.useQuery(
      {
        courseId: courseId,
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    );

  return (
    <section className="flex flex-col mt-6 lg:mt-10">
      <h2 className="subtitle-large-med-20px lg:title-large-sb-24px text-dashboardSectionTitle lg:text-center">
        {t('dashboard.teacher.reviews.reviewsAndGrading')}
      </h2>
      <p className="body-16px text-dashboardSectionText/75 mt-4 lg:text-center">
        {t('dashboard.teacher.reviews.checkReviews')}
      </p>

      {!isFetched && <Loader size={'s'} />}
      {isFetched && !reviews && (
        <p className="body-16px text-dashboardSectionText/75 mt-4 lg:text-center">
          {t('dashboard.teacher.reviews.noReviewsYet')}
        </p>
      )}
      {isFetched && reviews?.general && reviews?.general.length > 0 && (
        <>
          <GeneralGradeSection ratings={reviews.general} />

          <div className="flex flex-wrap gap-8 lg:gap-12 lg:mt-10 justify-center">
            <div className="flex flex-col gap-8 lg:gap-12 w-full max-w-[464px]">
              <SliderGradeSection
                label={t('courses.review.length')}
                stepNames={[
                  t('courses.review.tooShort'),
                  t('courses.review.asExpected'),
                  t('courses.review.tooLong'),
                ]}
                ratings={reviews.length}
              />

              <SliderGradeSection
                label={t('courses.review.difficulty')}
                stepNames={[
                  t('courses.review.tooEasy'),
                  t('courses.review.asExpected'),
                  t('courses.review.tooHard'),
                ]}
                ratings={reviews.difficulty}
              />

              <SliderGradeSection
                label={t('courses.review.quality')}
                stepNames={[
                  t('courses.review.veryBad'),
                  t('courses.review.soAndSo'),
                  t('courses.review.veryGood'),
                ]}
                ratings={reviews.quality}
              />
            </div>
            <div className="flex flex-col gap-8 lg:gap-12 w-full max-w-[464px]">
              <SliderGradeSection
                label={t('courses.review.faithful')}
                stepNames={[
                  t('courses.review.notReally'),
                  t('courses.review.neutral'),
                  t('courses.review.yesVeryMuch'),
                ]}
                ratings={reviews.faithful}
              />

              <SliderGradeSection
                label={t('courses.review.recommend')}
                stepNames={[
                  t('courses.review.no'),
                  t('courses.review.soAndSo'),
                  t('courses.review.yesOfCourse'),
                ]}
                ratings={reviews.recommend}
              />
            </div>
          </div>

          <CourseFeedbacks feedbacks={reviews.feedbacks} />
        </>
      )}
    </section>
  );
};

const CourseFeedbacks = ({
  feedbacks,
}: {
  feedbacks: CourseReviewsExtended['feedbacks'];
}) => {
  return (
    <section className="flex flex-col mt-6 lg:mt-16">
      <h2 className="subtitle-large-med-20px lg:title-large-sb-24px text-dashboardSectionTitle lg:text-center">
        {t('dashboard.teacher.reviews.writtenFeedbacks')}
      </h2>
      <p className="body-16px text-dashboardSectionText/75 mt-4 lg:text-center">
        {t('dashboard.teacher.reviews.checkComments')}
      </p>
      <WrittenFeedbacks
        feedbacks={[...feedbacks].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )}
      />
    </section>
  );
};

const WrittenFeedbacks = ({
  feedbacks,
}: {
  feedbacks: CourseReviewsExtended['feedbacks'];
}) => {
  const [visibleFeedbacks, setVisibleFeedbacks] = useState(5);

  const showMoreFeedbacks = () => {
    setVisibleFeedbacks((prev) => prev + 5);
  };

  return (
    <section className="mt-7 flex flex-col gap-5 md:gap-7">
      {feedbacks.slice(0, visibleFeedbacks).map((feedback, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <article key={index} className="flex flex-col">
          <div className="flex flex-col">
            <span className="label-small-12px text-newGray-1 capitalize">
              {new Date(feedback.date).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <div className="h-px bg-newGray-4 w-full px-5 mt-2.5 mb-5" />
            <span className="font-medium text-dashboardSectionText leading-[120%]">
              {feedback.user}
            </span>
          </div>
          <div className="flex max-md:flex-wrap w-full mt-3 gap-3">
            <div className="flex flex-col justify-between gap-3 p-3 w-full">
              <p className="body-16px text-newBlack-3">
                &quot;{feedback.publicComment || "User didn't add comment."}
                &quot;
              </p>
              <TextTag size={'verySmall'} className="self-end">
                {t('dashboard.teacher.reviews.publicComment')}
              </TextTag>
            </div>
            <div className="flex flex-col justify-between gap-3 p-3 w-full bg-newGray-5 rounded-sm">
              <p className="body-16px text-newBlack-3">
                &quot;
                {feedback.teacherComment || "User didn't add comment."}
                &quot;
              </p>
              <TextTag size={'verySmall'} mode="dark" className="self-end">
                {t('dashboard.teacher.reviews.privateComment')}
              </TextTag>
            </div>
          </div>
        </article>
      ))}
      {visibleFeedbacks < feedbacks.length && (
        <div className="flex flex-col gap-2 items-center">
          <Button
            variant="outline"
            mode="light"
            size="m"
            onClick={showMoreFeedbacks}
            className="mt-6 lg:mt-8"
          >
            {t('courses.review.loadMoreComments')}
          </Button>
          <span className="body-14px">
            {visibleFeedbacks} {t('courses.review.displayOutOf')}{' '}
            {feedbacks.length}
          </span>
        </div>
      )}
    </section>
  );
};

const SliderGradeSection = ({
  label,
  stepNames,
  ratings,
}: {
  label: string;
  stepNames: string[];
  ratings: number[];
}) => {
  const chartData = Array.from({ length: 11 }, (_, i) => ({
    star: (i - 5).toString(),
    [t('words.users')]: ratings.filter((rating) => rating === i - 5).length,
  }));

  const averageRating = Math.round(
    ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length,
  );

  return (
    <article className="flex flex-col items-center w-full">
      <ReviewSlider
        id={label.toLocaleLowerCase()}
        label={label}
        stepNames={stepNames}
        value={averageRating}
      />
      <CollapsibleDropdown
        title={t('dashboard.teacher.reviews.seeStatistics')}
        className="mt-10"
      >
        <div className="px-5 pt-5 pb-8">
          <RatingChart chartData={chartData} />
        </div>
      </CollapsibleDropdown>
      <div className="h-px bg-newGray-4 w-full px-5 my-4" />
    </article>
  );
};

const ReviewSlider = ({
  id,
  label,
  stepNames,
  disabled,
  value,
}: {
  id: string;
  label: string;
  stepNames: string[];
  disabled?: boolean;
  value: number;
}) => {
  const sliderProps = {
    min: -5,
    default: [0],
    max: 5,
    step: 1,
  };

  return (
    <div className="flex flex-col w-full lg:max-w-[88%]">
      <h3 className="text-center subtitle-large-med-20px text-dashboardSectionTitle">
        {label}
      </h3>
      <Slider
        {...sliderProps}
        id={id}
        disabled={disabled}
        onValueChange={() => {}}
        value={[value]}
        className="mt-4"
      />
      <div className="relative mt-4">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 max-w-[95%] mx-auto">
          <div className="relative flex justify-between">
            {Array.from({ length: 11 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={i}
                className="w-[2px] h-1 bg-newGray-3"
                style={{ left: `${(i / 10) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="relative mt-4 w-full max-w-[88%] lg:max-w-[95%] mx-auto">
        <div className="flex flex-col body-14px !font-medium text-newGray-1 text-center">
          {stepNames[0] && (
            <span className="absolute self-start -translate-x-1/2 max-sm:max-w-16">
              {stepNames[0]}
            </span>
          )}
          {stepNames[1] && (
            <span className="absolute self-center max-sm:max-w-16">
              {stepNames[1]}
            </span>
          )}
          {stepNames[2] && (
            <span className="absolute self-end translate-x-1/2 max-sm:max-w-16">
              {stepNames[2]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const GeneralGradeSection = ({ ratings }: { ratings: number[] }) => {
  const numberOfReviews = ratings.length;
  const averageRating = Number(
    (
      ratings.reduce((acc, rating) => acc + rating, 0) / numberOfReviews
    ).toFixed(1),
  );
  const maxRating = 5;

  const chartData = Array.from({ length: maxRating }, (_, i) => ({
    star: (i + 1).toString(),
    [t('words.users')]: ratings.filter((rating) => rating === i + 1).length,
  }));

  return (
    <article className="flex flex-col mt-2.5 lg:mt-10 lg:items-center">
      <h3 className="lg:text-center subtitle-large-med-20px text-dashboardSectionTitle">
        {t('courses.review.generalGrade')}
      </h3>
      <StarRating
        rating={averageRating}
        totalStars={maxRating}
        starSize={window.innerWidth < 768 ? 41 : 45}
        className="mt-5"
      />
      <span className="lowercase body-16px text-dashboardSectionTitle mt-5">{`${averageRating}/${maxRating} (${numberOfReviews} ${numberOfReviews > 1 ? t('dashboard.teacher.reviews.reviews') : t('dashboard.teacher.reviews.review')})`}</span>
      <CollapsibleDropdown
        title={t('dashboard.teacher.reviews.viewDetails')}
        className="mt-2.5 lg:mt-1.5 max-w-[464px]"
      >
        <div className="px-5 pt-5 pb-8">
          <RatingChart chartData={chartData} />
        </div>
      </CollapsibleDropdown>
      <div className="h-px bg-newGray-4 w-full max-w-[416px] px-5 my-10 lg:mt-4" />
    </article>
  );
};
