import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { t } from 'i18next';
import { isEmpty } from 'lodash-es';
import { useCallback } from 'react';
import { ZodError, z } from 'zod';

import { Button } from '@sovereign-university/ui';

import { Modal } from '../../../atoms/Modal/index.tsx';
import { TextInput } from '../../../atoms/TextInput/index.tsx';
import { trpc } from '../../../utils/index.ts';

const changeEmailSchema = z.object({
  email: z.string(),
});

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onEmailSent: () => void;
}

type ChangeEmailForm = z.infer<typeof changeEmailSchema>;

export const ChangeEmailModal = ({
  isOpen,
  onClose,
  email,
  onEmailSent,
}: ChangePasswordModalProps) => {
  const changeEmail = trpc.user.changeEmail.useMutation({
    onSuccess: () => {
      onClose();
      onEmailSent();
    },
  });

  const handleChangeEmail = useCallback(
    async (form: ChangeEmailForm, actions: FormikHelpers<ChangeEmailForm>) => {
      const errors = await actions.validateForm();
      if (!isEmpty(errors)) return;

      changeEmail.mutate(form);
    },
    [changeEmail],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('settings.changeEmail')}
    >
      <div className="flex flex-col items-center">
        <Formik
          initialValues={{ email }}
          validate={(values) => {
            try {
              changeEmailSchema.parse(values);
            } catch (error) {
              if (error instanceof ZodError) {
                return error.flatten().fieldErrors;
              }
            }
          }}
          onSubmit={handleChangeEmail}
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
              className="flex w-full flex-col"
            >
              <div className="pb-8">
                <div className="flex w-full flex-col">
                  <TextInput
                    name="email"
                    type="email"
                    autoComplete="email"
                    labelText="Email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    className="w-80"
                    error={touched.email ? errors.email : null}
                  />
                </div>

                {changeEmail.error && (
                  <p className="mt-2 text-base font-semibold text-red-300">
                    {t(changeEmail.error.message)}
                  </p>
                )}
              </div>

              <div className="p-4 flex gap-4 justify-between">
                <Button variant="newPrimary" size="m" type="submit">
                  {t('dashboard.profile.save')}
                </Button>
                <Button
                  variant="secondary"
                  size="m"
                  type="reset"
                  onClick={onClose}
                >
                  {t('dashboard.profile.cancel')}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};
