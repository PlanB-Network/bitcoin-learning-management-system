import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { t } from 'i18next';
import { isEmpty } from 'lodash-es';
import { useCallback } from 'react';
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
          <DialogTitle>{t('settings.changeEmail')}</DialogTitle>
          <DialogDescription className="hidden">
            {t('settings.changeEmail')}
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};
