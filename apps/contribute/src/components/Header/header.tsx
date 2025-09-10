import { cn } from '@blms/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { AuthModal } from '../AuthModals/auth-modal.tsx';
import { AuthModalState } from '../AuthModals/props.ts';
import { FlyingMenu } from './flying-menu.tsx';
import { MobileMenu } from './mobile-menu.tsx';

interface HeaderProps {
  variant?: 'light' | 'dark';
  notificationPanelVariant?: 'light' | 'dark';
}

export const Header = ({
  variant = 'dark',
  notificationPanelVariant = 'dark',
}: HeaderProps) => {
  const { i18n } = useTranslation();

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  // Todo change this when better auth flow is implemented (this is awful)
  const [authMode, setAuthMode] = useState<AuthModalState>(
    AuthModalState.SignIn,
  );

  return (
    <header
      className={cn(
        'pt-if-pear sticky left-0 top-0 z-40 flex w-full flex-row justify-between py-[11px] px-4 lg:min-h-[96px] lg:px-12 lg:py-3',
        variant === 'light' ? 'bg-darkOrange-5' : 'bg-headerDark',
      )}
    >
      <FlyingMenu
        onClickLogin={() => {
          setAuthMode(AuthModalState.SignIn);
          openAuthModal();
        }}
        onClickRegister={() => {
          setAuthMode(AuthModalState.Register);
          openAuthModal();
        }}
        variant={variant}
        notificationPanelVariant={notificationPanelVariant}
      />
      <MobileMenu
        onClickLogin={() => {
          setAuthMode(AuthModalState.SignIn);
          openAuthModal();
        }}
      />
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialState={authMode}
          redirectTo={`/${i18n.language}`}
        />
      )}
    </header>
  );
};
