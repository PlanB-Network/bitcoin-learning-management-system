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
import { PageLayout } from '#src/components/page-layout.tsx';
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
  const { session } = useContext(AppContext);
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

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      navigate({ to: '/' });
    } else if (!canAccess(UserRole.Admin)(session?.user)) {
      navigate({ to: '/my-courses' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  // If we're on a child route, render the child component
  if (isChildRoute) {
    return <Outlet />;
  }

  return (
    <PageLayout layoutSize="wide" title="Translation panel" hideTitle>
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
    </PageLayout>
  );
}
