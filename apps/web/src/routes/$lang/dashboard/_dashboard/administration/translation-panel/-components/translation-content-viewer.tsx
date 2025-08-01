import { useTranslation } from 'react-i18next';
import { AudioPlayer } from './audio-player-advanced.tsx';
import { TranslationLanguageHeader } from './translation-language-header.tsx';

interface TranslationContentViewerProps {
  originalLanguage: string;
  targetLanguage: string;
  originalContent: string | null;
  courseId: string;
  partId: string;
  chapterId: string;
  slideId: string;
  fileName: string;
  /** Optional right component for the header (e.g., compare button) */
  headerRightComponent?: React.ReactNode;
}

export function TranslationContentViewer({
  originalLanguage,
  targetLanguage,
  originalContent,
  courseId,
  partId,
  chapterId,
  slideId,
  fileName,
  headerRightComponent,
}: TranslationContentViewerProps) {
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

      {/* Content Grid - Text left, Audio right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Original Content */}
        <div>
          <div className="bg-white border rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {t('translate.originalContent', {
                defaultValue: 'Original Content',
              })}
            </h4>
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

        {/* Right - Audio Player */}
        <div>
          <AudioPlayer
            courseId={courseId}
            language={targetLanguage}
            partId={partId}
            chapterId={chapterId}
            slideId={slideId}
            fileName={fileName}
          />
        </div>
      </div>
    </div>
  );
}
