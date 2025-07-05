import { getStatusBadgeClass } from '@blms/shared';
import type { AdminContentManagementCourse } from '@blms/types';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TableBody,
  TableCell,
  TableRow,
} from '@blms/ui';
import { useMemo, useState } from 'react';
import { HiOutlineDownload } from 'react-icons/hi';
import XLSX from 'xlsx';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../../-components/shared-table-header.tsx';

export interface CoursesSubTabProps {
  courses: AdminContentManagementCourse[];
  getLanguageName: (code: string) => string;
  t: (key: string) => string;
}

export const CoursesSubTab = ({
  courses,
  getLanguageName,
  t,
}: CoursesSubTabProps) => {
  // Filter to only show courses with assigned status
  const assignedCourses = useMemo(() => {
    return courses.filter((course) => course.isAssigned === 'assigned');
  }, [courses]);

  const uniqueCourses = useMemo(() => {
    const map = new Map<
      string,
      { courseId: string; index: string; name: string | null }
    >();
    for (const course of assignedCourses) {
      if (!map.has(course.courseId)) {
        map.set(course.courseId, {
          courseId: course.courseId,
          index: course.index,
          name: course.courseName,
        });
      }
    }
    return Array.from(map.values());
  }, [assignedCourses]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    () => assignedCourses[0]?.courseId ?? 'all',
  );

  const filteredRows = useMemo(() => {
    if (selectedCourseId === 'all') return assignedCourses;
    return assignedCourses.filter((c) => c.courseId === selectedCourseId);
  }, [assignedCourses, selectedCourseId]);

  const selectedCourseInfo = useMemo(() => {
    if (selectedCourseId === 'all') return null;
    return uniqueCourses.find((c) => c.courseId === selectedCourseId) || null;
  }, [selectedCourseId, uniqueCourses]);

  const formatDateLong = (date: Date) =>
    new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  /** ------------------------------------------------------------------ */
  /** Export helpers                                                     */
  /** ------------------------------------------------------------------ */
  const downloadGeneralReport = () => {
    if (assignedCourses.length === 0) return;

    const data = assignedCourses.map((row) => ({
      'Course Index': row.index,
      'Course Name': row.courseName ?? '',
      Language: getLanguageName(row.language),
      Contributor: row.assigneeDisplayName || row.assigneeUsername || '',
      Status: row.status,
      Progress: `${row.progress}%`,
      'Last Updated': new Date(row.updatedAt).toLocaleDateString('en-GB'),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Courses');
    XLSX.writeFile(wb, 'Courses_Report.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Filter & export */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="label-medium-16px">
            {t(
              'dashboard.adminPanel.translationPanel.reports.courses.filterByCourse',
            )}
          </span>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-white border-gray-300">
              <SelectItem value="all">{t('words.all')}</SelectItem>
              {uniqueCourses.map((c) => (
                <SelectItem key={c.courseId} value={c.courseId}>
                  {c.index}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="primary"
          size="s"
          className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"
          onClick={downloadGeneralReport}
        >
          {t('dashboard.adminPanel.translationPanel.reports.generalReport')}
          <HiOutlineDownload className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {selectedCourseInfo && (
        <div className="flex items-center gap-3">
          <span className="bg-gray-200 rounded px-2 py-1 text-xs font-medium text-gray-700">
            {selectedCourseInfo.index}
          </span>
          <h3 className="title-large-sb-24px text-dashboardSectionTitle">
            {selectedCourseInfo.name || ''}
          </h3>
        </div>
      )}

      <SharedTable>
        <SharedTableHeader>
          <SharedTableHead className="w-48">
            {t(
              'dashboard.adminPanel.translationPanel.reports.table.contributor',
            )}
          </SharedTableHead>
          <SharedTableHead className="w-32">
            {t('words.language')}
          </SharedTableHead>
          <SharedTableHead className="w-32 text-center">
            {t('words.status')}
          </SharedTableHead>
          <SharedTableHead className="w-32 text-center">
            {t('dashboard.adminPanel.translationPanel.reports.table.progress')}
          </SharedTableHead>
          <SharedTableHead className="w-40 text-center">
            {t(
              'dashboard.adminPanel.translationPanel.reports.table.lastUpdated',
            )}
          </SharedTableHead>
        </SharedTableHeader>
        <TableBody>
          {filteredRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                {t('dashboard.adminPanel.translationPanel.reports.noCourses')}
              </TableCell>
            </TableRow>
          ) : (
            filteredRows.map((row) => (
              <TableRow
                key={`${row.courseId}-${row.language}`}
                className="hover:bg-gray-50"
              >
                <TableCell className="py-3">
                  {row.assigneeDisplayName || row.assigneeUsername || '-'}
                </TableCell>
                <TableCell className="py-3">
                  {getLanguageName(row.language)}
                </TableCell>
                <TableCell className="py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusBadgeClass(
                      row.status,
                    )}`}
                  >
                    {row.status.replace(/_/g, ' ')}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-center">
                  {row.progress}%
                </TableCell>
                <TableCell className="py-3 text-center">
                  {formatDateLong(row.updatedAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </SharedTable>
    </div>
  );
};
