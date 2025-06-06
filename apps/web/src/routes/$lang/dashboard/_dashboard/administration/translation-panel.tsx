import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Loader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextTag,
} from '@blms/ui';

import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.js';
import { trpcClient } from '#src/utils/trpc.js';

import { AssignmentStatus, UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import { ToggleSwitch } from '#src/components/ui/toggle-switch.tsx';
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

        <TabsContent value="users">
          <div className="p-8 text-center text-gray-500">
            {t(
              'dashboard.adminPanel.translationPanel.comingSoon.userManagement',
            )}
          </div>
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
