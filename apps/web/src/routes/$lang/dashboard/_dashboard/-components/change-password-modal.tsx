import {
  BasicModal,
  Button,
  customToast,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from '@blms/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import PasswordValidator from 'password-validator';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ImCheckmark } from 'react-icons/im';
import { z } from 'zod';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { trpc } from '#src/utils/trpc.js';

const password = new PasswordValidator().is().min(10);

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({
  isOpen,
  onClose,
}: ChangePasswordModalProps) => {
  const isMobile = useSmaller('md') || window.innerWidth < 768;
  const { t } = useTranslation();
  const changePassword = useMutation(
    trpc.user.changePassword.mutationOptions({
      onSuccess: () => {
        customToast(t('auth.passwordChangedSuccess'), {
          closeButton: true,
          color: 'success',
          icon: ImCheckmark,
          mode: 'light',
        });
        onClose();
      },
    }),
  );

  const passwordsDontMatchMessage = t('auth.passwordsDontMatch');

  const changePasswordSchema = z
    .object({
      newPassword: z.string().superRefine((pwd, ctx) => {
        const isValid = password.validate(pwd);
        const details = password.validate(pwd, { details: true });

        if (!isValid) {
          ctx.addIssue({
            code: 'custom',
            message:
              Array.isArray(details) && details.length > 0
                ? details[0].message
                : t('auth.errors.passwordTooShort'),
          });
        }
      }),
      newPasswordConfirmation: z.string(),
      oldPassword: z
        .string()
        .min(1, { message: t('auth.errors.oldPasswordRequired') }),
    })
    .superRefine((data, ctx) => {
      if (data.newPassword !== data.newPasswordConfirmation) {
        ctx.addIssue({
          code: 'custom',
          message: passwordsDontMatchMessage,
          path: ['newPasswordConfirmation'],
        });
      }
    });

  type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

  const form = useForm({
    defaultValues: {
      newPassword: '',
      newPasswordConfirmation: '',
      oldPassword: '',
    },
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit: SubmitHandler<ChangePasswordForm> = async (values) => {
    await changePassword.mutateAsync({
      newPassword: values.newPassword,
      oldPassword: values.oldPassword,
    });
  };

  return (
    <BasicModal
      trigger={<button type="button" className="hidden" />}
      title={t('settings.changePassword')}
      open={isOpen}
      onOpenChange={onClose}
    >
      <form
        className="flex w-full flex-col items-center gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Controller
          control={form.control}
          name="oldPassword"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="w-full flex flex-col"
            >
              <FieldLabel htmlFor={field.name}>
                {t('auth.oldPassword')}
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="password"
                aria-invalid={fieldState.invalid}
                error={fieldState.error?.message || null}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="w-full flex flex-col"
            >
              <FieldLabel htmlFor={field.name}>
                {t('auth.newPassword')}
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="password"
                aria-invalid={fieldState.invalid}
                error={fieldState.error?.message || null}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="newPasswordConfirmation"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="w-full flex flex-col"
            >
              <FieldLabel htmlFor={field.name}>
                {t('words.confirmation')}
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="password"
                aria-invalid={fieldState.invalid}
                error={fieldState.error?.message || null}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          variant="primary"
          size={isMobile ? 'm' : 'l'}
          className="mt-2 w-full"
        >
          {t('words.update')}
        </Button>
      </form>
    </BasicModal>
  );
};
