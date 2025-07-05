import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Loader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TableBody,
  TableCell,
  TableRow,
} from '@blms/ui';

import { CoursesSubTab } from './courses-sub-tab.tsx';
import { LanguageCoverageSubTab } from './language-coverage-sub-tab.tsx';
import { MetricCard } from './metric-card.tsx';

import type {
  AdminContentManagementCourse,
  AdminUserManagement,
} from '@blms/types';
import { trpcClient } from '#src/utils/trpc.js';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../../-components/shared-table-header.tsx';

interface LanguageInfo {
  code: string;
  name: string;
}

export const ReportsTab = () => {
  const { t } = useTranslation();

  const [subTab, setSubTab] = useState<'contributors' | 'courses' | 'coverage'>(
    'contributors',
  );

  const [contributors, setContributors] = useState<AdminUserManagement[]>([]);
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [courses, setCourses] = useState<AdminContentManagementCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Real statistics
  const [statistics, setStatistics] = useState({
    proofreadCourses: 0,
    totalCourses: 0,
    languagesProofread: 0,
  });

  /* Fetch contributors + languages first */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contributorsData, languagesData, coursesData] =
          await Promise.all([
            trpcClient.user.translation.getAdminUserManagement.query(),
            trpcClient.user.translation.getAvailableLanguages.query(),
            trpcClient.content.getReportsCourses.query({}),
          ]);
        setContributors(contributorsData || []);
        setLanguages(languagesData || []);
        setCourses(coursesData || []);
      } catch (err) {
        console.error(
          '[ReportsTab] Failed fetching contributors/languages',
          err,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* Fetch statistics separately */
  useEffect(() => {
    const fetchStatistics = () => {
      if (courses.length === 0) return;

      setStatisticsLoading(true);

      // Unique course count
      const totalCourses = new Set(courses.map((c) => c.courseId)).size;

      const published = courses.filter((c) => c.status === 'published');

      const proofreadCourses = new Set(published.map((c) => c.courseId)).size;
      const languagesProofread = new Set(published.map((c) => c.language)).size;

      setStatistics({
        proofreadCourses,
        totalCourses,
        languagesProofread,
      });

      setStatisticsLoading(false);
    };

    fetchStatistics();
  }, [courses]);

  /** Utils */
  const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-GB');

  const filteredContributors = useMemo(() => {
    if (selectedLanguage === 'all') return contributors;
    return contributors.filter((c) => c.languages?.includes(selectedLanguage));
  }, [contributors, selectedLanguage]);

  /** Helper to translate language code -> full name */
  const getLanguageName = (code: string) =>
    languages.find((l) => l.code === code)?.name || code;

  /* --- UI Components --- */

  /** Render */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mt-6">
      {/* KPI cards */}
      <div className="flex flex-wrap gap-5">
        <MetricCard
          title={t(
            'dashboard.adminPanel.translationPanel.reports.proofreadCourses',
          )}
          value={
            statisticsLoading
              ? '...'
              : `${statistics.proofreadCourses}/${statistics.totalCourses}`
          }
          icon={
            <svg
              className="w-6 h-6 text-orange-700"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Proofread courses icon</title>
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title={t(
            'dashboard.adminPanel.translationPanel.reports.totalLanguages',
          )}
          value={new Set(contributors.flatMap((c) => c.languages || [])).size}
          icon={
            <svg
              className="w-6 h-6 text-orange-700"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Total languages icon</title>
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
          }
        />
        <MetricCard
          title={t(
            'dashboard.adminPanel.translationPanel.reports.languagesProofread',
          )}
          value={statisticsLoading ? '...' : statistics.languagesProofread}
          icon={
            <svg
              className="w-6 h-6 text-orange-700"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Languages proofread icon</title>
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
          }
        />
      </div>

      {/* Sub tabs */}
      <div className="flex w-fit mb-6 bg-gray-100 p-1 rounded-md">
        <button
          type="button"
          onClick={() => setSubTab('contributors')}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            subTab === 'contributors'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t('dashboard.adminPanel.translationPanel.reports.tabs.contributors')}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('courses')}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            subTab === 'courses'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t('dashboard.adminPanel.translationPanel.reports.tabs.courses')}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('coverage')}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            subTab === 'coverage'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {t('dashboard.adminPanel.translationPanel.reports.tabs.coverage')}
        </button>
      </div>

      {/* Contributors view */}
      {subTab === 'contributors' && (
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
              <SharedTableHead className="w-32">
                <div className="flex items-center gap-1">
                  {t(
                    'dashboard.adminPanel.translationPanel.reports.contributors.startDate',
                  )}
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </SharedTableHead>
              <SharedTableHead className="w-48">
                <div className="flex items-center gap-1">
                  {t(
                    'dashboard.adminPanel.translationPanel.reports.contributors.username',
                  )}
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </SharedTableHead>
              <SharedTableHead className="w-32 text-center">
                <div className="flex items-center justify-center gap-1">
                  {t(
                    'dashboard.adminPanel.translationPanel.reports.contributors.assignedCourses',
                  )}
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </SharedTableHead>
              <SharedTableHead className="w-40 text-center">
                <div className="flex items-center justify-center gap-1">
                  {t(
                    'dashboard.adminPanel.translationPanel.reports.contributors.completedCourses',
                  )}
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </SharedTableHead>
              <SharedTableHead className="w-56">
                <div className="flex items-center gap-1">
                  {t(
                    'dashboard.adminPanel.translationPanel.reports.contributors.languages',
                  )}
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </SharedTableHead>
              <SharedTableHead className="w-40 text-center">
                <div className="flex items-center justify-center gap-1">
                  {t(
                    'dashboard.adminPanel.translationPanel.reports.contributors.totalReward',
                  )}
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </SharedTableHead>
            </SharedTableHeader>
            <TableBody>
              {filteredContributors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    {t(
                      'dashboard.adminPanel.translationPanel.reports.noContributors',
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredContributors.map((contributor) => (
                  <TableRow key={contributor.uid} className="hover:bg-gray-50">
                    <TableCell className="py-3">
                      {formatDate(
                        contributor.startDate ?? contributor.createdAt,
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-medium">
                        {contributor.username}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      {contributor.assignedCourses}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      {
                        courses.filter(
                          (c) =>
                            c.assigneeId === contributor.uid &&
                            (c.status === 'reviewed' ||
                              c.status === 'published'),
                        ).length
                      }
                    </TableCell>
                    <TableCell className="py-3">
                      {contributor.languages
                        ?.map((code) => getLanguageName(code))
                        .join(', ')}
                    </TableCell>
                    <TableCell className="py-3 text-center">0</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </SharedTable>
        </div>
      )}

      {/* Courses sub-tab */}
      {subTab === 'courses' && (
        <CoursesSubTab
          courses={courses}
          getLanguageName={getLanguageName}
          t={t}
        />
      )}

      {/* Placeholder for other sub tabs */}
      {subTab === 'coverage' && (
        <LanguageCoverageSubTab
          courses={courses}
          getLanguageName={getLanguageName}
          t={t}
        />
      )}
    </div>
  );
};
