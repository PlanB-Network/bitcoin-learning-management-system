import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared';
import { Button, Loader } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import type { ChangeEvent } from 'react';
import { useContext, useEffect, useState } from 'react';
import { TbLogout } from 'react-icons/tb';
import SignInIconLight from '#src/assets/icons/profile_log_in_light.svg';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl, setProfilePicture } from '#src/services/user.js';
import { logout } from '#src/utils/session-utils.ts';
import { ChangeDisplayNameModal } from '../dashboard/_dashboard/-components/change-display-name-modal.tsx';
import { ChangeEmailModal } from '../dashboard/_dashboard/-components/change-email-modal.tsx';
import { ChangePictureModal } from '../dashboard/_dashboard/-components/change-picture-modal.tsx';

export const Route = createFileRoute('/$lang/account/')({
  component: Account,
});

function Account() {
  const navigate = useNavigate();
  const { user, setUser, session } = useContext(AppContext);

  const [file, setFile] = useState<File | null>(null);
  const pictureUrl = getPictureUrl(user ? user : null);
  const profilePictureDisclosure = useDisclosure();

  // Called when the user selects a profile picture to upload
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setFile(target.files![0]);
    profilePictureDisclosure.open();
    target.value = '';
  };

  // Called when the user has cropped his profile picture
  const onPictureChange = (file: File) => {
    setProfilePicture(file)
      .then((update) => {
        setUser({ ...user, ...update });
      })
      .finally(profilePictureDisclosure.close)
      .catch((error) => console.error('Error:', error));
  };

  const {
    open: openChangeDisplayNameModal,
    isOpen: isChangeDisplayNameModalOpen,
    close: onCloseDisplayNameModal,
  } = useDisclosure();

  const changeEmailModal = useDisclosure();
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      layoutSize="small"
      title={t('account.account')}
      tabs={[
        { id: 'account', label: t('words.account'), href: '/account' },
        ...(user?.professorId && canAccess(UserRole.Professor)(user)
          ? [
              {
                id: 'teacher-profile',
                label: t('account.myTeacherProfile'),
                href: '/account/teacher-profile',
              },
            ]
          : []),
        {
          id: 'settings',
          label: t('words.settings'),
          href: '/account/settings',
        },
        {
          id: 'invoices',
          label: t('words.invoices'),
          href: '/account/invoices',
        },
      ]}
    >
      <div className="flex w-full flex-col text-black">
        <div className="flex flex-col">
          <label htmlFor="usernameId">{t('dashboard.profile.username')}</label>
          <input
            id="usernameId"
            type="text"
            value={user?.username}
            disabled
            className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10"
          />
        </div>
        <div className="mt-6">
          <label htmlFor="displayName">
            {t('dashboard.profile.displayName')}
          </label>
          <div className="flex max-lg:flex-col lg:items-center gap-4">
            <input
              id="displayName"
              type="text"
              value={user?.displayName || ''}
              disabled
              className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10 grow"
            />
            <Button
              variant="outline"
              size="s"
              onClick={openChangeDisplayNameModal}
              className="h-[34px] px-3 w-fit"
            >
              {t('dashboard.profile.edit')}
            </Button>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex flex-col">
            <label htmlFor="emailId">{t('dashboard.profile.email')}</label>

            <div className="flex max-lg:flex-col lg:items-center gap-4">
              <input
                id="emailId"
                type="text"
                value={user?.email ?? ''}
                disabled
                className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10 grow"
              />

              <Button
                variant="outline"
                size="s"
                onClick={changeEmailModal.open}
                className="h-[34px] px-3 w-fit"
              >
                {t('dashboard.profile.edit')}
              </Button>
            </div>
          </div>

          {/* Confirmation message */}
          <div>
            {emailSent && (
              <div className="mt-6 text-green-500">
                {t('dashboard.profile.emailChangeConfirmation')}
              </div>
            )}
            {emailError && (
              <div className="mt-6 text-red-5">
                {t(`dashboard.profile.${emailError}`)}
              </div>
            )}
          </div>
        </div>

        {/* Profile Picture Zone */}
        <div className="mt-6 flex flex-col">
          <label htmlFor="profilePictureFile">
            {t('dashboard.profile.profilePicture')}
          </label>

          <div className="mt-2 max-md:flex-col flex gap-8 lg:items-end">
            <img
              src={pictureUrl ?? SignInIconLight}
              alt="Profile"
              className="rounded-full size-32"
            />

            <div>
              <Button variant="outline" size="m" className="p-0">
                <label
                  htmlFor="profilePictureFile"
                  className="px-2.5 py-1.5 cursor-pointer"
                >
                  {t('dashboard.profile.edit')}
                </label>
              </Button>
              <input
                className="hidden"
                type="file"
                name="file"
                id="profilePictureFile"
                accept="image/*"
                onChange={onFileChange}
              />
            </div>
          </div>
        </div>

        <Button
          variant="newTertiary"
          onClick={async () => {
            await logout();
          }}
          className="flex items-center gap-2 mt-8 md:mt-12 w-full"
        >
          {t('dashboard.logout')}
          <TbLogout size={16} />
        </Button>
      </div>

      <ChangeDisplayNameModal
        isOpen={isChangeDisplayNameModalOpen}
        onClose={() => {
          onCloseDisplayNameModal();
        }}
      />

      <ChangePictureModal
        file={file}
        onChange={onPictureChange}
        onClose={profilePictureDisclosure.close}
        isOpen={profilePictureDisclosure.isOpen}
      />

      <ChangeEmailModal
        isOpen={changeEmailModal.isOpen}
        onClose={changeEmailModal.close}
        onEmailSent={(data) => {
          if (data.success) {
            setEmailSent(true);
          } else {
            setEmailSent(false);
            setEmailError(data.error ?? 'An error occurred');
          }
        }}
        email={user?.email || ''}
      />
    </PageLayout>
  );
}
