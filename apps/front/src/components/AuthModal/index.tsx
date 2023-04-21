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
  const [openedAt, setOpenedAt] = useState<number>();
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
    if (isOpen) setOpenedAt(new Date().getTime());
    else setCurrentState(AuthModalState.Signin);
  }, [isOpen]);

  return (
    <>
      {/* SignIn Dialog */}
      <SignIn
        key={`${openedAt}_signin`}
        isOpen={isOpen && currentState === AuthModalState.Signin}
        onClose={onClose}
        goTo={goTo}
      />

      {/* Signup Dialog */}
      <SignUp
        key={`${openedAt}_signup`}
        isOpen={isOpen && currentState === AuthModalState.Signup}
        onClose={onClose}
        goTo={goTo}
      />

      {/* Password Reset Dialog */}
      <PasswordReset
        key={`${openedAt}_pwd_reset`}
        isOpen={isOpen && currentState === AuthModalState.PasswordReset}
        onClose={onClose}
        goTo={goTo}
      />
    </>
  );
};
