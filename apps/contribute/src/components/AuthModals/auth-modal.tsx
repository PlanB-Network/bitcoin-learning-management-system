import { useEffect, useState } from 'react';

import { PasswordReset } from './password-reset.tsx';
import { AuthModalState } from './props.ts';
import { Register } from './register.tsx';
import { SignIn } from './sign-in.tsx';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState?: AuthModalState;
  redirectTo?: string | null; // Redirect to this URL after successful login/signup
}

export const AuthModal = ({
  isOpen,
  onClose,
  initialState = AuthModalState.SignIn,
  redirectTo = null,
}: LoginModalProps) => {
  const [currentState, setCurrentState] = useState<AuthModalState | null>(
    initialState,
  );

  const goTo = (newState: AuthModalState) => {
    setCurrentState(null);
    setTimeout(() => setCurrentState(newState), 300);
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
        redirectTo={redirectTo}
        goTo={goTo}
      />

      {/* Register Dialog */}
      <Register
        isOpen={isOpen && currentState === AuthModalState.Register}
        onClose={onClose}
        redirectTo={redirectTo}
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
