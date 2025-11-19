import {
  BasicModal,
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
} from '@blms/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { trpc } from '#src/utils/index.js';
import { AuthModalState } from './props.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

enum ResetPasswordState {
  Initial,
  Sent,
  Error,
}

export const PasswordReset = ({ isOpen, onClose, goTo }: LoginModalProps) => {
  const isMobile = useSmaller('md') || window.innerWidth < 768;
  const { t } = useTranslation();

  const [resetPasswordState, setResetPasswordState] =
    useState<ResetPasswordState>(ResetPasswordState.Initial);

  const resetPassword = useMutation(
    trpc.user.requestPasswordReset.mutationOptions({
      onError: (error) => {
        console.error('Error sending password reset email:', error);
        setResetPasswordState(ResetPasswordState.Error);
      },
      onSuccess: () => {
        console.log('Password reset email sent');
        setResetPasswordState(ResetPasswordState.Sent);
      },
    }),
  );

  const passwordResetSchema = z.object({
    email: z.string(),
  });

  const form = useForm({
    defaultValues: { email: '' },
    resolver: zodResolver(passwordResetSchema),
  });

  const handlePasswordReset = useCallback(
    ({ email }: { email: string }) => {
      console.log('Reset password for email:', email);

      resetPassword.mutate({ email });
    },
    [resetPassword],
  );

  const modalContent = {
    [ResetPasswordState.Initial]: (
      <form
        onSubmit={form.handleSubmit(handlePasswordReset)}
        className="flex w-full flex-col items-center gap-5"
      >
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">
                  {t('auth.emailAddress')}
                </FieldLabel>
                <Input
                  type="email"
                  id="email"
                  {...field}
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                />
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          variant="primary"
          type="submit"
          className="w-full"
          size={isMobile ? 'm' : 'l'}
          disabled={!form.watch('email')}
        >
          {t('auth.sendLink')}
        </Button>
      </form>
    ),
    [ResetPasswordState.Sent]: (
      <div className="flex flex-col items-center">
        <p className="mb-8">{t('auth.passwordResetSent')}</p>
        <Button
          variant="primary"
          className="w-full"
          size={isMobile ? 'm' : 'l'}
          onClick={() => goTo(AuthModalState.SignIn)}
        >
          {t('auth.backToLogin')}
        </Button>
      </div>
    ),
    [ResetPasswordState.Error]: (
      <div className="flex flex-col items-center">
        <p className="mb-8">{t('auth.passwordResetError')}</p>
        <Button
          variant="primary"
          mode="light"
          className="w-full"
          size={isMobile ? 'm' : 'l'}
          onClick={() => setResetPasswordState(ResetPasswordState.Initial)}
        >
          {t('auth.tryAgain')}
        </Button>
      </div>
    ),
  };

  return (
    <BasicModal
      trigger={<button type="button" className="hidden" />}
      title={t('auth.resetPassword')}
      open={isOpen}
      onOpenChange={onClose}
    >
      <div className="flex flex-col items-center w-full">
        {modalContent[resetPasswordState]}
      </div>
    </BasicModal>
  );
};
