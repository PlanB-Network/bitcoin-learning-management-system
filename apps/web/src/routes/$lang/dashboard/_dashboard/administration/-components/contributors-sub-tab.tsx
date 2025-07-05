import type {
  AdminContentManagementCourse,
  AdminUserManagement,
} from '@blms/types';
import {
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
import type { ReactNode } from 'react';
import SwapIcon from '#src/assets/translation/swap.svg';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../../-components/shared-table-header.tsx';

interface LanguageInfo {
  code: string;
  name: string;
}

export interface ContributorsSubTabProps {
  contributors: AdminUserManagement[];
  languages: LanguageInfo[];
  courses: AdminContentManagementCourse[];
  getLanguageName: (code: string) => string;
  /**
   * Translation function from react-i18next. We accept a generic signature
   * to keep the component decoupled from the exact i18n implementation.
   */
  t: (key: string) => string;
}

export const ContributorsSubTab = ({
  contributors,
  languages,
  courses,
  getLanguageName,
  t,
}: ContributorsSubTabProps) => {
  /* ------------------------------------------------------------- */
  /* Local state & derived data                                    */
  /* ------------------------------------------------------------- */
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  const filteredContributors = useMemo(() => {
    if (selectedLanguage === 'all') return contributors;
    return contributors.filter((c) => c.languages?.includes(selectedLanguage));
  }, [contributors, selectedLanguage]);

  /* ------------------------------------------------------------- */
  /* Sorting                                                       */
  /* ------------------------------------------------------------- */
  type SortField =
    | 'startDate'
    | 'username'
    | 'assignedCourses'
    | 'completedCourses'
    | 'languages';

  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField): ReactNode => {
    if (sortField !== field) {
      return <img src={SwapIcon} alt="Swap" className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const sortedContributors = useMemo(() => {
    const list = [...filteredContributors];
    list.sort((a, b) => {
      let aVal: any;
      let bVal: any;
      switch (sortField) {
        case 'startDate':
          aVal = a.startDate ?? a.createdAt;
          bVal = b.startDate ?? b.createdAt;
          break;
        case 'username':
          aVal = a.username ?? '';
          bVal = b.username ?? '';
          break;
        case 'assignedCourses':
          aVal = a.assignedCourses ?? 0;
          bVal = b.assignedCourses ?? 0;
          break;
        case 'completedCourses': {
          const completedA = courses.filter(
            (c) =>
              c.assigneeId === a.uid &&
              (c.status === 'reviewed' || c.status === 'published'),
          ).length;
          const completedB = courses.filter(
            (c) =>
              c.assigneeId === b.uid &&
              (c.status === 'reviewed' || c.status === 'published'),
          ).length;
          aVal = completedA;
          bVal = completedB;
          break;
        }
        case 'languages':
          aVal = (a.languages || []).join(',');
          bVal = (b.languages || []).join(',');
          break;
        default:
          return 0;
      }
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const comp = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? comp : -comp;
    });
    return list;
  }, [filteredContributors, sortField, sortDirection, courses]);

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-GB');

  /* ------------------------------------------------------------- */
  /* Render                                                        */
  /* ------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="title-large-sb-24px text-dashboardSectionTitle">
          {t(
            'dashboard.adminPanel.translationPanel.reports.contributors.title',
          )}
        </h2>
        {/* Language filter */}
        <div className="flex items-center gap-2">
          <span className="label-medium-16px">
            {t(
              'dashboard.adminPanel.translationPanel.reports.filterByLanguage',
            )}
          </span>
          <Select
            value={selectedLanguage}
            onValueChange={(v) => setSelectedLanguage(v)}
          >
            <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-white border-gray-300">
              <SelectItem key="all" value="all">
                {t('words.all')}
              </SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contributors table */}
      <SharedTable>
        <SharedTableHeader>
          <SharedTableHead
            className="w-32"
            sortable
            onSort={() => handleSort('startDate')}
            sortIcon={getSortIcon('startDate')}
          >
            {t(
              'dashboard.adminPanel.translationPanel.reports.contributors.startDate',
            )}
          </SharedTableHead>
          <SharedTableHead
            className="w-48"
            sortable
            onSort={() => handleSort('username')}
            sortIcon={getSortIcon('username')}
          >
            {t(
              'dashboard.adminPanel.translationPanel.reports.contributors.username',
            )}
          </SharedTableHead>
          <SharedTableHead
            className="w-32 text-center"
            sortable
            onSort={() => handleSort('assignedCourses')}
            sortIcon={getSortIcon('assignedCourses')}
          >
            {t(
              'dashboard.adminPanel.translationPanel.reports.contributors.assignedCourses',
            )}
          </SharedTableHead>
          <SharedTableHead
            className="w-40 text-center"
            sortable
            onSort={() => handleSort('completedCourses')}
            sortIcon={getSortIcon('completedCourses')}
          >
            {t(
              'dashboard.adminPanel.translationPanel.reports.contributors.completedCourses',
            )}
          </SharedTableHead>
          <SharedTableHead
            className="w-56"
            sortable
            onSort={() => handleSort('languages')}
            sortIcon={getSortIcon('languages')}
          >
            {t(
              'dashboard.adminPanel.translationPanel.reports.contributors.languages',
            )}
          </SharedTableHead>
          <SharedTableHead className="w-40 text-center">
            {t(
              'dashboard.adminPanel.translationPanel.reports.contributors.totalReward',
            )}
          </SharedTableHead>
        </SharedTableHeader>
        <TableBody>
          {sortedContributors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                {t(
                  'dashboard.adminPanel.translationPanel.reports.noContributors',
                )}
              </TableCell>
            </TableRow>
          ) : (
            sortedContributors.map((contributor) => (
              <TableRow key={contributor.uid} className="hover:bg-gray-50">
                <TableCell className="py-3">
                  {formatDate(contributor.startDate ?? contributor.createdAt)}
                </TableCell>
                <TableCell className="py-3">
                  <span className="font-medium">{contributor.username}</span>
                </TableCell>
                <TableCell className="py-3 text-center">
                  {contributor.assignedCourses}
                </TableCell>
                <TableCell className="py-3 text-center">
                  {
                    courses.filter(
                      (c) =>
                        c.assigneeId === contributor.uid &&
                        (c.status === 'reviewed' || c.status === 'published'),
                    ).length
                  }
                </TableCell>
                <TableCell className="py-3">
                  {contributor.languages?.map(getLanguageName).join(', ')}
                </TableCell>
                <TableCell className="py-3 text-center">0</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </SharedTable>
    </div>
  );
};
