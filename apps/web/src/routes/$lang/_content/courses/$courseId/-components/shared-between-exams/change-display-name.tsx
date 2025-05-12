import { Button, Divider } from '@blms/ui';
import { t } from 'i18next';
import { useContext } from 'react';
import { MdOutlineModeEdit } from 'react-icons/md';
import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { AppContext } from '#src/providers/context.tsx';
import { ChangeDisplayNameModal } from '#src/routes/$lang/dashboard/_dashboard/-components/change-display-name-modal.tsx';

export const ChangeDisplayName = () => {
  const { user } = useContext(AppContext);
  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const {
    open: openChangeDisplayNameModal,
    isOpen: isChangeDisplayNameModalOpen,
    close: onCloseDisplayNameModal,
  } = useDisclosure();

  return (
    <div className="flex flex-col w-full max-w-[604px] max-md:gap-4">
      <Divider className="mx-0" width="w-full" mode="dark" />
      <p className="subtitle-medium-med-16px text-newBlack-1 md:mt-4">
        {t('courses.exam.verifyDisplayName')}
      </p>
      <section className="flex flex-col md:mt-5 gap-2">
        <label
          htmlFor="displayName"
          className="flex gap-0.5 text-dashboardSectionText font-medium leading-[120%]"
        >
          {t('dashboard.profile.displayName')}
          <span className="text-red-5">*</span>
        </label>
        <div className="flex max-lg:flex-col lg:items-center gap-4 md:gap-5">
          <span
            id="displayName"
            className="rounded-md bg-commentTextBackground border border-gray-500/10 px-4 py-2 text-newGray-1 text-sm leading-[120%] w-full max-w-[302px] h-8 truncate"
            onClick={!isLoggedIn ? openAuthModal : openChangeDisplayNameModal}
            // biome-ignore lint/a11y/useSemanticElements: <explanation>
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                !isLoggedIn ? openAuthModal() : openChangeDisplayNameModal();
              }
            }}
          >
            {user?.displayName || ''}
          </span>
          <Button
            variant="outline"
            size={window.innerHeight < 768 ? 'xs' : 's'}
            onClick={openChangeDisplayNameModal}
            className="w-fit flex items-center gap-2.5"
          >
            <MdOutlineModeEdit size={18} className="shrink-0" />
            {t('dashboard.profile.change')}
          </Button>
        </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialState={AuthModalState.SignIn}
      />

      <ChangeDisplayNameModal
        isOpen={isChangeDisplayNameModalOpen}
        onClose={() => {
          onCloseDisplayNameModal();
        }}
      />
    </div>
  );
};
