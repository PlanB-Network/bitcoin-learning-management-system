import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Formik, FormikHelpers } from 'formik';
import { t } from 'i18next';
import { isEmpty } from 'lodash';
import PasswordValidator from 'password-validator';
import { useCallback } from 'react';
import { BsCheck } from 'react-icons/bs';
import { ZodError, z } from 'zod';

import { trpc } from '@sovereign-academy/api-client';

import { Button } from '../../../atoms/Button';
import { Modal } from '../../../atoms/Modal';
import { TextInput } from '../../../atoms/TextInput';
import { useAppDispatch } from '../../../hooks';
import { userSlice } from '../../../store';
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
      .min(6, { message: t('auth.errors.usernameTooShort') }),
    password: z.string().refine(
      (pwd) => password.validate(pwd),
      (pwd) => {
        const result = password.validate(pwd, { details: true });
        return { message: Array.isArray(result) ? result[0].message : '' };
      }
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
          accessToken: data.accessToken,
        })
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
    [register]
  );

  return (
    <Modal
      closeButtonEnabled={isMobile || (register.data && !register.error)}
      isOpen={isOpen}
      onClose={onClose}
      headerText={
        register.data ? t('auth.headerAccountCreated') : t('auth.createAccount')
      }
      showAccountHelper
    >
      {register.data && !register.error ? (
        <div className="mb-8 flex flex-col items-center">
          <BsCheck className="text-success-300 my-8 h-20 w-20 text-lg" />
          <p className="text-center">
            {t('auth.accountCreated', {
              userName: register.data.user.username,
            })}
            <br />
            {t('auth.canSaveProgress')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
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
                  console.log(error.flatten().fieldErrors);
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
                className="flex w-full flex-col items-center py-6"
              >
                <div className="flex w-full flex-col items-center">
                  <TextInput
                    name="username"
                    labelText="Username"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.username}
                    className="w-4/5"
                    error={touched.username ? errors.username : null}
                  />

                  <TextInput
                    name="password"
                    type="password"
                    labelText="Password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    className="w-4/5"
                    error={touched.password ? errors.password : null}
                  />

                  <TextInput
                    name="confirmation"
                    type="password"
                    labelText="Confirmation"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.confirmation}
                    className="w-4/5"
                    error={touched.confirmation ? errors.confirmation : null}
                  />
                </div>

                {register.error && (
                  <p className="text-danger-300 mt-2 text-base font-semibold">
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
