import { LANGUAGES_MAP } from '@blms/shared';
import type { CourseWithTodoTranslations } from '@blms/types';
import { cn, customToast, Input, Loader } from '@blms/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbLanguage } from 'react-icons/tb';
import { CommonModal } from '#src/components/ui/common-modal.tsx';
import { trpcClient } from '#src/utils/trpc.js';

interface SelectLanguagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  course: CourseWithTodoTranslations;
}

interface UploadProgress {
  progress: string;
  totalFiles?: number;
  processedFiles?: number;
  currentFile?: string;
}

interface ModalState {
  selectedLanguages: string[];
  isStarting: boolean;
  selectedFiles: File[];
  folderError: string;
  hasExisting: boolean;
  overwriteWarning: boolean;
  uploadType: 'folder' | 'zip' | 'url' | null;
  uploadProgress: UploadProgress | null;
}

const initialState: ModalState = {
  selectedLanguages: [],
  isStarting: false,
  selectedFiles: [],
  folderError: '',
  hasExisting: false,
  overwriteWarning: false,
  uploadType: null,
  uploadProgress: null,
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

  // Check for existing uploads
  useEffect(() => {
    if (isOpen) {
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

  // Use LANGUAGES_MAP directly for language names
  const getLanguageName = useCallback((code: string): string => {
    return LANGUAGES_MAP[code] || code;
  }, []);

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

  /**
   * Poll upload job status until completion or failure
   */
  const pollUploadJobStatus = useCallback(
    async (jobId: string): Promise<{ uploadId: string } | null> => {
      const maxAttempts = 120; // 10 minutes max (120 * 5s)
      const pollInterval = 5000; // 5 seconds

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const statusResponse = await fetch(
            `/api/upload-job-status/${jobId}`,
            {
              method: 'GET',
              credentials: 'include',
            },
          );

          if (!statusResponse.ok) {
            if (statusResponse.status === 404) {
              throw new Error('Upload job not found');
            }
            throw new Error(
              `Status check failed: ${statusResponse.statusText}`,
            );
          }

          const jobStatus = await statusResponse.json();

          // Update progress in state for UI display
          setState((prev) => ({
            ...prev,
            uploadProgress: {
              progress: jobStatus.progress || 'Processing...',
              totalFiles: jobStatus.totalFiles,
              processedFiles: jobStatus.processedFiles,
              currentFile: jobStatus.currentFile,
            },
          }));

          if (jobStatus.status === 'completed') {
            console.log('[Upload] Job completed successfully');
            return { uploadId: jobStatus.uploadId };
          }

          if (jobStatus.status === 'failed') {
            throw new Error(jobStatus.error || 'Upload failed');
          }

          // Still processing, wait before next poll
          console.log(
            `[Upload] Job still processing (${jobStatus.progress || 'uploading...'})`,
          );
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
        } catch (error) {
          console.error('[Upload] Error polling job status:', error);
          // Clear progress on error
          setState((prev) => ({ ...prev, uploadProgress: null }));
          throw error;
        }
      }

      // Timeout after max attempts
      setState((prev) => ({ ...prev, uploadProgress: null }));
      throw new Error(
        'Upload timed out after 10 minutes. Please try with smaller files.',
      );
    },
    [],
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
      // Step 1: Start upload (returns immediately with jobId)
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

      const uploadResponse = await fetch('/api/upload-translation-files', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

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

        customToast(
          t(
            'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.uploadError',
          ) || `Upload failed: ${errorMessage}`,
          { color: 'warning' },
        );
        return;
      }

      const uploadJobResponse = await uploadResponse.json();
      const { jobId } = uploadJobResponse;

      console.log('[Upload] Job started with ID:', jobId);

      // Step 2: Poll upload job status until completion
      const uploadResult = await pollUploadJobStatus(jobId);

      if (!uploadResult) {
        throw new Error('Upload job did not return upload ID');
      }

      console.log(
        '[Upload] Upload completed, uploadId:',
        uploadResult.uploadId,
      );

      // Clear upload progress after successful completion
      setState((prev) => ({ ...prev, uploadProgress: null }));

      // Step 3: Start translation (returns immediately)
      const translationResponse = await fetch(
        `/api/start-translation/${uploadResult.uploadId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            languages: state.selectedLanguages,
          }),
          credentials: 'include',
        },
      );

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

        customToast(
          t(
            'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.translationFailed',
          ) || `Translation failed: ${errorMessage}`,
          { color: 'warning' },
        );
        return;
      }

      await translationResponse.json();

      // Show unified success message
      const successMessage =
        t(
          'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.uploadAndTranslationStarted',
        ) ||
        'Files uploaded and translation started! The process may take several minutes for large courses. You can close this modal and check back later.';

      customToast(successMessage, { color: 'success' });

      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error in translation process:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      customToast(
        t(
          'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.networkError',
        ) || errorMessage,
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
    pollUploadJobStatus,
  ]);

  // Determine if translation can start (for button disabled state)
  const canStartTranslation =
    state.selectedLanguages.length > 0 &&
    (state.hasExisting ||
      state.selectedFiles.length > 0 ||
      (folderUrl.trim().length > 0 && isValidUrl(folderUrl)));

  const handleClose = useCallback(() => {
    // Don't allow closing while upload is in progress
    if (state.uploadProgress) {
      return;
    }
    setState(initialState);
    setFolderUrl('');
    onClose();
  }, [onClose, state.uploadProgress]);

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      icon={<TbLanguage className="text-2xl text-orange-500" />}
      title={t(
        'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.title',
      )}
      maxWidth="max-w-lg"
    >
      {/* Show progress UI when uploading */}
      {state.uploadProgress ? (
        <div className="w-full space-y-6 py-8">
          {/* Spinner */}
          <div className="flex justify-center">
            <Loader size="xl" />
          </div>

          {/* Progress message */}
          <div className="text-center space-y-2">
            <p className="text-base font-medium text-gray-900">
              {state.uploadProgress.progress}
            </p>

            {/* File counter */}
            {state.uploadProgress.totalFiles !== undefined &&
              state.uploadProgress.processedFiles !== undefined && (
                <p className="text-sm text-gray-600">
                  {state.uploadProgress.processedFiles} /{' '}
                  {state.uploadProgress.totalFiles} files processed
                </p>
              )}

            {/* Current file */}
            {state.uploadProgress.currentFile && (
              <p className="text-xs text-gray-500 truncate max-w-md mx-auto">
                {state.uploadProgress.currentFile}
              </p>
            )}
          </div>

          {/* Progress bar (optional) */}
          {state.uploadProgress.totalFiles !== undefined &&
            state.uploadProgress.processedFiles !== undefined &&
            state.uploadProgress.totalFiles > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(state.uploadProgress.processedFiles / state.uploadProgress.totalFiles) * 100}%`,
                  }}
                />
              </div>
            )}

          <p className="text-sm text-gray-500 text-center">
            This may take several minutes. Please do not close this window.
          </p>
        </div>
      ) : (
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
                {getLanguageName(course.originalLanguage)}
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
                      {getLanguageName(language)}
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
                  {state.uploadType === 'folder' &&
                  state.selectedFiles.length > 0
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
                  state.uploadType === 'url' &&
                    'border-orange-500 bg-orange-50',
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
      )}
    </CommonModal>
  );
};
