import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Loader, TableBody, TableCell, TableRow } from '@blms/ui';

import { formatDate } from '#src/utils/date.ts';
import { getLanguageName } from '#src/utils/i18n.ts';
import { trpcClient } from '#src/utils/trpc.js';

import { TranslationPanelHeader } from '../-components/translation-panel-header.tsx';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../../../-components/shared-table-header.tsx';

// Import des icônes
import ArrowIcon from '#src/assets/icons/arrow_filled.svg';
import ProfileIcon from '#src/assets/icons/groups.svg';

interface UserDetails {
  uid: string;
  username: string;
  displayName: string | null;
  email: string;
  startDate: string;
  role: string;
  assignments: Assignment[];
  languages: string[];
}

interface Assignment {
  id: string;
  courseId: string;
  language: string;
  assignmentStatus: string;
  translationStatus: string;
  assignedAt: string;
  completedAt: string | null;
  courseIndex: string;
  courseName: string;
  progress: number;
  translationUpdatedAt: string;
}

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/translation-panel/user/$userId',
)({
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userId } = Route.useParams();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trpcClient.content.getUserDetails.query({ userId });
      setUserDetails(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleBackToUserManagement = () => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel',
      search: { tab: 'users' },
    });
  };

  const formatDateForTable = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusTag = (status: string) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';
    let displayText = status;

    switch (status) {
      case 'todo':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        displayText = t(
          'dashboard.adminPanel.translationPanel.userManagement.status.todo',
        );
        break;
      case 'in_progress':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        displayText = t(
          'dashboard.adminPanel.translationPanel.status.inProgress',
        );
        break;
      case 'ready_for_review':
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        displayText = t(
          'dashboard.adminPanel.translationPanel.userManagement.status.readyForReview',
        );
        break;
      case 'under_review':
        bgColor = 'bg-yellow-200';
        textColor = 'text-yellow-900';
        displayText = t(
          'dashboard.adminPanel.translationPanel.userManagement.status.underReview',
        );
        break;
      case 'reviewed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        displayText = t(
          'dashboard.adminPanel.translationPanel.userManagement.status.reviewed',
        );
        break;
      case 'published':
        bgColor = 'bg-green-600';
        textColor = 'text-white';
        displayText = t(
          'dashboard.adminPanel.translationPanel.userManagement.status.published',
        );
        break;
      case 'assigned':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        displayText = t(
          'dashboard.adminPanel.translationPanel.status.assigned',
        );
        break;
      case 'completed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        displayText = t(
          'dashboard.adminPanel.translationPanel.status.completed',
        );
        break;
      case 'rejected':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        displayText = t(
          'dashboard.adminPanel.translationPanel.userManagement.status.rejected',
        );
        break;
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap ${bgColor} ${textColor}`}
        style={
          status === 'under_review'
            ? { backgroundColor: '#fef3c7', color: '#92400e' }
            : {}
        }
      >
        {displayText}
      </span>
    );
  };

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
              <img src={ArrowIcon} alt="Back" className="w-3 h-3 rotate-180" />
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
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-gray-600">
                    <img
                      src={ProfileIcon}
                      alt="Profile icon"
                      className="w-5 h-5"
                    />
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-900">
                      {userDetails.displayName || userDetails.username}
                    </div>
                    {/* Languages under username with orange background */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userDetails.languages.map((language) => (
                        <span
                          key={language}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-500 text-white"
                        >
                          {getLanguageName(language)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Stats with separator */}
              <div className="lg:border-l lg:border-gray-300 lg:pl-6">
                <div className="space-y-3">
                  {/* Start date with calendar icon */}
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 text-gray-600">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-label="Calendar"
                      >
                        <title>Calendar</title>
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <span className="text-base text-gray-900">
                      {formatDate(userDetails.startDate)}
                    </span>
                  </div>

                  {/* Total chapters */}
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 text-gray-600">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-label="Chapters"
                      >
                        <title>Book chapters</title>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
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
                    <div className="w-5 h-5 text-gray-600">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-label="Courses"
                      >
                        <title>Courses</title>
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
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
                            {assignment.courseIndex}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm font-medium text-gray-900 break-words">
                            {assignment.courseName || assignment.courseId}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray-900">
                          {getLanguageName(assignment.language)}
                        </TableCell>
                        <TableCell className="py-4">
                          {getStatusTag(
                            assignment.translationStatus ||
                              assignment.assignmentStatus,
                          )}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Button
                            size="s"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() => {
                              // TODO: Navigate to assignment details
                              console.log(
                                'View details for assignment:',
                                assignment.id,
                              );
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
