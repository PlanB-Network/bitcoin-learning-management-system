import { Alert, AlertDescription, AlertTitle, Button, cn } from '@blms/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaClock } from 'react-icons/fa6';
import {
  LuArrowUpDown,
  LuChevronDown,
  LuChevronUp,
  LuCircleAlert,
} from 'react-icons/lu';

interface Student {
  displayName: string;
  username: string;
  grade: number | null | undefined;
}

interface Assignment {
  id: string;
  name: string;
  students: Student[];
}

export const CourseAssignment = ({ courseId }: { courseId: string }) => {
  const { t } = useTranslation();

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: 'assignment-1',
      name: 'Breeze',
      students: [
        { displayName: 'Alice Johnson', username: 'alice_j', grade: 54 },
        { displayName: 'David Chen', username: 'david_chen', grade: 85 },
        { displayName: 'Sarah Williams', username: 'sarah_w', grade: 76 },
        { displayName: 'Michael Torres', username: 'mike_t', grade: 22 },
        { displayName: 'Emma Rodriguez', username: 'emma_r', grade: 98 },
      ],
    },
    {
      id: 'assignment-2',
      name: 'Braiins',
      students: [
        { displayName: 'James Brown', username: 'james_b', grade: null },
        { displayName: 'Lisa Garcia', username: 'lisa_g', grade: 73 },
        { displayName: 'Kevin Park', username: 'kevin_p', grade: 89 },
        { displayName: 'Nina Patel', username: 'nina_p', grade: 82 },
        { displayName: 'Ryan Thompson', username: 'ryan_t', grade: 91 },
      ],
    },
  ]);

  const handleGradeChange = (
    assignmentId: string,
    username: string,
    newGrade: number,
  ): void => {
    setAssignments((prevAssignments) =>
      prevAssignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              students: assignment.students.map((student) =>
                student.username === username
                  ? { ...student, grade: newGrade }
                  : student,
              ),
            }
          : assignment,
      ),
    );
  };

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
        <Button variant="primary" size="m" mode="dark">
          {t('dashboard.teacher.courses.assignmentGrade.publishAllGrades')}
        </Button>
      </div>
      <Alert className="mt-5" variant="warning" hasCloseButton>
        <AlertTitle icon={LuCircleAlert}>
          {t('dashboard.teacher.courses.assignmentGrade.alertTitle')}
        </AlertTitle>
        <AlertDescription className="text-newBlack-2">
          {t('dashboard.teacher.courses.assignmentGrade.alertDescription')}
        </AlertDescription>
        <span className="flex items-center gap-2 body-14px text-maroon-7 mt-2.5">
          <FaClock />
          {t('dashboard.teacher.courses.assignmentGrade.alertDescription2')}
        </span>
      </Alert>
      <div className="flex flex-col gap-6 mt-10">
        {assignments.map((assignment) => (
          <AssignmentGradesTable
            key={assignment.id}
            assignmentId={assignment.id}
            assignmentName={assignment.name}
            students={assignment.students}
            onGradeChange={handleGradeChange}
          />
        ))}
      </div>
    </div>
  );
};

interface AssignmentGradesTableProps {
  assignmentId: string;
  assignmentName: string;
  students: Student[];
  onGradeChange?: (
    assignmentId: string,
    username: string,
    newGrade: number,
  ) => void;
}

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

const AssignmentGradesTable = ({
  assignmentId,
  assignmentName,
  students,
  onGradeChange,
}: AssignmentGradesTableProps) => {
  const { t } = useTranslation();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingGrades, setEditingGrades] = useState<Record<string, number>>(
    {},
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc',
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = useMemo(() => {
    if (!sortConfig.key) return students;

    return [...students].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Student];
      const bValue = b[sortConfig.key as keyof Student];

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
  }, [students, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <LuArrowUpDown className="size-5" />;
    }
    return sortConfig.direction === 'asc' ? (
      <LuChevronUp className="size-5" />
    ) : (
      <LuChevronDown className="size-5" />
    );
  };

  const handleEditClick = () => {
    if (isEditing) {
      for (const [username, grade] of Object.entries(editingGrades)) {
        onGradeChange?.(assignmentId, username, grade);
      }
      setEditingGrades({});
      setIsEditing(false);
    } else {
      const initialGrades: Record<string, number> = {};
      for (const student of students) {
        initialGrades[student.username] = student.grade ?? 0;
      }
      setEditingGrades(initialGrades);
      setIsEditing(true);
    }
  };

  const handleGradeChange = (studentUsername: string, newGrade: string) => {
    const numericGrade = Number.parseInt(newGrade);
    if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      return;
    }

    if (isEditing) {
      setEditingGrades((prev) => ({
        ...prev,
        [studentUsername]: numericGrade,
      }));
    } else {
      onGradeChange?.(assignmentId, studentUsername, numericGrade);
    }
  };

  const handleGradeKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentUsername: string,
  ) => {
    if (e.key === 'Enter') {
      handleGradeChange(studentUsername, e.currentTarget.value);
    }
  };

  const handleGradeBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    studentUsername: string,
  ) => {
    handleGradeChange(studentUsername, e.target.value);
  };

  const getGradeValue = (student: Student) => {
    const grade = isEditing
      ? (editingGrades[student.username] ?? student.grade)
      : student.grade;

    return grade !== null && grade !== undefined ? grade : '';
  };

  return (
    <div className="w-full border border-newGray-5 bg-newGray-6 rounded-xl flex flex-col gap-2">
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
        <h3 className="subtitle-large-med-20px">{assignmentName}</h3>
        <LuChevronDown
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
                <th className="desktop-typo2 text-left py-4">
                  {t(
                    'dashboard.teacher.courses.assignmentGrade.studentDisplayName',
                  )}
                </th>
                <th className="desktop-typo2 text-left py-4">
                  {t('words.username')}
                </th>
                <th
                  className="desktop-typo2 cursor-pointer text-left py-4"
                  onClick={() => handleSort('grade')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSort('grade');
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="flex items-center justify-end gap-2">
                    {t('dashboard.teacher.courses.assignmentGrade.grade100')}
                    {getSortIcon('grade')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => (
                <tr key={student.username}>
                  <td className="py-2.5 body-16px">{student.displayName}</td>
                  <td className="py-2.5 body-16px">{student.username}</td>
                  <td className="text-right py-2.5">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={getGradeValue(student)}
                      placeholder="--"
                      readOnly={!isEditing}
                      className={cn(
                        'w-25 px-4 py-1.5 text-left border rounded-lg border-newGray-4 placeholder:text-newGray-3',
                        isEditing
                          ? 'bg-white'
                          : 'bg-transparent cursor-default',
                      )}
                      onChange={(e) =>
                        handleGradeChange(student.username, e.target.value)
                      }
                      onBlur={(e) => handleGradeBlur(e, student.username)}
                      onKeyDown={(e) => handleGradeKeyDown(e, student.username)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end w-full py-1.5">
            <Button
              variant="primary"
              size="s"
              mode="light"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick();
              }}
            >
              {isEditing ? t('words.save') : t('words.edit')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
