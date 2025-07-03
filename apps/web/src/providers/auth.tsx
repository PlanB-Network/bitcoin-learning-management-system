import type { PropsWithChildren } from 'react';
import { createContext, useContext, useState } from 'react';

import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';

interface AuthModalContextType {
  isAuthModalOpen: boolean;
  authMode: AuthModalState;
  openAuthModal: (mode: AuthModalState) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType>({
  authMode: AuthModalState.SignIn,
  closeAuthModal: () => {},
  isAuthModalOpen: false,
  openAuthModal: () => {},
});

export const AuthModalProvider = ({ children }: PropsWithChildren) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthModalState>(
    AuthModalState.SignIn,
  );

  const openAuthModal = (mode: AuthModalState) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthModalContext.Provider
      value={{ authMode, closeAuthModal, isAuthModalOpen, openAuthModal }}
    >
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialState={authMode}
        />
      )}
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
