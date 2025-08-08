import { TranslationStatus } from '@blms/constants';
import type React from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  OnlyOfficeSlideEditor,
  type OnlyOfficeSlideEditorRef,
} from '#src/components/translation/onlyoffice-slide-editor.tsx';
import { ValidationCheckbox } from '#src/components/ui/validation-checkbox.tsx';
import { getLanguageName } from '#src/utils/i18n.ts';
import { trpcClient } from '#src/utils/trpc.ts';

interface ValidatedPptEditorProps {
  courseId: string;
  chapterId: string;
  slideId: string;
  partId: string;
  fileName: string;
  language: string;
  validated: boolean;
  onValidationChange: (validated: boolean) => void;
  fileUrl: string;
  mode?: 'edit' | 'view';
  showLanguageHeader?: boolean;
  languageLabel?: string;
  className?: string;
  showValidationCheckbox?: boolean;
  // PptLinkSection integration
  usePptLinkSection?: boolean;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  // Custom header content
  headerContent?: React.ReactNode;
  // Custom validation handler (for cases where parent wants to handle validation)
  onValidate?: () => void;
  // Loading state change callback
  onLoadingStateChange?: (loading: boolean) => void;
}

export function ValidatedPptEditor({
  courseId,
  chapterId,
  slideId,
  partId,
  fileName,
  language,
  validated,
  onValidationChange,
  fileUrl,
  mode = 'edit',
  showLanguageHeader = true,
  languageLabel,
  className = '',
  showValidationCheckbox = true,
  usePptLinkSection: _usePptLinkSection = false,
  leftComponent,
  rightComponent,
  headerContent,
  onValidate,
  onLoadingStateChange,
}: ValidatedPptEditorProps) {
  const { t } = useTranslation();
  const onlyOfficeEditorRef = useRef<OnlyOfficeSlideEditorRef>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidatePresentation = async () => {
    // If custom validation handler is provided, use that instead
    if (onValidate) {
      onValidate();
      return;
    }

    console.log('Validate presentation clicked');
    setIsValidating(true);
    onLoadingStateChange?.(true);

    try {
      console.log('Starting presentation validation process...');

      // First, save the current document using OnlyOffice and wait for S3 upload
      if (onlyOfficeEditorRef.current && mode === 'edit') {
        console.log('Triggering OnlyOffice save and waiting for S3 upload...');
        try {
          await onlyOfficeEditorRef.current.saveDocument();
          console.log('OnlyOffice save and S3 upload completed');
        } catch (error) {
          console.error('OnlyOffice save/S3 upload failed:', error);
          setIsValidating(false);
          onLoadingStateChange?.(false);
          throw error;
        }
      } else {
        console.warn('OnlyOffice editor ref not available or in view mode');
      }

      // Then update the validation state in the database
      console.log('Updating database validation state...');
      await trpcClient.content.updateCourseTranslationSlide.mutate({
        courseId,
        language,
        chapterId,
        slideId,
        pptValidated: true,
        status: TranslationStatus.UnderReview,
      } as any);

      // Update local state
      onValidationChange(true);
      console.log('Presentation validation completed successfully');
    } catch (error) {
      console.error('Error validating presentation:', error);
    } finally {
      setIsValidating(false);
      onLoadingStateChange?.(false);
    }
  };

  // Handle document modification (auto-uncheck validation)
  const handleDocumentModified = async () => {
    console.log('Document modified - unchecking validation');

    try {
      // Update database to mark as unvalidated
      // Explicitly maintain under_review status while contributor is working
      await trpcClient.content.updateCourseTranslationSlide.mutate({
        courseId,
        language,
        chapterId,
        slideId,
        pptValidated: false,
        status: TranslationStatus.UnderReview,
      } as any);

      // Update local state
      onValidationChange(false);
    } catch (error) {
      console.error('Error updating validation state:', error);
    }
  };

  const displayLanguageLabel = languageLabel || getLanguageName(language);

  return (
    <div
      className={`${className}`}
      style={{
        backgroundColor: '#F5F5F5',
        border: '1px solid #D1D5DB',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0px 1px 1px 0px #00000040',
      }}
    >
      {/* Language info header or custom header */}
      {(showLanguageHeader || headerContent) && (
        <div
          className={`mb-5 ${headerContent ? '' : 'flex items-center justify-between'}`}
        >
          {headerContent ? (
            headerContent
          ) : (
            <div className="flex items-center gap-[10px]">
              <span
                className="text-[18px] font-semibold text-gray-900"
                style={{ fontFamily: 'Rubik, sans-serif' }}
              >
                {t('translate.language', { defaultValue: 'Language' })}
              </span>
              <span
                className="text-orange-500 text-[18px]"
                style={{ fontFamily: 'Rubik, sans-serif' }}
              >
                {displayLanguageLabel}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <OnlyOfficeSlideEditor
          key={`${courseId}-${chapterId}-${slideId}-${language}`}
          ref={onlyOfficeEditorRef}
          fileUrl={fileUrl}
          className="w-full"
          onDocumentModified={
            mode === 'edit' ? handleDocumentModified : undefined
          }
          courseId={courseId}
          partId={partId}
          chapterId={chapterId}
          slideId={slideId}
          fileName={fileName}
          language={language}
          mode={mode}
        />
      </div>

      {/* Validate Presentation */}
      {showValidationCheckbox && (
        <div
          className={`mt-4 flex flex-col sm:flex-row items-center gap-3 ${leftComponent ? 'sm:justify-between justify-center' : 'justify-center sm:justify-end'}`}
        >
          {leftComponent && (
            <div className="w-full sm:w-auto flex justify-center sm:justify-start">
              {leftComponent}
            </div>
          )}
          <div className="flex items-center gap-3">
            <ValidationCheckbox
              checked={validated}
              onToggle={handleValidatePresentation}
              label={t('translate.validatePresentation', {
                defaultValue: 'Validate presentation PPT',
              })}
              loading={isValidating}
              disabled={isValidating}
            />
            {rightComponent}
          </div>
        </div>
      )}
    </div>
  );
}
