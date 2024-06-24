import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { t } from 'i18next';
import { isEmpty } from 'lodash-es';
import PasswordValidator from 'password-validator';
import { useCallback, useEffect } from 'react';
import { BsCheck, BsLightningChargeFill } from 'react-icons/bs';
import { ZodError, z } from 'zod';

import { Button } from '@sovereign-university/ui';

import { Divider } from '../../../atoms/Divider/index.tsx';
import { Modal } from '../../../atoms/Modal/index.tsx';
import { TextInput } from '../../../atoms/TextInput/index.tsx';
import { trpc } from '../../../utils/trpc.ts';
import { AuthModalState } from '../props.ts';

const password = new PasswordValidator().is().min(10);
// I am not a big fan of conditions in password validation, that lowers the entropy
// in some way.
/* .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(2)
  .has()
  .symbols()
  .has()
  .not()
  .spaces(); */

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        return { message: Array.isArray(result) ? result[0].message : '' };
      },
    ),
    confirmation: z.string(),
  })
  .refine((data) => data.password === data.confirmation, {
    message: t('auth.passwordsDontMatch'),
    path: ['confirmation'],
  });

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

type AccountData = z.infer<typeof registerSchema>;

export const Register = ({ isOpen, onClose, goTo }: LoginModalProps) => {
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
    <Modal
      closeButtonEnabled={true}
      isOpen={isOpen}
      onClose={onClose}
      headerText={
        register.data ? t('auth.headerAccountCreated') : t('auth.createAccount')
      }
      showAccountHelper={true}
    >
      {register.data && !register.error ? (
        <div className="mb-8 flex flex-col items-center">
          <BsCheck className="my-8 size-20 text-black" />
          <p className="text-center">
            {t('auth.accountCreated', {
              userName: register.data.user.username,
            })}
            <br />
            {t('auth.canSaveProgress')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
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
            initialValues={{
              username: '',
              password: '',
              confirmation: '',
            }}
            validate={(values) => {
              try {
                registerSchema.parse(values);
              } catch (error) {
                if (error instanceof ZodError) {
                  return error.flatten().fieldErrors;
                }
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
                    placeholder={t('dashboard.profile.username').toLowerCase()}
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
                    labelText="Password"
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
                  variant="newPrimary"
                  size="m"
                  type="submit"
                  className="my-8"
                >
                  {t('auth.createAccount')}
                </Button>
              </form>
            )}
          </Formik>
          <p className="desktop-body1 text-center">
            {t('auth.alreadyHaveAccount')}{' '}
            <button
              className="cursor-pointer underline italic"
              onClick={() => goTo(AuthModalState.SignIn)}
            >
              {t('menu.login')}
            </button>
          </p>
        </div>
      )}
    </Modal>
  );
};
