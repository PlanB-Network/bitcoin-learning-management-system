import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { UserTranslationDetailsServiceResponse } from '@blms/types';
import { Button, Loader, TableBody, TableCell, TableRow } from '@blms/ui';

import { formatDate } from '#src/utils/date.ts';
import { trpcClient } from '#src/utils/trpc.js';

import { TranslationPanelHeader } from '../-components/translation-panel-header.tsx';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../../../-components/shared-table-header.tsx';

import { getStatusBadgeClass, getStatusText } from '@blms/shared';
import BookIcon from '#src/assets/translation/book_black.svg';
import CalendarIcon from '#src/assets/translation/calendar.svg';
import ProfileIcon from '#src/assets/translation/contributor.svg';
import GridIcon from '#src/assets/translation/grid_view.svg';
import LeftArrowIcon from '#src/assets/translation/left_arrow.svg';

import { TextTag } from '@blms/ui';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/translation-panel/user/$userId',
)({
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = Route.useParams();

  const [userDetails, setUserDetails] =
    useState<UserTranslationDetailsServiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languages, setLanguages] = useState<
    Array<{ code: string; name: string }>
  >([]);

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trpcClient.user.translation.getUserDetails.query({
        userId,
      });
      setUserDetails(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch languages data
  const fetchLanguages = async () => {
    try {
      const data =
        await trpcClient.user.translation.getAvailableLanguages.query();
      setLanguages(data || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
      setLanguages([]);
    }
  };

  // Function to get language names from the fetched languages data
  const getLanguageNameFromData = (code: string) => {
    return languages.find((lang) => lang.code === code)?.name || code;
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchLanguages();
    }
  }, [userId]);

  const handleBackToUserManagement = () => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel',
      search: { tab: 'users' },
    });
  };

  const getStatusTag = (status: string) => (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${getStatusBadgeClass(
        status,
      )}`}
    >
      {getStatusText(status, t)}
    </span>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error || !userDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('errors.userNotFound')}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'User details could not be loaded'}
          </p>
          <Button onClick={handleBackToUserManagement}>
            {t(
              'dashboard.adminPanel.translationPanel.userManagement.actions.backToList',
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <TranslationPanelHeader activeTab="users" isUserDetailsPage={true}>
        <div className="mt-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={handleBackToUserManagement}
              className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
            >
              <img src={LeftArrowIcon} alt="Back" className="w-3 h-3" />
              {t(
                'dashboard.adminPanel.translationPanel.userManagement.actions.backToUsers',
              )}
            </button>
          </div>

          {/* Contributor Information Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-6">
            {t(
              'dashboard.adminPanel.translationPanel.userManagement.contributorInformation',
            )}
          </h2>

          {/* Contributor Information Card */}
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
                        {getLanguageNameFromData(language)}
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
                    <img
                      src={CalendarIcon}
                      alt="Calendar"
                      className="w-5 h-5"
                    />
                    <span className="text-base text-gray-900">
                      {formatDate(userDetails.startDate)}
                    </span>
                  </div>

                  {/* Total chapters */}
                  <div className="flex items-center gap-3">
                    <img src={GridIcon} alt="Chapters" className="w-5 h-5" />
                    <span className="text-base text-gray-900">
                      {userDetails.assignments.reduce((total) => {
                        // Estimate chapters per course (we can make this more accurate later)
                        return total + 5; // Assume average 5 chapters per course
                      }, 0)}{' '}
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

          {/* Assignments History Table */}
          <div className="bg-white p-6">
            <h2 className="title-large-sb-24px text-dashboardSectionTitle mb-4">
              {t(
                'dashboard.adminPanel.translationPanel.userManagement.modal.assignments',
              )}
            </h2>

            {userDetails.assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t(
                  'dashboard.adminPanel.translationPanel.userManagement.modal.noAssignments',
                )}
              </div>
            ) : (
              <div className="w-full">
                <SharedTable>
                  <SharedTableHeader>
                    <SharedTableHead className="w-24">
                      {t(
                        'dashboard.adminPanel.translationPanel.contentManagement.table.index',
                      )}
                    </SharedTableHead>
                    <SharedTableHead>
                      {t(
                        'dashboard.adminPanel.translationPanel.contentManagement.table.course',
                      )}
                    </SharedTableHead>
                    <SharedTableHead className="w-32">
                      {t(
                        'dashboard.adminPanel.translationPanel.contentManagement.table.language',
                      )}
                    </SharedTableHead>
                    <SharedTableHead className="w-32">
                      {t(
                        'dashboard.adminPanel.translationPanel.contentManagement.table.status',
                      )}
                    </SharedTableHead>
                    <SharedTableHead className="w-32">
                      {t('words.actions')}
                    </SharedTableHead>
                  </SharedTableHeader>
                  <TableBody>
                    {userDetails.assignments.map((assignment) => (
                      <TableRow
                        key={assignment.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <TableCell className="py-4 font-medium text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                            {assignment.index || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm font-medium text-gray-900 break-words">
                            {assignment.courseName || assignment.courseId}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray-900">
                          {getLanguageNameFromData(assignment.language)}
                        </TableCell>
                        <TableCell className="py-4">
                          {getStatusTag(
                            String(
                              assignment.translationStatus ||
                                assignment.assignmentStatus,
                            ),
                          )}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Button
                            size="s"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() => {
                              navigate({
                                to: '/$lang/dashboard/administration/translation-panel/course/$courseId',
                                params: { courseId: assignment.courseId },
                                search: { language: assignment.language },
                              });
                            }}
                          >
                            {t(
                              'dashboard.adminPanel.translationPanel.userManagement.actions.viewDetails',
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </SharedTable>
              </div>
            )}
          </div>
        </div>
      </TranslationPanelHeader>
    </div>
  );
}
