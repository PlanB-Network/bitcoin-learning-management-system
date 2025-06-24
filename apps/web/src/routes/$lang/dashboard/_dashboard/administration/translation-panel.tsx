import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Loader,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextTag,
} from '@blms/ui';

import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.js';
import { getLanguageName } from '#src/utils/i18n.ts';
import { trpcClient } from '#src/utils/trpc.js';

import { AssignmentStatus, UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import { ToggleSwitch } from '#src/components/ui/toggle-switch.tsx';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../-components/shared-table-header.tsx';
import { TranslationRequestsTable } from '../-components/translation-requests-table.js';
import { ContentManagementTab } from './-components/content-management-tab.tsx';

// Import filter icon
import FilterIcon from '#src/assets/icons/Filter.svg';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/translation-panel',
)({
  component: DashboardAdministrationTranslationPanel,
});

function DashboardAdministrationTranslationPanel() {
  const isMobile = useSmaller('md');
  const isTablet = useSmaller('lg');
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { session } = useContext(AppContext);

  // Changed to boolean - false = pending, true = rejected
  const [showRejectedRequests, setShowRejectedRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State for pending requests
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoadingPendingRequests, setIsLoadingPendingRequests] =
    useState(true);

  const pendingCount = pendingRequests?.length || 0;

  // Fetch pending requests using trpcClient
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setIsLoadingPendingRequests(true);
        // @ts-ignore - translations router should be available
        const data =
          await trpcClient.content.getTranslationAssignmentRequests.query({
            status: AssignmentStatus.Requested,
          });
        setPendingRequests(data || []);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        setPendingRequests([]);
      } finally {
        setIsLoadingPendingRequests(false);
      }
    };

    fetchPendingRequests();
  }, []);

  useEffect(() => {
    if (!session) {
      navigate({ to: '/' });
    } else if (!canAccess(UserRole.Admin)(session?.user)) {
      navigate({ to: '/dashboard/courses' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Header */}
      <div className="flex max-lg:flex-col lg:items-center gap-2 lg:gap-5">
        <h1 className="display-small-32px">
          {t('dashboard.adminPanel.translationPanel.title')}
        </h1>
        <TextTag
          size={isTablet ? 'verySmall' : 'small'}
          className="uppercase w-fit bg-newOrange-1 text-white"
        >
          {t('dashboard.adminPanel.translationPanel.admin')}
        </TextTag>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="requests" className="w-full">
        <TabsList size={isMobile ? 's' : 'm'} className="w-full justify-start">
          <TabsTrigger value="requests" size={isMobile ? 's' : 'm'}>
            {t('dashboard.adminPanel.translationPanel.tabs.requests')}
          </TabsTrigger>
          <TabsTrigger value="content" size={isMobile ? 's' : 'm'}>
            {t('dashboard.adminPanel.translationPanel.tabs.contentManagement')}
          </TabsTrigger>
          <TabsTrigger value="users" size={isMobile ? 's' : 'm'}>
            {t('dashboard.adminPanel.translationPanel.tabs.userManagement')}
          </TabsTrigger>
          <TabsTrigger value="reports" size={isMobile ? 's' : 'm'}>
            {t('dashboard.adminPanel.translationPanel.tabs.reports')}
          </TabsTrigger>
        </TabsList>

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
      </Tabs>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserManagementData[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      // @ts-ignore - translations router should be available
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

  const formatDate = (dateString: string) => {
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
                    {formatDate(user.startDate)}
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
