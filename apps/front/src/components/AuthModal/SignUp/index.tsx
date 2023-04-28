import { Formik, FormikHelpers } from 'formik';
import { isEmpty } from 'lodash';
import PasswordValidator from 'password-validator';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useCallback } from 'react';
import { ZodError, z } from 'zod';

import { trpc } from '@sovereign-academy/api-client';

import { useAppDispatch } from '../../../hooks';
import { userSlice } from '../../../store';
import { ErrorMessage } from '../../ErrorMessage';
import {
  createAccountText,
  dialogContainer,
  dialogContent,
  inputContainer,
  inputStyle,
  signinForm,
  submitButton,
  switchButton,
} from '../index.css';
import { AuthModalState } from '../props';

import { createdAccountContainer, createdAccountIcon } from './index.css';

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
      onClose();
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
    <Dialog
      dismissableMask
      resizable={false}
      draggable={false}
      visible={isOpen}
      onHide={onClose}
      className={dialogContainer}
      header={register.data ? 'Account created' : 'Créer un compte'}
    >
      {register.data ? (
        <div className={createdAccountContainer}>
          <i className={createdAccountIcon} />
          <p>
            Your account has been created, {register.data.user.username}! <br />
            You can now save your progression on the Bitcoin Academy
          </p>
        </div>
      ) : (
        <div className={dialogContent}>
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
                className={signinForm}
              >
                <span className={inputContainer}>
                  <InputText
                    name="username"
                    id="username"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.username}
                    className={inputStyle}
                  />
                  <label htmlFor="username">Username*</label>
                </span>
                {touched.username && <ErrorMessage text={errors.username} />}

                <span className={inputContainer}>
                  <Password
                    name="password"
                    inputId="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    toggleMask
                    feedback={false}
                  />
                  <label htmlFor="password">Password*</label>
                </span>
                {touched.password && <ErrorMessage text={errors.password} />}

                <span className={inputContainer}>
                  <Password
                    name="confirmation"
                    inputId="confirmation"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.confirmation}
                    toggleMask
                    feedback={false}
                  />
                  <label htmlFor="confirmation">Confirmation*</label>
                </span>
                {touched.confirmation && (
                  <ErrorMessage text={errors.confirmation} />
                )}

                <span className={inputContainer}>
                  <InputText
                    name="email"
                    id="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    className={inputStyle}
                  />
                  <label htmlFor="email">Email</label>
                </span>
                {touched.email && <ErrorMessage text={errors.email} />}

                <span className={inputContainer}>
                  <InputText
                    name="contributorId"
                    id="contributorId"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.contributorId}
                    className={inputStyle}
                  />
                  <label htmlFor="contributorId">
                    Identifiant contributeur
                  </label>
                </span>
                {touched.contributorId && (
                  <ErrorMessage text={errors.contributorId} />
                )}

                <Button className={submitButton}>Créer un compte</Button>
              </form>
            )}
          </Formik>
          <p className={createAccountText}>
            Vous avez déjà un compte ?{' '}
            <button
              className={switchButton}
              onClick={() => goTo(AuthModalState.Signin)}
            >
              Connectez vous !
            </button>
          </p>
        </div>
      )}
    </Dialog>
  );
};
