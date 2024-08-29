import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { isEmpty } from 'lodash-es';
import PasswordValidator from 'password-validator';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ZodError, z } from 'zod';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  TextInput,
} from '@blms/ui';

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
    message: 'auth.passwordsDontMatch',
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
  const { t } = useTranslation();
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

  const validate = (values: ChangePasswordForm) => {
    try {
      changePasswordSchema.parse(values);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors;
        if (errors.newPassword) {
          errors.newPassword = errors.newPassword.map((msg) => t(msg));
        }
        if (errors.newPasswordConfirmation) {
          errors.newPasswordConfirmation = [t('auth.passwordsDontMatch')];
        }
        return errors;
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <button className="hidden" />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        showAccountHelper={false}
        className="px-4 py-2 sm:p-6 sm:gap-6 gap-3"
      >
        <DialogHeader>
          <DialogTitle>{t('settings.changePassword')}</DialogTitle>
          <DialogDescription className="hidden">
            {t('settings.changePassword')}
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{
            oldPassword: '',
            newPassword: '',
            newPasswordConfirmation: '',
          }}
          validate={validate}
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

                {changePassword.error && (
                  <p className="mt-2 text-base font-semibold text-red-300">
                    {t(changePassword.error.message)}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="tertiary"
                  className="mt-6"
                  rounded
                >
                  {t('words.update')}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};
