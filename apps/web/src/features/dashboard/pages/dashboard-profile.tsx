import { useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';

import { Button } from '@sovereign-university/ui';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../atoms/Tabs/index.tsx';
import { useDisclosure } from '../../../hooks/index.ts';
import { trpc } from '../../../utils/index.ts';
import { ChangePasswordModal } from '../components/change-password-modal.tsx';
import { DashboardLayout } from '../layout.tsx';

export const DashboardProfile = () => {
  const navigate = useNavigate();
  const { data: session } = trpc.user.getSession.useQuery();

  if (!session) {
    navigate({ to: '/' });
  }

  const {
    open: openChangePasswordModal,
    isOpen: isChangePasswordModalOpen,
    close: onClose,
  } = useDisclosure();

  const { data: user } = trpc.user.getDetails.useQuery();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="text-lg font-medium">
          {t('dashboard.profile.profileInformation')}
        </div>
        <Tabs defaultValue="info" className="max-w-[600px]">
          <TabsList>
            <TabsTrigger
              value="info"
              className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
            >
              {t('dashboard.profile.personalInformation')}
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
            >
              {t('dashboard.profile.security')}
            </TabsTrigger>
            <TabsTrigger
              value="document"
              className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
            >
              {t('dashboard.profile.documents')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <div className="flex w-full flex-col">
              <div className="mt-6 flex flex-col">
                <label htmlFor="usernameId">
                  {t('dashboard.profile.username')}
                </label>
                <input
                  id="usernameId"
                  type="text"
                  value={user?.username}
                  disabled
                  className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10"
                />
              </div>

              <div className="mt-6 flex flex-col">
                <label htmlFor="displayName">
                  {t('dashboard.profile.displayName')}
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={user?.displayName || ''}
                  disabled
                  className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10"
                />
              </div>
              <div className="mt-6 flex flex-col">
                <label htmlFor="emailId">{t('dashboard.profile.email')}</label>
                <input
                  id="emailId"
                  type="text"
                  value={user?.email ? user?.email : ''}
                  disabled
                  className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="mt-6 flex justify-between">
              <div>{t('dashboard.profile.password')}</div>
              <Button
                variant="newPrimary"
                size="s"
                onClick={openChangePasswordModal}
              >
                {t('dashboard.profile.change')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="document"></TabsContent>
        </Tabs>

        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={onClose}
        />
      </div>
    </DashboardLayout>
  );
};
