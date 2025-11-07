import {
  BasicModal,
  Button,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from '@blms/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

interface ChangeDisplayNameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeDisplayNameModal = ({
  isOpen,
  onClose,
}: ChangeDisplayNameModalProps) => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AppContext);

  const displayNameTooShortMsg = t('auth.errors.displayNameTooShort');

  const changeDisplayNameSchema = z.object({
    displayName: z.string().min(2, { message: displayNameTooShortMsg }),
  });

  type ChangeDisplayNameForm = z.infer<typeof changeDisplayNameSchema>;

  const changeDisplayName = useMutation(
    trpc.user.changeDisplayName.mutationOptions({
      onSuccess: onClose,
    }),
  );

  const form = useForm({
    defaultValues: {
      displayName: '',
    },
    resolver: zodResolver(changeDisplayNameSchema),
  });

  const onSubmit: SubmitHandler<ChangeDisplayNameForm> = async (values) => {
    await changeDisplayName.mutateAsync({
      displayName: values.displayName,
    });
    if (user) {
      setUser({ ...user, displayName: values.displayName });
    }
  };

  return (
    <BasicModal
      trigger={<button type="button" className="hidden" />}
      title={t('settings.changeDisplayName')}
      open={isOpen}
      onOpenChange={onClose}
    >
      <form
        className="flex w-full flex-col items-center"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Controller
          control={form.control}
          name="displayName"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-col justify-between text-center"
            >
              <FieldLabel htmlFor={field.name}>
                {t('auth.displayName')}
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="text"
                aria-invalid={fieldState.invalid}
                error={fieldState.error?.message || null}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" variant="primary" mode="light" className="mt-6">
          {t('words.update')}
        </Button>
      </form>
    </BasicModal>
  );
};
