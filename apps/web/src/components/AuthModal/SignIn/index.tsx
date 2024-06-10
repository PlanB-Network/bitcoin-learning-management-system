import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { isEmpty } from 'lodash-es';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ZodError, z } from 'zod';

import { Button } from '@sovereign-university/ui';

import { useSmaller } from '#src/hooks/use-smaller.js';

import { Divider } from '../../../atoms/Divider/index.tsx';
import { Modal } from '../../../atoms/Modal/index.tsx';
import { TextInput } from '../../../atoms/TextInput/index.tsx';
import { trpc } from '../../../utils/trpc.ts';
import { AuthModalState } from '../props.ts';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

export const SignIn = ({ isOpen, onClose, goTo }: SignInModalProps) => {
  const { t } = useTranslation();
  const isMobile = useSmaller('md');

  const signInSchema = z.object({
    username: z.string().min(1, t('auth.errors.usernameRequired')),
    password: z.string().min(1, t('auth.passwordRequired')),
  });

  const credentialsLogin = trpc.auth.credentials.login.useMutation({
    onSuccess: () => {
      // TODO log in the user
      onClose();
      window.location.reload();
    },
  });

  const handleLogin = useCallback(
    async (
      values: {
        username: string;
        password: string;
      },
      actions: FormikHelpers<{
        username: string;
        password: string;
      }>,
    ) => {
      const errors = await actions.validateForm();
      if (!isEmpty(errors)) return;
      credentialsLogin.mutate(values);
    },
    [credentialsLogin],
  );

  return (
    <Modal
      closeButtonEnabled={isMobile ? isMobile : false}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('auth.signIn')}
      showAccountHelper={isMobile ? false : true}
    >
      <div className="flex flex-col items-center space-y-8 pb-5">
        <Button
          variant="newSecondary"
          className="mt-2 text-sm md:text-base"
          rounded
          onClick={() => goTo(AuthModalState.LnurlAuth)}
          disabled
        >
          {t('auth.connectWithLn')}
        </Button>
        <Divider>{t('words.or').toUpperCase()}</Divider>
        <Formik
          initialValues={{ username: '', password: '' }}
          onSubmit={handleLogin}
          validate={(values) => {
            try {
              signInSchema.parse(values);
            } catch (error) {
              if (error instanceof ZodError) {
                return error.flatten().fieldErrors;
              }
            }
          }}
        >
          {({
            touched,
            errors,
            handleBlur,
            handleChange,
            values,
            handleSubmit,
          }) => (
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col items-center"
            >
              <div className="flex w-full flex-col items-center">
                <TextInput
                  name="username"
                  labelText="Username"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                  className="w-full min-w-64  md:w-4/5"
                  error={touched.username ? errors.username : null}
                />

                <TextInput
                  name="password"
                  type="password"
                  labelText="Password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  className="w-full text-blue-900 md:w-4/5"
                  error={touched.password ? errors.password : null}
                />
              </div>

              {credentialsLogin.error && (
                <p className="mt-2 text-base font-semibold text-red-300">
                  {credentialsLogin.error.message}
                </p>
              )}

              <Button
                type="submit"
                className="mt-6 text-sm md:text-base"
                rounded
              >
                {t('words.continue')}
              </Button>
            </form>
          )}
        </Formik>
        <p className="mb-0 text-xs">
          {t('auth.noAccountYet')}
          <button
            className="ml-1 cursor-pointer border-none bg-transparent text-xs underline"
            onClick={() => goTo(AuthModalState.Register)}
          >
            {t('auth.createOne')}
          </button>
        </p>
        {/* 
        // Add back when we support emails

        <p className="mb-0 mt-2 text-xs">
          <button
            className="cursor-pointer border-none bg-transparent text-xs underline"
            onClick={() => goTo(AuthModalState.PasswordReset)}
          >
            {t('auth.forgottenPassword')}
          </button>
        </p> 
        
        */}
      </div>
    </Modal>
  );
};
