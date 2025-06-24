import {
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Loader,
  TableBody,
  TableCell,
  TableRow,
  TabsContent,
} from '@blms/ui';

import { AppContext } from '#src/providers/context.js';
import { getLanguageName } from '#src/utils/i18n.ts';
import { trpcClient } from '#src/utils/trpc.js';

import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import { ToggleSwitch } from '#src/components/ui/toggle-switch.tsx';
import { ContentManagementTab } from '#src/routes/$lang/dashboard/_dashboard/administration/-components/content-management-tab.tsx';
import { TranslationPanelHeader } from '#src/routes/$lang/dashboard/_dashboard/administration/translation-panel/-components/translation-panel-header.tsx';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../-components/shared-table-header.tsx';
import { TranslationRequestsTable } from '../-components/translation-requests-table.js';

// Import filter icon
import FilterIcon from '#src/assets/icons/Filter.svg';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/translation-panel',
)({
  component: DashboardAdministrationTranslationPanel,
});

function DashboardAdministrationTranslationPanel() {
  const { t } = useTranslation();
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on a child route (like user details)
  const isChildRoute = location.pathname.includes('/user/');

  // Get current tab from URL search params or default to 'requests'
  const currentTab = (location.search as any)?.tab || 'requests';

  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectedRequests, setShowRejectedRequests] = useState(false);

  // For now, we'll set pendingCount to 0 since the endpoint doesn't exist yet
  const pendingCount = 0;

  // Redirect if user doesn't have access
  useEffect(() => {
    if (user && !canAccess(UserRole.Admin)(user)) {
      navigate({ to: '/$lang/dashboard' });
    }
  }, [user, navigate]);

  if (!user || !canAccess(UserRole.Admin)(user)) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  // If we're on a child route, render the child component
  if (isChildRoute) {
    return <Outlet />;
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <TranslationPanelHeader activeTab={currentTab}>
        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6 mt-6">
          <div className="space-y-6">
            {/* Section Header with Badge */}
            <div className="flex items-center gap-3">
              <h2 className="title-large-sb-24px text-dashboardSectionTitle">
                {t(
                  'dashboard.adminPanel.translationPanel.pendingTranslationRequests',
                )}
              </h2>
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center bg-newOrange-1 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full min-w-[1.5rem] h-6">
                  {pendingCount}
                </span>
              )}
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center">
              <ToggleSwitch
                checked={showRejectedRequests}
                onChange={setShowRejectedRequests}
                leftLabel={t(
                  'dashboard.adminPanel.translationPanel.toggle.pendingRequest',
                )}
                rightLabel={t(
                  'dashboard.adminPanel.translationPanel.toggle.rejectedRequests',
                )}
                className="w-fit"
              />
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(
                    'dashboard.adminPanel.translationPanel.searchPlaceholder',
                  )}
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-newOrange-1 focus:border-newOrange-1 outline-none"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                >
                  <img src={FilterIcon} alt="Filter" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Requests Table */}
            <TranslationRequestsTable
              status={showRejectedRequests ? 'rejected' : 'requested'}
              searchQuery={searchQuery}
            />
          </div>
        </TabsContent>

        {/* Content Management Tab */}
        <TabsContent value="content" className="mt-6">
          <ContentManagementTab />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="reports">
          <div className="p-8 text-center text-gray-500">
            {t('dashboard.adminPanel.translationPanel.comingSoon.reports')}
          </div>
        </TabsContent>
      </TranslationPanelHeader>
    </div>
  );
}

// User Management Tab Component
interface UserManagementData {
  uid: string;
  username: string;
  displayName: string | null;
  email: string;
  startDate: string;
  assignedCourses: number;
  languages: string[] | null;
}

const UserManagementTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserManagementData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await trpcClient.content.getAdminUserManagement.query();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!users || !searchQuery.trim()) {
      return users || [];
    }

    const query = searchQuery.toLowerCase().trim();
    return users.filter((user: UserManagementData) => {
      const languages = user.languages || [];
      const languageNames = languages
        .map((lang) => getLanguageName(lang).toLowerCase())
        .join(' ');

      return (
        user.username.toLowerCase().includes(query) ||
        user.displayName?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        languages.some((lang) => lang.toLowerCase().includes(query)) ||
        languageNames.includes(query)
      );
    });
  }, [users, searchQuery]);

  const formatDateForTable = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatLanguages = (languages: string[] | null) => {
    if (!languages || languages.length === 0) {
      return t('words.none');
    }

    return languages.map((lang) => getLanguageName(lang)).join(', ');
  };

  const handleViewDetails = (userId: string) => {
    navigate({
      to: '/$lang/dashboard/administration/translation-panel/user/$userId',
      params: { userId },
    });
  };

  if (usersLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <h2 className="title-large-sb-24px text-dashboardSectionTitle">
          {t('dashboard.adminPanel.translationPanel.userManagement.title')}
        </h2>

        <p className="text-gray-600">
          {t(
            'dashboard.adminPanel.translationPanel.userManagement.description',
          )}
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'dashboard.adminPanel.translationPanel.searchPlaceholder',
              )}
              className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-newOrange-1 focus:border-newOrange-1 outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
            >
              <img
                src={FilterIcon}
                alt={t('words.filter')}
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="w-full">
        <SharedTable>
          <SharedTableHeader>
            <SharedTableHead className="w-32">
              {t(
                'dashboard.adminPanel.translationPanel.userManagement.table.startDate',
              )}
            </SharedTableHead>
            <SharedTableHead className="w-48">
              {t(
                'dashboard.adminPanel.translationPanel.userManagement.table.username',
              )}
            </SharedTableHead>
            <SharedTableHead className="w-28 text-center">
              {t(
                'dashboard.adminPanel.translationPanel.userManagement.table.assignedCourses',
              )}
            </SharedTableHead>
            <SharedTableHead className="w-56">
              {t(
                'dashboard.adminPanel.translationPanel.userManagement.table.language',
              )}
            </SharedTableHead>
            <SharedTableHead className="w-36">
              {t(
                'dashboard.adminPanel.translationPanel.userManagement.table.actions',
              )}
            </SharedTableHead>
          </SharedTableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {searchQuery.trim()
                    ? t('dashboard.adminPanel.translationPanel.noResultsFound')
                    : t(
                        'dashboard.adminPanel.translationPanel.userManagement.noUsers',
                      )}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.uid} className="hover:bg-gray-50">
                  <TableCell className="py-4">
                    {formatDateForTable(user.startDate)}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-medium">{user.username}</span>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span className="text-sm font-medium">
                      {user.assignedCourses}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm text-gray-700">
                      {formatLanguages(user.languages)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <Button
                      size="s"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => handleViewDetails(user.uid)}
                    >
                      {t(
                        'dashboard.adminPanel.translationPanel.userManagement.actions.viewDetails',
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </SharedTable>
      </div>
    </div>
  );
};
