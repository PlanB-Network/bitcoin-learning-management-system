import { createFileRoute, useParams } from '@tanstack/react-router';
import { t } from 'i18next';
import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

import { Loader, cn } from '@blms/ui';

import { AnswersReviewPanel } from '#src/routes/_content/courses/$courseId/-components/exam-results.tsx';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute('/dashboard/_dashboard/course/$courseId')({
  component: DashboardStudentCourse,
});

function DashboardStudentCourse() {
  const { courseId } = useParams({
    from: '/dashboard/_dashboard/course/$courseId',
  });

  return <CourseExams courseId={courseId} />;
}

const CourseExams = ({ courseId }: { courseId: string }) => {
  const { data: examResults, isFetched: isExamResultsFetched } =
    trpc.user.courses.getAllUserCourseExamResults.useQuery({
      courseId,
    });

  const [collapsedStates, setCollapsedStates] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleCollapse = (index: number) => {
    setCollapsedStates((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  return (
    <div>
      <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
        {t('dashboard.course.completionDiploma')}
      </h2>
      <p className="desktop-typo-1 md:body-16px text-dashboardSectionText/75 mt-4">
        {t('dashboard.course.completionExamInfo')}
      </p>

      {!isExamResultsFetched && <Loader />}
      {isExamResultsFetched && examResults && examResults?.length > 0 && (
        <div className="max-w-[948px] mt-2.5 md:mt-12">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between body-14px-medium md:body-16px-medium text-dashboardSectionTitle mx-2.5">
              <span className="w-[180px] pl-1 max-md:mr-auto">
                {t('words.date')}
              </span>
              <span className="w-[503px] max-md:hidden">
                {t('words.location')}
              </span>
              <span className="w-[70px] md:w-[130px] md:text-center">
                {t('words.grade')}
              </span>
              <span className="max-md:hidden md:w-[138px] pr-1">
                <span className="max-md:hidden">{t('words.status')}</span>
              </span>
            </div>
            <div className="h-px bg-newGray-1"></div>
            {[...examResults]
              .sort(
                (a, b) =>
                  new Date(a.startedAt).getTime() -
                  new Date(b.startedAt).getTime(),
              )
              .map((exam, index) => {
                const isCollapsed = collapsedStates[index];

                return (
                  <div
                    className={cn(
                      'flex flex-col p-2.5',
                      isCollapsed && 'bg-newGray-6',
                    )}
                    key={index}
                  >
                    <div
                      className="cursor-pointer hover:font-medium body-16px text-newBlack-1 flex md:justify-between items-center"
                      onClick={() => toggleCollapse(index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleCollapse(index);
                        }
                      }}
                    >
                      <span className="pl-1 w-[180px] max-md:mr-auto">
                        {new Date(exam.startedAt).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                          },
                        )}
                      </span>
                      <span className="max-md:hidden w-[503px]">
                        {t('words.online')}
                      </span>
                      <span
                        className={cn(
                          'md:text-center body-medium-16px w-[52px] md:w-[130px]',
                          exam.succeeded ? 'text-brightGreen-6' : 'text-red-5',
                        )}
                      >
                        {exam.score}%
                      </span>
                      <div className="flex items-center justify-between pr-1 w-fit md:w-[138px]">
                        <span
                          className={cn(
                            'max-md:hidden body-16px italic',
                            exam.succeeded
                              ? 'text-brightGreen-6'
                              : 'text-red-5',
                          )}
                        >
                          {exam.succeeded
                            ? t('courses.exam.passed')
                            : t('courses.exam.failed')}
                        </span>
                        <IoIosArrowDown
                          className={cn(
                            'transition-all',
                            isCollapsed ? '-rotate-180' : '',
                          )}
                        />
                      </div>
                    </div>
                    <div
                      className={cn(
                        'flex flex-col max-md:gap-4 w-full',
                        isCollapsed ? 'w-full' : 'hidden',
                      )}
                    >
                      <span className="subtitle-small-caps-14px text-newBlack-1 md:text-newBlack-5">
                        {t('courses.exam.answersReview')}
                      </span>
                      <AnswersReviewPanel examResults={exam} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
