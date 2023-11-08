import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Formik, FormikHelpers } from 'formik';
import { t } from 'i18next';
import { isEmpty } from 'lodash-es';
import PasswordValidator from 'password-validator';
import { useCallback, useEffect } from 'react';
import { BsCheck } from 'react-icons/bs';
import { ZodError, z } from 'zod';

import { Button } from '../../../atoms/Button';
import { Divider } from '../../../atoms/Divider';
import { Modal } from '../../../atoms/Modal';
import { TextInput } from '../../../atoms/TextInput';
import { useAppDispatch } from '../../../hooks/use-app-dispatch';
import { userSlice } from '../../../store';
import { trpc } from '../../../utils/trpc';
import { AuthModalState } from '../props';

const { useSmaller } = BreakPointHooks(breakpointsTailwind);

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
      .regex(/^[a-zA-Z0-9_\\.-]+$/, {
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

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

type AccountData = z.infer<typeof registerSchema>;

export const Register = ({ isOpen, onClose, goTo }: LoginModalProps) => {
  const dispatch = useAppDispatch();
  const isMobile = useSmaller('md');

  const register = trpc.auth.credentials.register.useMutation({
    onSuccess: (data) => {
      dispatch(
        userSlice.actions.login({
          uid: data.user.uid,
        }),
      );
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
        await new Promise((f) => setTimeout(f, 2000));
        onClose();
      }
    }

    initial();
  }, [onClose, register.data]);

  return (
    <Modal
      closeButtonEnabled={isMobile || (register.data && !register.error)}
      isOpen={isOpen}
      onClose={onClose}
      headerText={
        register.data ? t('auth.headerAccountCreated') : t('auth.createAccount')
      }
      showAccountHelper={isMobile ? false : true}
    >
      {register.data && !register.error ? (
        <div className="mb-8 flex flex-col items-center">
          <BsCheck className="my-8 h-20 w-20 text-lg text-green-300" />
          <p className="text-center">
            {t('auth.accountCreated', {
              userName: register.data.user.username,
            })}
            <br />
            {t('auth.canSaveProgress')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          <Button
            className="mt-2 text-sm md:text-base"
            rounded
            onClick={() => goTo(AuthModalState.LnurlAuth)}
          >
            {t('auth.connectWithLn')}
          </Button>
          <Divider>{t('words.or').toUpperCase()}</Divider>
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
                className="flex w-full flex-col items-center"
              >
                <div className="flex w-full flex-col items-center">
                  <TextInput
                    name="username"
                    labelText="Username"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.username}
                    className="w-full min-w-[16rem] md:w-4/5"
                    error={
                      touched.username && errors.username
                        ? errors.username[0]
                        : null
                    }
                  />

                  <TextInput
                    name="password"
                    type="password"
                    labelText="Password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    className="w-full md:w-4/5"
                    error={
                      touched.password && errors.password
                        ? errors.password[0]
                        : null
                    }
                  />

                  <TextInput
                    name="confirmation"
                    type="password"
                    labelText="Confirmation"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.confirmation}
                    className="w-full md:w-4/5"
                    error={
                      touched.confirmation && errors.confirmation
                        ? errors.confirmation[0]
                        : null
                    }
                  />
                </div>

                {register.error && (
                  <p className="mt-2 text-base font-semibold text-red-300">
                    {register.error.message}
                  </p>
                )}

                <Button type="submit" className="mt-6" rounded>
                  {t('auth.createAccount')}
                </Button>
              </form>
            )}
          </Formik>
          <p className="mb-0 text-xs">
            {t('auth.alreadyHaveAccount')}{' '}
            <button
              className="cursor-pointer border-none bg-transparent text-xs underline"
              onClick={() => goTo(AuthModalState.SignIn)}
            >
              {t('words.signIn')}
            </button>
          </p>
        </div>
      )}
    </Modal>
  );
};
