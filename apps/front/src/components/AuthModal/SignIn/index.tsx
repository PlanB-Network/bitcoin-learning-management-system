import { Formik, FormikHelpers } from 'formik';
import { isEmpty } from 'lodash';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useCallback, useEffect } from 'react';
import { ZodError, z } from 'zod';

import { trpc } from '@sovereign-academy/api-client';

import { ErrorMessage } from '../../ErrorMessage';
import {
  createAccountText,
  dialogContainer,
  dialogContent,
  inputContainer,
  inputStyle,
  loginWithLNButton,
  signinForm,
  submitButton,
  switchButton,
} from '../index.css';
import { AuthModalState } from '../props';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

const signinSchema = z.object({
  username: z.string().min(1, 'username is required'),
  password: z.string().min(1, 'password is required'),
});

export const SignIn = ({ isOpen, onClose, goTo }: SignInModalProps) => {
  const login = trpc.auth.credentials.login.useMutation();
  const handleLogin = useCallback(
    async (
      values: {
        username: string;
        password: string;
      },
      actions: FormikHelpers<{
        username: string;
        password: string;
      }>
    ) => {
      const errors = await actions.validateForm();
      if (!isEmpty(errors)) return;
      await login.mutate(values);
    },
    [login]
  );

  useEffect(() => {
    if (login.data?.isLoggedIn) {
      onClose();
    }
  }, [login, login.data?.isLoggedIn, onClose]);

  return (
    <Dialog
      dismissableMask
      resizable={false}
      draggable={false}
      visible={isOpen}
      onHide={onClose}
      className={dialogContainer}
      header="Se connecter"
    >
      <div className={dialogContent}>
        <Button className={loginWithLNButton} rounded>
          Connect with LN
        </Button>
        <Divider layout="horizontal" className="p-divider-center">
          OR
        </Divider>
        <Formik
          initialValues={{ username: '', password: '' }}
          onSubmit={handleLogin}
          validate={(values) => {
            try {
              signinSchema.parse(values);
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
            <form onSubmit={handleSubmit} className={signinForm}>
              <span className={inputContainer}>
                <InputText
                  name="username"
                  id="username"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                  className={inputStyle}
                />
                <label htmlFor="password">Username</label>
              </span>
              {touched.username && <ErrorMessage text={errors.username} />}

              <span className={inputContainer}>
                <Password
                  name="password"
                  inputId="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  feedback={false}
                  toggleMask
                />
                <label htmlFor="password">Password</label>
              </span>
              {touched.password && <ErrorMessage text={errors.password} />}

              <Button type="submit" className={submitButton}>
                Se connecter
              </Button>
            </form>
          )}
        </Formik>
        <p className={createAccountText}>
          Vous n'avez pas encore de compte ?
          <button
            className={switchButton}
            onClick={() => goTo(AuthModalState.Signup)}
          >
            Créez-en un !
          </button>
        </p>
        <p className={createAccountText}>
          <button
            className={switchButton}
            onClick={() => goTo(AuthModalState.PasswordReset)}
          >
            Mot de passe oublié ?
          </button>
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: 0,
          background: 'var(--surface-0)',
          width: '100%',
          padding: '15px 30px',
          borderRadius: '4px',
          fontSize: 12,
        }}
      >
        Le savais tu ? Pas besoin de compte pour commencer à apprendre sur
        l'Académie Bitcoin!
      </div>
    </Dialog>
  );
};
