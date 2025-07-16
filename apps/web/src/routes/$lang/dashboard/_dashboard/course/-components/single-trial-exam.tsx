/** biome-ignore-all lint/correctness/useHookAtTopLevel: TODO check */
import type { CourseResponse, JoinedCourseChapter } from '@blms/types';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ButtonWithArrow,
  CollapsibleDropdown,
  cn,
  DividerSimple,
  DividerVertical,
  Loader,
} from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { BiPencil } from 'react-icons/bi';
import { BsTwitterX } from 'react-icons/bs';
import { IoMdLock } from 'react-icons/io';
import { LuCircleAlert } from 'react-icons/lu';
import { MdOutlineCalendarMonth } from 'react-icons/md';
import { TbAlertOctagon, TbDownload } from 'react-icons/tb';
import ApprovedIcon from '#src/assets/icons/approved.svg?react';
import Finish from '#src/assets/icons/finish.svg?react';
import SuccessExam from '#src/assets/icons/success_party.svg?react';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { formatDate, formatDateRange } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

export const SingleTrialExam = ({ course }: { course: CourseResponse }) => {
  const { data: userProgress } = useQuery(
    trpc.user.courses.getProgress.queryOptions({
      courseId: course.id,
    }),
  );

  const { data: enrolledStudentsCount } = useQuery(
    trpc.user.courses.getEnrolledStudentsCount.queryOptions({
      courseId: course.id,
    }),
  );

  const { data: timestamp, isSuccess: isTimestampFetched } = useQuery(
    trpc.user.courses.getTeacherLedCourseDiplomaTimestamp.queryOptions({
      courseId: course.id,
    }),
  );

  const courseProgress = userProgress?.[0];
  const assignmentScore = courseProgress?.assignmentGrade;

  const singleTrialExams = course?.parts.flatMap((p) =>
    p.chapters.filter((c) => c?.isSingleTrialExam),
  );

  const courseHasAssignment = course?.hasAssignment;
  const assignmentWeight = course?.assignmentWeight ?? 40;

  const totalWeight =
    singleTrialExams.reduce((acc, exam) => acc + (exam.rateWeight ?? 0), 0) +
    assignmentWeight;

  const finalScore = courseProgress?.totalScore || 0;
  const passingThreshold = course.passingGradeThreshold ?? 50;
  const totalStudents = enrolledStudentsCount ?? '-';

  const hasPassed = finalScore >= passingThreshold;
  const isCourseConclusionReleased = !!course?.parts?.some((part) =>
    part.chapters.some(
      (chap) =>
        chap.isCourseConclusion &&
        chap.releaseDate != null &&
        chap.releaseDate <= new Date(),
    ),
  );

  const examItems = singleTrialExams.map((exam) => ({
    data: exam,
    startDate: exam.startDate,
    type: 'exam' as const,
  }));

  const assignmentItems = courseHasAssignment
    ? [
        {
          data: {
            description: t('dashboard.course.individualWork'),
            endDate: new Date(
              course.assignmentEndDate || '2024-06-18T23:59:00',
            ),
            isGradePublished: course.isAssignmentGradingPublished,
            score:
              typeof assignmentScore === 'number' && assignmentScore >= 0
                ? assignmentScore
                : undefined,
            startDate: new Date(course.assignmentStartDate || '2024-06-02'),
            title: t('dashboard.course.assignmentTitle'),
            weight: assignmentWeight,
          },
          startDate: new Date(course.assignmentStartDate || '2024-06-02'),
          type: 'assignment' as const,
        },
      ]
    : [];
  const allItems = [...examItems, ...assignmentItems].sort(
    (a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0),
  );

  const scoreAndRankingClasses =
    'flex flex-col gap-2.5 md:gap-4 items-center justify-center p-5 bg-white rounded-2xl border border-newGray-5 w-full md:max-w-80';

  return (
    <section className="flex flex-col mt-6 md:mt-10 w-full max-w-[1000px] gap-6">
      {isCourseConclusionReleased && (
        <>
          <div className="flex flex-col gap-4 md:gap-6 w-full">
            <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle capitalize">
              {t('dashboard.course.finalGradeSummary')}
            </h2>
            <section className="flex flex-col items-center w-full rounded-2xl bg-newGray-6 border border-newGray-5 px-2.5 py-5 md:p-8 gap-4 md:gap-10">
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
                    {courseProgress?.ranking ?? '-'} / {totalStudents}
                  </span>
                  <span className="subtitle-medium-16px md:label-18px text-newGray-1">
                    {t('dashboard.course.ranking')}
                  </span>
                </div>
              </div>
            </section>
          </div>
          {hasPassed &&
            (isCourseConclusionReleased ? (
              <section className="flex flex-col items-center w-full rounded-2xl bg-newGray-6 border border-newGray-5 px-2.5 py-5 md:p-8 gap-4 md:gap-5">
                <Finish className="fill-darkOrange-5 size-7 md:size-9" />
                <p className="label-medium-16px md:subtitle-large-med-20px text-newBlack-1 whitespace-pre-line text-center">
                  {t('dashboard.course.wellDoneCompleting')}
                </p>
                {isTimestampFetched && timestamp ? (
                  <DiplomaSection
                    timestampId={timestamp.id}
                    imgKey={timestamp.imgKey || ''}
                    courseName={course.name}
                    courseCoordinator={course.mainProfessors[0]?.name}
                  />
                ) : (
                  <Loader />
                )}
              </section>
            ) : (
              <Alert hasCloseButton variant="warning">
                <AlertTitle icon={TbAlertOctagon}>
                  {t('dashboard.course.diplomaReleaseTitle')}
                </AlertTitle>
                <AlertDescription className="max-md:body-14px text-newBlack-2">
                  {t('dashboard.course.diplomaReleaseDescription')}
                </AlertDescription>
              </Alert>
            ))}
        </>
      )}
      <div className="flex flex-col gap-2.5 md:gap-6">
        <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
          {t('dashboard.course.exams')}
        </h2>
        {course?.isPlanbSchool && (
          <CollapsibleDropdown
            title={t('dashboard.course.generalInformation')}
            className="border border-newGray-4"
            variant="dark"
            defaultOpen={singleTrialExams.length === 0}
            icon={<LuCircleAlert />}
          >
            <p className="whitespace-pre-line text-newBlack-4 body-14px md:body-16px">
              {t('dashboard.course.planbSchoolGeneralInformation', {
                threshold: passingThreshold,
              })}
            </p>
          </CollapsibleDropdown>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {allItems.map((item) => {
          if (item.type === 'exam') {
            return (
              <ExamItem
                key={item.data.chapterId}
                exam={item.data}
                totalWeight={totalWeight}
                courseId={course.id}
                chapterId={item.data.chapterId}
                language={item.data.language}
              />
            );
          }

          return (
            <AssignmentItem
              key={'assignment'}
              title={item.data.title}
              description={item.data.description}
              weight={item.data.weight}
              startDate={item.data.startDate}
              endDate={item.data.endDate}
              score={item.data.score}
              isGradePublished={item.data.isGradePublished}
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
      chapterId: chapterId,
      courseId: courseId,
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
              chapterId: exam.chapterId,
              courseId: courseId,
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
                  chapterId: exam.chapterId,
                  courseId: courseId,
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

interface DiplomaSectionProps {
  timestampId: string;
  imgKey: string;
  courseName: string;
  courseCoordinator: string;
}

const DiplomaSection = ({
  timestampId,
  imgKey,
  courseName,
  courseCoordinator,
}: DiplomaSectionProps) => {
  const { i18n } = useTranslation();

  return (
    <div className="flex flex-col w-full max-w-[549px] items-center">
      <img
        src={`/api/files/${imgKey}`}
        alt="Diploma"
        className="mt-4 md:mt-2.5"
      />

      <div className="flex max-md:flex-col max-md:items-center md:justify-between w-full mt-7 md:mt-5">
        <a
          href={`/api/files/zip/diplomas/${timestampId}`}
          download
          target="_blank"
          rel="noreferrer"
        >
          <Button
            size={'m'}
            variant="primary"
            className="items-center flex gap-2.5"
          >
            {t('dashboard.myCourses.download')}
            <TbDownload className="size-[18px] md:size-6" />
          </Button>
        </a>
        <div className="flex items-center gap-4 max-md:hidden ">
          <Link
            to={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              t('dashboard.course.tweetTextCourseDiploma', {
                certificateUrl: `${window.location.origin}/${i18n.language ?? 'en'}/course-diplomas/${timestampId}`,
                courseCoordinator: courseCoordinator,
                courseName: courseName,
              }),
            )}`}
            target="_blank"
            className="w-fit"
          >
            <Button
              variant="outline"
              size="m"
              className="flex gap-2.5 !font-normal"
            >
              {t('dashboard.myCourses.shareOn')}
              <BsTwitterX size={24} />
            </Button>
          </Link>
        </div>
      </div>
      <Link
        to={
          '/tutorials/contribution/others/pbn-certificate-timestamping-dd16f8c0-00c1-45fd-8792-920612bed18f'
        }
        target="_blank"
        className="mt-4 md:mt-2.5 md:self-start max-md:self-center flex flex-row items-center gap-2 text-newBlack-5 hover:text-newOrange-5 hover:underline max-md:order-3"
      >
        <ApprovedIcon className="size-4" />
        <span>{t('dashboard.myCourses.verify')}</span>
      </Link>
      <Link
        to={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          t('dashboard.course.tweetTextCourseDiploma', {
            certificateUrl: `${window.location.origin}/${i18n.language ?? 'en'}/course-diplomas/${timestampId}`,
            courseCoordinator: courseCoordinator,
            courseName: courseName,
          }),
        )}`}
        target="_blank"
        className="w-fit md:hidden mt-4"
      >
        <Button variant="outline" size="m">
          Share on
          <BsTwitterX size={18} className="ml-1.5" />
        </Button>
      </Link>
    </div>
  );
};
