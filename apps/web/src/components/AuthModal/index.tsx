import { useEffect, useState } from 'react';

import { PasswordReset } from './PasswordReset';
import { AuthModalState } from './props';
import { Register } from './Register';
import { SignIn } from './SignIn';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState?: AuthModalState;
}

export const AuthModal = ({
  isOpen,
  onClose,
  initialState = AuthModalState.SignIn,
}: LoginModalProps) => {
  const [currentState, setCurrentState] = useState<AuthModalState | null>(
    initialState,
  );

  const goTo = (newState: AuthModalState) => {
    setCurrentState(null);

    setTimeout(() => {
      setCurrentState(newState);
    }, 300);
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentState(AuthModalState.SignIn);
    }
  }, [isOpen]);

  return (
    <>
      {/* SignIn Dialog */}
      <SignIn
        isOpen={isOpen && currentState === AuthModalState.SignIn}
        onClose={onClose}
        goTo={goTo}
      />

      {/* Register Dialog */}
      <Register
        isOpen={isOpen && currentState === AuthModalState.Register}
        onClose={onClose}
        goTo={goTo}
      />

      {/* Password Reset Dialog */}
      <PasswordReset
        isOpen={isOpen && currentState === AuthModalState.PasswordReset}
        onClose={onClose}
        goTo={goTo}
      />
    </>
  );
};
