import { TableBody, TableCell, TableRow } from '@blms/ui';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import SwapIcon from '#src/assets/translation/swap.svg';

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
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  const getSortIcon = (field: SortField): ReactNode => {
    if (sortField !== field) {
      return <img src={SwapIcon} alt="Swap" className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? '↑' : '↓';
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
            sortIcon={getSortIcon('language')}
          >
            <div className="flex items-center gap-1">{t('words.language')}</div>
          </SharedTableHead>
          <SharedTableHead
            className="w-32 text-center cursor-pointer"
            sortable
            onSort={() => toggleSort('inProgress')}
            sortIcon={getSortIcon('inProgress')}
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
            sortIcon={getSortIcon('completed')}
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
            sortIcon={getSortIcon('notStarted')}
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
            sortIcon={getSortIcon('total')}
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
