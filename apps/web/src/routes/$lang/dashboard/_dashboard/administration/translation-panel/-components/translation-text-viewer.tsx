import { useTranslation } from 'react-i18next';
import { TranslationLanguageHeader } from './translation-language-header.tsx';

interface TranslationTextViewerProps {
  originalLanguage: string;
  targetLanguage: string;
  originalContent: string | null;
  /** Optional right component for the header (e.g., compare button) */
  headerRightComponent?: React.ReactNode;
}

export function TranslationTextViewer({
  originalLanguage,
  targetLanguage,
  originalContent,
  headerRightComponent,
}: TranslationTextViewerProps) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        backgroundColor: '#F5F5F5',
        border: '1px solid #D1D5DB',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0px 1px 1px 0px #00000040',
      }}
    >
      {/* Language Header */}
      <TranslationLanguageHeader
        originalLanguage={originalLanguage}
        targetLanguage={targetLanguage}
        rightComponent={headerRightComponent}
      />

      {/* Text Content */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {originalContent ? (
          <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap overflow-y-auto max-h-[400px]">
            {originalContent}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-8">
            {t('translate.noOriginalContent', {
              defaultValue: 'No original content',
            })}
          </div>
        )}
      </div>
    </div>
  );
}
