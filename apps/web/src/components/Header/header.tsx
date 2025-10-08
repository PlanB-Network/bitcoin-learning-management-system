import { cn } from '@blms/ui';
import { useState } from 'react';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { AuthModal } from '../AuthModals/auth-modal.tsx';
import { AuthModalState } from '../AuthModals/props.ts';
import { FlyingMenu } from './FlyingMenu/flying-menu.tsx';
import { MobileMenu } from './MobileMenu/mobile-menu.tsx';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const Header = ({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) => {
  const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu } =
    useDisclosure();

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
        'pt-if-pear fixed left-1/2 top-0 z-40 flex w-full max-w-[1920px] -translate-x-1/2 flex-row justify-between py-3 px-4 bg-header',
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
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <MobileMenu
        onClickLogin={() => {
          setAuthMode(AuthModalState.SignIn);
          openAuthModal();
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialState={authMode}
          redirectTo={'/dashboard/my-courses'}
        />
      )}
    </header>
  );
};
