import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineTranslate } from 'react-icons/hi';

import { Loader, cn } from '@blms/ui';

import type { CourseWithTodoTranslations } from '@blms/types';
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
  selectedAudioFile: File | null;
  selectedPptxFile: File | null;
  audioError: string;
  pptxError: string;
}

const initialState: ModalState = {
  selectedLanguages: [],
  isStarting: false,
  languages: [],
  selectedAudioFile: null,
  selectedPptxFile: null,
  audioError: '',
  pptxError: '',
};

export const SelectLanguagesModal = ({
  isOpen,
  onClose,
  onSuccess,
  course,
}: SelectLanguagesModalProps) => {
  const { t } = useTranslation();
  const [state, setState] = useState<ModalState>(initialState);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const pptxInputRef = useRef<HTMLInputElement>(null);

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

  const handleAudioFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate audio file type
        if (!file.type.startsWith('audio/')) {
          setState((prev) => ({
            ...prev,
            audioError: t(
              'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.invalidAudioFile',
            ),
            selectedAudioFile: null,
          }));
          return;
        }
        // File size limit (50MB)
        if (file.size > 50 * 1024 * 1024) {
          setState((prev) => ({
            ...prev,
            audioError: t(
              'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.audioFileTooLarge',
            ),
            selectedAudioFile: null,
          }));
          return;
        }
        setState((prev) => ({
          ...prev,
          selectedAudioFile: file,
          audioError: '',
        }));
      }
    },
    [t],
  );

  const handlePptxFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate PPTX file type
        if (
          file.type !==
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' &&
          !file.name.toLowerCase().endsWith('.pptx')
        ) {
          setState((prev) => ({
            ...prev,
            pptxError: t(
              'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.invalidPptxFile',
            ),
            selectedPptxFile: null,
          }));
          return;
        }
        // File size limit (100MB)
        if (file.size > 100 * 1024 * 1024) {
          setState((prev) => ({
            ...prev,
            pptxError: t(
              'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.pptxFileTooLarge',
            ),
            selectedPptxFile: null,
          }));
          return;
        }
        setState((prev) => ({
          ...prev,
          selectedPptxFile: file,
          pptxError: '',
        }));
      }
    },
    [t],
  );

  const handleStartTranslation = useCallback(async () => {
    if (state.selectedLanguages.length === 0) {
      return;
    }

    setState((prev) => ({ ...prev, isStarting: true }));
    try {
      const formData = new FormData();
      formData.append('courseId', course.id);
      formData.append('languages', JSON.stringify(state.selectedLanguages));
      if (state.selectedAudioFile) {
        formData.append('audioFile', state.selectedAudioFile);
      }
      if (state.selectedPptxFile) {
        formData.append('pptxFile', state.selectedPptxFile);
      }

      const response = await fetch('/api/translation-uploads', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);

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
    state.selectedAudioFile,
    state.selectedPptxFile,
    course.id,
    onClose,
    onSuccess,
  ]);

  const handleClose = useCallback(() => {
    setState(initialState);
    onClose();
  }, [onClose]);

  const handleAudioFileClick = useCallback(() => {
    audioInputRef.current?.click();
  }, []);

  const handlePptxFileClick = useCallback(() => {
    pptxInputRef.current?.click();
  }, []);

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

        {/* File Upload Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 text-center">
            {t(
              'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.uploadFiles',
            )}
          </h3>

          {/* Audio File Upload */}
          <div className="space-y-2">
            <label
              htmlFor="audioFileInput"
              className="block text-sm font-medium text-gray-700"
            >
              {t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.audioFile',
              )}
            </label>
            <input
              id="audioFileInput"
              type="file"
              accept="audio/*"
              className="hidden"
              ref={audioInputRef}
              onChange={handleAudioFileChange}
            />
            <div className="flex items-center rounded-lg overflow-hidden border border-gray-300 hover:shadow-sm">
              <button
                type="button"
                onClick={handleAudioFileClick}
                className="flex items-center px-4 py-2 bg-orange-500 text-white font-medium hover:bg-orange-600 focus:bg-orange-600 transition-colors"
              >
                {t(
                  'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.chooseAudioFile',
                )}
              </button>
              <span className="flex-1 px-3 py-2 text-sm text-gray-600 truncate">
                {state.selectedAudioFile?.name ||
                  t(
                    'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.noAudioFileSelected',
                  )}
              </span>
            </div>
            {state.audioError && (
              <p className="text-red-600 text-xs" role="alert">
                {state.audioError}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.audioFileInfo',
              )}
            </p>
          </div>

          {/* PPTX File Upload */}
          <div className="space-y-2">
            <label
              htmlFor="pptxFileInput"
              className="block text-sm font-medium text-gray-700"
            >
              {t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.pptxFile',
              )}
            </label>
            <input
              id="pptxFileInput"
              type="file"
              accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              className="hidden"
              ref={pptxInputRef}
              onChange={handlePptxFileChange}
            />
            <div className="flex items-center rounded-lg overflow-hidden border border-gray-300 hover:shadow-sm">
              <button
                type="button"
                onClick={handlePptxFileClick}
                className="flex items-center px-4 py-2 bg-orange-500 text-white font-medium hover:bg-orange-600 focus:bg-orange-600 transition-colors"
              >
                {t(
                  'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.choosePptxFile',
                )}
              </button>
              <span className="flex-1 px-3 py-2 text-sm text-gray-600 truncate">
                {state.selectedPptxFile?.name ||
                  t(
                    'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.noPptxFileSelected',
                  )}
              </span>
            </div>
            {state.pptxError && (
              <p className="text-red-600 text-xs" role="alert">
                {state.pptxError}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {t(
                'dashboard.adminPanel.translationPanel.translate.selectLanguagesModal.pptxFileInfo',
              )}
            </p>
          </div>
        </div>

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
            disabled={state.selectedLanguages.length === 0 || state.isStarting}
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
