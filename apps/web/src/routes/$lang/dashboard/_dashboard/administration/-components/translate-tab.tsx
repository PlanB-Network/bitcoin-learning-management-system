import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import SwapIcon from '#src/assets/translation/swap.svg';
import { SearchBar } from '#src/components/ui/search-bar.tsx';

import {
  Button,
  Loader,
  TableBody,
  TableCell,
  TableRow,
  TextTag,
} from '@blms/ui';

import type { CourseWithTodoTranslations } from '@blms/types';
import { trpcClient } from '#src/utils/trpc.js';

import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../../-components/shared-table-header.tsx';
import { SelectLanguagesModal } from './select-languages-modal.tsx';

interface TranslateTabState {
  selectedCourse: CourseWithTodoTranslations | null;
  isModalOpen: boolean;
}

export const TranslateTab = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<TranslateTabState>({
    selectedCourse: null,
    isModalOpen: false,
  });

  const [courses, setCourses] = useState<CourseWithTodoTranslations[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /* ------------------------------------------------------------- */
  /* Sorting                                                       */
  /* ------------------------------------------------------------- */
  type SortField = 'index' | 'course' | 'todoCount' | 'totalLanguages';
  const [sortField, setSortField] = useState<SortField>('index');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  // Fetch courses with todo translations
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data =
        await trpcClient.content.getCoursesWithTodoTranslations.query();
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available languages
  const fetchLanguages = async () => {
    try {
      const data =
        await trpcClient.user.translation.getAvailableLanguages.query();
      setLanguages(data || []);
    } catch (err) {
      console.error('Error fetching languages:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchLanguages();
  }, []);

  // Memoize language name lookup function for better performance
  const languageMap = useMemo(() => {
    if (!languages || languages.length === 0) return new Map<string, string>();
    return new Map(
      languages.map((lang: { code: string; name: string }) => [
        lang.code,
        lang.name || lang.code,
      ]),
    );
  }, [languages]);

  const getLanguageNameFromData = useCallback(
    (code: string): string => {
      const name = languageMap.get(code);
      return typeof name === 'string' && name.length > 0 ? name : code;
    },
    [languageMap],
  );

  const handleTranslateClick = useCallback(
    (course: CourseWithTodoTranslations) => {
      setState({
        selectedCourse: course,
        isModalOpen: true,
      });
    },
    [],
  );

  const handleCloseModal = useCallback(() => {
    setState({
      selectedCourse: null,
      isModalOpen: false,
    });
  }, []);

  const handleTranslationSuccess = useCallback(() => {
    // Close modal first
    setState({ selectedCourse: null, isModalOpen: false });
    // Refresh the courses list
    fetchCourses();
  }, [fetchCourses]);

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase().trim();
    return courses.filter(
      (c) =>
        c.courseName?.toLowerCase().includes(q) ||
        c.index.toLowerCase().includes(q) ||
        (c.todoLanguages || []).some((lang) => lang.toLowerCase().includes(q)),
    );
  }, [courses, searchQuery]);

  const sortedCourses = useMemo(() => {
    const list = [...filteredCourses];
    list.sort((a, b) => {
      let aVal: any;
      let bVal: any;
      switch (sortField) {
        case 'index':
          aVal = a.index;
          bVal = b.index;
          break;
        case 'course':
          aVal = a.courseName ?? '';
          bVal = b.courseName ?? '';
          break;
        case 'todoCount':
          aVal = a.todoLanguages?.length ?? 0;
          bVal = b.todoLanguages?.length ?? 0;
          break;
        case 'totalLanguages':
          aVal = a.totalLanguages ?? 0;
          bVal = b.totalLanguages ?? 0;
          break;
        default:
          return 0;
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const comp = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? comp : -comp;
    });
    return list;
  }, [filteredCourses, sortField, sortDirection]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="title-large-sb-24px text-dashboardSectionTitle">
            {t('dashboard.adminPanel.translationPanel.translate.title')}
          </h2>
        </div>
        <div className="flex justify-center py-8">
          <Loader size="m" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="title-large-sb-24px text-dashboardSectionTitle">
            {t('dashboard.adminPanel.translationPanel.translate.title')}
          </h2>
        </div>
        <div className="text-center py-8" role="alert">
          <p className="text-red-600">
            Error loading courses: {error?.message}
          </p>
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="title-large-sb-24px text-dashboardSectionTitle">
            {t('dashboard.adminPanel.translationPanel.translate.title')}
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">
            {t('dashboard.adminPanel.translationPanel.translate.noCourses')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <h2 className="title-large-sb-24px text-dashboardSectionTitle">
          {t('dashboard.adminPanel.translationPanel.translate.title')}
        </h2>
      </div>

      {/* Description */}
      <p className="text-gray-600">
        {t('dashboard.adminPanel.translationPanel.translate.description')}
      </p>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t(
          'dashboard.adminPanel.translationPanel.searchPlaceholder',
        )}
        className="max-w-lg"
      />

      {/* Courses Table */}
      <div className="w-full">
        <SharedTable>
          <SharedTableHeader>
            <SharedTableHead
              className="w-24"
              sortable
              onSort={() => handleSort('index')}
              sortIcon={getSortIcon('index')}
            >
              {t('dashboard.adminPanel.translationPanel.translate.table.index')}
            </SharedTableHead>
            <SharedTableHead
              sortable
              onSort={() => handleSort('course')}
              sortIcon={getSortIcon('course')}
            >
              {t(
                'dashboard.adminPanel.translationPanel.translate.table.course',
              )}
            </SharedTableHead>
            <SharedTableHead
              sortable
              onSort={() => handleSort('todoCount')}
              sortIcon={getSortIcon('todoCount')}
            >
              {t(
                'dashboard.adminPanel.translationPanel.translate.table.todoLanguages',
              )}
            </SharedTableHead>
            <SharedTableHead
              className="w-32 text-center"
              sortable
              onSort={() => handleSort('totalLanguages')}
              sortIcon={getSortIcon('totalLanguages')}
            >
              {t(
                'dashboard.adminPanel.translationPanel.translate.table.totalLanguages',
              )}
            </SharedTableHead>
            <SharedTableHead className="w-32">
              {t(
                'dashboard.adminPanel.translationPanel.translate.table.actions',
              )}
            </SharedTableHead>
          </SharedTableHeader>
          <TableBody>
            {sortedCourses.map((course: CourseWithTodoTranslations) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">
                  <TextTag size="verySmall" variant="grey">
                    {course.index.toUpperCase()}
                  </TextTag>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{course.courseName}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {course.todoLanguages.slice(0, 3).map((lang: string) => (
                      <span
                        key={lang}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full"
                      >
                        {getLanguageNameFromData(lang) || lang}
                      </span>
                    ))}
                    {course.todoLanguages.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        +{course.todoLanguages.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {course.totalLanguages}
                </TableCell>
                <TableCell>
                  <Button
                    size="s"
                    variant="primary"
                    onClick={() => handleTranslateClick(course)}
                    aria-label={`Translate ${course.courseName}`}
                  >
                    {t(
                      'dashboard.adminPanel.translationPanel.translate.actions.translate',
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </SharedTable>
      </div>

      {/* Select Languages Modal */}
      {state.selectedCourse && (
        <SelectLanguagesModal
          isOpen={state.isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleTranslationSuccess}
          course={state.selectedCourse}
        />
      )}
    </div>
  );
};
