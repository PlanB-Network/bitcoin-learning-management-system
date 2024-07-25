import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { t } from 'i18next';
import { isEmpty } from 'lodash-es';
import PasswordValidator from 'password-validator';
import { useCallback } from 'react';
import { ZodError, z } from 'zod';

import { Button } from '@blms/ui';

import { Modal } from '#src/atoms/Modal/index.js';
import { TextInput } from '#src/atoms/TextInput/index.js';
import { trpc } from '#src/utils/trpc.js';

const password = new PasswordValidator().is().min(10);

const changePasswordSchema = z
  .object({
    oldPassword: z.string(),
    newPassword: z.string().refine(
      (pwd) => password.validate(pwd),
      (pwd) => {
        const result = password.validate(pwd, { details: true });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        return { message: Array.isArray(result) ? result[0].message : '' };
      },
    ),
    newPasswordConfirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: t('auth.passwordsDontMatch'),
    path: ['newPasswordConfirmation'],
  });

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export const ChangePasswordModal = ({
  isOpen,
  onClose,
}: ChangePasswordModalProps) => {
  const changePassword = trpc.user.changePassword.useMutation({
    onSuccess: onClose,
  });

  const handleChangePassword = useCallback(
    async (
      values: ChangePasswordForm,
      actions: FormikHelpers<ChangePasswordForm>,
    ) => {
      const errors = await actions.validateForm();
      if (!isEmpty(errors)) return;

      changePassword.mutate({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
    },
    [changePassword],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('settings.changePassword')}
    >
      <div className="flex flex-col items-center">
        <Formik
          initialValues={{
            oldPassword: '',
            newPassword: '',
            newPasswordConfirmation: '',
          }}
          validate={(values) => {
            try {
              changePasswordSchema.parse(values);
            } catch (error) {
              if (error instanceof ZodError) {
                return error.flatten().fieldErrors;
              }
            }
          }}
          onSubmit={handleChangePassword}
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
                  name="oldPassword"
                  type="password"
                  labelText="Old password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.oldPassword}
                  className="w-80"
                  error={touched.oldPassword ? errors.oldPassword : null}
                />

                <TextInput
                  name="newPassword"
                  type="password"
                  labelText="New password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.newPassword}
                  className="w-80"
                  error={touched.newPassword ? errors.newPassword : null}
                />

                <TextInput
                  name="newPasswordConfirmation"
                  type="password"
                  labelText="Confirmation"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.newPasswordConfirmation}
                  className="w-80"
                  error={
                    touched.newPasswordConfirmation
                      ? errors.newPasswordConfirmation
                      : null
                  }
                />
              </div>

              {changePassword.error && (
                <p className="mt-2 text-base font-semibold text-red-300">
                  {t(changePassword.error.message)}
                </p>
              )}

              <Button className="mt-6" rounded>
                {t('words.update')}
              </Button>
            </form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};
