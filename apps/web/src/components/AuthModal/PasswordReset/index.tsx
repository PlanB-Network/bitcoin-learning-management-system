import { Formik } from 'formik';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@sovereign-university/ui';

import { trpc } from '#src/utils/index.js';

import { Modal } from '../../../atoms/Modal/index.tsx';
import { TextInput } from '../../../atoms/TextInput/index.tsx';
import { AuthModalState } from '../props.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

export const PasswordReset = ({ isOpen, onClose, goTo }: LoginModalProps) => {
  const { t } = useTranslation();

  const resetPassword = trpc.user.requestPasswordReset.useMutation({
    onSuccess: () => {
      console.log('Password reset email sent');
    },
  });

  const handlePasswordReset = useCallback(
    ({ email }: { email: string }) => {
      console.log('Reset password for email:', email);

      resetPassword.mutate({ email });
    },
    [resetPassword],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('auth.passwordReinit')}
    >
      <div className="flex flex-col items-center">
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
                type="submit"
                className="mb-5 mt-10"
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
      </div>
    </Modal>
  );
};
