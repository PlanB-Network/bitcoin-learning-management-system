import type { CourseResponse, JoinedCourseChapter } from '@blms/types';
import { Button, DividerSimple, DividerVertical, Loader } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { BiPencil } from 'react-icons/bi';
import { IoMdLock } from 'react-icons/io';
import { MdOutlineCalendarMonth } from 'react-icons/md';
import { CollapsibleDropdown } from '#src/components/Dropdown/collapsible-dropdown.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { getDateString } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

export const SingleTrialExam = ({
  course,
}: {
  course: CourseResponse;
}) => {
  const singleTrialExams = course?.parts.flatMap((p) =>
    p.chapters.filter((c) => c?.isSingleTrialExam),
  );

  const assignmentWeight = 40;

  const totalWeight =
    singleTrialExams.reduce((acc, exam) => acc + (exam.rateWeight ?? 0), 0) +
    assignmentWeight;

  return (
    <section className="flex flex-col mt-4 md:mt-10 w-full max-w-[1000px] gap-6">
      <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
        {t('dashboard.course.exams')}
      </h2>
      <CollapsibleDropdown
        title={t('dashboard.course.generalInformation')}
        className="border border-newGray-4"
        variant="dark"
        defaultOpen={true}
        type="info"
      >
        <p className="whitespace-pre-line text-newBlack-4 max-md:text-sm">
          {t('dashboard.course.planbSchoolExamDescription')}
        </p>
      </CollapsibleDropdown>

      <div className="flex flex-col gap-4">
        {singleTrialExams.map((exam) => {
          return (
            <ExamItem
              key={exam.chapterId}
              exam={exam}
              totalWeight={totalWeight}
              courseId={course.id}
              chapterId={exam.chapterId}
              language={exam.language}
            />
          );
        })}
      </div>
    </section>
  );
};

const ExamItem = ({
  exam,
  totalWeight,
  courseId,
  chapterId,
  language,
}: {
  exam: JoinedCourseChapter;
  totalWeight: number;
  courseId: string;
  chapterId: string;
  language: string;
}) => {
  if (!exam.startDate || !exam.endDate) return null;

  const { data: examInfo, isFetched: isExamInfoFetched } =
    trpc.user.courses.getExamInfo.useQuery({
      chapterId: chapterId,
      language: language,
    });

  const { data: examResults, isFetched: isExamResultsFetched } =
    trpc.user.courses.getLatestExamResults.useQuery({
      courseId: courseId,
      chapterId: chapterId,
    });

  const now = Date.now();
  const isMobile = useSmaller('md');

  const isExamOngoing =
    exam.startDate.getTime() <= now && exam.endDate.getTime() >= now;
  const isExamEnded = exam.endDate.getTime() < now;
  const examWeight = Math.round(((exam.rateWeight ?? 1) * 100) / totalWeight);

  let nbQuestion = examInfo?.nbQuestions ?? 0;

  // TODO remove hardcoded data when quiz questions are in the data repo
  if (exam.chapterId === '6065ea4e-2675-11f0-b6ab-bb5e1522cb78') {
    nbQuestion = 25;
  } else if (exam.chapterId === '9a307a50-2675-11f0-a893-57c148082c1f') {
    nbQuestion = 50;
  }

  return isExamResultsFetched ? (
    <div className="flex flex-col md:flex-row md:items-center h-full p-4 border border-newGray-5 bg-newGray-6 rounded-2xl gap-3 md:gap-5">
      <div className="flex flex-col gap-1 w-52">
        <span className="text-lg font-semibold">{exam.title}</span>
        <span className="text-sm text-newGray-1">
          {t('courses.exam.weight', { weight: examWeight })}
        </span>
      </div>
      <DividerVertical className="max-md:hidden my-1 mx-2 bg-newGray-4 h-12" />
      <DividerSimple className="md:hidden bg-newGray-4" />
      <div className="flex flex-col md:flex-row md:items-center max-md:gap-4 justify-between flex-1">
        <div className="flex flex-col gap-1.5">
          {examResults ? (
            <p className="subtitle-large-med-20px">
              <span>{t('dashboard.course.examScore')} </span>
              <span className="text-darkOrange-5">{examResults.score}%</span>
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-newBlack-3">
                <BiPencil size={24} />
                {isExamInfoFetched ? (
                  <span>
                    {t('courses.exam.nbQuestions', { nb: nbQuestion })} /{' '}
                    {t('courses.exam.nbMinutes', { nb: nbQuestion / 2 })}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-sm text-newBlack-3">
                <MdOutlineCalendarMonth size={24} />
                <span>
                  {getDateString(
                    exam.startDate,
                    exam.endDate,
                    undefined,
                    false,
                    false,
                  )}
                </span>
              </div>
            </>
          )}
        </div>
        {examResults ? (
          <Link
            to={'/courses/$courseId/$chapterId'}
            params={{
              courseId: courseId,
              chapterId: exam.chapterId,
            }}
          >
            <ButtonWithArrow
              variant={'primary'}
              className="w-fit"
              size={isMobile ? 's' : 'm'}
            >
              <span>{t('courses.exam.viewExam')}</span>
            </ButtonWithArrow>
          </Link>
        ) : (
          <>
            {isExamOngoing ? (
              <Link
                to={'/courses/$courseId/$chapterId'}
                params={{
                  courseId: courseId,
                  chapterId: exam.chapterId,
                }}
              >
                <ButtonWithArrow
                  variant={'primary'}
                  className="w-fit"
                  size={isMobile ? 's' : 'm'}
                >
                  <span>{t('courses.exam.takeExam')}</span>
                </ButtonWithArrow>
              </Link>
            ) : isExamEnded ? null : (
              <Button
                variant={'primary'}
                disabled
                className="w-fit"
                size={isMobile ? 's' : 'm'}
              >
                <IoMdLock size={24} className="mr-2" />
                <span>{t('courses.exam.takeExam')}</span>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  ) : (
    <Loader />
  );
};
