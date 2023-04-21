import { Formik, FormikHelpers } from 'formik';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useCallback } from 'react';

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

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

export const PasswordReset = ({ isOpen, onClose, goTo }: LoginModalProps) => {
  const handlePasswordReset = useCallback(
    (
      values: {
        email: string;
      },
      actions: FormikHelpers<{
        email: string;
      }>
    ) => {
      console.log(values);
    },
    []
  );

  return (
    <Dialog
      dismissableMask
      resizable={false}
      draggable={false}
      visible={isOpen}
      onHide={onClose}
      className={dialogContainer}
      header="Réinitilisation de mot de passe"
    >
      <div className={dialogContent}>
        <Formik initialValues={{ email: '' }} onSubmit={handlePasswordReset}>
          {(props) => (
            <form onSubmit={props.handleSubmit} className={signinForm}>
              <span className={inputContainer}>
                <InputText
                  required
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
  );
};
