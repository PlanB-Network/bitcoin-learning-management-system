import {
  BasicModal,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from '@blms/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import EmailIcon from '#src/assets/icons/pixelated/email.svg?react';
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

  const changeEmail = useMutation(
    trpc.user.changeEmail.mutationOptions({
      onError: (error) => {
        console.error('Error adding email:', error.message);
        setEmailError(error.message);
      },
      onSuccess: (data) => {
        if (
          ('success' in data && data.success) ||
          ('error' in data && data.error === 'emailChangeRateLimitError')
        ) {
          setEmailSent(true);
          setEmailError(null);
        } else if ('error' in data) {
          setEmailError(data.error);
        }
      },
    }),
  );

  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      if (!hasTriggeredRef.current) {
        setEmailSent(false);
        setEmailError(null);
        form.reset({ email });

        if (email && email !== '') {
          changeEmail.mutate({ email });
          hasTriggeredRef.current = true;
        }
      }
    } else {
      hasTriggeredRef.current = false;
    }
  }, [isOpen, email, form.reset, changeEmail.mutate]);

  const onSubmit: SubmitHandler<AddEmailForm> = useCallback(
    async (values) => {
      setEmailError(null);
      await changeEmail.mutateAsync(values);
    },
    [changeEmail],
  );

  const isAutoSending = email && email !== '' && !emailError;
  const isInVerifyFlow = emailSent || !!isAutoSending || changeEmail.isPending;

  return (
    <BasicModal
      trigger={<button type="button" className="hidden" />}
      title={
        isInVerifyFlow
          ? t('settings.verifyEmailContinue')
          : t('settings.addEmailContinue')
      }
      iconSrc={isInVerifyFlow ? EmailIcon : undefined}
      iconClassName={'fill-orange-500'}
      open={isOpen}
      onOpenChange={onClose}
      showPill={!isInVerifyFlow}
    >
      {!isInVerifyFlow ? (
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
                <FieldDescription className="text-left">
                  {t('settings.accountNeedsEmail')}
                </FieldDescription>
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
          <p className="title-base md:title-large text-black text-center">
            {t('settings.emailSentTitle')}
          </p>
          <p className="body-base md:label text-black text-center whitespace-pre-line">
            {t('settings.emailSentDescription', {
              email: form.getValues('email'),
            })}
          </p>
          <p className="body-small text-neutral-500">
            {t('settings.emailSentSpam')}
          </p>
        </div>
      )}
    </BasicModal>
  );
};
