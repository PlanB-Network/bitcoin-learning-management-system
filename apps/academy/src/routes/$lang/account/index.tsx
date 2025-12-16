import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared';
import { Button, cn, Loader } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import type { ChangeEvent } from 'react';
import { useContext, useEffect, useState } from 'react';
import {
  TbAlertCircleFilled,
  TbLogout,
  TbPencil,
  TbPlus,
  TbUserHexagon,
} from 'react-icons/tb';
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
      title={t('account.profile')}
      hideTitle
      tabs={[
        { id: 'account', label: t('account.profile'), href: '/account' },
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
      <div className="flex flex-col w-full justify-center items-center">
        <div className="relative w-fit">
          <img
            src={pictureUrl ?? SignInIconLight}
            alt="Profile"
            className="rounded-full size-30"
          />
          <div className="absolute bottom-0.5 right-0.5">
            <button
              className="p-2 border-3 border-white bg-orange-400 text-white rounded-full size-9 flex items-center justify-center shrink-0"
              type="button"
            >
              <label htmlFor="profilePictureFile" className="cursor-pointer">
                <TbPlus size={16} />
              </label>
            </button>
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
        <span className="title-base md:title-medium text-center mt-2">
          {user?.displayName}
        </span>
        <section className="flex flex-col w-full mt-4 md:mt-12 gap-3">
          <h2 className="flex items-center gap-1 text-neutral-700 body-small-bold">
            <TbUserHexagon size={16} className="text-neutral-400 shrink-0" />
            {t('words.details')}
          </h2>
          <div className="flex flex-col w-full border border-neutral-100 rounded-2xl">
            {/* Display Name */}
            <div className="flex items-center justify-between w-full p-4 border-b border-neutral-100 gap-2">
              <span className="body-base-bold text-neutral-700 shrink-0">
                {t('dashboard.profile.displayName')}
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="body-base text-neutral-700 truncate">
                  {user?.displayName}
                </span>
                <TbPencil
                  size={16}
                  onClick={openChangeDisplayNameModal}
                  className="shrink-0 text-neutral-300 cursor-pointer"
                >
                  {t('dashboard.profile.edit')}
                </TbPencil>
              </div>
            </div>
            {/* Username */}
            <div className="flex items-center justify-between w-full p-4 border-b border-neutral-100 gap-2">
              <span className="body-base-bold text-neutral-700 shrink-0">
                {t('dashboard.profile.username')}
              </span>
              <span className="body-base text-neutral-700 min-w-0 truncate">
                {user?.username}
              </span>
            </div>
            {/* Email */}
            <div className="flex items-center justify-between w-full p-4 gap-2">
              <div className="flex flex-col shrink-0">
                <div className="flex items-center gap-1">
                  {!user?.currentEmailChecked || !user?.email ? (
                    <TbAlertCircleFilled size={24} className="text-yellow-5" />
                  ) : null}
                  <span className="body-base-bold text-neutral-700">
                    {t('dashboard.profile.email')}
                  </span>
                </div>
                {!user?.currentEmailChecked && user?.email ? (
                  <span className="body-small text-yellow-6">
                    {t('dashboard.profile.verifyYourEmail')}
                  </span>
                ) : null}
              </div>
              {user?.email ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      'body-base truncate',
                      user?.currentEmailChecked
                        ? 'text-neutral-700'
                        : 'text-yellow-6',
                    )}
                  >
                    {user?.email}
                  </span>
                  <TbPencil
                    size={16}
                    onClick={changeEmailModal.open}
                    className="shrink-0 text-neutral-300 cursor-pointer"
                  />
                </div>
              ) : (
                <Button size="s" onClick={changeEmailModal.open}>
                  {t('dashboard.profile.addEmail')}
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Confirmation message */}
        <div>
          {emailSent && (
            <div className="mt-3 text-green-500">
              {t('dashboard.profile.emailChangeConfirmation')}
            </div>
          )}
          {emailError && (
            <div className="mt-3 text-red-5">
              {t(`dashboard.profile.${emailError}`)}
            </div>
          )}
        </div>

        <Button
          variant="newTertiary"
          onClick={async () => {
            await logout();
          }}
          className="flex items-center gap-2 mt-12 w-full"
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
