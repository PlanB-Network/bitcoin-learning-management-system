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
  const {
    open: openChangePasswordModal,
    isOpen: isChangePasswordModalOpen,
    close: onClose,
  } = useDisclosure();

  const { data: user } = trpc.user.getDetails.useQuery();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="text-lg font-medium">Profile information</div>
        <Tabs defaultValue="info" className="max-w-[600px]">
          <TabsList>
            <TabsTrigger value="info" variant="light">
              My personal information
            </TabsTrigger>
            <TabsTrigger value="security" variant="light">
              Security
            </TabsTrigger>
            <TabsTrigger value="document" variant="light">
              My documents
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <div className="flex w-full flex-col">
              <div className="mt-6 flex flex-col">
                <label htmlFor="usernameId">Username</label>
                <input
                  id="usernameId"
                  type="text"
                  value={user?.username}
                  disabled
                  className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10"
                />
              </div>
              <div className="mt-6 flex flex-col">
                <label htmlFor="displayName">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={user?.displayName || ''}
                  disabled
                  className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10"
                />
              </div>
              <div className="mt-6 flex flex-col">
                <label htmlFor="emailId">Email</label>
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
              <div>Password</div>
              <Button
                variant="newPrimary"
                size="s"
                onClick={openChangePasswordModal}
              >
                Change
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
