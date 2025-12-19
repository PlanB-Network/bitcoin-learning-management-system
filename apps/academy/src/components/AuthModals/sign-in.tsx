import {
  Button,
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
import { TbExternalLink } from 'react-icons/tb';
import { z } from 'zod';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { isPearApp } from '../../env.ts';
import { trpc } from '../../utils/trpc.ts';
import { AuthModalState } from './props.ts';

interface SignInFormData {
  username: string;
  password: string;
}

interface SignInProps {
  onClose: () => void;
  redirectTo?: string | null;
  goTo: (newState: AuthModalState) => void;
}

export const SignIn = ({ onClose, goTo, redirectTo }: SignInProps) => {
  const isMobile = useSmaller('md') || window.innerWidth < 768;

  const { t } = useTranslation();
  const usernameRequired = t('auth.errors.usernameRequired');
  const passwordRequired = t('auth.passwordRequired');

  const signInSchema = z.object({
    password: z.string().min(1, { message: passwordRequired }),
    username: z.string().min(1, { message: usernameRequired }),
  });

  const methods = useForm({
    defaultValues: {
      password: '',
      username: '',
    },
    resolver: zodResolver(signInSchema),
  });

  const credentialsLogin = useMutation(
    trpc.auth.credentials.login.mutationOptions({
      onError: () => {
        methods.setError('username', {
          message: t('auth.errors.invalidCredentials'),
          type: 'manual',
        });
        methods.setError('password', {
          message: t('auth.errors.invalidCredentials'),
          type: 'manual',
        });
      },
      onSuccess: () => {
        onClose();
        if (redirectTo) {
          window.location.href = redirectTo;
        } else {
          window.location.reload();
        }
      },
    }),
  );

  const handleLogin: SubmitHandler<SignInFormData> = useCallback(
    (values) => {
      credentialsLogin.mutate(values);
    },
    [credentialsLogin],
  );

  if (isPearApp) {
    return (
      <div className="flex flex-col gap-8">
        <p className="font-medium text-xl">{t('auth.loginNotAvailable1')}</p>
        <p className="font-medium text-xl">{t('auth.loginNotAvailable2')}</p>
        <a
          className="flex flex-row gap-2 justify-center items-center text-orange-500"
          href="https://planb.academy"
        >
          <span className="text-lg">planb.academy</span>
          <TbExternalLink size={24} />
        </a>
      </div>
    );
  }

  return (
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
                {t('dashboard.profile.emailOrUsername')}
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="username"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <button
        type="button"
        onClick={() => goTo(AuthModalState.PasswordReset)}
        className="cursor-pointer border-none bg-transparent body-extra-small-bold self-end w-fit text-orange-500 mt-2"
      >
        {t('auth.forgotPassword')}
      </button>

      <Button type="submit" className="w-full mt-6" size={isMobile ? 'm' : 'l'}>
        {t('menu.login')}
      </Button>
    </form>
  );
};
