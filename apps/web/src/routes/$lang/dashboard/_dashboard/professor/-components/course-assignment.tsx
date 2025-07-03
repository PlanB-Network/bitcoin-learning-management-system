import type { MinimalCourseAssignmentWithStudents } from '@blms/types';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  BasicModal,
  Button,
  cn,
  customToast,
  DialogClose,
  Loader,
} from '@blms/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TbAlertCircle,
  TbArrowBackUp,
  TbArrowsDownUp,
  TbCheck,
  TbChevronDown,
  TbChevronUp,
  TbClock,
} from 'react-icons/tb';
import InformationIcon from '#src/assets/icons/warning_orange.svg';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { trpc } from '#src/utils/trpc.ts';

interface GradeToEdit {
  uid: string;
  grade: number | null;
}

interface EditingStates {
  [assignmentId: string]: {
    isEditing: boolean;
    grades: Record<string, number | null>;
  };
}

export const CourseAssignment = ({ courseId }: { courseId: string }) => {
  const { t, i18n } = useTranslation();

  const { data: assignments, refetch: refetchAssignments } = useQuery(
    trpc.content.getCourseAssignmentsWithStudentsGrades.queryOptions({
      courseId,
    }),
  );

  const { data: course, refetch: refetchCourse } = useQuery(
    trpc.content.getCourse.queryOptions({
      id: courseId,
      language: i18n.language,
    }),
  );

  const saveGradesMutation = useMutation(
    trpc.user.courses.saveCourseAssignmentGrade.mutationOptions({
      onError: (error) => {
        customToast(error.message, {
          color: 'warning',
          icon: TbAlertCircle,
          mode: 'light',
        });
      },
    }),
  );

  const setGradesAsPublishedMutation = useMutation(
    trpc.user.courses.setCourseAssignmentGradesAsPublished.mutationOptions({
      onError: (error) => {
        customToast(error.message, {
          color: 'warning',
          icon: TbAlertCircle,
          mode: 'light',
        });
      },
      onSuccess: async () => {
        await refetchCourse();
        await refetchAssignments();
        customToast(
          t('dashboard.teacher.courses.assignmentGrade.gradesPublished'),
          {
            color: 'success',
            icon: TbCheck,
            mode: 'light',
          },
        );
      },
    }),
  );

  const [editingStates, setEditingStates] = useState<EditingStates>({});

  const saveGradesBatch = async (
    assignmentId: string,
    gradesToSave: GradeToEdit[],
  ) => {
    try {
      if (gradesToSave.length === 0) return;

      await Promise.all(
        gradesToSave.map((gradeEntry) =>
          saveGradesMutation.mutateAsync({
            courseId,
            grade: gradeEntry.grade,
            uid: gradeEntry.uid,
          }),
        ),
      );
    } catch (error) {
      console.error(
        `Error saving grades for assignment ${assignmentId}:`,
        error,
      );
    }
  };

  const handleToggleEdit = useCallback(
    async (assignmentId: string) => {
      const currentState = editingStates[assignmentId];
      const assignment = assignments?.find((a) => a.id === assignmentId);
      if (!assignment) return;

      if (currentState?.isEditing) {
        const gradesToSave: GradeToEdit[] = Object.entries(
          currentState.grades,
        ).map(([username, grade]) => ({
          grade,
          uid: assignment.students.find((s) => s.username === username)!.uid,
        }));

        await saveGradesBatch(assignmentId, gradesToSave);

        setEditingStates((prev) => {
          const newState = { ...prev };
          delete newState[assignmentId];
          return newState;
        });

        await refetchCourse();
        await refetchAssignments();
      } else {
        setEditingStates((prev) => ({
          ...prev,
          [assignmentId]: {
            grades: {},
            isEditing: true,
          },
        }));
      }
    },
    [editingStates, assignments, refetchAssignments, refetchCourse],
  );

  const handleGradeChange = useCallback(
    (
      assignmentId: string,
      studentUsername: string,
      newGrade: number | null,
    ) => {
      setEditingStates((prev) => ({
        ...prev,
        [assignmentId]: {
          ...prev[assignmentId],
          grades: {
            ...prev[assignmentId].grades,
            [studentUsername]: newGrade,
          },
          isEditing: true,
        },
      }));
    },
    [],
  );

  const handleBulkSaveAndPublish = async () => {
    try {
      const allSaves: Promise<void>[] = [];

      for (const assignment of assignments || []) {
        const assignmentId = assignment.id;
        const state = editingStates[assignmentId];
        const gradesToSave: GradeToEdit[] = [];

        if (state?.isEditing) {
          for (const [username, grade] of Object.entries(state.grades)) {
            gradesToSave.push({
              grade,
              uid: assignment.students.find((s) => s.username === username)!
                .uid,
            });
          }
        }

        for (const student of assignment.students) {
          const isEdited = student.username in (state?.grades || {});
          if (student.grade === null && !isEdited) {
            gradesToSave.push({ grade: 0, uid: student.uid });
          }
        }

        if (gradesToSave.length > 0) {
          allSaves.push(saveGradesBatch(assignmentId, gradesToSave));
        }
      }

      await Promise.all(allSaves);

      setEditingStates({});

      await setGradesAsPublishedMutation.mutateAsync({
        courseId,
      });
    } catch (error) {
      console.error('Error during bulk save and publish:', error);
    }
  };

  if (!course) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col w-full max-w-[924px]">
      <div className="flex max-md:flex-col md:justify-between gap-4 mt-3 md:mt-8 md:items-center">
        <div className="flex flex-col gap-4">
          <h3 className="title-large-sb-24px text-dashboardSectionTitle">
            {t('dashboard.teacher.courses.assignmentGrade.title')}
          </h3>
          <p className="body-16px text-dashboardSectionText/75">
            {t('dashboard.teacher.courses.assignmentGrade.description')}
          </p>
        </div>
        {!course.isAssignmentGradingPublished && (
          <ConfirmGradingSubmissionDialog
            onConfirm={handleBulkSaveAndPublish}
            missingGradesCount={
              assignments?.reduce(
                (total, assignment) =>
                  total +
                  assignment.students.filter(
                    (student) => student.grade === null,
                  ).length,
                0,
              ) || 0
            }
          />
        )}
      </div>
      {!course.isAssignmentGradingPublished && (
        <Alert className="mt-5" variant="warning" hasCloseButton>
          <AlertTitle icon={TbAlertCircle}>
            {t('dashboard.teacher.courses.assignmentGrade.alertTitle')}
          </AlertTitle>
          <AlertDescription className="text-newBlack-2">
            {t('dashboard.teacher.courses.assignmentGrade.alertDescription')}
          </AlertDescription>
          <span className="flex md:items-center gap-2 body-14px text-maroon-7 mt-2.5">
            <TbClock className="shrink-0 size-4 max-md:my-0.5" />
            {t('dashboard.teacher.courses.assignmentGrade.alertDescription2')}
          </span>
        </Alert>
      )}
      {assignments && assignments.length > 0 && (
        <div className="flex flex-col gap-6 mt-10">
          {assignments.map((assignment) => {
            const currentEditingState = editingStates[assignment.id];
            return (
              <AssignmentGradesTable
                key={assignment.id}
                assignment={assignment}
                isEditing={currentEditingState?.isEditing ?? false}
                editingGrades={currentEditingState?.grades ?? {}}
                onToggleEdit={() => handleToggleEdit(assignment.id)}
                onGradeChange={(username, grade) =>
                  handleGradeChange(assignment.id, username, grade)
                }
                showEditButton={!course.isAssignmentGradingPublished}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

interface AssignmentGradesTableProps {
  assignment: MinimalCourseAssignmentWithStudents;
  isEditing: boolean;
  editingGrades: Record<string, number | null>;
  onToggleEdit: () => void;
  onGradeChange: (studentUsername: string, newGrade: number | null) => void;
  showEditButton: boolean;
}

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

const AssignmentGradesTable = ({
  assignment,
  isEditing,
  editingGrades,
  onToggleEdit,
  onGradeChange,
  showEditButton = true,
}: AssignmentGradesTableProps) => {
  const { t } = useTranslation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    direction: 'asc',
    key: null,
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ direction, key });
  };

  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return assignment.students;

    return [...assignment.students].sort((a, b) => {
      const aValue =
        a[
          sortConfig.key as keyof MinimalCourseAssignmentWithStudents['students'][0]
        ];
      const bValue =
        b[
          sortConfig.key as keyof MinimalCourseAssignmentWithStudents['students'][0]
        ];

      if (sortConfig.key === 'grade') {
        const numA = aValue as number;
        const numB = bValue as number;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      const strA = aValue as string;
      const strB = bValue as string;
      const comparison = strA.localeCompare(strB);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [assignment.students, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <TbArrowsDownUp className="size-5" />;
    }
    return sortConfig.direction === 'asc' ? (
      <TbChevronUp className="size-5" />
    ) : (
      <TbChevronDown className="size-5" />
    );
  };

  const handleLocalGradeChange = (
    studentUsername: string,
    newGradeStr: string,
  ) => {
    if (newGradeStr === '') {
      onGradeChange(studentUsername, null);
      return;
    }

    const numericGrade = Number.parseInt(newGradeStr);
    if (
      !Number.isNaN(numericGrade) &&
      numericGrade >= 0 &&
      numericGrade <= 100
    ) {
      onGradeChange(studentUsername, numericGrade);
    }
  };

  const getGradeValue = (
    student: MinimalCourseAssignmentWithStudents['students'][0],
  ) => {
    if (student.username in editingGrades) {
      const grade = editingGrades[student.username];
      return grade !== null ? grade : '';
    }

    const originalGrade = student.grade;
    return originalGrade !== null ? originalGrade : '';
  };

  return (
    <div className="w-full border border-newGray-5 bg-newGray-6 rounded-xl flex flex-col gap-2">
      {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: TODO fix this */}
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsCollapsed(!isCollapsed);
            e.preventDefault();
          }
        }}
        aria-expanded={!isCollapsed}
      >
        <h3 className="subtitle-large-med-20px">{assignment.name}</h3>
        <TbChevronDown
          className={cn(
            'size-5 transition-all',
            isCollapsed ? '' : '-rotate-180',
          )}
        />
      </div>

      {!isCollapsed && (
        <div className="flex flex-col gap-2.5 overflow-x-auto px-4 pb-4">
          <table className="w-full">
            <thead>
              <tr>
                <th className="desktop-typo2 text-left py-4 pr-2 w-full max-w-[60%] max-md:hidden">
                  {t(
                    'dashboard.teacher.courses.assignmentGrade.studentDisplayName',
                  )}
                </th>
                <th className="desktop-typo2 text-left py-4 pr-2 w-full max-w-[60%] md:hidden">
                  {t('words.student')}
                </th>
                <th className="desktop-typo2 text-left py-4 pr-2 min-w-[180px] w-[20%] max-md:hidden">
                  {t('words.username')}
                </th>
                <th
                  className="desktop-typo2 cursor-pointer text-left py-4 max-md:min-w-33 md:min-w-[180px] md:w-[20%]"
                  onClick={() => handleSort('grade')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('grade');
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="flex items-center justify-end gap-2.5">
                    {t('dashboard.teacher.courses.assignmentGrade.grade100')}
                    {getSortIcon('grade')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => (
                <tr key={student.username}>
                  <td className="py-2.5 pr-2 body-16px max-md:hidden">
                    {student.displayName}
                  </td>
                  <td className="py-2.5 pr-2 flex flex-col md:hidden">
                    <span className="body-16px">{student.displayName}</span>
                    <span className="text-newGray-1 body-12px">
                      {student.username}
                    </span>
                  </td>
                  <td className="py-2.5 pr-2 body-16px max-md:hidden">
                    {student.username}
                  </td>
                  <td className="text-right py-2.5">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={getGradeValue(student)}
                      placeholder="--"
                      readOnly={!isEditing}
                      className={cn(
                        'w-19 md:w-25 px-4 py-1.5 text-left border rounded-lg border-newGray-4 placeholder:text-newGray-3',
                        isEditing
                          ? 'bg-white'
                          : 'bg-transparent cursor-default',
                      )}
                      onChange={(e) =>
                        handleLocalGradeChange(student.username, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {showEditButton && (
            <div className="flex justify-end w-full py-1.5">
              <Button
                variant="primary"
                size="s"
                mode="light"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEdit();
                }}
              >
                {isEditing ? t('words.save') : t('words.edit')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ConfirmGradingSubmissionDialog = ({
  onConfirm,
  missingGradesCount,
}: {
  onConfirm: () => void;
  missingGradesCount: number;
}) => {
  const isMobile = useSmaller('md');
  const { t } = useTranslation();

  return (
    <BasicModal
      trigger={
        <Button
          variant="primary"
          size="m"
          mode="dark"
          className="max-md:self-end"
        >
          {t('dashboard.teacher.courses.assignmentGrade.publishAllGrades')}
        </Button>
      }
      title={
        missingGradesCount > 0
          ? t('dashboard.teacher.courses.assignmentGrade.missingGradesTitle', {
              count: missingGradesCount,
            })
          : t(
              'dashboard.teacher.courses.assignmentGrade.confirmPublicationTitle',
            )
      }
      content={
        <p className="text-center max-w-[442px] md:px-5">
          {missingGradesCount > 0
            ? t(
                'dashboard.teacher.courses.assignmentGrade.missingGradesDescription',
              )
            : t(
                'dashboard.teacher.courses.assignmentGrade.confirmPublicationDescription',
              )}
        </p>
      }
      iconSrc={InformationIcon}
      showLogo
      contentClassName="w-[95%] max-md:max-w-100 md:w-[530px]"
    >
      <div className="!flex max-md:flex-wrap justify-center items-center gap-2.5 md:!gap-[30px]">
        <DialogClose asChild>
          <Button
            variant={missingGradesCount ? 'outline' : 'primary'}
            size={isMobile ? 'm' : 'l'}
            className="w-fit"
            onClick={onConfirm}
          >
            {t('dashboard.teacher.courses.assignmentGrade.confirmPublication')}
            <TbCheck className="ml-2.5" />
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant={missingGradesCount ? 'primary' : 'outline'}
            size={isMobile ? 'm' : 'l'}
            className="w-fit"
          >
            {t('courses.exam.goBack')} <TbArrowBackUp className="ml-2.5" />
          </Button>
        </DialogClose>
      </div>
    </BasicModal>
  );
};
