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

const password = new PasswordValidator();

password
  .is()
  .min(10)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(2)
  .has()
  .symbols()
  .has()
  .not()
  .spaces();

const signupSchema = z
  .object({
    username: z
      .string({ required_error: t('auth.usernameRequired') })
      .min(6, t('auth.usernameRules')),
    password: z.string().refine(
      (pwd) => password.validate(pwd),
      (pwd) => {
        const result = password.validate(pwd, { details: true });
        return { message: Array.isArray(result) ? result[0].message : '' };
      }
    ),
    confirmation: z.string(),
    email: z.string().email().optional(),
    contributor_id: z.string().optional(),
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

interface AccountData {
  username: string;
  password: string;
  confirmation: string;
  email?: string;
  contributorId?: string;
}

export const SignUp = ({ isOpen, onClose, goTo }: LoginModalProps) => {
  const dispatch = useAppDispatch();

  const register = trpc.auth.credentials.register.useMutation({
    onSuccess: (data) => {
      dispatch(
        userSlice.actions.login({
          username: data.user.username,
          accessToken: data.accessToken,
        })
      );
    },
  });

  const handleCreateUserAccount = useCallback(
    async (values: AccountData, actions: FormikHelpers<AccountData>) => {
      const errors = await actions.validateForm();
      if (!isEmpty(errors)) return;

      await register.mutate({
        email: values.email,
        password: values.password,
        username: values.username,
        contributor_id: values.contributorId,
      });
    },
    [register]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerText={
        register.data ? t('auth.headerAccountCreated') : t('auth.createAccount')
      }
    >
      {register.data ? (
        <div className="flex flex-col items-center">
          <BsCheck className="text-success-300 my-8 h-20 w-20 text-lg" />
          <p className="text-center">
            {t('auth.accountCreated', register.data.user.username)} <br />
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
                signupSchema.parse(values);
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
                <TextInput
                  name="username"
                  labelText="Username*"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                  className="mt-4 w-96"
                  error={touched.username ? errors.username : null}
                />

                <TextInput
                  name="password"
                  type="password"
                  labelText="Password*"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  className="mt-4 w-96"
                  error={touched.password ? errors.password : null}
                />

                <TextInput
                  name="confirmation"
                  type="password"
                  labelText="Confirmation*"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.confirmation}
                  className="mt-4 w-96"
                  error={touched.confirmation ? errors.confirmation : null}
                />

                <TextInput
                  name="email"
                  labelText={t('words.email')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  className="mt-4 w-96"
                  error={touched.email ? errors.email : null}
                />

                <TextInput
                  name="contributorId"
                  labelText={t('auth.contributorId')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.contributorId}
                  className="mt-4 w-96"
                  error={touched.contributorId ? errors.contributorId : null}
                />

                <Button className="mb-5 mt-10">
                  {t('auth.createAccount')}
                </Button>
              </form>
            )}
          </Formik>
          <p className="mb-0 text-xs">
            {t('auth.alreadyAnAccount')}{' '}
            <button
              className="cursor-pointer border-none bg-transparent text-xs underline"
              onClick={() => goTo(AuthModalState.Signin)}
            >
              {t('auth.getConnected')}
            </button>
          </p>
        </div>
      )}
    </Modal>
  );
};
