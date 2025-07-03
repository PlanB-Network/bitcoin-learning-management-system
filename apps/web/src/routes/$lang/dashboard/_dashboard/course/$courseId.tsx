import { Tabs, TabsContent, TabsListUnderlined, TextTag } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useLocation } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { addSpaceToCourseIndex } from '#src/utils/courses.ts';
import { trpc } from '#src/utils/trpc.ts';
import { Assignment } from './-components/assignment.tsx';
import { CourseOverview } from './-components/course-overview.tsx';
import { CourseRatings } from './-components/course-ratings.tsx';
import { CourseRetakeExam } from './-components/course-retake-exam.tsx';
import { SingleTrialExam } from './-components/single-trial-exam.tsx';
import { SummerSchool } from './-components/summer-school.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/course/$courseId',
)({
  component: DashboardStudentCourse,
  params: {
    parse: (params) => ({
      courseId: z.string().parse(params.courseId),
    }),
    stringify: ({ courseId }) => ({ courseId: `${courseId}` }),
  },
});

function DashboardStudentCourse() {
  const isMobile = useSmaller('md');
  const { i18n } = useTranslation();
  const params = Route.useParams();

  const location = useLocation();
  const { data: course, isFetched } = useQuery(
    trpc.content.getCourse.queryOptions(
      {
        id: params.courseId,
        language: i18n.language,
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  const { data: userProgress } = useQuery(
    trpc.user.courses.getProgress.queryOptions({
      courseId: params.courseId,
    }),
  );

  const courseProgress = userProgress?.[0];
  const isSelectedForSummerSchool =
    courseProgress?.isSelectedForFinalLesson ?? false;

  const reviewChapterId =
    course?.parts
      .flatMap((part) => part.chapters)
      ?.find((c) => c?.isCourseReview)?.chapterId ?? null;

  const courseHaveRetakeExam = course?.parts.some((p) =>
    p.chapters.some((c) => c?.isCourseExam),
  );

  const courseHaveSingleTrialExam = course?.parts.some((p) =>
    p.chapters.some((c) => c?.isSingleTrialExam),
  );

  const courseHaveAssignments = course?.isPlanbSchool;

  const isBizSchool =
    course?.id === 'c762773a-9017-4129-bc0e-06adf86050ef' ||
    course?.id === '576ac496-a4fd-471a-b022-e0da1ab89a29';

  const tabs = [
    { key: 'overview', text: t('words.overview'), value: 'overview' },
  ];
  if (courseHaveRetakeExam) {
    tabs.push({
      key: 'retakeExam',
      text: t('courses.exam.examAndDiploma'),
      value: 'retakeExam',
    });
  }
  if (courseHaveSingleTrialExam) {
    tabs.push({
      key: 'singleTrialExam',
      text: t('courses.exam.examAndDiploma'),
      value: 'singleTrialExam',
    });
  }
  if (courseHaveAssignments) {
    tabs.push({
      key: 'assignment',
      text: t('dashboard.course.assignment'),
      value: 'assignment',
    });
  }
  if (isBizSchool && isSelectedForSummerSchool) {
    tabs.push({
      key: 'summerSchool',
      text: t('dashboard.course.summerSchool'),
      value: 'summerSchool',
    });
  }
  if (reviewChapterId) {
    tabs.push({ key: 'ratings', text: t('words.ratings'), value: 'ratings' });
  }

  const [currentTab, setCurrentTab] = useState<string>();

  useEffect(() => {
    let hash = location.hash.replace('#', '');
    hash = decodeURI(hash);
    const validTabs = tabs.map((tab) => tab.value);
    setCurrentTab(validTabs.includes(hash) ? hash : tabs[0].value);
  }, [tabs]);

  const onTabChange = (value: string) => {
    setCurrentTab(value);
    window.location.hash = value;
  };

  return (
    <div>
      {isFetched && course && (
        <div className="flex flex-col gap-4 md:gap-8">
          <div className="flex max-md:flex-col md:items-center gap-2 md:gap-5">
            <TextTag size="small" className="uppercase w-fit max-md:hidden">
              {addSpaceToCourseIndex(course.index)}
            </TextTag>
            <h3 className="display-small-32px">{course.name}</h3>
          </div>
          <Tabs
            defaultValue="overview"
            value={currentTab}
            onValueChange={onTabChange}
            className="w-full"
          >
            <TabsListUnderlined
              tabs={tabs.map((tab) => ({
                ...tab,
                active: currentTab === tab.value,
              }))}
              size={isMobile ? 's' : 'm'}
            />
            {/* Overview */}
            <TabsContent value="overview">
              <CourseOverview course={course} />
            </TabsContent>
            {/* RetakeExam */}
            {courseHaveRetakeExam ? (
              <TabsContent value="retakeExam">
                <CourseRetakeExam
                  courseId={params.courseId}
                  courseIndex={course.index}
                  examLink={`/courses/${params.courseId}/${
                    course.parts
                      .find((part) =>
                        part.chapters.find((chapter) => chapter?.isCourseExam),
                      )
                      ?.chapters.find((chapter) => chapter?.isCourseExam)
                      ?.chapterId
                  }`}
                />
              </TabsContent>
            ) : null}
            {/* SingleTrialExam */}
            {courseHaveSingleTrialExam ? (
              <TabsContent value="singleTrialExam">
                <SingleTrialExam course={course} />
              </TabsContent>
            ) : null}
            {courseHaveAssignments ? (
              <TabsContent value="assignment">
                <Assignment courseId={params.courseId} />
              </TabsContent>
            ) : null}

            {/* Summer school */}
            {isBizSchool && isSelectedForSummerSchool ? (
              <TabsContent value="summerSchool">
                <SummerSchool courseId={course.id} />
              </TabsContent>
            ) : null}
            {/* Ratings */}
            {reviewChapterId ? (
              <TabsContent value="ratings">
                <CourseRatings
                  courseId={course.id}
                  reviewChapterId={reviewChapterId}
                />
              </TabsContent>
            ) : null}
          </Tabs>
        </div>
      )}
    </div>
  );
}
