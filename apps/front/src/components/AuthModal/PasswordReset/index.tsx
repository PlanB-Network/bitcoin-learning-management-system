import { Formik, FormikHelpers } from 'formik';
import { useCallback } from 'react';

import { Button } from '../../../atoms/Button';
import { Modal } from '../../../atoms/Modal';
import { TextInput } from '../../../atoms/TextInput';
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerText="Réinitilisation de mot de passe"
    >
      <div className="flex flex-col items-center">
        <Formik initialValues={{ email: '' }} onSubmit={handlePasswordReset}>
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            touched,
            errors,
          }) => (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center w-full"
            >
              <TextInput
                name="email"
                labelText="Addresse email"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
                className="mt-8 w-96"
                error={touched.email ? errors.email : null}
              />

              <Button type="submit" className="mt-10 mb-5">
                Envoyer un lien
              </Button>
            </form>
          )}
        </Formik>
        <p className="mb-0 text-xs">
          <button
            className="text-xs underline bg-transparent border-none cursor-pointer"
            onClick={() => goTo(AuthModalState.Signin)}
          >
            Retour
          </button>
        </p>
      </div>
    </Modal>
  );
};
