import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { isEmpty } from 'lodash-es';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BsLightningChargeFill } from 'react-icons/bs';
import { ZodError, z } from 'zod';

import { Button } from '@blms/ui';

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
      closeButtonEnabled={true}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('menu.login')}
    >
      <div className="flex flex-col items-center w-full px-0.5 sm:px-5">
        <Button
          variant="ghost"
          mode="light"
          size="m"
          onClick={() => goTo(AuthModalState.LnurlAuth)}
          iconRight={<BsLightningChargeFill className="w-6" />}
          disabled
          className="mb-2.5"
        >
          {t('auth.connectWithLn')}
        </Button>
        <Divider>{t('words.or').toLowerCase()}</Divider>
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
              className="flex w-full flex-col items-center mt-3"
            >
              <div className="flex w-full flex-col items-center">
                <TextInput
                  name="username"
                  labelText={t('dashboard.profile.username')}
                  placeholder={t('dashboard.profile.username').toLowerCase()}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                  className="w-full"
                  error={touched.username ? errors.username : null}
                  mandatory
                />

                <TextInput
                  name="password"
                  type="password"
                  labelText={t('dashboard.profile.password')}
                  placeholder={t('dashboard.profile.password').toLowerCase()}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  className="w-full"
                  error={touched.password ? errors.password : null}
                  mandatory
                />
              </div>

              {credentialsLogin.error && (
                <p className="mt-2 text-base font-semibold text-red-300">
                  {credentialsLogin.error.message}
                </p>
              )}
              <Button
                variant="newPrimary"
                size="m"
                type="submit"
                className="my-8"
              >
                {t('menu.login')}
              </Button>
            </form>
          )}
        </Formik>
        <p className="mobile-body2 md:desktop-body1 text-center">
          {t('auth.noAccountYet')}
          <button
            className="ml-1 cursor-pointer underline italic"
            onClick={() => goTo(AuthModalState.Register)}
          >
            {t('auth.createOne')}
          </button>
        </p>

        <p className="mb-0 mt-2 text-xs">
          <button
            className="cursor-pointer border-none bg-transparent text-xs underline"
            onClick={() => goTo(AuthModalState.PasswordReset)}
          >
            {t('auth.forgottenPassword')}
          </button>
        </p>
      </div>
    </Modal>
  );
};
