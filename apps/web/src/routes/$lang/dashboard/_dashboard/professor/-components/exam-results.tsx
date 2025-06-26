import { Clock, DashGauge, Loader, RadialGauge, cn } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TbCalendar, TbClipboardText, TbClock, TbWeight } from 'react-icons/tb';
import { formatDateRange } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

export const ExamResults = ({ courseId }: { courseId: string }) => {
  const { t, i18n } = useTranslation();

  const { data: course } = useQuery(
    trpc.content.getCourse.queryOptions({
      language: i18n.language,
      id: courseId,
    }),
  );
  const singleTrialExams = course?.parts.flatMap((p) =>
    p.chapters.filter((c) => c?.isSingleTrialExam),
  );

  const isPlanBSchool = course?.isPlanbSchool;

  const { data: enrolledStudentsCount } = useQuery(
    trpc.user.courses.getEnrolledStudentsCount.queryOptions({
      courseId: courseId,
    }),
  );

  const { data: courseGradesAndSummary } = useQuery(
    trpc.user.courses.getTeacherLedCourseGrades.queryOptions(
      {
        courseId: courseId,
        passingThreshold: course?.passingGradeThreshold ?? 0,
      },
      {
        enabled: !!course && !!course?.passingGradeThreshold,
      },
    ),
  );

  const assignmentWeight = course?.assignmentWeight ?? 40;

  const isCourseConclusionReleased = !!course?.parts?.some((part) =>
    part.chapters.some(
      (chap) =>
        chap.isCourseConclusion &&
        chap.releaseDate != null &&
        chap.releaseDate <= new Date(),
    ),
  );

  // Placeholder
  const exams = [
    {
      index: 0,
      name: 'Mid-term exam',
      weight: 25,
      startDate: '15 May 2025',
      endDate: '17 May 2025',
      duration: 14,
      questionsCount: 25,
      averageScore: 85,
      medianScore: 78,
      averageDuration: 420, // in seconds
    },
    {
      index: 1,
      name: 'Project assignment',
      weight: 15,
      averageScore: 56,
      medianScore: 48,
    },
    {
      index: 2,
      name: 'Final exam',
      weight: 40,
      startDate: '18 May 2025',
      endDate: '22 May 2025',
      duration: 25,
      questionsCount: 50,
      averageScore: 70,
      medianScore: 68,
      averageDuration: 980, // in seconds
    },
  ];

  const finalResultsInfos = {
    graduatedStudents: courseGradesAndSummary?.graduatedStudentsAmount ?? 0,
    totalStudents: enrolledStudentsCount,
    averageScore: courseGradesAndSummary?.averageTotalScore ?? 0,
    thresholdToPass: course?.passingGradeThreshold,
  };

  if (!course) {
    return <Loader />;
  }

  if (!singleTrialExams || singleTrialExams.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col w-full max-w-[1066px] p-4 gap-4 lg:border border-newGray-5 bg-white rounded-2xl mt-3 lg:mt-8">
      {isCourseConclusionReleased && (
        <section className="flex flex-col items-center gap-3 lg:gap-7 w-full">
          <h2 className="text-center title-large-24px font-medium">
            {t('dashboard.teacher.courses.finalAverageResults')}
          </h2>
          <div className="flex flex-wrap lg:gap-2 items-center justify-center w-full">
            {finalResultsInfos.totalStudents &&
            finalResultsInfos.totalStudents > 0 ? (
              <DashGauge
                total={finalResultsInfos.totalStudents}
                completed={finalResultsInfos.graduatedStudents}
                label={t('dashboard.teacher.courses.studentsGraduated')}
                variant="orange"
                size="l"
              />
            ) : null}
            <RadialGauge
              percentage={finalResultsInfos.averageScore}
              label={t('dashboard.teacher.courses.averageScore')}
              variant="green"
              size="l"
            />
            <RadialGauge
              percentage={finalResultsInfos.thresholdToPass || 0}
              label={t('dashboard.teacher.courses.thresholdToPass')}
              variant="yellow"
              size="l"
            />
          </div>
        </section>
      )}
      {exams.map((exam) => (
        <ExamCard
          key={exam.index}
          index={exam.index}
          name={exam.name}
          weight={exam.weight}
          startDate={exam.startDate}
          endDate={exam.endDate}
          duration={exam.duration}
          questionsCount={exam.questionsCount}
          averageScore={exam.averageScore}
          medianScore={exam.medianScore}
          averageDuration={exam.averageDuration}
        />
      ))}
    </div>
  );
};

interface ExamCardProps {
  index: number;
  name: string;
  weight: number;
  startDate?: string;
  endDate?: string;
  duration?: number;
  questionsCount?: number;
  averageScore?: number;
  medianScore?: number;
  averageDuration?: number; // in seconds
}

const ExamCard = ({
  index,
  name,
  weight,
  startDate,
  endDate,
  duration,
  questionsCount,
  averageScore,
  medianScore,
  averageDuration,
}: ExamCardProps) => {
  const { t } = useTranslation();

  const areResultsPublished =
    averageScore !== undefined && medianScore !== undefined;

  return (
    <article className="bg-newGray-6 rounded-2xl overflow-hidden w-full">
      <header className="p-4 lg:px-6 lg:py-3 border-b border-newGray-5">
        <h4 className="label-med-18px font-medium lg:label-large-med-20px text-newBlack-1">
          {index + 1}. {name}
        </h4>
      </header>

      <section className="p-3 xl:p-6 flex max-xl:flex-col gap-4 xl:gap-7 w-full">
        <div className="flex flex-col grow self-center max-lg:w-full lg:min-w-80">
          <h5 className="mb-3 label-medium-med-16px text-newBlack-3">
            {t('words.structure')}
          </h5>

          <div className="flex flex-col gap-1.5 bg-white rounded-2xl p-2 lg:p-5">
            {questionsCount && (
              <InfoRow
                label={t('words.questions')}
                value={questionsCount}
                icon={<TbClipboardText className="size-6 shrink-0" />}
                showBorder={true}
              />
            )}

            <InfoRow
              label={t('words.weight')}
              value={
                <div className="flex items-center gap-3">
                  <span>{weight}%</span>
                  <WeightIndicator weight={weight} />
                </div>
              }
              icon={<TbWeight className="size-6 shrink-0" />}
              showBorder={!!(duration || (startDate && endDate))}
            />

            {duration && (
              <InfoRow
                label={t('words.duration')}
                value={`${duration}'`}
                icon={<TbClock className="size-6 shrink-0" />}
                showBorder={true}
              />
            )}

            {startDate && endDate && (
              <InfoRow
                label={t('words.date')}
                value={formatDateRange(new Date(startDate), new Date(endDate))}
                icon={<TbCalendar className="size-6 shrink-0" />}
              />
            )}
          </div>
        </div>
        {areResultsPublished && (
          <div className="flex flex-col items-center">
            <h5 className="mb-3 label-medium-med-16px text-newBlack-3 self-start">
              {t('words.results')}
            </h5>

            <div className="flex items-center gap-2 flex-wrap">
              <RadialGauge
                percentage={averageScore}
                label={t('dashboard.teacher.courses.averageScore')}
                variant="green"
                showBackground
              />
              <RadialGauge
                percentage={medianScore}
                label={t('dashboard.teacher.courses.medianScore')}
                variant="purple"
                showBackground
              />

              {averageDuration && (
                <Clock
                  time={`${Math.floor(averageDuration / 60)}’${(averageDuration % 60).toString().padStart(2, '0')}’’`}
                  label={t('dashboard.teacher.courses.averageDuration')}
                  variant="blue"
                  showBackground
                />
              )}
            </div>
          </div>
        )}
      </section>
    </article>
  );
};

const InfoRow = ({
  label,
  value,
  icon,
  showBorder = false,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  showBorder?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      'flex justify-between items-center py-1.5 gap-2',
      showBorder && 'border-b border-newGray-6',
      className,
    )}
  >
    <div className="flex items-center gap-2 text-newGray-1 shrink-0">
      {icon}
      <span className="subtitle-small-14px lg:label-18px">{label}</span>
    </div>
    <span className="subtitle-small-14px lg:label-18px text-newBlack-3">
      {value}
    </span>
  </div>
);

const WeightIndicator = ({ weight }: { weight: number }) => {
  const filledBars = Math.ceil(weight / 20);
  return (
    <div className="flex gap-0.25">
      {[...Array(5)].map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={`weight-bar-${i}`}
          className={cn(
            'w-1.5 h-5.5',
            i < filledBars ? 'bg-newGray-2' : 'bg-newGray-5',
          )}
        />
      ))}
    </div>
  );
};
