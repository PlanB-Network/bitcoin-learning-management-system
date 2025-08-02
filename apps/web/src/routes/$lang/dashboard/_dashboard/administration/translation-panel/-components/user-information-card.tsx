import type { UserTranslationDetailsServiceResponse } from '@blms/types';
import { TextTag } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import BookIcon from '#src/assets/translation/book_black.svg';
import CalendarIcon from '#src/assets/translation/calendar.svg';
import ProfileIcon from '#src/assets/translation/contributor.svg';
import GridIcon from '#src/assets/translation/grid_view.svg';
import { formatDate } from '#src/utils/date.ts';

interface UserInformationCardProps {
  userDetails: UserTranslationDetailsServiceResponse;
  getLanguageName: (code: string) => string;
}

export function UserInformationCard({
  userDetails,
  getLanguageName,
}: UserInformationCardProps) {
  const { t } = useTranslation();

  const totalChapters = userDetails.assignments.reduce((total) => {
    // Estimate chapters per course (we can make this more accurate later)
    return total + 5; // Assume average 5 chapters per course
  }, 0);

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - User info */}
        <div className="space-y-4">
          {/* Name with profile icon */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <img src={ProfileIcon} alt="Profile" className="w-5 h-5" />
              <span className="text-lg font-medium text-gray-900">
                {userDetails.displayName || userDetails.username}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-4 w-full">
              {userDetails.languages.map((language) => (
                <TextTag key={language} size="verySmall" variant="orange">
                  {getLanguageName(language)}
                </TextTag>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Stats with separator */}
        <div className="lg:border-l lg:border-gray-300 lg:pl-6">
          <div className="space-y-3">
            {/* Start date with calendar icon */}
            <div className="flex items-center gap-3">
              <img src={CalendarIcon} alt="Calendar" className="w-5 h-5" />
              <span className="text-base text-gray-900">
                {formatDate(userDetails.startDate)}
              </span>
            </div>

            {/* Total chapters */}
            <div className="flex items-center gap-3">
              <img src={GridIcon} alt="Chapters" className="w-5 h-5" />
              <span className="text-base text-gray-900">
                {totalChapters}{' '}
                {t(
                  'dashboard.adminPanel.translationPanel.userManagement.chapters',
                )}
              </span>
            </div>

            {/* Courses with book icon */}
            <div className="flex items-center gap-3">
              <img src={BookIcon} alt="Courses" className="w-5 h-5" />
              <span className="text-base text-gray-900">
                {userDetails.assignments.length}{' '}
                {t(
                  'dashboard.adminPanel.translationPanel.userManagement.courses',
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
