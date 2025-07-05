import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader } from '@blms/ui';

import { ContributorsSubTab } from './contributors-sub-tab.tsx';
import { CoursesSubTab } from './courses-sub-tab.tsx';
import { LanguageCoverageSubTab } from './language-coverage-sub-tab.tsx';
import { MetricCard } from './metric-card.tsx';

import type {
  AdminContentManagementCourse,
  AdminUserManagement,
} from '@blms/types';
import BookIcon from '#src/assets/translation/book.svg';
import TranslateIcon from '#src/assets/translation/translate.svg';
import { trpcClient } from '#src/utils/trpc.js';

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
            <img
              src={BookIcon}
              alt="Book icon"
              className="w-6 h-6 text-orange-700"
            />
          }
        />
        <MetricCard
          title={t(
            'dashboard.adminPanel.translationPanel.reports.totalLanguages',
          )}
          value={new Set(contributors.flatMap((c) => c.languages || [])).size}
          icon={
            <img
              src={TranslateIcon}
              alt="Translate icon"
              className="w-6 h-6 text-orange-700"
            />
          }
        />
        <MetricCard
          title={t(
            'dashboard.adminPanel.translationPanel.reports.languagesProofread',
          )}
          value={statisticsLoading ? '...' : statistics.languagesProofread}
          icon={
            <img
              src={TranslateIcon}
              alt="Translate icon"
              className="w-3 h-6 flex-shrink-0 text-orange-700"
            />
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

      {/* Contributors sub-tab */}
      {subTab === 'contributors' && (
        <ContributorsSubTab
          contributors={contributors}
          languages={languages}
          courses={courses}
          getLanguageName={getLanguageName}
          t={t}
        />
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
