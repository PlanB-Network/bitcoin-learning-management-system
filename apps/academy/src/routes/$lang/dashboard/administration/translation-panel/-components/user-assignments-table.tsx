import { getStatusBadgeClass, getStatusText } from '@blms/shared';
import type { UserTranslationDetailsServiceResponse } from '@blms/types';
import { Button, TableBody, TableCell, TableRow } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../../../-components/shared-table-header.tsx';

interface UserAssignmentsTableProps {
  userDetails: UserTranslationDetailsServiceResponse;
  getLanguageName: (code: string) => string;
  onCourseClick: (courseId: string, language: string) => void;
}

export function UserAssignmentsTable({
  userDetails,
  getLanguageName,
  onCourseClick,
}: UserAssignmentsTableProps) {
  const { t } = useTranslation();

  const getStatusTag = (status: string) => (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${getStatusBadgeClass(
        status,
      )}`}
    >
      {getStatusText(status, t)}
    </span>
  );

  if (userDetails.assignments.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        {t(
          'dashboard.adminPanel.translationPanel.userManagement.modal.noAssignments',
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <SharedTable>
        <SharedTableHeader>
          <SharedTableHead className="w-24">
            {t(
              'dashboard.adminPanel.translationPanel.contentManagement.table.index',
            )}
          </SharedTableHead>
          <SharedTableHead>
            {t(
              'dashboard.adminPanel.translationPanel.contentManagement.table.course',
            )}
          </SharedTableHead>
          <SharedTableHead className="w-32">
            {t(
              'dashboard.adminPanel.translationPanel.contentManagement.table.language',
            )}
          </SharedTableHead>
          <SharedTableHead className="w-32">
            {t(
              'dashboard.adminPanel.translationPanel.contentManagement.table.status',
            )}
          </SharedTableHead>
          <SharedTableHead className="w-32">
            {t('words.actions')}
          </SharedTableHead>
        </SharedTableHeader>
        <TableBody>
          {userDetails.assignments.map((assignment) => (
            <TableRow
              key={assignment.id}
              className="border-b border-neutral-50 hover:bg-neutral-100"
            >
              <TableCell className="py-4 font-medium text-neutral-900">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-neutral-50 text-neutral-800 rounded-md">
                  {assignment.index || 'N/A'}
                </span>
              </TableCell>
              <TableCell className="py-4">
                <div className="text-sm font-medium text-neutral-900 break-words">
                  {assignment.courseName || assignment.courseId}
                </div>
              </TableCell>
              <TableCell className="py-4 text-sm text-neutral-900">
                {getLanguageName(assignment.language)}
              </TableCell>
              <TableCell className="py-4">
                {getStatusTag(
                  String(
                    assignment.translationStatus || assignment.assignmentStatus,
                  ),
                )}
              </TableCell>
              <TableCell className="py-4 text-center">
                <Button
                  size="s"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() =>
                    onCourseClick(assignment.courseId, assignment.language)
                  }
                >
                  {t(
                    'dashboard.adminPanel.translationPanel.userManagement.actions.viewDetails',
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </SharedTable>
    </div>
  );
}
