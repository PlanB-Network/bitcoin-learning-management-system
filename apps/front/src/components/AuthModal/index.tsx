import { useEffect, useState } from 'react';

import { PasswordReset } from './PasswordReset';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum AuthModalState {
  Signin,
  Signup,
  PasswordReset,
}

export const AuthModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [currentState, setCurrentState] = useState<AuthModalState | null>(
    AuthModalState.Signin
  );

  const goTo = (newState: AuthModalState) => {
    setCurrentState(null);

    setTimeout(() => {
      setCurrentState(newState);
    }, 300);
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentState(AuthModalState.Signin);
    }
  }, [isOpen]);

  return (
    <>
      {/* SignIn Dialog */}
      <SignIn
        isOpen={isOpen && currentState === AuthModalState.Signin}
        onClose={onClose}
        goTo={goTo}
      />

      {/* Signup Dialog */}
      <SignUp
        isOpen={isOpen && currentState === AuthModalState.Signup}
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
