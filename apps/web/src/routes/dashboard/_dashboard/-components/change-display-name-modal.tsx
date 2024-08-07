import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { t } from 'i18next';
import { isEmpty } from 'lodash-es';
import { useCallback, useContext } from 'react';
import { ZodError, z } from 'zod';

import { Button, TextInput } from '@blms/ui';

import { Modal } from '#src/atoms/Modal/index.js';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

const changeDisplayNameSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: t('auth.errors.displayNameTooShort') })
    .regex(/^[\w .\\-]+$/, {
      message: t('auth.errors.displayNameRegex'),
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('settings.changeDisplayName')}
    >
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
                return error.flatten().fieldErrors;
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
