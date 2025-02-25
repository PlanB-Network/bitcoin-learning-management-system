import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
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

import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import { RoleAllocationTable } from '../-components/role-allocation-table.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/role',
)({
  component: DashboardAdministrationRole,
});

function DashboardAdministrationRole() {
  const isMobile = useSmaller('md');
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { session } = useContext(AppContext);

  const isTablet = useSmaller('lg');

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
    <div className="flex flex-col gap-4 lg:gap-8">
      <div className="flex max-lg:flex-col lg:items-center gap-2 lg:gap-5">
        <h1 className="display-small-32px">
          {t('dashboard.adminPanel.userRolesAllocation')}
        </h1>
        <TextTag
          size={isTablet ? 'verySmall' : 'small'}
          className="uppercase w-fit"
        >
          {t('words.admin')}
        </TextTag>
      </div>

      <Tabs defaultValue="students" className="w-full max-w-[900px]">
        <TabsList size={isMobile ? 's' : 'm'}>
          <TabsTrigger value="students" size={isMobile ? 's' : 'm'}>
            {t('words.students')}
          </TabsTrigger>
          <TabsTrigger value="professors" size={isMobile ? 's' : 'm'}>
            {t('words.professors')}
          </TabsTrigger>
          <TabsTrigger value="admins" size={isMobile ? 's' : 'm'}>
            {t('words.admins')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <RoleAllocationTable userRole={UserRole.Student} />
        </TabsContent>
        <TabsContent value="professors">
          <RoleAllocationTable userRole={UserRole.Professor} />
        </TabsContent>
        <TabsContent value="admins">
          <RoleAllocationTable userRole={UserRole.Admin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
