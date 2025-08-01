import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import { Loader, TabsContent } from '@blms/ui';
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { AppContext } from '#src/providers/context.js';
import { ContentManagementTab } from '#src/routes/$lang/dashboard/_dashboard/administration/-components/content-management-tab.tsx';
import { TranslateTab } from '#src/routes/$lang/dashboard/_dashboard/administration/-components/translate-tab.tsx';
import { TranslationPanelHeader } from '#src/routes/$lang/dashboard/_dashboard/administration/translation-panel/-components/translation-panel-header.tsx';
import { ReportsTab } from './-components/reports-tab.tsx';
import { RequestsTab } from './-components/requests-tab.tsx';
import { UserManagementTab } from './-components/user-management-tab.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/translation-panel',
)({
  component: DashboardAdministrationTranslationPanel,
});

function DashboardAdministrationTranslationPanel() {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on a child route (like user details, course details, chapter details, or comparison)
  const isChildRoute =
    location.pathname.includes('/user/') ||
    location.pathname.includes('/course/') ||
    location.pathname.includes('/chapter/') ||
    location.pathname.includes('/compare/') ||
    location.pathname.includes('/compare-png/');

  // Get current tab from URL search params or default to 'requests'
  const currentTab = (location.search as any)?.tab || 'requests';

  // RequestsTab handles its own state and data fetching

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
        <TabsContent value="requests" className="mt-6">
          <RequestsTab />
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
