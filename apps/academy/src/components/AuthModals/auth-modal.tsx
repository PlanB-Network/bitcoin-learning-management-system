import { BasicModal, SegmentedControl, SegmentedControlItem } from '@blms/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { PasswordReset } from './password-reset.tsx';
import { AuthModalState } from './props.ts';
import { Register } from './register.tsx';
import { SignIn } from './sign-in.tsx';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState?: AuthModalState;
  redirectTo?: string; // Redirect to this URL after successful login/signup
}

export const AuthModal = ({
  isOpen,
  onClose,
  initialState = AuthModalState.SignIn,
  redirectTo,
}: LoginModalProps) => {
  const isMobile = useSmaller('md') || window.innerWidth < 768;
  const { t } = useTranslation();
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
      {isOpen &&
        (currentState === AuthModalState.SignIn ||
          currentState === AuthModalState.Register) && (
          <BasicModal
            trigger={<button type="button" className="hidden" />}
            title={t('menu.getStarted')}
            open={isOpen}
            onOpenChange={onClose}
            showPill
          >
            <div className="flex flex-col w-full gap-4">
              <SegmentedControl
                variant="outline"
                value={
                  currentState === AuthModalState.Register
                    ? 'register'
                    : 'signin'
                }
                onValueChange={(v) =>
                  setCurrentState(
                    v === 'register'
                      ? AuthModalState.Register
                      : AuthModalState.SignIn,
                  )
                }
                className="w-full"
                size={isMobile ? 'sm' : 'default'}
              >
                <SegmentedControlItem
                  value="register"
                  size={isMobile ? 'sm' : 'default'}
                >
                  {t('auth.signUp')}
                </SegmentedControlItem>

                <SegmentedControlItem
                  value="signin"
                  size={isMobile ? 'sm' : 'default'}
                >
                  {t('menu.login')}
                </SegmentedControlItem>
              </SegmentedControl>

              {currentState === AuthModalState.SignIn && (
                <SignIn onClose={onClose} redirectTo={redirectTo} goTo={goTo} />
              )}

              {currentState === AuthModalState.Register && (
                <Register redirectTo={redirectTo} />
              )}
            </div>
          </BasicModal>
        )}

      <PasswordReset
        isOpen={isOpen && currentState === AuthModalState.PasswordReset}
        onClose={onClose}
        goTo={goTo}
      />
    </>
  );
};
