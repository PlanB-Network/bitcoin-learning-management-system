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
              className="flex w-full flex-col items-center"
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

              <Button type="submit" className="mb-5 mt-10">
                Envoyer un lien
              </Button>
            </form>
          )}
        </Formik>
        <p className="mb-0 text-xs">
          <button
            className="cursor-pointer border-none bg-transparent text-xs underline"
            onClick={() => goTo(AuthModalState.Signin)}
          >
            Retour
          </button>
        </p>
      </div>
    </Modal>
  );
};
