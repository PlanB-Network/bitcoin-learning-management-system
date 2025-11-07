import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from '@blms/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { trpcClient } from '#src/utils/trpc.ts';
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
  const { t } = useTranslation();

  const [resetPasswordState, setResetPasswordState] =
    useState<ResetPasswordState>(ResetPasswordState.Initial);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordResetSchema = z.object({
    email: z.string(),
  });

  const form = useForm({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { email: '' },
  });

  const handlePasswordReset = useCallback(
    async ({ email }: { email: string }) => {
      if (isSubmitting) return;

      console.log('Reset password for email:', email);

      try {
        setIsSubmitting(true);
        await trpcClient.user.requestPasswordReset.mutate({ email });
        console.log('Password reset email sent');
        setResetPasswordState(ResetPasswordState.Sent);
      } catch (error) {
        console.error('Error sending password reset email:', error);
        setResetPasswordState(ResetPasswordState.Error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting],
  );

  const modalContent = {
    [ResetPasswordState.Initial]: (
      <>
        <form
          onSubmit={form.handleSubmit(handlePasswordReset)}
          className="flex w-full flex-col items-center"
        >
          <div className="space-y-2 my-2 w-4/5">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} required>
                    {t('auth.emailAddress')}
                  </FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Button
            variant="primary"
            type="submit"
            className="mb-5 mt-2"
            disabled={!form.watch('email')}
          >
            {t('auth.sendLink')}
          </Button>
        </form>

        <p className="mb-0 text-xs">
          <button
            type="button"
            onClick={() => goTo(AuthModalState.SignIn)}
            className="cursor-pointer border-none bg-transparent text-xs underline"
          >
            {t('words.back')}
          </button>
        </p>
      </>
    ),
    [ResetPasswordState.Sent]: (
      <div className="flex flex-col items-center">
        <p className="mb-8">{t('auth.passwordResetSent')}</p>
        <Button variant="primary" onClick={() => goTo(AuthModalState.SignIn)}>
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
          onClick={() => setResetPasswordState(ResetPasswordState.Initial)}
        >
          {t('auth.tryAgain')}
        </Button>
      </div>
    ),
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={true}
        className="w-full max-w-[90%] md:max-w-sm px-4 py-2 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle variant="orange">{t('auth.resetPassword')}</DialogTitle>
          <DialogDescription className="hidden">
            {t('auth.resetPassword')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center">
          {modalContent[resetPasswordState]}
        </div>
      </DialogContent>
    </Dialog>
  );
};
