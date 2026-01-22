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
import PasswordValidator from 'password-validator';
import { useCallback, useContext } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import EmailIcon from '#src/assets/icons/pixelated/email.svg?react';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';
import { trpc } from '../../utils/trpc.ts';

interface RegisterFormData {
  username: string;
  password: string;
  email: string;
  university?: string | null;
}

interface RegisterProps {
  setIsOnVerifyEmail: (value: boolean) => void;
}

export const Register = ({ setIsOnVerifyEmail }: RegisterProps) => {
  const isMobile = useSmaller('md') || window.innerWidth < 768;

  const { t } = useTranslation();
  const { university } = useContext(AppContext);

  const password = new PasswordValidator().is().min(10);

  const registerSchema = z.object({
    email: z.string().email({ message: t('auth.errors.emailInvalid') }),
    password: z.string().superRefine((pwd, ctx) => {
      const result = password.validate(pwd, { details: true });
      if (Array.isArray(result) && result.length > 0) {
        const msg = result[0].message;
        ctx.addIssue({ code: 'custom', message: msg });
      }
    }),
    university: z.string().optional(),
    username: z
      .string({ error: t('auth.errors.usernameRequired') })
      .min(5, { message: t('auth.errors.usernameTooShort') })
      .regex(/^[\w.-]+$/, {
        message: t('auth.errors.usernameRegex'),
      }),
  });

  const methods = useForm({
    defaultValues: {
      email: '',
      password: '',
      university: university ?? undefined,
      username: '',
    },
    resolver: zodResolver(registerSchema),
  });

  const register = useMutation(
    trpc.auth.credentials.register.mutationOptions({
      onSuccess: () => {
        sessionStorage.setItem('hasJustRegistered', 'true');

        setIsOnVerifyEmail(true);
      },
    }),
  );

  const handleCreateUserAccount: SubmitHandler<RegisterFormData> = useCallback(
    ({ password, username, email, university }) =>
      register.mutate({ email, password, university, username }),
    [register],
  );

  if (register.data && !register.error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <EmailIcon className="w-12 md:w-20 fill-orange-500" />
        <div className="flex flex-col items-center gap-2">
          <p className="title-base md:title-large">
            {t('settings.emailSentTitle')}
          </p>
          <p className="body-base md:label">{t('settings.verifyEmailClick')}</p>
          <p className="body-small text-neutral-500">
            {t('settings.checkSpam')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={methods.handleSubmit(handleCreateUserAccount)}
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
              <Input {...field} id={field.name} placeholder="nakamoto2008" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name} required>
                {t('words.email')}
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                placeholder="nakamoto@proton.me"
                value={field.value ?? ''}
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
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Hidden field */}
        <Controller
          name="university"
          control={methods.control}
          render={({ field }) => <input type="hidden" {...field} />}
        />
      </FieldGroup>

      {register.error && (
        <p className="mt-2 text-base font-semibold text-red-400">
          {register.error.message}
        </p>
      )}

      <Button
        variant="primary"
        size={isMobile ? 'm' : 'l'}
        type="submit"
        className="mt-6 w-full"
      >
        {t('auth.signUp')}
      </Button>
    </form>
  );
};
