import { Formik, FormikHelpers } from 'formik';
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
      .string({ required_error: 'username is required' })
      .min(6, 'username must contain at least 6 characters'),
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
    message: "Passwords don't match",
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
      headerText={register.data ? 'Account created' : 'Créer un compte'}
    >
      {register.data ? (
        <div className="flex flex-col items-center">
          <BsCheck className="my-8 w-20 h-20 text-lg text-success-300" />
          <p className="text-center">
            Your account has been created, {register.data.user.username}! <br />
            You can now save your progression on the Bitcoin Academy
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
                className="flex flex-col items-center w-full"
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
                  labelText="Email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  className="mt-4 w-96"
                  error={touched.email ? errors.email : null}
                />

                <TextInput
                  name="contributorId"
                  labelText="Identifiant contributeur"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.contributorId}
                  className="mt-4 w-96"
                  error={touched.contributorId ? errors.contributorId : null}
                />

                <Button className="mt-10 mb-5">Créer un compte</Button>
              </form>
            )}
          </Formik>
          <p className="mb-0 text-xs">
            Vous avez déjà un compte ?{' '}
            <button
              className="text-xs underline bg-transparent border-none cursor-pointer"
              onClick={() => goTo(AuthModalState.Signin)}
            >
              Connectez vous !
            </button>
          </p>
        </div>
      )}
    </Modal>
  );
};
