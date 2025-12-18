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
import { useCallback, useEffect, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import InformationIcon from '#src/assets/icons/warning_orange.svg';
import { trpc } from '#src/utils/trpc.js';

const addEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type AddEmailForm = z.infer<typeof addEmailSchema>;

interface AddEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const AddEmailModal = ({
  isOpen,
  onClose,
  email,
}: AddEmailModalProps) => {
  const { t } = useTranslation();

  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email },
    resolver: zodResolver(addEmailSchema),
  });

  useEffect(() => {
    if (isOpen) {
      setEmailSent(false);
      setEmailError(null);
      form.reset({ email });
    }
  }, [isOpen, email, form.reset]);

  const changeEmail = useMutation(
    trpc.user.changeEmail.mutationOptions({
      onError: (error) => {
        console.error('Error adding email:', error.message);
        setEmailError(error.message);
      },
      onSuccess: (data) => {
        if ('success' in data && data.success) {
          setEmailSent(true);
          setEmailError(null);
        } else if ('error' in data) {
          setEmailError(data.error);
        }
      },
    }),
  );

  const onSubmit: SubmitHandler<AddEmailForm> = useCallback(
    async (values) => {
      setEmailError(null);
      await changeEmail.mutateAsync(values);
    },
    [changeEmail],
  );

  return (
    <BasicModal
      trigger={<button type="button" className="hidden" />}
      title={
        !emailSent ? t('settings.addEmailContinue') : t('settings.verifyEmail')
      }
      iconSrc={emailSent ? InformationIcon : undefined}
      open={isOpen}
      onOpenChange={onClose}
      showPill
    >
      {!emailSent ? (
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
                  aria-invalid={fieldState.invalid}
                  error={fieldState.error?.message || null}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            variant="primary"
            size="m"
            type="submit"
            className="w-full"
            disabled={changeEmail.isPending}
          >
            {t('settings.addEmail')}
          </Button>

          {emailError && (
            <FieldError
              errors={[{ message: t(`dashboard.profile.${emailError}`) }]}
            />
          )}
        </form>
      ) : (
        <div className="flex w-full flex-col items-center gap-2">
          <p className="title-large text-black text-center">
            {t('settings.emailSentTitle')}
          </p>
          <p className="label text-black text-center">
            {t('settings.emailSentDescription')}
          </p>
        </div>
      )}
    </BasicModal>
  );
};
