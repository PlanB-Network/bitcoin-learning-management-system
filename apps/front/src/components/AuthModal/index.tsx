import { Formik } from 'formik';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useState } from 'react';

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
} from './index.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum AuthModalState {
  Signin,
  Signup,
  PasswordReset,
}

export const AuthModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [currentState, setCurrentState] = useState<AuthModalState | null>(
    AuthModalState.Signin
  );

  const goTo = (newState: AuthModalState) => {
    setCurrentState(null);

    setTimeout(() => {
      setCurrentState(newState);
    }, 300);
  };

  return (
    <>
      {/* SignIn Dialog */}
      <Dialog
        resizable={false}
        draggable={false}
        visible={isOpen && currentState === AuthModalState.Signin}
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
            onSubmit={(values, actions) => {
              setTimeout(() => {
                alert(JSON.stringify(values, null, 2));

                actions.setSubmitting(false);
              }, 1000);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit} className={signinForm}>
                <span className={inputContainer}>
                  <InputText
                    name="username"
                    id="username"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.username}
                    className={inputStyle}
                  />
                  <label htmlFor="password">Username</label>
                </span>

                <span className={inputContainer}>
                  <Password
                    name="password"
                    inputId="password"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.password}
                    feedback={false}
                    toggleMask
                  />
                  <label htmlFor="password">Password</label>
                </span>

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

      {/* Signup Dialog */}
      <Dialog
        resizable={false}
        draggable={false}
        visible={isOpen && currentState === AuthModalState.Signup}
        onHide={onClose}
        className={dialogContainer}
        header="Créer un compte"
      >
        <div className={dialogContent}>
          <Formik
            initialValues={{ username: '', password: '', confirmation: '' }}
            onSubmit={(values, actions) => {
              setTimeout(() => {
                alert(JSON.stringify(values, null, 2));

                actions.setSubmitting(false);
              }, 1000);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit} className={signinForm}>
                <span className={inputContainer}>
                  <InputText
                    required
                    name="username"
                    id="username"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.username}
                    className={inputStyle}
                  />
                  <label htmlFor="username">Username</label>
                </span>

                <span className={inputContainer}>
                  <Password
                    required
                    name="password"
                    inputId="password"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.password}
                    toggleMask
                  />
                  <label htmlFor="password">Password</label>
                </span>

                <span className={inputContainer}>
                  <Password
                    required
                    name="confirmation"
                    inputId="confirmation"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.confirmation}
                    toggleMask
                    feedback={false}
                  />
                  <label htmlFor="confirmation">Confirmation</label>
                </span>

                <Button type="submit" className={submitButton}>
                  Créer un compte
                </Button>
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
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog
        resizable={false}
        draggable={false}
        visible={isOpen && currentState === AuthModalState.PasswordReset}
        onHide={onClose}
        className={dialogContainer}
        header="Réinitilisation de mot de passe"
      >
        <div className={dialogContent}>
          <Formik
            initialValues={{ email: '' }}
            onSubmit={(values, actions) => {
              setTimeout(() => {
                alert(JSON.stringify(values, null, 2));

                actions.setSubmitting(false);
              }, 1000);
            }}
          >
            {(props) => (
              <form onSubmit={props.handleSubmit} className={signinForm}>
                <span className={inputContainer}>
                  <InputText
                    name="email"
                    id="email"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.email}
                    className={inputStyle}
                  />
                  <label htmlFor="password">Addresse email</label>
                </span>

                <Button type="submit" className={submitButton}>
                  Envoyer un lien
                </Button>
              </form>
            )}
          </Formik>
          <p className={createAccountText}>
            <button
              className={switchButton}
              onClick={() => goTo(AuthModalState.Signin)}
            >
              Retour
            </button>
          </p>
        </div>
      </Dialog>
    </>
  );
};
