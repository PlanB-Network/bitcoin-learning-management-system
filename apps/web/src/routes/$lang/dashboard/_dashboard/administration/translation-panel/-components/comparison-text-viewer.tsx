import { useTranslation } from 'react-i18next';
import { getLanguageName } from '#src/utils/i18n.js';

interface ComparisonTextViewerProps {
  language: string;
  content: string | null;
  /** Optional right component for the header (e.g., compare button) */
  headerRightComponent?: React.ReactNode;
}

export function ComparisonTextViewer({
  language,
  content,
  headerRightComponent,
}: ComparisonTextViewerProps) {
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
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-[10px]">
          <span
            className="text-base font-semibold text-gray-900"
            style={{ fontFamily: 'Rubik, sans-serif' }}
          >
            Language :
          </span>
          <span
            className="text-orange-500 text-base"
            style={{ fontFamily: 'Rubik, sans-serif' }}
          >
            {getLanguageName(language)}
          </span>
        </div>
        {headerRightComponent && <div>{headerRightComponent}</div>}
      </div>

      {/* Text Content */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {content ? (
          <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap overflow-y-auto max-h-[400px]">
            {content}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-8">
            {t('translate.noContentAvailable', {
              defaultValue: 'No content available',
            })}
          </div>
        )}
      </div>
    </div>
  );
}
