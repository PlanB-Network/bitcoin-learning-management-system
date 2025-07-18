import type {
  CourseWithSingleTrialExamsGradesAndSummary,
  ExamQuestionStatistics,
  JoinedCourseChapter,
  MinimalAssignmentGrade,
  MinimalCourseExamAttemptWithUsername,
} from '@blms/types';
import {
  CustomGauge,
  cn,
  DashGauge,
  EmptyState,
  Loader,
  RadialGauge,
  SegmentedGauge,
} from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  TbCalendar,
  TbClipboardText,
  TbClock,
  TbFileStack,
  TbFileTypeXls,
  TbWeight,
} from 'react-icons/tb';
import XLSX from 'xlsx';

import { formatDateRange } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

const SELF_PACED_PASSING_THRESHOLD = 80;
const DEFAULT_ASSIGNMENT_WEIGHT = 40;
const MAX_QUESTIONS_IN_MULTI_ATTEMPT_EXAM = 40;
const DURATION_CALCULATION_QUESTIONS_PER_MINUTE = 2;
const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;
const WEIGHT_PER_BAR = 20;
const TOTAL_WEIGHT_BARS = 5;

export const ExamResults = ({ courseId }: { courseId: string }) => {
  const { t, i18n } = useTranslation();

  const { data: course } = useQuery(
    trpc.content.getCourse.queryOptions({
      id: courseId,
      language: i18n.language,
    }),
  );

  const singleTrialExams =
    course?.parts.flatMap((p) =>
      p.chapters.filter((c) => c?.isSingleTrialExam),
    ) || [];

  const multiAttemptExams =
    course?.parts.flatMap((p) => p.chapters.filter((c) => c?.isCourseExam)) ||
    [];

  const isSelfPacedCourse = course?.teachingFormat === 'self_paced';
  const isProfessorLedCourse = course?.teachingFormat === 'professor_led';

  const hasAssignment = course?.hasAssignment ?? false;
  const assignmentWeight =
    course?.assignmentWeight ?? DEFAULT_ASSIGNMENT_WEIGHT;

  const isCourseConclusionReleased = !!course?.parts?.some((part) =>
    part.chapters.some(
      (chap) =>
        chap.isCourseConclusion &&
        chap.releaseDate != null &&
        chap.releaseDate <= new Date(),
    ),
  );

  const { data: enrolledStudentsCount } = useQuery(
    trpc.user.courses.getEnrolledStudentsCount.queryOptions(
      {
        courseId: courseId,
      },
      { enabled: !!courseId && isProfessorLedCourse },
    ),
  );

  const { data: teacherLedCourseGradesAndSummary } = useQuery(
    trpc.user.courses.getTeacherLedCourseGrades.queryOptions(
      {
        courseId: courseId,
        passingThreshold: course?.passingGradeThreshold ?? 0,
      },
      {
        enabled:
          !!course &&
          isProfessorLedCourse &&
          (singleTrialExams.length > 0 || hasAssignment),
      },
    ),
  );

  const { data: selfPacedCourseGradesAndSummary } = useQuery(
    trpc.user.courses.getMultiAttemptExamCourseGrades.queryOptions(
      {
        courseId: courseId,
        passingThreshold: SELF_PACED_PASSING_THRESHOLD,
      },
      {
        enabled: !!course && isSelfPacedCourse && multiAttemptExams.length > 0,
      },
    ),
  );

  const finalResultsInfos = {
    averageScore:
      (isProfessorLedCourse
        ? teacherLedCourseGradesAndSummary?.averageTotalScore
        : selfPacedCourseGradesAndSummary?.averageScore) || 0,
    graduatedStudents:
      (isProfessorLedCourse
        ? teacherLedCourseGradesAndSummary?.graduatedStudentsAmount
        : selfPacedCourseGradesAndSummary?.graduatedStudentsAmount) || 0,
    thresholdToPass: isProfessorLedCourse
      ? course?.passingGradeThreshold || 0
      : SELF_PACED_PASSING_THRESHOLD,
    totalStudents:
      enrolledStudentsCount ||
      selfPacedCourseGradesAndSummary?.totalStudentsTakingExam,
  };

  if (!course) {
    return <Loader />;
  }

  if (
    singleTrialExams.length === 0 &&
    !hasAssignment &&
    multiAttemptExams.length === 0
  ) {
    return <EmptyState message={t('dashboard.teacher.courses.noExamLinked')} />;
  }

  const singleTrialExamItems = singleTrialExams.map((exam, index) => ({
    data: {
      chapterId: exam.chapterId,
      endDate: exam.endDate,
      examGrades:
        teacherLedCourseGradesAndSummary?.examsGrades.filter(
          (grade) => grade.chapterId === exam.chapterId,
        ) || undefined,
      index,
      language: exam.language,
      name: exam.title,
      startDate: exam.startDate,
      type: 'single-trial' as const,
      weight: exam.rateWeight || 0,
    },
    startDate: exam.startDate,
    type: 'exam' as const,
  }));

  const multiAttemptsExamItems = multiAttemptExams.map((exam, index) => ({
    data: {
      chapterId: exam.chapterId,
      examGrades:
        selfPacedCourseGradesAndSummary?.examsGrades.filter(
          (grade) => grade.chapterId === exam.chapterId,
        ) || undefined,
      index,
      language: course.originalLanguage,
      type: 'multi-attempts' as const,
      name: exam.title,
    },
    type: 'exam' as const,
  }));

  const assignmentItems = hasAssignment
    ? [
        {
          data: {
            assignmentGrades:
              teacherLedCourseGradesAndSummary?.assignmentGrades || [],
            assignmentPublished: course?.isAssignmentGradingPublished,
            endDate: course?.assignmentEndDate,
            index: singleTrialExams.length,
            language: course.language,
            name: t('dashboard.teacher.courses.assignment'),
            startDate: course?.assignmentStartDate,
            type: 'assignment' as const,
            weight: assignmentWeight,
          },
          startDate: course?.assignmentStartDate,
          type: 'assignment' as const,
        },
      ]
    : [];

  const allItems = [
    ...singleTrialExamItems,
    ...multiAttemptsExamItems,
    ...assignmentItems,
  ].sort((a, b) => {
    const dateA =
      'startDate' in a && a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB =
      'startDate' in b && b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <div className="flex flex-col w-full max-w-[1066px] p-4 gap-4 md:border border-newGray-5 bg-white rounded-2xl mt-3 md:mt-8">
      {((isCourseConclusionReleased && teacherLedCourseGradesAndSummary) ||
        (multiAttemptExams.length > 0 && selfPacedCourseGradesAndSummary)) && (
        <FinalResultsSummary
          finalResultsInfos={finalResultsInfos}
          teacherLedCourseGradesAndSummary={teacherLedCourseGradesAndSummary}
          singleTrialExams={singleTrialExams}
          hasAssignment={hasAssignment}
          assignmentWeight={assignmentWeight}
          courseName={course.name}
        />
      )}
      {allItems.map((item, sortedIndex) => (
        <ExamCard
          key={item.type === 'exam' ? item.data.chapterId : 'assignment'}
          index={sortedIndex}
          name={item.data.name}
          weight={'weight' in item.data ? item.data.weight : undefined}
          chapterId={
            item.data.type === 'single-trial' ||
            item.data.type === 'multi-attempts'
              ? item.data.chapterId
              : undefined
          }
          courseId={courseId}
          language={item.data.language}
          type={item.data.type}
          startDate={'startDate' in item.data ? item.data.startDate : undefined}
          endDate={'endDate' in item.data ? item.data.endDate : undefined}
          assignmentPublished={
            item.data.type === 'assignment'
              ? item.data.assignmentPublished
              : undefined
          }
          assignmentGrades={
            item.data.type === 'assignment'
              ? item.data.assignmentGrades
              : undefined
          }
          examGrades={
            item.data.type === 'single-trial' ||
            item.data.type === 'multi-attempts'
              ? item.data.examGrades
              : undefined
          }
        />
      ))}
    </div>
  );
};

interface FinalResultsSummaryProps {
  finalResultsInfos: {
    averageScore: number;
    graduatedStudents: number;
    thresholdToPass?: number | null;
    totalStudents?: number;
  };
  teacherLedCourseGradesAndSummary?: CourseWithSingleTrialExamsGradesAndSummary;
  singleTrialExams: JoinedCourseChapter[];
  hasAssignment: boolean;
  assignmentWeight: number;
  courseName: string;
}

const FinalResultsSummary = ({
  finalResultsInfos,
  teacherLedCourseGradesAndSummary,
  singleTrialExams,
  hasAssignment,
  assignmentWeight,
  courseName,
}: FinalResultsSummaryProps) => {
  const { t } = useTranslation();

  return (
    <section className="relative flex flex-col items-center gap-3 md:gap-7 w-full">
      <h2 className="text-center title-large-24px font-medium">
        {t('dashboard.teacher.courses.finalAverageResults')}
      </h2>
      <div className="flex flex-wrap gap-x-12 md:gap-x-2 items-center justify-center w-full">
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
      {teacherLedCourseGradesAndSummary && (
        <button
          onClick={() =>
            downloadConsolidatedGrades(
              teacherLedCourseGradesAndSummary,
              singleTrialExams,
              hasAssignment,
              assignmentWeight,
              courseName,
            )
          }
          type="button"
          className="absolute right-0 text-newBlack-5"
        >
          <TbFileTypeXls size={24} />
        </button>
      )}
    </section>
  );
};

interface ExamCardProps {
  index: number;
  name: string;
  language: string;
  weight?: number;
  chapterId?: string;
  courseId?: string;
  type?: 'single-trial' | 'multi-attempts' | 'assignment';
  startDate?: Date | null;
  endDate?: Date | null;
  assignmentPublished?: boolean;
  assignmentGrades?: MinimalAssignmentGrade[];
  examGrades?: MinimalCourseExamAttemptWithUsername[];
}

const ExamCard = ({
  index,
  name,
  weight,
  language,
  chapterId,
  courseId,
  type,
  startDate,
  endDate,
  assignmentPublished = false,
  assignmentGrades = [],
  examGrades = [],
}: ExamCardProps) => {
  const { t } = useTranslation();

  const { data: examInfo, isFetched: isExamInfoFetched } = useQuery(
    trpc.user.courses.getExamInfo.queryOptions(
      {
        chapterId: chapterId || '',
        language: language,
      },
      {
        enabled: type === 'single-trial',
      },
    ),
  );

  const { data: singleTrialExamQuestionsStatistics } = useQuery(
    trpc.user.courses.getSingleTrialExamQuestionStatistics.queryOptions(
      {
        chapterId: chapterId || '',
      },
      {
        enabled: type === 'single-trial',
      },
    ),
  );

  const { data: multiAttemptsExamQuestionsStatistics } = useQuery(
    trpc.user.courses.getMultiAttemptsExamQuestionStatistics.queryOptions(
      {
        courseId: courseId || '',
      },
      {
        enabled: type === 'multi-attempts',
      },
    ),
  );

  const now = Date.now();

  const areResultsPublished =
    type === 'single-trial'
      ? endDate != null &&
        now > endDate.getTime() + TWO_HOURS_IN_MS &&
        examGrades.length > 0
      : type === 'assignment'
        ? assignmentPublished && assignmentGrades.length > 0
        : true;

  const averageDuration = calculateAverageDuration(examGrades);

  const averageScore =
    assignmentGrades && assignmentGrades.length > 0
      ? calculateAssignmentAverageScore(assignmentGrades)
      : calculateExamAverageScore(examGrades);

  const medianScore = calculateMedian(
    assignmentGrades && assignmentGrades.length > 0
      ? assignmentGrades.map((g) => g.assignmentGrade)
      : examGrades.map((g) => g.score),
  );

  const questionsInExam = examInfo?.isSingleTrialExam
    ? examInfo?.nbQuestions
    : type === 'multi-attempts'
      ? Math.min(
          multiAttemptsExamQuestionsStatistics?.length || 0,
          MAX_QUESTIONS_IN_MULTI_ATTEMPT_EXAM,
        )
      : 0;

  const totalQuestions =
    type === 'multi-attempts'
      ? multiAttemptsExamQuestionsStatistics?.length || 0
      : examInfo?.nbQuestions || 0;

  if (!isExamInfoFetched && type === 'single-trial') {
    return <Loader />;
  }

  return (
    <article className="bg-newGray-6 rounded-2xl overflow-hidden w-full">
      <header className="p-4 md:px-6 md:py-3 border-b border-newGray-5 flex justify-between items-center">
        <h4 className="label-med-18px font-medium md:label-large-med-20px text-newBlack-1">
          {index + 1}. {name}
        </h4>
        {((assignmentGrades && assignmentGrades.length > 0) ||
          (examGrades && examGrades.length > 0)) &&
          areResultsPublished && (
            <button
              onClick={() =>
                assignmentGrades.length > 0
                  ? downloadAssignmentGrades(assignmentGrades)
                  : downloadExamGrades(
                      examGrades,
                      name,
                      (type === 'single-trial'
                        ? examInfo?.nbQuestions
                        : questionsInExam) || 0,
                      singleTrialExamQuestionsStatistics ||
                        multiAttemptsExamQuestionsStatistics ||
                        [],
                      type === 'multi-attempts',
                    )
              }
              type="button"
              className="body-16px-medium text-newBlack-5 flex items-center gap-2"
            >
              <span className="max-md:hidden">
                {t('dashboard.teacher.courses.exportExamData')}
              </span>
              <TbFileTypeXls />
            </button>
          )}
      </header>

      <section className="p-3 md:p-6 flex max-md:flex-col gap-4 md:gap-7 w-full">
        <div className="flex flex-col grow self-center max-md:w-full md:min-w-80">
          <h5 className="mb-3 label-medium-med-16px text-newBlack-3">
            {t('words.structure')}
          </h5>

          <div className="flex flex-col gap-1.5 bg-white rounded-2xl p-2 md:p-5">
            {questionsInExam > 0 && (
              <InfoRow
                label={
                  examInfo?.isSingleTrialExam
                    ? t('words.questions')
                    : t('dashboard.teacher.courses.questionsInExam')
                }
                value={questionsInExam}
                icon={<TbClipboardText className="size-6 shrink-0" />}
                showBorder={true}
              />
            )}

            {totalQuestions > 0 && !examInfo?.isSingleTrialExam && (
              <InfoRow
                label={t('dashboard.teacher.courses.totalQuestions')}
                value={totalQuestions}
                icon={<TbFileStack className="size-6 shrink-0" />}
                showBorder={true}
              />
            )}

            {weight && (
              <InfoRow
                label={t('words.weight')}
                value={
                  <div className="flex items-center gap-3">
                    <span>{weight}%</span>
                    <WeightIndicator weight={weight} />
                  </div>
                }
                icon={<TbWeight className="size-6 shrink-0" />}
                showBorder={!!(examInfo?.nbQuestions || (startDate && endDate))}
              />
            )}

            {questionsInExam > 0 && (
              <InfoRow
                label={t('words.duration')}
                value={`${Math.round(questionsInExam / DURATION_CALCULATION_QUESTIONS_PER_MINUTE)}'`}
                icon={<TbClock className="size-6 shrink-0" />}
                showBorder={type !== 'multi-attempts'}
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
          <div className="flex flex-col max-md:grow max-md:self-center items-center">
            <h5 className="mb-3 label-medium-med-16px text-newBlack-3 self-start">
              {t('words.results')}
            </h5>

            <div className="flex items-center gap-2 flex-wrap max-md:w-full">
              <RadialGauge
                percentage={averageScore}
                label={t('dashboard.teacher.courses.averageScore')}
                variant="green"
                showBackground
              />

              {type === 'assignment' || type === 'single-trial' ? (
                <RadialGauge
                  percentage={medianScore || 0}
                  label={t('dashboard.teacher.courses.medianScore')}
                  variant="purple"
                  showBackground
                />
              ) : null}

              {type === 'multi-attempts' && (
                <SegmentedGauge
                  value={calculateAverageAttemptsPerUser(examGrades)}
                  label={t('dashboard.teacher.courses.averageAttempts')}
                  variant="purple"
                  threshold1={2}
                  threshold2={3}
                  showBackground
                />
              )}

              {averageDuration && (
                <CustomGauge
                  value={`${Math.floor(averageDuration / 60)}'${(averageDuration % 60).toString().padStart(2, '0')}''`}
                  label={t('dashboard.teacher.courses.averageDuration')}
                  variant="blue"
                  type="clock"
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
      <span className="subtitle-small-14px md:label-18px">{label}</span>
    </div>
    <span className="subtitle-small-14px md:label-18px text-newBlack-3">
      {value}
    </span>
  </div>
);

export const WeightIndicator = ({ weight }: { weight: number }) => {
  const filledBars = Math.ceil(weight / WEIGHT_PER_BAR);
  return (
    <div className="flex gap-0.25">
      {[...Array(TOTAL_WEIGHT_BARS)].map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: false positive
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

const calculateMedian = (values: (number | null)[]) => {
  const validValues = values
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);

  if (validValues.length === 0) return null;

  const mid = Math.floor(validValues.length / 2);
  return validValues.length % 2 !== 0
    ? validValues[mid]
    : (validValues[mid - 1] + validValues[mid]) / 2;
};

const sanitizeFilename = (filename: string) => {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

const calculateAverageDuration = (
  examGrades: MinimalCourseExamAttemptWithUsername[],
) => {
  const validDurations = examGrades
    .filter((grade) => grade.finishedAt && grade.startedAt)
    .map((grade) =>
      Math.floor(
        (new Date(grade.finishedAt!).getTime() -
          new Date(grade.startedAt!).getTime()) /
          1000,
      ),
    );

  if (validDurations.length === 0) return undefined;

  return Math.round(
    validDurations.reduce((acc, duration) => acc + duration, 0) /
      validDurations.length,
  );
};

const calculateAssignmentAverageScore = (
  assignmentGrades: MinimalAssignmentGrade[],
) => {
  const validGrades = assignmentGrades.filter(
    (grade) => grade.assignmentGrade !== null,
  );

  if (validGrades.length === 0) return 0;

  return (
    validGrades.reduce((acc, grade) => acc + grade.assignmentGrade!, 0) /
    validGrades.length
  );
};

const calculateExamAverageScore = (
  examGrades: MinimalCourseExamAttemptWithUsername[],
) => {
  if (examGrades.length === 0) return 0;

  return (
    examGrades.reduce((acc, grade) => acc + (grade.score || 0), 0) /
    examGrades.length
  );
};

const calculateAverageAttemptsPerUser = (
  examGrades: MinimalCourseExamAttemptWithUsername[],
): number => {
  if (examGrades.length === 0) return 0;

  const attemptsByUser = examGrades.reduce(
    (acc, grade) => {
      if (grade.username) {
        acc[grade.username] = (acc[grade.username] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const usernames = Object.keys(attemptsByUser);
  if (usernames.length === 0) return 0;

  const totalAttempts = examGrades.length;
  return totalAttempts / usernames.length;
};

const downloadAssignmentGrades = (
  assignmentGrades: MinimalAssignmentGrade[],
) => {
  const rows = assignmentGrades
    .filter((grade) => grade.assignmentGrade !== null && grade.username)
    .map((grade) => ({
      Username: grade.username,
      'Score (%)': grade.assignmentGrade,
    }));

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['Username', 'Score (%)'],
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Assignment grades');

  const maxUsernameWidth = rows.reduce(
    (w, r) => Math.max(w, r.Username.length),
    10,
  );

  worksheet['!cols'] = [{ wch: maxUsernameWidth }, { wch: 15 }];

  XLSX.writeFile(workbook, 'assignment_grades.xlsx', { compression: true });
};

const downloadExamGrades = (
  examGrades: MinimalCourseExamAttemptWithUsername[],
  examName: string,
  totalQuestions: number,
  questionsStatistics: ExamQuestionStatistics[] = [],
  isMultiAttempts = false,
) => {
  const gradesRows = examGrades
    .filter((grade) => grade.username && grade.score !== null)
    .map((grade) => {
      let duration = null;
      if (grade.finishedAt && grade.startedAt) {
        duration = Math.round(
          (new Date(grade.finishedAt).getTime() -
            new Date(grade.startedAt).getTime()) /
            1000,
        );
      }

      let realScore = null;
      if (totalQuestions && grade.score !== null) {
        realScore = Math.round((grade.score / 100) * totalQuestions);
      }

      const baseRow = {
        Username: grade.username!,
        'Score (%)': grade.score!,
        'Correct answers': realScore,
        'Duration (seconds)': duration,
      };

      if (isMultiAttempts) {
        return {
          ...baseRow,
          Date: grade.finishedAt,
        };
      }

      return baseRow;
    });

  const statisticsRows = questionsStatistics.map((stat) => ({
    'Question ID': stat.questionId,
    'Question text': stat.questionText,
    'Question difficulty': stat.questionDifficulty,
    'Total answers': stat.totalAnswers,
    'Correct answers (%)': Math.round(stat.successPercentage * 100) / 100,
    Archived: stat.isArchived ? 'Yes' : 'No',
  }));

  const workbook = XLSX.utils.book_new();

  const gradesHeaders = [
    'Username',
    'Score (%)',
    'Correct answers',
    'Duration (seconds)',
    ...(isMultiAttempts ? ['Date'] : []),
  ];

  const gradesWorksheet = XLSX.utils.json_to_sheet(gradesRows, {
    header: gradesHeaders,
  });

  XLSX.utils.book_append_sheet(workbook, gradesWorksheet, 'Exam grades');

  const maxUsernameWidth = gradesRows.reduce(
    (w, r) => Math.max(w, r.Username.length),
    10,
  );

  gradesWorksheet['!cols'] = [
    { wch: maxUsernameWidth },
    { wch: 10 },
    { wch: 15 },
    { wch: 18 },
    ...(isMultiAttempts ? [{ wch: 15 }] : []),
  ];

  if (statisticsRows.length > 0) {
    const statisticsHeaders = [
      'Question ID',
      'Question text',
      'Question difficulty',
      'Total answers',
      'Correct answers (%)',
      'Archived',
    ];

    const statisticsWorksheet = XLSX.utils.json_to_sheet(statisticsRows, {
      header: statisticsHeaders,
    });

    XLSX.utils.book_append_sheet(
      workbook,
      statisticsWorksheet,
      'Questions statistics',
    );

    const maxQuestionTextWidth = Math.min(
      Math.max(
        ...statisticsRows.map((r) => r['Question text'].length),
        'Question text'.length,
      ),
      80,
    );

    const maxQuestionIdWidth = Math.max(
      ...statisticsRows.map((r) => r['Question ID'].length),
      'Question ID'.length,
    );

    statisticsWorksheet['!cols'] = [
      { wch: Math.max(maxQuestionIdWidth, 15) },
      { wch: maxQuestionTextWidth },
      { wch: 20 },
      { wch: 15 },
      { wch: 17 },
      { wch: 10 },
    ];
  }

  const sanitizedExamName = sanitizeFilename(examName);
  XLSX.writeFile(workbook, `${sanitizedExamName}_grades.xlsx`, {
    compression: true,
  });
};

const downloadConsolidatedGrades = (
  teacherLedCourseGradesAndSummary: CourseWithSingleTrialExamsGradesAndSummary,
  singleTrialExams: JoinedCourseChapter[],
  hasAssignment: boolean,
  assignmentWeight: number,
  courseName: string,
) => {
  const allUsernames = new Set<string>();

  if (teacherLedCourseGradesAndSummary?.examsGrades) {
    for (const grade of teacherLedCourseGradesAndSummary.examsGrades) {
      if (grade.username) {
        allUsernames.add(grade.username);
      }
    }
  }

  if (teacherLedCourseGradesAndSummary?.assignmentGrades) {
    for (const grade of teacherLedCourseGradesAndSummary.assignmentGrades) {
      if (grade.username) {
        allUsernames.add(grade.username);
      }
    }
  }

  const headers = ['Username'];
  for (const exam of singleTrialExams) {
    headers.push(`${exam.title} (%)`);
  }
  if (hasAssignment) {
    headers.push('Assignment (%)');
  }
  headers.push('Average grade (%)');

  const rows: any[] = Array.from(allUsernames).map((username) => {
    const row: any = {
      Username: username,
    };

    singleTrialExams.forEach((exam) => {
      const examGrade = teacherLedCourseGradesAndSummary?.examsGrades?.find(
        (grade) =>
          grade.username === username && grade.chapterId === exam.chapterId,
      );
      const examHeaderKey = `${exam.title} (%)`;
      row[examHeaderKey] = examGrade?.score ?? 0;
    });

    if (hasAssignment) {
      const assignmentGrade =
        teacherLedCourseGradesAndSummary?.assignmentGrades?.find(
          (grade) => grade.username === username,
        );
      row['Assignment (%)'] = assignmentGrade?.assignmentGrade ?? 0;
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;

    singleTrialExams.forEach((exam) => {
      const examHeaderKey = `${exam.title} (%)`;
      const examScore = row[examHeaderKey];
      const examWeight = exam.rateWeight || 0;
      totalWeightedScore += (examScore * examWeight) / 100;
      totalWeight += examWeight;
    });

    if (hasAssignment && row['Assignment (%)'] !== undefined) {
      totalWeightedScore += (row['Assignment (%)'] * assignmentWeight) / 100;
      totalWeight += assignmentWeight;
    }

    row['Average grade (%)'] =
      totalWeight > 0
        ? Math.round((totalWeightedScore / totalWeight) * 100)
        : 0;

    return row;
  });

  rows.sort((a, b) => b['Average grade (%)'] - a['Average grade (%)']);

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });

  const maxUsernameWidth = Math.max(
    ...rows.map((r) => r.Username.length),
    'Username'.length,
    15,
  );

  const cols = [{ wch: maxUsernameWidth }];
  for (const _ of singleTrialExams) {
    cols.push({ wch: 15 });
  }
  if (hasAssignment) cols.push({ wch: 15 });
  cols.push({ wch: 18 });

  worksheet['!cols'] = cols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Consolidated grades');

  const sanitizedCourseName = sanitizeFilename(courseName);
  XLSX.writeFile(workbook, `${sanitizedCourseName}_consolidated_grades.xlsx`, {
    compression: true,
  });
};
