import { TextTag } from '@blms/ui';
import BookIcon from '#src/assets/translation/book_black.svg';
import CalendarIcon from '#src/assets/translation/calendar.svg';
import ProfileIcon from '#src/assets/translation/contributor.svg';
import GridIcon from '#src/assets/translation/grid_view.svg';
import { formatDate } from '#src/utils/date.ts';

interface ContributorInformationCardProps {
  /** Contributor display name (preferred) */
  displayName?: string | null;
  /** Contributor username – used as fallback when displayName is absent */
  username?: string | null;
  /** Languages the contributor works with – iso codes */
  languages: string[];
  /** Helper used to convert a language code to a human-readable name */
  getLanguageName: (code: string) => string;
  /** Date when contributor started working on the project (optional) */
  startDate?: Date | string | null;
  /** Total chapters currently assigned (optional) */
  totalChapters?: number;
  /** Total courses currently assigned (optional) */
  totalCourses?: number;
  /** Extra CSS class names */
  className?: string;
}

/**
 * Reusable information card that displays contributor meta information.
 * Although originally created for the translation admin panel, the component
 * is entirely presentation-only and can safely be reused elsewhere.
 */
export const ContributorInformationCard = ({
  displayName,
  username,
  languages,
  getLanguageName,
  startDate,
  totalChapters,
  totalCourses,
  className = '',
}: ContributorInformationCardProps) => {
  const _displayName = displayName || username || '—';
  const _formattedStartDate = startDate ? formatDate(startDate) : '—';

  return (
    <div
      className={`bg-gray-100 border border-gray-200 rounded-lg p-6 ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left – contributor identity */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <img src={ProfileIcon} alt="Profile" className="w-5 h-5" />
              <span className="text-lg font-medium text-gray-900">
                {_displayName}
              </span>
            </div>

            {/* Languages */}
            {languages.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4 w-full">
                {languages.map((lng) => (
                  <TextTag key={lng} size="verySmall" variant="orange">
                    {getLanguageName(lng)}
                  </TextTag>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right – stats */}
        <div className="lg:border-l lg:border-gray-300 lg:pl-6">
          <div className="space-y-3">
            {/* Start date */}
            <div className="flex items-center gap-3">
              <img src={CalendarIcon} alt="Calendar" className="w-5 h-5" />
              <span className="text-base text-gray-900">
                {_formattedStartDate}
              </span>
            </div>

            {/* Total chapters */}
            {typeof totalChapters === 'number' && (
              <div className="flex items-center gap-3">
                <img src={GridIcon} alt="Chapters" className="w-5 h-5" />
                <span className="text-base text-gray-900">
                  {totalChapters} {/* i18n handled by parent component */}
                </span>
              </div>
            )}

            {/* Total courses */}
            {typeof totalCourses === 'number' && (
              <div className="flex items-center gap-3">
                <img src={BookIcon} alt="Courses" className="w-5 h-5" />
                <span className="text-base text-gray-900">{totalCourses} </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
