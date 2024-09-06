import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { t } from 'i18next';
import { isEmpty } from 'lodash-es';
import PasswordValidator from 'password-validator';
import { useCallback, useEffect } from 'react';
import { BsCheck, BsLightningChargeFill } from 'react-icons/bs';
import { ZodError, z } from 'zod';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Divider,
  TextInput,
} from '@blms/ui';

import { trpc } from '../../utils/trpc.ts';

import { AuthModalState } from './props.ts';

const password = new PasswordValidator().is().min(10);

const registerSchema = z
  .object({
    username: z
      .string({ required_error: t('auth.errors.usernameRequired') })
      .min(5, { message: t('auth.errors.usernameTooShort') })
      .regex(/^[\w.\\-]+$/, {
        message: t('auth.errors.usernameRegex'),
      }),
    password: z.string().refine(
      (pwd) => password.validate(pwd),
      (pwd) => {
        const result = password.validate(pwd, { details: true });
        return { message: Array.isArray(result) ? result[0].message : '' };
      },
    ),
    confirmation: z.string(),
  })
  .refine((data) => data.password === data.confirmation, {
    message: t('auth.passwordsDontMatch'),
    path: ['confirmation'],
  });

interface RegisterProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

type AccountData = z.infer<typeof registerSchema>;

export const Register = ({ isOpen, onClose, goTo }: RegisterProps) => {
  const register = trpc.auth.credentials.register.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        window.location.reload();
        // TODO log in the user
      }, 2000);
    },
  });

  const handleCreateUserAccount = useCallback(
    async (values: AccountData, actions: FormikHelpers<AccountData>) => {
      const errors = await actions.validateForm();
      if (!isEmpty(errors)) return;

      register.mutate({
        password: values.password,
        username: values.username,
      });
    },
    [register],
  );

  useEffect(() => {
    async function initial() {
      if (register.data) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        onClose();
      }
    }

    initial();
  }, [onClose, register.data]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          showCloseButton={true}
          className="gap-3 py-2 px-4 sm:gap-6 sm:p-6 w-full max-w-[90%] md:max-w-sm"
          showAccountHelper={true}
        >
          <DialogHeader>
            <DialogTitle>
              {register.data
                ? t('auth.headerAccountCreated')
                : t('auth.createAccount')}
            </DialogTitle>
          </DialogHeader>

          {register.data && !register.error ? (
            <div className="mb-8 flex flex-col items-center">
              <BsCheck className="my-8 text-black" size={20} />
              <DialogDescription>
                {t('auth.accountCreated', {
                  userName: register.data.user.username,
                })}
                <br />
                {t('auth.canSaveProgress')}
              </DialogDescription>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center w-full px-0.5 sm:px-5">
                <DialogDescription className="hidden">
                  Register
                </DialogDescription>
                <Button
                  variant="outline"
                  size="m"
                  onClick={() => goTo(AuthModalState.LnurlAuth)}
                  disabled
                  className="mb-2.5"
                >
                  {t('auth.connectWithLn')}
                  <span className="ml-3">
                    <BsLightningChargeFill className="w-6" />
                  </span>
                </Button>
                <Divider>{t('words.or').toLowerCase()}</Divider>
                <Formik
                  initialValues={{
                    username: '',
                    password: '',
                    confirmation: '',
                  }}
                  validate={(values) => {
                    try {
                      registerSchema.parse(values);
                      return {};
                    } catch (error) {
                      if (error instanceof ZodError) {
                        return error.flatten().fieldErrors;
                      }
                      return {};
                    }
                  }}
                  onSubmit={handleCreateUserAccount}
                >
                  {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    errors,
                    touched,
                  }) => (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleSubmit();
                      }}
                      className="flex w-full flex-col items-center mt-3"
                    >
                      <div className="flex w-full flex-col items-center">
                        <TextInput
                          name="username"
                          labelText={t('dashboard.profile.username')}
                          placeholder={t(
                            'dashboard.profile.username',
                          ).toLowerCase()}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.username}
                          className="w-full"
                          error={
                            touched.username && errors.username
                              ? errors.username[0]
                              : null
                          }
                          mandatory
                        />
                        <TextInput
                          name="password"
                          type="password"
                          labelText={t('dashboard.profile.password')}
                          placeholder={t(
                            'dashboard.profile.password',
                          ).toLowerCase()}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.password}
                          className="w-full"
                          error={
                            touched.password && errors.password
                              ? errors.password[0]
                              : null
                          }
                          mandatory
                        />
                        <TextInput
                          name="confirmation"
                          type="password"
                          labelText="Confirmation"
                          placeholder={t(
                            'dashboard.profile.password',
                          ).toLowerCase()}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.confirmation}
                          className="w-full"
                          error={
                            touched.confirmation && errors.confirmation
                              ? errors.confirmation[0]
                              : null
                          }
                          mandatory
                        />
                      </div>
                      {register.error && (
                        <p className="mt-2 text-base font-semibold text-red-300">
                          {register.error.message}
                        </p>
                      )}
                      <Button
                        variant="primary"
                        size="m"
                        type="submit"
                        className="my-8"
                      >
                        {t('auth.createAccount')}
                      </Button>
                    </form>
                  )}
                </Formik>
                <p className="mobile-body2 md:desktop-body1 text-center max-md:max-w-[198px] mx-auto">
                  {t('auth.alreadyHaveAccount')}{' '}
                  <button
                    className="cursor-pointer underline italic"
                    onClick={() => goTo(AuthModalState.SignIn)}
                  >
                    {t('menu.login')}
                  </button>
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
