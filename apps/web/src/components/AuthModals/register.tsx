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
import { BsCheck } from 'react-icons/bs';
import { z } from 'zod';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';
import { trpc } from '../../utils/trpc.ts';

interface RegisterFormData {
  username: string;
  password: string;
  email: string | null;
  university?: string | null;
}

interface RegisterProps {
  redirectTo?: string | null;
}

export const Register = ({ redirectTo }: RegisterProps) => {
  const isMobile = useSmaller('md') || window.innerWidth < 768;

  const { t } = useTranslation();
  const { university } = useContext(AppContext);

  const password = new PasswordValidator().is().min(10);

  const registerSchema = z.object({
    email: z
      .union([
        z.literal(''),
        z.string().email({ message: t('auth.errors.emailInvalid') }),
      ])
      .transform((data) => data || null)
      .nullable(),
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

        setTimeout(() => {
          if (redirectTo) {
            window.location.href = redirectTo;
          } else {
            window.location.reload();
          }
        }, 2000);
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
      <div className="flex flex-col items-center">
        <BsCheck className="my-8 text-black" size={80} />
        <p>
          {t('auth.accountCreated', {
            userName: register.data.user.username,
          })}
          <br />
          {t('auth.canSaveProgress')}
        </p>
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
              <Input {...field} id={field.name} placeholder="username" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={methods.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor={field.name}
                optionalText={`(${t('words.optional').toLowerCase()})`}
              >
                {t('words.email')}
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                placeholder="email"
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
        <p className="mt-2 text-base font-semibold text-red-5">
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
