import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import type {
  CourseReviewsExtended,
  JoinedCourse,
  JoinedCourseWithAll,
} from '@blms/types';
import {
  Button,
  Loader,
  Slider,
  Tabs,
  TabsContent,
  TextTag,
  cn,
} from '@blms/ui';

import { RatingChart } from '#src/components/Chart/rating-chart.tsx';
import { CollapsibleDropdown } from '#src/components/Dropdown/collapsible-dropdown.tsx';
import { DropdownMenu } from '#src/components/Dropdown/dropdown-menu.js';
import { ListItem } from '#src/components/ListItem/list-item.tsx';
import { StarRating } from '#src/components/Stars/star-rating.tsx';
import { TabsListSegmented } from '#src/components/Tabs/TabsListSegmented.js';
import { TabsListUnderlined } from '#src/components/Tabs/TabsListUnderlined.js';
import { CourseCurriculum } from '#src/organisms/course-curriculum.js';
import { AppContext } from '#src/providers/context.js';
import { assetUrl } from '#src/utils/index.js';
import { trpc } from '#src/utils/trpc.js';

import { MakeModificationBlock } from './-components/make-modification.tsx';

export const Route = createFileRoute('/dashboard/_dashboard/professor/courses')(
  {
    component: DashboardProfessorCourses,
  },
);

function DashboardProfessorCourses() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const { user } = useContext(AppContext);
  if (!user || user.role !== 'professor') {
    navigate({ to: '/' });
  }

  const { data: courses, isFetched } =
    trpc.content.getProfessorCourses.useQuery(
      {
        coursesId: user?.professorCourses ?? [],
        language: i18n.language,
      },
      {
        staleTime: 300_000, // 5 minutes
        enabled: user?.role === 'professor',
      },
    );

  return (
    <div className="flex flex-col gap-4 lg:gap-8 text-black">
      <div className="flex max-lg:flex-col lg:items-center gap-2 lg:gap-5">
        <h3 className="display-small-32px">
          {t('dashboard.teacher.courses.coursesManagementPanel')}
        </h3>
        <span className="flex size-fit p-1 lg:py-[3px] lg:px-2 justify-center items-center rounded-md bg-[rgba(204,204,204,0.50)] text-newBlack-3 desktop-typo1 uppercase">
          {t('dashboard.teacher.profile.teacher')}
        </span>
      </div>
      <p className="body-14px lg:body-16px text-dashboardSectionTitle">
        {t('dashboard.teacher.courses.reviewInfos')}
      </p>
      {!isFetched && <Loader size={'s'} />}
      {isFetched && <CourseTabs courses={courses || []} />}
    </div>
  );
}

const CourseTabs = ({ courses }: { courses: JoinedCourse[] }) => {
  const [currentTab, setCurrentTab] = useState(courses?.at(0)?.id);

  const onTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <Tabs
      defaultValue={courses?.at(0)?.id}
      value={currentTab}
      onValueChange={onTabChange}
      className="flex flex-col gap-4"
    >
      <TabsListSegmented
        tabs={courses.map((course) => ({
          value: course.id,
          key: course.id,
          text: `${course.id.toLocaleUpperCase()} - ${course.name}`,
          active: course.id === currentTab,
        }))}
        slice={6}
        className="max-md:hidden"
      >
        <a
          href="https://kutt.planb.network/add-course"
          target="_blank"
          rel="noreferrer"
          className={cn(
            'flex item-center max-md:basis-1/2 w-56 max-w-56 grow px-5 py-1.5 md:border-l md:first:border-l-0 !outline-none text-newBlack-3 hover:text-darkOrange-5 hover:font-medium text-center',
          )}
        >
          <span className="m-auto">
            {t('dashboard.teacher.courses.proposeNewCourse')}
          </span>
        </a>
      </TabsListSegmented>

      <label
        htmlFor="coursesSelector"
        className="text-dashboardSectionText leading-tight font-medium md:hidden"
      >
        Select course
      </label>
      <DropdownMenu
        id="coursesSelector"
        itemsList={[
          ...courses.map((course) => ({
            name: `${course.id.toLocaleUpperCase()} - ${course.name}`,
            onClick: () => setCurrentTab(course.id),
          })),
          {
            name: 'Propose new course',
            onClick: () =>
              window.open('https://kutt.planb.network/add-course', '_blank'),
          },
        ]}
        activeItem={
          `${currentTab?.toUpperCase()} - ${courses.find((course) => course.id === currentTab)?.name}` ||
          `${courses[0].id.toLocaleUpperCase()} - ${courses[0].name}`
        }
        variant="light"
        className="md:hidden"
      />

      {courses?.map((course) => (
        <CourseTabContent key={course.id} course={course} />
      ))}
    </Tabs>
  );
};

const CourseTabContent = ({ course }: { course: JoinedCourse }) => {
  const { t } = useTranslation();

  const [currentTab, setCurrentTab] = useState('details');

  const onTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <TabsContent value={course.id}>
      <Tabs
        defaultValue="details"
        value={currentTab}
        onValueChange={onTabChange}
      >
        <TabsListUnderlined
          tabs={[
            {
              key: 'details',
              value: 'details',
              text: t('dashboard.teacher.courses.courseDetails'),
              active: 'details' === currentTab,
            },
            {
              key: 'review',
              value: 'review',
              text: t('dashboard.teacher.courses.reviews'),
              active: 'review' === currentTab,
            },
            {
              key: 'analytics',
              value: 'analytics',
              text: t('dashboard.teacher.courses.analytics'),
              active: 'analytics' === currentTab,
              disabled: true,
            },
            {
              key: 'exam-results',
              value: 'exam-results',
              text: t('dashboard.teacher.courses.examResults'),
              active: 'exam-results' === currentTab,
              disabled: true,
            },
          ]}
        />
        <TabsContent value="details">
          <CourseDetails course={course} />
        </TabsContent>
        <TabsContent value="review">
          <CourseReview courseId={course.id} />
        </TabsContent>
        <TabsContent value="analytics">
          {t('dashboard.teacher.courses.analytics')}
        </TabsContent>
        <TabsContent value="exam-results">
          {t('dashboard.teacher.courses.examResults')}
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
};

const CourseDetails = ({ course }: { course: JoinedCourse }) => {
  const { t, i18n } = useTranslation();

  const courseItems = {
    'Course Name': course.name,
    Professor: course.professors.map((professor) => professor.name).join(', '),
    Level: t(`words.level.${course.level}`),
    Duration: `${course.hours} ${t('words.hours')}`,
    Price:
      (course.onlinePriceDollars && course.onlinePriceDollars > 0) ||
      (course.inpersonPriceDollars && course.inpersonPriceDollars > 0)
        ? `$${course.inpersonPriceDollars} (in-person) \n $${course.onlinePriceDollars} (online)`
        : t('words.free'),
    'Course ID': course.id.toUpperCase(),
  };

  const { data: courseWithDetails, isFetched } =
    trpc.content.getCourse.useQuery(
      {
        id: course.id,
        language: i18n.language,
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    );

  const infoTextClasses =
    'flex flex-col py-1 px-4 bg-white rounded-md border border-newGray-4 overflow-y-scroll text-newBlack-3 body-14px !leading-[120%] whitespace-pre-line scrollbar-light';

  const labelClasses = 'leading-tight font-medium text-black';

  // Hack to ensure that the max height of second column is equal to the first column (not reproducible with CSS alone)
  const goalAndObjectivesRef = useRef<HTMLDivElement | null>(null);
  const descriptionRef = useRef<HTMLDivElement | null>(null);
  const [goalAndObjectivesHeight, setGoalAndObjectivesHeight] = useState(0);

  useEffect(() => {
    if (goalAndObjectivesRef.current && descriptionRef.current) {
      const height1 =
        goalAndObjectivesRef.current.getBoundingClientRect().height;
      setGoalAndObjectivesHeight(height1);
    }
  }, [course]);
  // End of hack

  return (
    <div className="flex flex-col text-dashboardSectionTitle w-full mt-3 lg:mt-10">
      <h2 className="mb-2.5 lg:mb-4 text-dashboardSectionTitle title-medium-sb-18px lg:title-large-sb-24px">
        {course.name}
      </h2>
      <p className="text-dashboardSectionText/75 body-14px lg:body-16px">
        {t('dashboard.teacher.courses.quickRecap')}
      </p>

      <div className="flex flex-col gap-6 mb-5 mt-6 lg:mb-8 lg:mt-10 lg:bg-newGray-6 lg:shadow-course-navigation lg:rounded-[20px] lg:p-5 max-w-xl lg:max-w-5xl">
        {/* Course details section */}
        <div className="flex flex-col gap-5 lg:gap-10 w-full items-center">
          <div className="flex max-lg:flex-col items-center justify-center w-full gap-x-[60px] gap-y-5">
            <div className="flex flex-col gap-2.5 w-full max-w-[517px]">
              <div className="flex flex-col w-full">
                {Object.entries(courseItems).map(([key, value]) => (
                  <ListItem
                    key={key}
                    leftText={key}
                    rightText={value.toLocaleString()}
                    variant="light"
                  />
                ))}
              </div>
            </div>
            {/* Course image section */}
            <div className="w-full max-w-[406px] flex justify-center items-center max-lg:-order-1">
              <img
                src={assetUrl(`courses/${course.id}`, 'thumbnail.webp')}
                alt={course.name}
                className="rounded-[20px] shadow-course-navigation"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            <div
              className="flex flex-col gap-5 lg:flex-1"
              ref={goalAndObjectivesRef}
            >
              <div className="flex flex-col gap-3 w-full">
                <span className={labelClasses}>
                  {t('dashboard.teacher.courses.courseShortDescription')}
                </span>
                <p className={infoTextClasses}>{course.goal}</p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <span className={labelClasses}>
                  {t('dashboard.teacher.courses.objectives')}
                </span>
                <ul
                  className={cn(
                    'gap-0.5 w-full list-disc list-inside',
                    infoTextClasses,
                  )}
                >
                  {course.objectives.map((objective, i) => (
                    <li key={i}>{objective}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div
              className="flex flex-col gap-3 w-full  lg:flex-1 max-lg:!max-h-full"
              style={{ maxHeight: `${goalAndObjectivesHeight}px` }}
              ref={descriptionRef}
            >
              <span className={labelClasses}>
                {t('dashboard.teacher.courses.courseLongDescription')}
              </span>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h3 className="title-small-med-16px">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <div className="body-14px">{children}</div>
                  ),
                }}
                className={cn('gap-2 w-full', infoTextClasses)}
              >
                {course.rawDescription}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* TODO: check why we need type */}
      {isFetched && (
        <CourseCurriculum course={courseWithDetails as JoinedCourseWithAll}>
          <h4 className="mb-2.5 lg:mb-4 text-dashboardSectionTitle title-medium-sb-18px lg:title-large-sb-24px">
            {t('dashboard.teacher.courses.curriculum')}
          </h4>
          <p className="mb-8 body-14px lg:body-16px">
            {t('dashboard.teacher.courses.curriculumDescription')}
          </p>
        </CourseCurriculum>
      )}

      <MakeModificationBlock
        title={t('dashboard.teacher.courses.makeModifications')}
        titleLink={`https://github.com/PlanB-Network/bitcoin-educational-content/tree/dev/courses/${course.id}`}
        text="dashboard.teacher.courses.courseModification"
        textLink="/tutorials/others/github-desktop-work-environment"
      />
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
        className="mt-2.5 lg:mt-1.5"
      >
        <div className="px-5 pt-5 pb-8">
          <RatingChart chartData={chartData} />
        </div>
      </CollapsibleDropdown>
      <div className="h-px bg-newGray-4 w-full max-w-[416px] px-5 my-10 lg:mt-4" />
    </article>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const CourseReview = ({ courseId }: { courseId: string }) => {
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
                ratings={reviews.recommand}
              />
            </div>
          </div>

          <CourseFeedbacks feedbacks={reviews.feedbacks} />
        </>
      )}
    </section>
  );
};
