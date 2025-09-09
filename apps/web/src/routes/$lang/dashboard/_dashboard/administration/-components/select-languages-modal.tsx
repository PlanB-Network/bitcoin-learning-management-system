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
  uploadType: 'folder' | 'zip' | 'url' | null;
}

const initialState: ModalState = {
  selectedLanguages: [],
  isStarting: false,
  languages: [],
  selectedFiles: [],
  folderError: '',
  hasExisting: false,
  overwriteWarning: false,
  uploadType: null,
};

export const SelectLanguagesModal = ({
  isOpen,
  onClose,
  onSuccess,
  course,
}: SelectLanguagesModalProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<ModalState>(initialState);

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
  }, [isOpen, course.id]);

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
        uploadType: 'folder',
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
        uploadType: 'zip',
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

  // URL validation
  const isValidUrl = useCallback((url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);

  const handleUrlChange = useCallback(
    (url: string) => {
      setFolderUrl(url);
      if (url.trim()) {
        setState((prev) => ({
          ...prev,
          selectedFiles: [],
          uploadType: 'url',
          folderError:
            !isValidUrl(url) && url.length > 0
              ? 'Please enter a valid HTTPS URL'
              : '',
        }));
      } else {
        setState((prev) => ({
          ...prev,
          uploadType: null,
          folderError: '',
        }));
      }
    },
    [isValidUrl],
  );

  const handleStartTranslation = useCallback(async () => {
    // User must have chosen at least one language AND (uploaded files OR previous uploads exist OR provided URL)
    const readyToStart =
      state.selectedLanguages.length > 0 &&
      (state.hasExisting ||
        state.selectedFiles.length > 0 ||
        (folderUrl.trim().length > 0 && isValidUrl(folderUrl)));

    if (!readyToStart) {
      // Set error message prompting user to upload files first
      let errorMessage =
        t(
          'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.missingFilesError',
        ) ||
        'Please upload translation files or provide a valid HTTPS URL before starting.';

      if (folderUrl.trim().length > 0 && !isValidUrl(folderUrl)) {
        errorMessage = 'Please enter a valid HTTPS URL';
      }

      setState((prev) => ({
        ...prev,
        folderError: errorMessage,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isStarting: true }));

    try {
      // Step 1: Upload files
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

      // Create AbortController with extended timeout for file uploads
      const uploadController = new AbortController();
      const uploadTimeoutId = setTimeout(
        () => {
          uploadController.abort();
        },
        10 * 60 * 1000,
      ); // 10 minutes timeout for uploads

      let uploadResult: { uploadId: string; filesUploaded: number } | undefined;
      try {
        const uploadResponse = await fetch('/api/upload-translation-files', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          signal: uploadController.signal,
        });

        clearTimeout(uploadTimeoutId);

        if (!uploadResponse.ok) {
          let errorMessage = uploadResponse.statusText;
          try {
            const errorData = await uploadResponse.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // If error response is not JSON, use default message
          }

          // Show upload-specific error notification
          customToast(
            errorMessage.includes('timeout') ||
              errorMessage.includes('timed out')
              ? t(
                  'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.uploadTimeoutError',
                ) ||
                  'Upload timed out after 10 minutes. Please try with smaller files or check your connection.'
              : t(
                  'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.uploadError',
                ) || `Upload failed: ${errorMessage}`,
            { color: 'warning' },
          );

          return;
        }

        uploadResult = await uploadResponse.json();

        // Upload completed successfully - proceed to translation step without notification
        // (final notification will be shown after translation starts)
      } catch (uploadError) {
        clearTimeout(uploadTimeoutId);
        console.error('Error during file upload:', uploadError);

        // Handle upload-specific errors
        if (uploadError instanceof Error) {
          if (uploadError.name === 'AbortError') {
            customToast(
              t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.uploadTimeoutError',
              ) ||
                'Upload timed out after 10 minutes. Please try with smaller files or check your connection.',
              { color: 'warning' },
            );
          } else {
            customToast(
              t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.uploadError',
              ) || 'Upload failed. Please check your files and try again.',
              { color: 'warning' },
            );
          }
        }
        return;
      }

      // Step 2: Start translation
      const translationController = new AbortController();
      const translationTimeoutId = setTimeout(
        () => {
          translationController.abort();
        },
        10 * 60 * 1000,
      ); // 10 minutes timeout for translation process

      try {
        const translationResponse = await fetch(
          `/api/start-translation/${uploadResult!.uploadId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              languages: state.selectedLanguages,
            }),
            credentials: 'include',
            signal: translationController.signal,
          },
        );

        clearTimeout(translationTimeoutId);

        if (!translationResponse.ok) {
          let errorMessage = translationResponse.statusText;
          try {
            const errorData = await translationResponse.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // If error response is not JSON, use default message
          }

          // Show translation-specific error notification
          customToast(
            errorMessage.includes('timeout') ||
              errorMessage.includes('timed out')
              ? t(
                  'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.timeoutError',
                ) ||
                  'Translation request timed out. Please try again or contact support.'
              : t(
                  'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.translationFailed',
                ) || `Translation failed: ${errorMessage}`,
            { color: 'warning' },
          );

          return;
        }

        // Show unified success message including upload and translation start
        const successMessage = uploadResult!.filesUploaded
          ? t(
              'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.uploadAndTranslationStarted',
            ) ||
            'Files uploaded and translation started! The process may take several minutes for large courses. You can close this modal and check back later.'
          : t(
              'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.processingStarted',
            ) ||
            'Translation started! The process may take several minutes for large courses. You can close this modal and check back later.';

        customToast(successMessage, { color: 'success' });

        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      } catch (translationError) {
        clearTimeout(translationTimeoutId);
        console.error('Error during translation start:', translationError);

        // Handle translation-specific errors
        if (translationError instanceof Error) {
          if (translationError.name === 'AbortError') {
            customToast(
              t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.timeoutError',
              ) ||
                'Translation request timed out. Please try again or contact support.',
              { color: 'warning' },
            );
          } else {
            customToast(
              t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.translationFailed',
              ) || 'Failed to start translation. Please try again.',
              { color: 'warning' },
            );
          }
        }
      }
    } catch (error) {
      console.error('Error in translation process:', error);

      // Show general error notification
      customToast(
        t(
          'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.networkError',
        ) ||
          'Network error occurred. Please check your connection and try again.',
        { color: 'warning' },
      );
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
    isValidUrl,
  ]);

  // Determine if translation can start (for button disabled state)
  const canStartTranslation =
    state.selectedLanguages.length > 0 &&
    (state.hasExisting ||
      state.selectedFiles.length > 0 ||
      (folderUrl.trim().length > 0 && isValidUrl(folderUrl)));

  const handleClose = useCallback(() => {
    setState(initialState);
    setFolderUrl('');
    onClose();
  }, [onClose]);

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
              {getLanguageNameFromData(course.originalLanguage)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.englishFilesRequired',
              ) || 'Please upload files in English only'}
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
            // non-standard attribute for folder selection
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
            <div
              className={cn(
                'flex items-center rounded-lg overflow-hidden border transition-colors hover:shadow-sm',
                state.uploadType === 'folder'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300',
              )}
            >
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
                {state.uploadType === 'folder' && state.selectedFiles.length > 0
                  ? `${state.selectedFiles.length} files selected`
                  : t(
                      'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.noFolderSelected',
                    )}
              </span>
            </div>

            <div
              className={cn(
                'flex items-center rounded-lg overflow-hidden border transition-colors hover:shadow-sm',
                state.uploadType === 'zip'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300',
              )}
            >
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
                {state.uploadType === 'zip' && state.selectedFiles.length > 0
                  ? `${state.selectedFiles.length} ZIP file(s) selected`
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
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://..."
              className={cn(
                state.uploadType === 'url' && 'border-orange-500 bg-orange-50',
                state.folderError && folderUrl && 'border-red-500',
              )}
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
