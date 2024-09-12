import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import type {
  JoinedCourseWithAll,
  JoinedCourseWithProfessors,
} from '@blms/types';
import { Loader, Tabs, TabsContent, cn } from '@blms/ui';

import { DropdownMenu } from '#src/components/Dropdown/dropdown-menu.js';
import { TabsListSegmented } from '#src/components/Tabs/TabsListSegmented.js';
import { TabsListUnderlined } from '#src/components/Tabs/TabsListUnderlined.js';
import { CourseCurriculum } from '#src/organisms/course-curriculum.js';
import { AppContext } from '#src/providers/context.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';
import { trpc } from '#src/utils/trpc.js';

import { MakeModificationBlock } from './-components/make-modification.tsx';

export const Route = createFileRoute('/dashboard/_dashboard/professor/courses')(
  {
    component: DashboardProfessorCourses,
  },
);

interface CourseInfoItemProps {
  leftText: string;
  rightText: string;
  className?: string;
}

const CourseInfoItem = ({
  leftText,
  rightText,
  className,
}: CourseInfoItemProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between last-of-type:border-none border-b border-newGray-4 pb-2 last:pb-0 gap-2',
        className,
      )}
    >
      <span className="text-newBlack-4 leading-relaxed tracking-[0.08px]">
        {leftText}
      </span>
      <span className="text-black font-medium leading-relaxed tracking-[0.08px] text-right">
        {rightText}
      </span>
    </div>
  );
};

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
      <div className="flex max-lg:flex-col lg:items-center gap-2 lg:gap-5">
        <h3 className="display-small-reg-32px">
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

function CourseTabs({ courses }: { courses: JoinedCourseWithProfessors[] }) {
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

      <DropdownMenu
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
      />

      {courses?.map((course) => (
        <CourseTabContent key={course.id} course={course} />
      ))}
    </Tabs>
  );
}

function CourseTabContent({ course }: { course: JoinedCourseWithProfessors }) {
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
              disabled: true,
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
          {t('dashboard.teacher.courses.reviews')}
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
}

function CourseDetails({ course }: { course: JoinedCourseWithProfessors }) {
  const { t, i18n } = useTranslation();

  const courseItems = {
    'Course Name': course.name,
    Professor: course.professors.map((professor) => professor.name).join(', '),
    Level: t(`words.level.${course.level}`),
    Duration: `${course.hours} ${t('words.hours')}`,
    Price:
      course.paidPriceDollars && course.paidPriceDollars > 0
        ? `$${course.paidPriceDollars}`
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
    'flex flex-col py-1 px-4 bg-white rounded-md border border-newGray-4 overflow-y-scroll text-newBlack-3 body-14px !leading-[120%] whitespace-pre-line scrollbar-thin';

  const labelClasses = 'leading-tight font-medium text-black';

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
              <div className="flex flex-col gap-2.5 w-full">
                {Object.entries(courseItems).map(([key, value]) => (
                  <CourseInfoItem
                    key={key}
                    leftText={key}
                    rightText={value.toLocaleString()}
                  />
                ))}
              </div>
            </div>
            {/* Course image section */}
            <div className="w-full max-w-[406px] flex justify-center items-center max-lg:-order-1">
              <img
                src={computeAssetCdnUrl(
                  course.lastCommit,
                  `courses/${course.id}/assets/thumbnail.webp`,
                )}
                alt={course.name}
                className="rounded-[20px] shadow-course-navigation"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            <div className="flex flex-col gap-5 lg:max-w-[482px]">
              <div className="flex flex-col gap-3 w-full">
                <span className={labelClasses}>
                  {t('dashboard.teacher.courses.courseShortDescription')}
                </span>
                <p className={cn('lg:h-[44px]', infoTextClasses)}>
                  {course.goal}
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <span className={labelClasses}>
                  {t('dashboard.teacher.courses.objectives')}
                </span>
                <ul
                  className={cn(
                    'gap-0.5 lg:h-[115px] w-full list-disc list-inside',
                    infoTextClasses,
                  )}
                >
                  {course.objectives.map((objective, i) => (
                    <li key={i}>{objective}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full lg:max-w-[482px]">
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
                className={cn(
                  'gap-2 lg:max-h-[210px] lg:h-full w-full',
                  infoTextClasses,
                )}
              >
                {course.rawDescription}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* TODO: check why we need type */}
      {isFetched && (
        <CourseCurriculum course={courseWithDetails as JoinedCourseWithAll} />
      )}

      <MakeModificationBlock
        title={t('dashboard.teacher.courses.makeModifications')}
        titleLink={`https://github.com/PlanB-Network/bitcoin-educational-content/tree/dev/courses/${course.id}`}
        text="dashboard.teacher.courses.courseModification"
        textLink="/tutorials/others/github-desktop-work-environment"
      />
    </div>
  );
}
