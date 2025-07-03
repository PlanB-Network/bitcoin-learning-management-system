import type {
  CourseWithSingleTrialExamsGradesAndSummary,
  JoinedCourseChapter,
  MinimalAssignmentGrade,
  MinimalCourseExamAttemptWithUsername,
  SingleTrialExamQuestionStatistics,
} from '@blms/types';
import {
  CustomGauge,
  cn,
  DashGauge,
  EmptyState,
  Loader,
  RadialGauge,
} from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  TbCalendar,
  TbClipboardText,
  TbClock,
  TbFileTypeXls,
  TbWeight,
} from 'react-icons/tb';
import XLSX from 'xlsx';

import { formatDateRange } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

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

  const hasAssignment = course?.isPlanbSchool;
  const assignmentWeight = course?.assignmentWeight ?? 40;

  const isCourseConclusionReleased = !!course?.parts?.some((part) =>
    part.chapters.some(
      (chap) =>
        chap.isCourseConclusion &&
        chap.releaseDate != null &&
        chap.releaseDate <= new Date(),
    ),
  );

  const finalResultsInfos = {
    averageScore: courseGradesAndSummary?.averageTotalScore ?? 0,
    graduatedStudents: courseGradesAndSummary?.graduatedStudentsAmount ?? 0,
    thresholdToPass: course?.passingGradeThreshold,
    totalStudents: enrolledStudentsCount,
  };

  if (!course) {
    return <Loader />;
  }

  if (singleTrialExams.length === 0 && !hasAssignment) {
    return <EmptyState message={t('dashboard.teacher.courses.noExamLinked')} />;
  }

  return (
    <div className="flex flex-col w-full max-w-[1066px] p-4 gap-4 lg:border border-newGray-5 bg-white rounded-2xl mt-3 lg:mt-8">
      {isCourseConclusionReleased && courseGradesAndSummary && (
        <section className="relative flex flex-col items-center gap-3 lg:gap-7 w-full">
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
              filledColorTransparent
              size="l"
            />
          </div>
          <button
            onClick={() =>
              downloadConsolidatedGrades(
                courseGradesAndSummary,
                singleTrialExams,
                hasAssignment || false,
                assignmentWeight,
                course.name,
              )
            }
            type="button"
            className="absolute right-0 text-newBlack-5"
          >
            <TbFileTypeXls size={24} />
          </button>
        </section>
      )}
      {singleTrialExams.map((exam, i) => (
        <ExamCard
          key={exam.title}
          index={i}
          name={exam.title}
          weight={exam.rateWeight || 0}
          chapterId={exam.chapterId}
          language={exam.language}
          type="single-trial"
          startDate={exam.startDate}
          endDate={exam.endDate}
          examGrades={
            courseGradesAndSummary?.examsGrades.filter(
              (grade) => grade.chapterId === exam.chapterId,
            ) || undefined
          }
        />
      ))}
      {hasAssignment && (
        <ExamCard
          index={singleTrialExams.length}
          name={t('dashboard.teacher.courses.assignment')}
          weight={assignmentWeight}
          language={course.language}
          type="assignment"
          assignmentPublished={course?.isAssignmentGradingPublished}
          assignmentGrades={courseGradesAndSummary?.assignmentGrades || []}
        />
      )}
    </div>
  );
};

interface ExamCardProps {
  index: number;
  name: string;
  weight: number;
  language: string;
  chapterId?: string;
  type?: 'single-trial' | 'assignment';
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

  const { data: examQuestionsStatistics } = useQuery(
    trpc.user.courses.getSingleTrialExamQuestionStatistics.queryOptions(
      {
        chapterId: chapterId || '',
      },
      {
        enabled: type === 'single-trial',
      },
    ),
  );

  const areResultsPublished =
    type === 'single-trial'
      ? endDate != null && endDate < new Date() && examGrades.length > 0
      : assignmentPublished && assignmentGrades.length > 0;

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

  if (!isExamInfoFetched && type === 'single-trial') {
    return <Loader />;
  }

  return (
    <article className="bg-newGray-6 rounded-2xl overflow-hidden w-full">
      <header className="p-4 lg:px-6 lg:py-3 border-b border-newGray-5 flex justify-between items-center">
        <h4 className="label-med-18px font-medium lg:label-large-med-20px text-newBlack-1">
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
                      examInfo?.nbQuestions || 0,
                      examQuestionsStatistics || [],
                    )
              }
              type="button"
              className="body-16px-medium text-newBlack-5 flex items-center gap-2"
            >
              <span className="max-lg:hidden">
                {t('dashboard.teacher.courses.exportExamData')}
              </span>
              <TbFileTypeXls />
            </button>
          )}
      </header>

      <section className="p-3 xl:p-6 flex max-xl:flex-col gap-4 xl:gap-7 w-full">
        <div className="flex flex-col grow self-center max-lg:w-full lg:min-w-80">
          <h5 className="mb-3 label-medium-med-16px text-newBlack-3">
            {t('words.structure')}
          </h5>

          <div className="flex flex-col gap-1.5 bg-white rounded-2xl p-2 lg:p-5">
            {examInfo?.nbQuestions && (
              <InfoRow
                label={t('words.questions')}
                value={examInfo?.nbQuestions}
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
              showBorder={!!(examInfo?.nbQuestions || (startDate && endDate))}
            />

            {examInfo?.nbQuestions && (
              <InfoRow
                label={t('words.duration')}
                value={`${Math.round(examInfo?.nbQuestions / 2)}'`}
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
                percentage={medianScore || 0}
                label={t('dashboard.teacher.courses.medianScore')}
                variant="purple"
                showBackground
              />

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
          // biome-ignore lint/suspicious/noArrayIndexKey: explanation
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

const downloadAssignmentGrades = (
  assignmentGrades: MinimalAssignmentGrade[],
) => {
  const rows = assignmentGrades
    .filter((grade) => grade.assignmentGrade !== null && grade.username)
    .map((grade) => ({
      assignmentScore: grade.assignmentGrade,
      username: grade.username,
    }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Assignment grades');

  XLSX.utils.sheet_add_aoa(worksheet, [['Username', 'Score (%)']], {
    origin: 'A1',
  });

  const maxUsernameWidth = rows.reduce(
    (w, r) => Math.max(w, r.username.length),
    10,
  );

  worksheet['!cols'] = [{ wch: maxUsernameWidth }, { wch: 15 }];

  XLSX.writeFile(workbook, 'assignment_grades.xlsx', { compression: true });
};

const downloadExamGrades = (
  examGrades: MinimalCourseExamAttemptWithUsername[],
  examName: string,
  totalQuestions: number,
  questionsStatistics: SingleTrialExamQuestionStatistics[] = [],
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

      return {
        duration,
        realScore,
        score: grade.score!,
        username: grade.username!,
      };
    });

  const statisticsRows = questionsStatistics.map((stat) => ({
    questionDifficulty: stat.questionDifficulty,
    questionId: stat.questionId,
    questionText: stat.questionText,
    successPercentage: Math.round(stat.successPercentage * 100) / 100,
    totalAnswers: stat.totalAnswers,
  }));

  const workbook = XLSX.utils.book_new();

  const gradesWorksheet = XLSX.utils.json_to_sheet(gradesRows);
  XLSX.utils.book_append_sheet(workbook, gradesWorksheet, 'Exam grades');

  const gradesHeaders = [
    'Username',
    'Score (%)',
    'Correct answers',
    'Duration (seconds)',
  ];

  XLSX.utils.sheet_add_aoa(gradesWorksheet, [gradesHeaders], {
    origin: 'A1',
  });

  const maxUsernameWidth = gradesRows.reduce(
    (w, r) => Math.max(w, r.username.length),
    10,
  );

  gradesWorksheet['!cols'] = [
    { wch: maxUsernameWidth },
    { wch: 10 },
    { wch: 15 },
    { wch: 18 },
  ];

  if (statisticsRows.length > 0) {
    const statisticsWorksheet = XLSX.utils.json_to_sheet(statisticsRows);
    XLSX.utils.book_append_sheet(
      workbook,
      statisticsWorksheet,
      'Questions statistics',
    );

    const statisticsHeaders = [
      'Question ID',
      'Question text',
      'Question difficulty',
      'Total answers',
      'Correct answers (%)',
    ];

    XLSX.utils.sheet_add_aoa(statisticsWorksheet, [statisticsHeaders], {
      origin: 'A1',
    });

    const maxQuestionTextWidth = Math.min(
      Math.max(
        ...statisticsRows.map((r) => r.questionText.length),
        'Question Text'.length,
      ),
      80,
    );

    const maxQuestionIdWidth = Math.max(
      ...statisticsRows.map((r) => r.questionId.length),
      'Question ID'.length,
    );

    statisticsWorksheet['!cols'] = [
      { wch: Math.max(maxQuestionIdWidth, 15) },
      { wch: maxQuestionTextWidth },
      { wch: 20 },
      { wch: 15 },
      { wch: 17 },
    ];
  }

  const sanitizedExamName = sanitizeFilename(examName);
  XLSX.writeFile(workbook, `${sanitizedExamName}_grades.xlsx`, {
    compression: true,
  });
};

interface ConsolidatedGradeRow {
  username: string;
  average_grade: number;
  assignment_score?: number;
  [key: `exam_${number}_score`]: number;
}

const downloadConsolidatedGrades = (
  courseGradesAndSummary: CourseWithSingleTrialExamsGradesAndSummary,
  singleTrialExams: JoinedCourseChapter[],
  hasAssignment: boolean,
  assignmentWeight: number,
  courseName: string,
) => {
  const allUsernames = new Set<string>();

  if (courseGradesAndSummary?.examsGrades) {
    for (const grade of courseGradesAndSummary.examsGrades) {
      if (grade.username) {
        allUsernames.add(grade.username);
      }
    }
  }

  if (courseGradesAndSummary?.assignmentGrades) {
    for (const grade of courseGradesAndSummary.assignmentGrades) {
      if (grade.username) {
        allUsernames.add(grade.username);
      }
    }
  }

  const rows: ConsolidatedGradeRow[] = Array.from(allUsernames).map(
    (username) => {
      const row: ConsolidatedGradeRow = {
        average_grade: 0,
        username,
      };

      singleTrialExams.forEach((exam, index) => {
        const examGrade = courseGradesAndSummary?.examsGrades?.find(
          (grade) =>
            grade.username === username && grade.chapterId === exam.chapterId,
        );
        const examKey = `exam_${index + 1}_score` as const;
        row[examKey] = examGrade?.score ?? 0;
      });

      if (hasAssignment) {
        const assignmentGrade = courseGradesAndSummary?.assignmentGrades?.find(
          (grade) => grade.username === username,
        );
        row.assignment_score = assignmentGrade?.assignmentGrade ?? 0;
      }

      let totalWeightedScore = 0;
      let totalWeight = 0;

      singleTrialExams.forEach((exam, index) => {
        const examKey = `exam_${index + 1}_score` as const;
        const examScore = row[examKey];
        const examWeight = exam.rateWeight || 0;
        totalWeightedScore += (examScore * examWeight) / 100;
        totalWeight += examWeight;
      });

      if (hasAssignment && row.assignment_score !== undefined) {
        totalWeightedScore += (row.assignment_score * assignmentWeight) / 100;
        totalWeight += assignmentWeight;
      }

      row.average_grade =
        totalWeight > 0
          ? Math.round((totalWeightedScore / totalWeight) * 100)
          : 0;

      return row;
    },
  );

  rows.sort((a, b) => b.average_grade - a.average_grade);

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Consolidated grades');

  const headers = ['Username'];
  for (const exam of singleTrialExams) {
    headers.push(`${exam.title} (%)`);
  }
  if (hasAssignment) {
    headers.push('Assignment (%)');
  }
  headers.push('Average grade (%)');

  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

  const maxUsernameWidth = Math.max(
    ...rows.map((r) => r.username.length),
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

  const sanitizedCourseName = sanitizeFilename(courseName);
  XLSX.writeFile(workbook, `${sanitizedCourseName}_consolidated_grades.xlsx`, {
    compression: true,
  });
};
