import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import type { JoinedCourseWithProfessors } from '@blms/types';
import { Tabs, TabsContent, TabsList, TabsTrigger, cn } from '@blms/ui';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { AppContext } from '#src/providers/context.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';
import { trpc } from '#src/utils/trpc.js';

export const Route = createFileRoute('/dashboard/_dashboard/professor/courses')(
  {
    component: DashboardProfessorCourses,
  },
);

function DashboardProfessorCourses() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }

  const coursesName = session?.user.professorCourses;

  const { data: courses, isFetched } =
    trpc.content.getProfessorCourses.useQuery(
      {
        coursesId: coursesName || [],
        language: i18n.language,
      },
      {
        staleTime: 300_000, // 5 minutes
        enabled: coursesName && coursesName.length > 0,
      },
    );

  return (
    <div className="flex flex-col gap-4 lg:gap-8 text-black">
      <div className="flex items-center gap-5">
        <h3 className="display-small-reg-32px">Courses management panel</h3>
        <span className="flex h-fit p-1 lg:py-[3px] lg:px-2 justify-center items-center rounded-md bg-[rgba(204,204,204,0.50)] text-newBlack-3 desktop-typo1 uppercase max-lg:hidden">
          {t('dashboard.teacher.profile.teacher')}
        </span>
      </div>
      <p className="text-sm">
        Here you can control and review all the information concerning each
        course you&apos;ve coordinated.
      </p>
      {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
      {isFetched && <CourseTabs courses={courses || []} />}
    </div>
  );
}

function CourseTabs({ courses }: { courses: JoinedCourseWithProfessors[] }) {
  const tabsTriggerClasses =
    'text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black';

  return (
    <Tabs defaultValue={courses?.at(0)?.id}>
      {/* TODO: Fix issue with first element not being displayed correctly on small screens */}
      <TabsList className="overflow-x-scroll no-scrollbar max-w-full">
        {courses?.map((course) => (
          <TabsTrigger
            key={course.id}
            value={course.id}
            className={cn(tabsTriggerClasses, 'uppercase')}
          >
            {course.id}
          </TabsTrigger>
        ))}
        <TabsTrigger value="newCourse" className={tabsTriggerClasses}>
          <a
            href="https://kutt.planb.network/add-course"
            target="_blank"
            rel="noreferrer"
          >
            Propose a new course
          </a>
        </TabsTrigger>
      </TabsList>
      {courses?.map((course) => (
        <CourseTabContent key={course.id} course={course} />
      ))}
    </Tabs>
  );
}

function CourseTabContent({ course }: { course: JoinedCourseWithProfessors }) {
  const tabsTriggerClasses =
    'text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black';

  return (
    <TabsContent value={course.id}>
      <Tabs defaultValue="details">
        <TabsList className="overflow-x-scroll no-scrollbar max-w-full">
          <TabsTrigger value="details" className={tabsTriggerClasses}>
            Course Details
          </TabsTrigger>
          <TabsTrigger value="review" className={tabsTriggerClasses} disabled>
            Reviews
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className={tabsTriggerClasses}
            disabled
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="exam-results"
            className={tabsTriggerClasses}
            disabled
          >
            Exam Results
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <CourseDetails course={course} />
        </TabsContent>
        <TabsContent value="review">Reviews</TabsContent>
        <TabsContent value="analytics">Analytics</TabsContent>
        <TabsContent value="exam-results">Exam Results</TabsContent>
      </Tabs>
    </TabsContent>
  );
}

function CourseDetails({ course }: { course: JoinedCourseWithProfessors }) {
  const { t } = useTranslation();

  const infoTextClasses =
    'flex flex-col py-1 px-4 bg-[#E9E9E9] rounded-md border border-[#7373731A] overflow-y-scroll text-newGray-1 body-14px whitespace-pre-line no-scrollbar';

  const labelClasses = 'text-xl leading-normal font-medium';

  return (
    <div className="flex flex-col text-[#060B15] w-full mt-10">
      <h1 className="display-small-reg-32px py-2.5 border-b border-black w-fit">
        {course.id.slice(0, 3).toUpperCase()}{' '}
        {course.id.slice(3, 6).toUpperCase()} - {course.name}
      </h1>
      <h2 className="title-large-sb-24px mt-6 lg:mt-10">Course details</h2>
      <p className="body-16px text-[#050A14BF] mt-4">
        Here is a quick recap of the course description.
      </p>

      <div className="flex flex-col lg:flex-row gap-6 mt-6 lg:mt-10">
        {/* Course details section */}
        <div className="flex flex-col gap-5 lg:gap-10 w-full">
          <div className="flex flex-wrap items-center gap-x-20 gap-y-5">
            <div className="flex flex-col gap-2.5 w-full max-w-[536px]">
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5">
                  <span className={cn('shrink-0', labelClasses)}>
                    Course ID
                  </span>
                  <p
                    className={cn(
                      'w-full lg:w-[364px] uppercase',
                      infoTextClasses,
                    )}
                  >
                    {course.id}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5">
                  <span className={cn('shrink-0', labelClasses)}>
                    Course name
                  </span>
                  <p className={cn('w-full lg:w-[364px]', infoTextClasses)}>
                    {course.name}
                  </p>
                </div>
              </div>
              <div className="flex flex-col h-[114px] gap-2.5">
                <span className={labelClasses}>Course short description</span>
                <p className={cn('h-full', infoTextClasses)}>{course.goal}</p>
              </div>
            </div>
            {/* Course image section */}
            <div className="w-full max-w-[420px] flex justify-center items-center max-lg:-order-1">
              <img
                src={computeAssetCdnUrl(
                  course.lastCommit,
                  `courses/${course.id}/assets/thumbnail.webp`,
                )}
                alt={course.name}
                className="rounded-2xl shadow-md"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            <div className="flex flex-col gap-5 justify-between w-full max-w-[536px]">
              <span className={labelClasses}>Courses long description</span>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h3 className="title-small-med-16px">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <div className="body-14px">{children}</div>
                  ),
                }}
                className={cn('gap-2 h-[114px] w-full', infoTextClasses)}
              >
                {course.rawDescription}
              </ReactMarkdown>
            </div>
            <div className="flex flex-col gap-5 justify-between w-full max-w-[536px]">
              <span className={labelClasses}>Objectives</span>
              <ul
                className={cn(
                  'gap-0.5 h-[114px] w-full list-disc list-inside',
                  infoTextClasses,
                )}
              >
                {course.objectives.map((objective, i) => (
                  <li key={i}>{objective}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mt-6 lg:mt-10">
        <Link
          to={`https://github.com/PlanB-Network/bitcoin-educational-content/tree/dev/courses/${course.id}`}
          className="w-fit underline underline-offset-2 text-darkOrange-5 hover:text-darkOrange-6 leading-tight lg:text-xl"
        >
          {t('dashboard.teacher.courses.makeModifications')}
        </Link>
        <p className="label-normal-16px lg:label-large-20px text-[#050A14BF]">
          <Trans i18nKey="dashboard.teacher.courses.courseModification">
            <Link
              className="text-newBlue-1 hover:text-darkOrange-5"
              to="/tutorials/others/github-desktop-work-environment"
            >
              Github Tutorial
            </Link>
          </Trans>
        </p>
      </div>
    </div>
  );
}
