import {
  getStatusBadgeClass,
  getStatusText,
  LANGUAGES_MAP,
} from '@blms/shared/utils';
import { Button } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import CalendarIcon from '#src/assets/translation/calendar.svg';
import ProfileIcon from '#src/assets/translation/contributor.svg';
import TranslateIcon from '#src/assets/translation/translate_black.svg';
import { formatDate } from '#src/utils/date.ts';

interface EnhancedContributorCardProps {
  displayName?: string | null;
  username?: string | null;
  status?: string | null;
  createdAt?: string | null;
  language?: string;
  originalLanguage?: string;
  courseName?: string | null;
  className?: string;
  onCompare?: () => void;
  canCompare?: boolean;
}

export function EnhancedContributorCard({
  displayName,
  username,
  status,
  createdAt,
  language,
  originalLanguage,
  className = '',
  onCompare,
  canCompare = true,
}: EnhancedContributorCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`bg-neutral-50 border border-neutral-100 rounded-lg p-6 ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - User info */}
        <div className="space-y-4">
          {/* Name with profile icon */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <img src={ProfileIcon} alt="Profile" className="w-5 h-5" />
              <span className="text-lg font-medium text-neutral-900">
                {displayName ||
                  username ||
                  t('translate.unknownContributor', {
                    defaultValue: 'Unknown',
                  })}
              </span>
            </div>

            {/* Status */}
            {status && (
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${getStatusBadgeClass(status)}`}
                >
                  {getStatusText(status, t)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center - Course and Language info */}
        <div className="lg:border-l lg:border-neutral-300 lg:pl-6 space-y-3">
          {/* Date with calendar icon */}
          {createdAt && (
            <div className="flex items-center gap-3">
              <img src={CalendarIcon} alt="Calendar" className="w-5 h-5" />
              <span className="text-base text-neutral-900">
                {formatDate(createdAt)}
              </span>
            </div>
          )}

          {/* Language info */}
          <div className="flex items-center gap-3">
            <img src={TranslateIcon} alt="Language" className="w-5 h-5" />
            <div className="text-base text-neutral-900">
              <span>
                {originalLanguage && originalLanguage !== language
                  ? `${LANGUAGES_MAP[originalLanguage] || originalLanguage.toUpperCase()}`
                  : LANGUAGES_MAP[language || ''] ||
                    (language || 'Unknown').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Compare button */}
        <div className="lg:border-l lg:border-neutral-300 lg:pl-6 flex items-center justify-center lg:justify-end">
          {onCompare && (
            <Button
              onClick={canCompare ? onCompare : undefined}
              variant="primary"
              size="s"
              disabled={!canCompare}
              className={`${
                canCompare
                  ? 'text-white border-orange-600 hover:bg-orange-50'
                  : 'text-neutral-500 border-neutral-300 cursor-not-allowed'
              }`}
              title={
                canCompare
                  ? t('translate.compareTooltip', {
                      defaultValue: 'Compare original and proofread versions',
                    })
                  : t('translate.compareDisabledTooltip', {
                      defaultValue: 'Proofread version not available',
                    })
              }
            >
              {t('translate.compare', { defaultValue: 'Compare' })}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
