import type { CourseResponse, JoinedCourseChapter } from '@blms/types';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ButtonWithArrow,
  CollapsibleDropdown,
  DividerSimple,
  DividerVertical,
  Loader,
  cn,
} from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { BiPencil } from 'react-icons/bi';
import { IoMdLock } from 'react-icons/io';
import { MdOutlineCalendarMonth } from 'react-icons/md';
import { TbAlertOctagon } from 'react-icons/tb';
import SuccessExam from '#src/assets/icons/success_party.svg?react';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { formatDate, formatDateRange } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

export const SingleTrialExam = ({
  course,
}: {
  course: CourseResponse;
}) => {
  const { data: userProgress } = useQuery(
    trpc.user.courses.getProgress.queryOptions({
      courseId: course.id,
    }),
  );

  const courseProgress = userProgress?.[0];
  const assignmentScore = courseProgress?.assignmentGrade;

  const singleTrialExams = course?.parts.flatMap((p) =>
    p.chapters.filter((c) => c?.isSingleTrialExam),
  );

  const assignmentWeight = course?.assignmentWeight ?? 40;

  const totalWeight =
    singleTrialExams.reduce((acc, exam) => acc + (exam.rateWeight ?? 0), 0) +
    assignmentWeight;

  const finalScore = courseProgress?.totalScore || 0;
  const passingThreshold = course.passingGradeThreshold ?? 50;
  const placeholderTotalStudents = 200;

  const hasPassed = finalScore >= passingThreshold;

  const scoreAndRankingClasses =
    'flex flex-col gap-2.5 md:gap-4 items-center justify-center p-5 bg-white rounded-2xl border border-newGray-5 w-full md:max-w-80';

  return (
    <section className="flex flex-col mt-6 md:mt-10 w-full max-w-[1000px] gap-6">
      {course.isAssignmentGradingPublished && (
        <>
          <div className="flex flex-col gap-4 md:gap-6 w-full">
            <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle capitalize">
              {t('dashboard.course.finalGradeSummary')}
            </h2>
            <section className="flex flex-col items-center w-full rounded-2xl bg-newGray-6 border border-newGray-5 p-8 gap-10">
              <div className="flex flex-col items-center gap-5">
                {hasPassed && (
                  <SuccessExam className="size-7 md:size-9 fill-brightGreen-6" />
                )}
                <p className="whitespace-pre-line label-med-18px md:label-large-med-20px text-newBlack-1 text-center">
                  {hasPassed
                    ? t('dashboard.course.congratulationsPassed')
                    : t('dashboard.course.keepMovingForward')}
                </p>
              </div>
              <div className="flex max-md:flex-col max-md:items-center gap-2.5 md:gap-4 items-stretch justify-center w-full">
                <div className={scoreAndRankingClasses}>
                  <span
                    className={cn(
                      hasPassed ? 'text-brightGreen-6' : 'text-red-5',
                      'title-large-sb-24px md:display-small-med-32px',
                    )}
                  >
                    {finalScore}%
                  </span>
                  <div className="flex flex-col items-center">
                    <span className="subtitle-medium-16px md:label-18px text-newGray-1">
                      {t('dashboard.course.finalScore')}
                    </span>
                    <span className="body-12px text-newGray-2">
                      {t('dashboard.course.thresholdToPass', {
                        threshold: passingThreshold,
                      })}
                    </span>
                  </div>
                </div>
                <div className={scoreAndRankingClasses}>
                  <span
                    className={cn(
                      'text-darkOrange-6 title-large-sb-24px md:display-small-med-32px',
                    )}
                  >
                    {courseProgress?.ranking ?? '-'} /{' '}
                    {placeholderTotalStudents}
                  </span>
                  <span className="subtitle-medium-16px md:label-18px text-newGray-1">
                    {t('dashboard.course.ranking')}
                  </span>
                </div>
              </div>
            </section>
          </div>
          {hasPassed && (
            <Alert hasCloseButton variant="warning">
              <AlertTitle icon={TbAlertOctagon}>
                {t('dashboard.course.diplomaReleaseTitle')}
              </AlertTitle>
              <AlertDescription className="max-md:body-14px text-newBlack-2">
                {t('dashboard.course.diplomaReleaseDescription')}
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
      <div className="flex flex-col gap-2.5 md:gap-6">
        <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
          {t('dashboard.course.exams')}
        </h2>
        <CollapsibleDropdown
          title={t('dashboard.course.generalInformation')}
          className="border border-newGray-4"
          variant="dark"
          defaultOpen={singleTrialExams.length === 0}
          type="info"
        >
          <p className="whitespace-pre-line text-newBlack-4 body-14px md:body-16px">
            {t('dashboard.course.planbSchoolGeneralInformation', {
              threshold: passingThreshold,
            })}
          </p>
        </CollapsibleDropdown>
      </div>

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
        {course.isPlanbSchool &&
          (courseProgress ? (
            <AssignmentItem
              title={t('dashboard.course.assignmentTitle')}
              description={t('dashboard.course.individualWork')}
              weight={assignmentWeight}
              startDate={new Date('2024-06-02')}
              endDate={new Date('2024-06-18T23:59:00')}
              score={
                typeof assignmentScore === 'number' && assignmentScore >= 0
                  ? assignmentScore
                  : undefined
              }
              isGradePublished={course.isAssignmentGradingPublished}
            />
          ) : (
            <Loader />
          ))}
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

  const { data: examInfo, isFetched: isExamInfoFetched } = useQuery(
    trpc.user.courses.getExamInfo.queryOptions({
      chapterId: chapterId,
      language: language,
    }),
  );

  const { data: examResults, isFetched: isExamResultsFetched } = useQuery(
    trpc.user.courses.getLatestExamResults.queryOptions({
      courseId: courseId,
      chapterId: chapterId,
    }),
  );

  const now = Date.now();
  const isMobile = useSmaller('md');

  const isExamOngoing =
    exam.startDate.getTime() <= now && exam.endDate.getTime() >= now;
  const isExamEnded = exam.endDate.getTime() < now;
  const examWeight = Math.round(((exam.rateWeight ?? 1) * 100) / totalWeight);

  const nbQuestion = examInfo?.nbQuestions ?? 0;

  return isExamResultsFetched ? (
    <div className="flex flex-col md:flex-row md:items-center h-full p-4 border border-newGray-5 bg-newGray-6 rounded-2xl gap-3 md:gap-5">
      <div className="flex flex-col gap-1 w-52">
        <span className="subtitle-large-med-18px md:subtitle-large-med-20px">
          {exam.title}
        </span>
        <span className="body-14px md:body-16px text-newGray-1">
          {t('courses.exam.weight', { weight: examWeight })}
        </span>
      </div>
      <DividerVertical className="max-md:hidden my-1 mx-2 bg-newGray-4 h-12" />
      <DividerSimple className="md:hidden bg-newGray-4" />
      <div className="flex flex-col md:flex-row md:items-center max-md:gap-4 justify-between flex-1">
        <div className="flex flex-col gap-1.5">
          {examResults ? (
            <p className="subtitle-large-med-18px md:subtitle-large-med-20px">
              <span>{t('dashboard.course.examScore')} </span>
              <span className="text-darkOrange-5">{examResults.score}%</span>
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 text-newBlack-3">
                <BiPencil size={24} />
                {isExamInfoFetched ? (
                  <span className="subtitle-medium-16px md:subtitle-large-18px">
                    {t('courses.exam.nbQuestions', { nb: nbQuestion })} /{' '}
                    {t('courses.exam.nbMinutes', { nb: nbQuestion / 2 })}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-newBlack-3">
                <MdOutlineCalendarMonth size={24} />
                <span className="subtitle-medium-16px md:subtitle-large-18px">
                  {formatDate(exam.startDate)}
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
              variant={'outline'}
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

const AssignmentItem = ({
  title,
  description,
  weight,
  startDate,
  endDate,
  isGradePublished,
  score,
}: {
  title: string;
  description: string;
  weight: number;
  startDate: Date;
  endDate: Date;
  isGradePublished: boolean;
  score?: number;
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center h-full p-4 border border-newGray-5 bg-newGray-6 rounded-2xl gap-3 md:gap-5">
      <div className="flex flex-col gap-1 w-52">
        <span className="subtitle-large-med-18px md:subtitle-large-med-20px">
          {title}
        </span>
        <span className="body-14px md:body-16px text-newGray-1">
          {t('courses.exam.weight', { weight })}
        </span>
      </div>
      <DividerVertical className="max-md:hidden my-1 mx-2 bg-newGray-4 h-12" />
      <DividerSimple className="md:hidden bg-newGray-4" />
      <div className="flex flex-col md:flex-row md:items-center max-md:gap-4 justify-between flex-1">
        <div className="flex flex-col gap-1.5">
          {isGradePublished ? (
            score !== undefined ? (
              <p className="subtitle-large-med-18px md:subtitle-large-med-20px">
                <span>{t('dashboard.course.examScore')} </span>
                <span className="text-darkOrange-5">{score}%</span>
              </p>
            ) : (
              <p className="subtitle-large-med-18px md:subtitle-large-med-20px">
                {t('words.notApplicable')}
              </p>
            )
          ) : (
            <>
              <div className="flex items-center gap-2 text-newBlack-3">
                <BiPencil size={24} />
                <span className="subtitle-medium-16px md:subtitle-large-18px">
                  {description}
                </span>
              </div>
              <div className="flex items-center gap-2 text-newBlack-3">
                <MdOutlineCalendarMonth size={24} />
                <span className="subtitle-medium-16px md:subtitle-large-18px">
                  {formatDateRange(startDate, endDate)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
