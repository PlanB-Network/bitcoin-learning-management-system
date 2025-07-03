import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Loader, TableBody, TableCell, TableRow } from '@blms/ui';

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
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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

      {/* Courses Table */}
      <div className="w-full">
        <SharedTable>
          <SharedTableHeader>
            <SharedTableHead className="w-24">
              {t('dashboard.adminPanel.translationPanel.translate.table.index')}
            </SharedTableHead>
            <SharedTableHead>
              {t(
                'dashboard.adminPanel.translationPanel.translate.table.course',
              )}
            </SharedTableHead>
            <SharedTableHead>
              {t(
                'dashboard.adminPanel.translationPanel.translate.table.todoLanguages',
              )}
            </SharedTableHead>
            <SharedTableHead className="w-32 text-center">
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
            {courses.map((course: CourseWithTodoTranslations) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                    {course.index}
                  </span>
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
