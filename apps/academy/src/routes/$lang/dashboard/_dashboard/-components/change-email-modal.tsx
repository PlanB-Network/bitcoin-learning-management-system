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
import { useCallback } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { trpc } from '#src/utils/trpc.js';

const changeEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ChangeEmailForm = z.infer<typeof changeEmailSchema>;

interface EmailSentReturn {
  success?: boolean;
  error?: string;
}

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onEmailSent: (data: EmailSentReturn) => void;
}

export const ChangeEmailModal = ({
  isOpen,
  onClose,
  email,
  onEmailSent,
}: ChangeEmailModalProps) => {
  const { t } = useTranslation();
  const changeEmail = useMutation(
    trpc.user.changeEmail.mutationOptions({
      onError: (error) => {
        console.error('Error changing email:', error.message);
      },
      onSuccess: (data) => {
        onClose();
        onEmailSent(data);
      },
    }),
  );

  const form = useForm({
    defaultValues: { email },
    resolver: zodResolver(changeEmailSchema),
  });

  const onSubmit: SubmitHandler<ChangeEmailForm> = useCallback(
    async (values) => {
      await changeEmail.mutateAsync(values);
    },
    [changeEmail],
  );

  return (
    <BasicModal
      trigger={<button type="button" className="hidden" />}
      title={t('settings.changeEmail')}
      open={isOpen}
      onOpenChange={onClose}
    >
      <form
        className="flex w-full flex-col items-center gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t('words.email')}</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="email"
                aria-invalid={fieldState.invalid}
                error={fieldState.error?.message || null}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex gap-4 justify-between items-center w-full">
          <Button
            variant="secondary"
            className="w-full"
            size="l"
            type="button"
            onClick={onClose}
          >
            {t('dashboard.profile.cancel')}
          </Button>

          <Button variant="primary" className="w-full" size="l" type="submit">
            {t('dashboard.profile.save')}
          </Button>
        </div>
      </form>
    </BasicModal>
  );
};
