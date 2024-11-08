import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@blms/ui';

import { AppContext } from '#src/providers/context.js';

import { AdminTable } from './-components/admin-table.tsx';

export const Route = createFileRoute('/dashboard/_dashboard/administration')({
  component: DashboardAdministration,
});

function DashboardAdministration() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  } else if (
    session?.user.role !== 'admin' &&
    session?.user.role !== 'superadmin'
  ) {
    navigate({ to: '/dashboard/courses' });
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <div className="text-2xl">{t('dashboard.administration')}</div>
      <Tabs defaultValue="students" className="w-full max-w-[900px]">
        <TabsList>
          <TabsTrigger
            value="students"
            className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
          >
            {t('words.students')}
          </TabsTrigger>
          <TabsTrigger
            value="professors"
            className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
          >
            {t('words.professors')}
          </TabsTrigger>
          <TabsTrigger
            value="admins"
            className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
          >
            {t('words.admins')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <AdminTable userRole="student" />
        </TabsContent>
        <TabsContent value="professors">
          <AdminTable userRole="professor" />
        </TabsContent>
        <TabsContent value="admins">
          <AdminTable userRole="admin" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
