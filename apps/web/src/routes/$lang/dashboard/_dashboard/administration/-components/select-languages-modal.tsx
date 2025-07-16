import type { CourseWithTodoTranslations } from '@blms/types';
import { cn, customToast, Input, Loader } from '@blms/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineTranslate } from 'react-icons/hi';

import { CommonModal } from '#src/components/ui/common-modal.tsx';
import { trpcClient } from '#src/utils/trpc.js';

interface SelectLanguagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  course: CourseWithTodoTranslations;
}

interface ModalState {
  selectedLanguages: string[];
  isStarting: boolean;
  languages: Array<{ code: string; name: string }>;
  selectedFiles: File[];
  folderError: string;
  hasExisting: boolean;
  overwriteWarning: boolean;
  hasEnglishTranslation: boolean;
  useEnglish: boolean;
}

const initialState: ModalState = {
  selectedLanguages: [],
  isStarting: false,
  languages: [],
  selectedFiles: [],
  folderError: '',
  hasExisting: false,
  overwriteWarning: false,
  hasEnglishTranslation: false,
  useEnglish: false,
};

export const SelectLanguagesModal = ({
  isOpen,
  onClose,
  onSuccess,
  course,
}: SelectLanguagesModalProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<ModalState>(initialState);

  /* ------------------------------------------------------------- */
  /* Check if English translation is published                      */
  /* ------------------------------------------------------------- */
  useEffect(() => {
    const fetchEnglish = async () => {
      if (course.originalLanguage?.toLowerCase() === 'en') return;
      try {
        const data =
          await trpcClient.content.getAvailableCourseTranslations.query({
            language: 'en',
            courseId: course.id,
          });
        if (data && data.length > 0) {
          setState((prev) => ({ ...prev, hasEnglishTranslation: true }));
        }
      } catch (err) {
        console.error('Failed fetching English translation info', err);
      }
    };
    fetchEnglish();
  }, [course.id, course.originalLanguage]);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Fetch languages data
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const data =
          await trpcClient.user.translation.getAvailableLanguages.query();
        setState((prev) => ({ ...prev, languages: data || [] }));
      } catch (error) {
        console.error('Error fetching languages:', error);
        setState((prev) => ({ ...prev, languages: [] }));
      }
    };

    if (isOpen) {
      fetchLanguages();
      trpcClient.content.hasCourseUploads
        .query({ courseId: course.id })
        .then((info: { exists: boolean }) => {
          setState((prev) => ({ ...prev, hasExisting: info.exists }));
        })
        .catch((e: unknown) =>
          console.error('Error checking existing uploads', e),
        );
    }
  }, [isOpen]);

  // Function to get language names from the fetched languages data
  const languageMap = useMemo(() => {
    if (!state.languages || state.languages.length === 0)
      return new Map<string, string>();
    return new Map(state.languages.map((lang) => [lang.code, lang.name]));
  }, [state.languages]);

  const getLanguageNameFromData = useCallback(
    (code: string) => {
      return languageMap.get(code) ?? code;
    },
    [languageMap],
  );

  const handleLanguageToggle = useCallback((language: string) => {
    setState((prev) => ({
      ...prev,
      selectedLanguages: prev.selectedLanguages.includes(language)
        ? prev.selectedLanguages.filter((lang) => lang !== language)
        : [...prev.selectedLanguages, language],
    }));
  }, []);

  const handleFolderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);
      setState((prev) => ({
        ...prev,
        selectedFiles: files,
        folderError: '',
        overwriteWarning: prev.hasExisting,
      }));
      // Clear any previously entered URL
      setFolderUrl('');
    },
    [],
  );

  const handleZipChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);
      setState((prev) => ({
        ...prev,
        selectedFiles: files,
        folderError: '',
        overwriteWarning: prev.hasExisting,
      }));
      // Clear URL when ZIP chosen
      setFolderUrl('');
    },
    [],
  );

  const handleFolderInputClick = useCallback(() => {
    folderInputRef.current?.click();
  }, []);

  const handleZipInputClick = useCallback(() => {
    zipInputRef.current?.click();
  }, []);

  // URL input state
  const [folderUrl, setFolderUrl] = useState('');

  const handleStartTranslation = useCallback(async () => {
    // User must have chosen at least one language AND (uploaded files OR previous uploads exist OR provided URL)
    const readyToStart =
      state.selectedLanguages.length > 0 &&
      (state.hasExisting ||
        state.selectedFiles.length > 0 ||
        folderUrl.trim().length > 0);

    if (!readyToStart) {
      // Set error message prompting user to upload files first
      setState((prev) => ({
        ...prev,
        folderError:
          t(
            'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.missingFilesError',
          ) ||
          'Please upload translation files or provide a URL before starting.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isStarting: true }));
    try {
      const formData = new FormData();
      formData.append('courseId', course.id);
      formData.append('languages', JSON.stringify(state.selectedLanguages));
      if (state.selectedFiles.length > 0) {
        for (const f of state.selectedFiles) {
          formData.append('files', f, (f as any).webkitRelativePath || f.name);
        }
      }
      if (folderUrl) {
        formData.append('url', folderUrl);
      }

      // Append useEnglish flag if relevant
      if (state.hasEnglishTranslation) {
        formData.append('useEnglish', state.useEnglish ? 'true' : 'false');
      }

      const response = await fetch('/api/translation-uploads', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      customToast(
        t(
          'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.startSuccess',
        ),
        { color: 'success' },
      );

      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error starting translation:', error);
    } finally {
      setState((prev) => ({ ...prev, isStarting: false }));
    }
  }, [
    state.selectedLanguages,
    state.selectedFiles,
    state.hasExisting,
    course.id,
    onClose,
    onSuccess,
    folderUrl,
    t,
    state.hasEnglishTranslation,
    state.useEnglish,
  ]);

  // Determine if translation can start (for button disabled state)
  const canStartTranslation =
    state.selectedLanguages.length > 0 &&
    (state.hasExisting ||
      state.selectedFiles.length > 0 ||
      folderUrl.trim().length > 0);

  const handleClose = useCallback(() => {
    setState(initialState);
    onClose();
  }, [onClose]);

  /* ------------------------------------------------------------- */
  /* Checkbox for using English                                     */
  /* ------------------------------------------------------------- */
  const englishCheckboxSection = state.hasEnglishTranslation ? (
    <div className="flex items-center gap-2">
      <input
        id="use-english-checkbox"
        type="checkbox"
        checked={state.useEnglish}
        onChange={() =>
          setState((prev) => ({ ...prev, useEnglish: !prev.useEnglish }))
        }
      />
      <label htmlFor="use-english-checkbox" className="text-sm text-gray-700">
        {t(
          'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.useEnglishLabel',
        )}
      </label>
    </div>
  ) : null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      icon={<HiOutlineTranslate className="text-2xl text-orange-500" />}
      title={t(
        'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.title',
      )}
      maxWidth="max-w-lg"
    >
      <div className="w-full space-y-6">
        {/* Course Information */}
        <div className="text-center space-y-1">
          <div>
            <span className="text-sm font-medium text-gray-700">
              {t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.course',
              )}
            </span>
            <p className="text-base font-semibold">{course.courseName}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">
              {t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.originalLanguage',
              )}
            </span>
            <p className="text-base font-semibold">
              {getLanguageNameFromData((course as any).originalLanguage)}
            </p>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
            {t(
              'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.selectLanguages',
            )}
          </h3>

          {course.todoLanguages.length === 0 ? (
            <p className="text-gray-500 text-center">
              {t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.noLanguagesAvailable',
              )}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {course.todoLanguages.map((language) => (
                <label
                  key={language}
                  className={cn(
                    'flex items-center p-2 rounded border cursor-pointer transition-colors',
                    state.selectedLanguages.includes(language)
                      ? 'bg-orange-50 border-orange-500 text-orange-700'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={state.selectedLanguages.includes(language)}
                    onChange={() => handleLanguageToggle(language)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">
                    {getLanguageNameFromData(language)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* English checkbox */}
        {englishCheckboxSection}

        {/* Upload Section & Notice */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 text-center">
            {t(
              'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.uploadFolder',
            )}
          </h3>

          {/* Hidden file inputs */}
          <input
            ref={folderInputRef}
            type="file"
            multiple
            /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
            // @ts-ignore - non-standard attribute for folder selection
            {...{ webkitdirectory: 'true', directory: 'true' }}
            className="hidden"
            onChange={handleFolderChange}
          />

          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleZipChange}
          />

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center rounded-lg overflow-hidden border border-gray-300 hover:shadow-sm">
              <button
                type="button"
                onClick={handleFolderInputClick}
                className="flex items-center px-4 py-2 bg-orange-500 text-white font-medium hover:bg-orange-600 focus:bg-orange-600 transition-colors"
              >
                {t(
                  'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.chooseFolder',
                )}
              </button>
              <span className="flex-1 px-3 py-2 text-sm text-gray-600 truncate">
                {state.selectedFiles.length > 0
                  ? `${state.selectedFiles.length} files selected`
                  : t(
                      'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.noFolderSelected',
                    )}
              </span>
            </div>

            <div className="flex items-center rounded-lg overflow-hidden border border-gray-300 hover:shadow-sm">
              <button
                type="button"
                onClick={handleZipInputClick}
                className="flex items-center px-4 py-2 bg-orange-500 text-white font-medium hover:bg-orange-600 focus:bg-orange-600 transition-colors"
              >
                {t(
                  'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.chooseZip',
                )}
              </button>
              <span className="flex-1 px-3 py-2 text-sm text-gray-600 truncate">
                {state.selectedFiles.length > 0
                  ? `${state.selectedFiles.length} file(s) selected`
                  : t(
                      'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.noZipSelected',
                    )}
              </span>
            </div>
          </div>

          {state.overwriteWarning && (
            <p className="text-orange-600 text-xs" role="alert">
              {t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.overwriteWarning',
              )}
            </p>
          )}

          {state.folderError && (
            <p className="text-red-600 text-xs" role="alert">
              {state.folderError}
            </p>
          )}

          {/* Optional URL field */}
          <div className="space-y-1">
            <label
              htmlFor="folderUrl"
              className="block text-sm font-medium text-gray-700"
            >
              {t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.folderUrl',
              )}
            </label>
            <Input
              id="folderUrl"
              type="url"
              value={folderUrl}
              onChange={(e) => {
                setFolderUrl(e.target.value);
                // Clear selected files when URL provided
                if (e.target.value) {
                  setState((prev) => ({ ...prev, selectedFiles: [] }));
                }
              }}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Info about existing uploads */}
        {state.hasExisting && (
          <p className="text-sm text-gray-700 text-center">
            {t(
              'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.existingUploadsInfo',
            )}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t(
              'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.cancel',
            )}
          </button>
          <button
            type="button"
            onClick={handleStartTranslation}
            disabled={!canStartTranslation || state.isStarting}
            className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {state.isStarting ? (
              <>
                <Loader size="s" className="mr-2" />
                {t(
                  'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.startingTranslation',
                )}
              </>
            ) : (
              t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.startTranslation',
              )
            )}
          </button>
        </div>
      </div>
    </CommonModal>
  );
};
