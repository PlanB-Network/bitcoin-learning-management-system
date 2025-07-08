import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import type { JoinedCourse } from '@blms/types';
import {
  cn,
  DropdownMenu,
  Loader,
  Tabs,
  TabsContent,
  TabsListSegmented,
  TabsListUnderlined,
} from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';
import { CourseAnnouncements } from './-components/course-announcements.tsx';
import { CourseAssignment } from './-components/course-assignment.tsx';
import { CourseDetails } from './-components/course-details.tsx';
import { CourseReview } from './-components/course-review.tsx';
import { ExamResults } from './-components/exam-results.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/professor/courses',
)({
  component: DashboardProfessorCourses,
});

function DashboardProfessorCourses() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const { session, user } = useContext(AppContext);

  const { data: courses, isFetched } = useQuery(
    trpc.content.getProfessorCourses.queryOptions(
      {
        coursesId: user?.professorCourses ?? [],
        language: i18n.language,
      },
      {
        enabled: user?.role === 'professor', // 5 minutes
        staleTime: 300_000,
      },
    ),
  );

  useEffect(() => {
    if (!session) {
      navigate({ to: '/' });
    } else if (!canAccess(UserRole.Professor)(session?.user)) {
      navigate({ to: '/dashboard/courses' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-8 text-black">
      <div className="flex max-lg:flex-col lg:items-center gap-2 lg:gap-5 max-md:px-4">
        <h3 className="display-small-32px">
          {t('dashboard.teacher.courses.coursesManagementPanel')}
        </h3>
        <span className="flex size-fit p-1 lg:py-[3px] lg:px-2 justify-center items-center rounded-md bg-[rgba(204,204,204,0.50)] text-newBlack-3 desktop-typo1 uppercase">
          {t('dashboard.teacher.profile.teacher')}
        </span>
      </div>
      <p className="body-14px lg:body-16px text-dashboardSectionTitle max-md:px-4">
        {t('dashboard.teacher.courses.reviewInfos')}
      </p>
      {!isFetched && <Loader size={'s'} />}
      {isFetched && <CourseTabs courses={courses || []} />}
    </div>
  );
}

const CourseTabs = ({ courses }: { courses: JoinedCourse[] }) => {
  const [currentTab, setCurrentTab] = useState(courses?.at(0)?.index);

  const onTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <Tabs
      defaultValue={courses?.at(0)?.index}
      value={currentTab}
      onValueChange={onTabChange}
      className="flex flex-col gap-4"
    >
      <TabsListSegmented
        tabs={courses.map((course) => ({
          active: course.index === currentTab,
          key: course.index,
          text: `${course.index.toLocaleUpperCase()} - ${course.name}`,
          value: course.index,
        }))}
        slice={6}
        className="max-md:hidden max-md:px-4"
      >
        <a
          href="https://kutt.planb.network/add-course"
          target="_blank"
          rel="noreferrer"
          className={cn(
            'flex item-center max-md:basis-1/2 w-56 max-w-56 grow px-5 py-1.5 md:border-l md:first:border-l-0 !outline-hidden text-newBlack-3 hover:text-darkOrange-5 hover:font-medium text-center',
          )}
        >
          <span className="m-auto">
            {t('dashboard.teacher.courses.proposeNewCourse')}
          </span>
        </a>
      </TabsListSegmented>

      <label
        htmlFor="coursesSelector"
        className="text-dashboardSectionText leading-tight font-medium md:hidden max-md:px-4"
      >
        {t('dashboard.teacher.courses.selectCourse')}
      </label>
      <DropdownMenu
        id="coursesSelector"
        itemsList={[
          ...courses.map((course) => ({
            name: `${course.index.toLocaleUpperCase()} - ${course.name}`,
            onClick: () => setCurrentTab(course.index),
          })),
          {
            name: 'Propose new course',
            onClick: () =>
              window.open('https://kutt.planb.network/add-course', '_blank'),
          },
        ]}
        activeItem={
          `${currentTab?.toUpperCase()} - ${courses.find((course) => course.index === currentTab)?.name}` ||
          `${courses[0].index.toLocaleUpperCase()} - ${courses[0].name}`
        }
        variant="light"
        className="md:hidden max-md:px-4"
      />

      {courses?.map((course) => (
        <CourseTabContent key={course.id} course={course} />
      ))}
    </Tabs>
  );
};

const CourseTabContent = ({ course }: { course: JoinedCourse }) => {
  const isMobile = useSmaller('md');
  const { t } = useTranslation();

  const [currentTab, setCurrentTab] = useState('details');

  const onTabChange = (value: string) => {
    setCurrentTab(value);
  };

  return (
    <TabsContent value={course.index}>
      <Tabs
        defaultValue="details"
        value={currentTab}
        onValueChange={onTabChange}
      >
        <TabsListUnderlined
          tabs={[
            {
              active: 'details' === currentTab,
              key: 'details',
              text: t('dashboard.teacher.courses.courseDetails'),
              value: 'details',
            },
            {
              active: 'review' === currentTab,
              key: 'review',
              text: t('dashboard.teacher.courses.reviews'),
              value: 'review',
            },
            ...(course.teachingFormat === 'professor_led'
              ? [
                  {
                    active: 'announcement' === currentTab,
                    key: 'announcement',
                    text: t('dashboard.teacher.courses.announcements'),
                    value: 'announcement',
                  },
                ]
              : []),
            ...(course.hasAssignment
              ? [
                  {
                    active: 'assignment' === currentTab,
                    key: 'assignment',
                    text: t('dashboard.teacher.courses.assignment'),
                    value: 'assignment',
                  },
                ]
              : []),
            {
              active: 'examResults' === currentTab,
              key: 'examResults',
              text: t('courses.exam.examResults'),
              value: 'examResults',
            },
          ]}
          size={isMobile ? 's' : 'm'}
          className="max-md:mx-4"
        />
        <TabsContent value="details" className="max-md:px-4">
          <CourseDetails course={course} />
        </TabsContent>
        <TabsContent value="review" className="max-md:px-4">
          <CourseReview courseId={course.id} />
        </TabsContent>
        <TabsContent value="announcement" className="max-md:px-4">
          <CourseAnnouncements courseId={course.id} />
        </TabsContent>
        <TabsContent value="assignment" className="max-md:px-4">
          <CourseAssignment courseId={course.id} />
        </TabsContent>
        <TabsContent value="examResults">
          <ExamResults courseId={course.id} />
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
};
