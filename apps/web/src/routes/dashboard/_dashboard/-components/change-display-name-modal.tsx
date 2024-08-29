import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { isEmpty } from 'lodash-es';
import { useCallback, useContext } from 'react';
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

import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

const changeDisplayNameSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: 'auth.errors.displayNameTooShort' })
    .regex(/^[\w .\\-]+$/, {
      message: 'auth.errors.displayNameRegex',
    }),
});

interface ChangeDisplayNameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChangeDisplayNameForm = z.infer<typeof changeDisplayNameSchema>;

export const ChangeDisplayNameModal = ({
  isOpen,
  onClose,
}: ChangeDisplayNameModalProps) => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AppContext);

  const changeDisplayName = trpc.user.changeDisplayName.useMutation({
    onSuccess: onClose,
  });

  const handleChangeDisplayName = useCallback(
    async (
      values: ChangeDisplayNameForm,
      actions: FormikHelpers<ChangeDisplayNameForm>,
    ) => {
      const errors = await actions.validateForm();
      if (!isEmpty(errors)) return;

      changeDisplayName.mutate({
        displayName: values.displayName,
      });
      if (user) {
        setUser({ ...user, displayName: values.displayName });
      }
    },
    [changeDisplayName, setUser, user],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <button className="hidden" />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="px-4 py-2 sm:p-6 sm:gap-6 gap-3"
      >
        <DialogHeader>
          <DialogTitle>{t('settings.changeDisplayName')}</DialogTitle>
          <DialogDescription className="hidden">
            {t('settings.changeDisplayName')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center">
          <Formik
            initialValues={{
              displayName: '',
            }}
            validate={(values) => {
              try {
                changeDisplayNameSchema.parse(values);
              } catch (error) {
                if (error instanceof ZodError) {
                  const errors = error.flatten().fieldErrors;
                  return {
                    displayName: errors.displayName
                      ?.map((msg) => t(msg))
                      .join(', '),
                  };
                }
              }
            }}
            onSubmit={handleChangeDisplayName}
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
                    name="displayName"
                    type="text"
                    labelText="Display Name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.displayName}
                    className="w-80"
                    error={touched.displayName ? errors.displayName : null}
                  />
                </div>

                {changeDisplayName.error && (
                  <p className="mt-2 text-base font-semibold text-red-300">
                    {t(changeDisplayName.error.message)}
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
              </form>
            )}
          </Formik>
        </div>
      </DialogContent>
    </Dialog>
  );
};
