import { TableBody, TableCell, TableRow } from '@blms/ui';
import { useMemo, useState } from 'react';

import type { AdminContentManagementCourse } from '@blms/types';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../../-components/shared-table-header.tsx';

export interface LanguageCoverageSubTabProps {
  courses: AdminContentManagementCourse[];
  getLanguageName: (code: string) => string;
  t: (key: string) => string;
}

type SortField =
  | 'language'
  | 'inProgress'
  | 'completed'
  | 'notStarted'
  | 'total';

export const LanguageCoverageSubTab = ({
  courses,
  getLanguageName,
  t,
}: LanguageCoverageSubTabProps) => {
  /** ------------------------------------------------------------------ */
  /** Build statistics per language                                      */
  /** ------------------------------------------------------------------ */
  const languageStats = useMemo(() => {
    const map = new Map<
      string,
      {
        inProgress: number;
        completed: number;
        notStarted: number;
        total: number;
      }
    >();

    for (const course of courses) {
      const lang = course.language;
      const stats = map.get(lang) ?? {
        inProgress: 0,
        completed: 0,
        notStarted: 0,
        total: 0,
      };

      stats.total += 1;

      const assignmentStatus = course.assignmentStatus as
        | 'assigned'
        | 'in_progress'
        | 'completed'
        | null;

      if (assignmentStatus === 'in_progress') {
        stats.inProgress += 1;
      } else if (assignmentStatus === 'completed') {
        stats.completed += 1;
      } else if (
        assignmentStatus === 'assigned' &&
        course.status === 'ready_for_review'
      ) {
        // Not started definition: assignment exists but translation not started yet
        stats.notStarted += 1;
      }

      map.set(lang, stats);
    }

    return Array.from(map.entries()).map(([language, stats]) => ({
      language,
      ...stats,
    }));
  }, [courses]);

  /** ------------------------------------------------------------------ */
  /** Sorting logic                                                      */
  /** ------------------------------------------------------------------ */
  const [sortField, setSortField] = useState<SortField>('language');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortedStats = useMemo(() => {
    const sorted = [...languageStats].sort((a, b) => {
      let compareVal: number;

      if (sortField === 'language') {
        compareVal = getLanguageName(a.language).localeCompare(
          getLanguageName(b.language),
        );
      } else {
        compareVal = (a as any)[sortField] - (b as any)[sortField];
      }

      return sortDirection === 'asc' ? compareVal : -compareVal;
    });

    return sorted;
  }, [languageStats, sortField, sortDirection, getLanguageName]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /** ------------------------------------------------------------------ */
  /** Render                                                             */
  /** ------------------------------------------------------------------ */
  return (
    <div className="space-y-6">
      <SharedTable>
        <SharedTableHeader>
          <SharedTableHead
            className="w-48 cursor-pointer"
            sortable
            onSort={() => toggleSort('language')}
            sortIcon={
              <SortIcon
                active={sortField === 'language'}
                direction={sortDirection}
              />
            }
          >
            <div className="flex items-center gap-1">{t('words.language')}</div>
          </SharedTableHead>
          <SharedTableHead
            className="w-32 text-center cursor-pointer"
            sortable
            onSort={() => toggleSort('inProgress')}
            sortIcon={
              <SortIcon
                active={sortField === 'inProgress'}
                direction={sortDirection}
              />
            }
          >
            <div className="flex items-center justify-center gap-1">
              {t(
                'dashboard.adminPanel.translationPanel.reports.languageCoverage.inProgress',
              )}
            </div>
          </SharedTableHead>
          <SharedTableHead
            className="w-32 text-center cursor-pointer"
            sortable
            onSort={() => toggleSort('completed')}
            sortIcon={
              <SortIcon
                active={sortField === 'completed'}
                direction={sortDirection}
              />
            }
          >
            <div className="flex items-center justify-center gap-1">
              {t(
                'dashboard.adminPanel.translationPanel.reports.languageCoverage.completed',
              )}
            </div>
          </SharedTableHead>
          <SharedTableHead
            className="w-32 text-center cursor-pointer"
            sortable
            onSort={() => toggleSort('notStarted')}
            sortIcon={
              <SortIcon
                active={sortField === 'notStarted'}
                direction={sortDirection}
              />
            }
          >
            <div className="flex items-center justify-center gap-1">
              {t(
                'dashboard.adminPanel.translationPanel.reports.languageCoverage.notStarted',
              )}
            </div>
          </SharedTableHead>
          <SharedTableHead
            className="w-32 text-center cursor-pointer"
            sortable
            onSort={() => toggleSort('total')}
            sortIcon={
              <SortIcon
                active={sortField === 'total'}
                direction={sortDirection}
              />
            }
          >
            <div className="flex items-center justify-center gap-1">
              {t(
                'dashboard.adminPanel.translationPanel.reports.languageCoverage.totalCourses',
              )}
            </div>
          </SharedTableHead>
        </SharedTableHeader>
        <TableBody>
          {sortedStats.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                {t('dashboard.adminPanel.translationPanel.reports.noLanguages')}
              </TableCell>
            </TableRow>
          ) : (
            sortedStats.map((row) => (
              <TableRow key={row.language} className="hover:bg-gray-50">
                <TableCell className="py-3">
                  {getLanguageName(row.language)}
                </TableCell>
                <TableCell className="py-3 text-center">
                  {row.inProgress}
                </TableCell>
                <TableCell className="py-3 text-center">
                  {row.completed}
                </TableCell>
                <TableCell className="py-3 text-center">
                  {row.notStarted}
                </TableCell>
                <TableCell className="py-3 text-center">{row.total}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </SharedTable>
    </div>
  );
};

/** Simple sort arrow icon */
const SortIcon = ({
  active,
  direction,
}: {
  active: boolean;
  direction: 'asc' | 'desc';
}) => {
  return (
    <svg
      className={`w-4 h-4 text-gray-500 ${active ? 'opacity-100' : 'opacity-40'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      {direction === 'asc' ? (
        <path d="M5.293 12.707a1 1 0 001.414 0L10 9.414l3.293 3.293a1 1 0 001.414-1.414l-4-4a1 1 0 00-1.414 0l-4 4a1 1 0 000 1.414z" />
      ) : (
        <path d="M14.707 7.293a1 1 0 00-1.414 0L10 10.586 6.707 7.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" />
      )}
    </svg>
  );
};
