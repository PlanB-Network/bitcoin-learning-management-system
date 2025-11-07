import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Field,
  FieldError,
  FieldGroup,
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
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { trpc } from '../../utils/trpc.ts';
import { AuthModalState } from './props.ts';

interface SignInFormData {
  username: string;
  password: string;
}

interface SignInProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string | null;
  goTo: (newState: AuthModalState) => void;
}

export const SignIn = ({ isOpen, onClose, goTo, redirectTo }: SignInProps) => {
  const isMobile = useSmaller('md') || window.innerWidth < 768;

  const { t } = useTranslation();
  const usernameRequired = t('auth.errors.usernameRequired');
  const passwordRequired = t('auth.passwordRequired');

  const signInSchema = z.object({
    username: z.string().min(1, { message: usernameRequired }),
    password: z.string().min(1, { message: passwordRequired }),
  });

  const methods = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const credentialsLogin = useMutation(
    trpc.auth.credentials.login.mutationOptions({
      onSuccess: () => {
        onClose();
        if (redirectTo) {
          window.location.href = redirectTo;
        } else {
          window.location.reload();
        }
      },
      onError: () => {
        methods.setError('username', {
          type: 'manual',
          message: t('auth.errors.invalidCredentials'),
        });
        methods.setError('password', {
          type: 'manual',
          message: t('auth.errors.invalidCredentials'),
        });
      },
    }),
  );

  const handleLogin: SubmitHandler<SignInFormData> = useCallback(
    (values) => {
      credentialsLogin.mutate(values);
    },
    [credentialsLogin],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton
        className="pb-[30px] pt-[65px] md:pb-[44px] md:pt-[80px] px-4 w-full max-w-[90%] md:max-w-sm"
      >
        <DialogTitle>{t('menu.login')}</DialogTitle>
        <DialogDescription className="hidden">
          {t('menu.login')}
        </DialogDescription>

        <form
          onSubmit={methods.handleSubmit(handleLogin)}
          className="flex w-full flex-col items-center"
        >
          <FieldGroup className="w-full gap-4">
            <Controller
              name="username"
              control={methods.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} required>
                    {t('dashboard.profile.username')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="username"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={methods.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} required>
                    {t('dashboard.profile.password')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    placeholder="password"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <button
            type="button"
            onClick={() => goTo(AuthModalState.PasswordReset)}
            className="cursor-pointer border-none bg-transparent body-extra-small-bold self-end w-fit text-orange-500 mt-2"
          >
            {t('auth.forgottenPassword')}
          </button>

          <Button
            type="submit"
            className="w-full mt-6"
            size={isMobile ? 'm' : 'l'}
          >
            {t('menu.login')}
          </Button>
        </form>

        <p className="body-base text-center mt-4">
          {t('auth.noAccountYet')}
          <button
            type="button"
            onClick={() => goTo(AuthModalState.Register)}
            className="ml-1 cursor-pointer underline italic"
          >
            {t('auth.createOne')}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
};
