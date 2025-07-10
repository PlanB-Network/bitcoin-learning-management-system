import {
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader, TabsContent } from '@blms/ui';

import { AppContext } from '#src/providers/context.js';

import { AssignmentStatus, UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import { SearchBar } from '#src/components/ui/search-bar.tsx';
import { ToggleSwitch } from '#src/components/ui/toggle-switch.tsx';
import { ContentManagementTab } from '#src/routes/$lang/dashboard/_dashboard/administration/-components/content-management-tab.tsx';
import { TranslateTab } from '#src/routes/$lang/dashboard/_dashboard/administration/-components/translate-tab.tsx';
import { TranslationPanelHeader } from '#src/routes/$lang/dashboard/_dashboard/administration/translation-panel/-components/translation-panel-header.tsx';
import { trpcClient } from '#src/utils/trpc.js';
import { ReportsTab } from './-components/reports-tab.tsx';
import { TranslationRequestsTable } from './-components/translation-requests-table.tsx';
import { UserManagementTab } from './-components/user-management-tab.tsx';

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

  // Check if we're on a child route (like user details or course details)
  const isChildRoute =
    location.pathname.includes('/user/') ||
    location.pathname.includes('/course/');

  // Get current tab from URL search params or default to 'requests'
  const currentTab = (location.search as any)?.tab || 'requests';

  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectedRequests, setShowRejectedRequests] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Fetch number of pending requests
  const fetchPendingCount = async () => {
    try {
      const data =
        await trpcClient.user.translation.getTranslationAssignmentRequests.query(
          {
            status: AssignmentStatus.Requested,
          },
        );
      setPendingCount(data?.length ?? 0);
    } catch (err) {
      console.error('[TranslationPanel] Failed fetching pending count', err);
      setPendingCount(0);
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, []);

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
                <span className="inline-flex items-center justify-center bg-maroon-9 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full min-w-[1rem] h-5">
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
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t(
                'dashboard.adminPanel.translationPanel.searchPlaceholder',
              )}
              className="max-w-lg"
            />

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

        <TabsContent value="reports" className="mt-6">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="translate" className="mt-6">
          <TranslateTab />
        </TabsContent>
      </TranslationPanelHeader>
    </div>
  );
}
