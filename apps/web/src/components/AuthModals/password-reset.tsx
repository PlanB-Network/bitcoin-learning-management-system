import { Formik } from 'formik';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  TextInput,
} from '@blms/ui';

import { trpc } from '#src/utils/index.js';

import { AuthModalState } from './props.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

enum ResetPasswordState {
  Initial,
  Sent,
  Error,
}

export const PasswordReset = ({ isOpen, onClose, goTo }: LoginModalProps) => {
  const { t } = useTranslation();

  const [resetPasswordState, setResetPasswordState] =
    useState<ResetPasswordState>(ResetPasswordState.Initial);

  const resetPassword = trpc.user.requestPasswordReset.useMutation({
    onSuccess: () => {
      console.log('Password reset email sent');
      setResetPasswordState(ResetPasswordState.Sent);
    },
    onError: (error) => {
      console.error('Error sending password reset email:', error);
      setResetPasswordState(ResetPasswordState.Error);
    },
  });

  const handlePasswordReset = useCallback(
    ({ email }: { email: string }) => {
      console.log('Reset password for email:', email);

      resetPassword.mutate({ email });
    },
    [resetPassword],
  );

  const modalContent = {
    [ResetPasswordState.Initial]: (
      <>
        <Formik initialValues={{ email: '' }} onSubmit={handlePasswordReset}>
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            touched,
            errors,
          }) => (
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col items-center"
            >
              <TextInput
                name="email"
                labelText={t('auth.emailAddress')}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
                autoComplete="email"
                className="w-4/5"
                error={touched.email ? errors.email : null}
              />

              <Button
                variant="primary"
                type="submit"
                className="mb-5 mt-2"
                disabled={values.email === ''}
              >
                {t('auth.sendLink')}
              </Button>
            </form>
          )}
        </Formik>
        <p className="mb-0 text-xs">
          <button
            className="cursor-pointer border-none bg-transparent text-xs underline"
            onClick={() => goTo(AuthModalState.SignIn)}
          >
            {t('words.back')}
          </button>
        </p>
      </>
    ),
    [ResetPasswordState.Sent]: (
      <div>
        <p className="mb-8">{t('auth.passwordResetSent')}</p>
        <Button variant="primary" onClick={() => goTo(AuthModalState.SignIn)}>
          {t('auth.backToLogin')}
        </Button>
      </div>
    ),
    [ResetPasswordState.Error]: (
      <div>
        <p className="mb-8">{t('auth.passwordResetError')}</p>
        <Button
          variant="primary"
          mode="light"
          onClick={() => setResetPasswordState(ResetPasswordState.Initial)}
        >
          {t('auth.tryAgain')}
        </Button>
      </div>
    ),
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={true}
        className="w-full max-w-[90%] md:max-w-sm px-4 py-2 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle variant="orange">{t('auth.resetPassword')}</DialogTitle>
          <DialogDescription className="hidden">
            {t('auth.resetPassword')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center">
          {modalContent[resetPasswordState]}
        </div>
      </DialogContent>
    </Dialog>
  );
};
