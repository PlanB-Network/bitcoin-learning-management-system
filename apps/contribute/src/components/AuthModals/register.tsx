import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from '@blms/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import PasswordValidator from 'password-validator';
import { useCallback } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BsCheck } from 'react-icons/bs';
import { z } from 'zod';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { trpc } from '../../utils/trpc.ts';
import { AuthModalState } from './props.ts';

interface RegisterFormData {
  username: string;
  password: string;
  email: string | null;
}

interface RegisterProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string | null;
  goTo: (newState: AuthModalState) => void;
}

export const Register = ({
  isOpen,
  onClose,
  goTo,
  redirectTo,
}: RegisterProps) => {
  const isMobile = useSmaller('md') || window.innerWidth < 768;

  const { t } = useTranslation();
  const password = new PasswordValidator().is().min(10);

  const registerSchema = z.object({
    username: z
      .string({ error: t('auth.errors.usernameRequired') })
      .min(5, { message: t('auth.errors.usernameTooShort') })
      .regex(/^[\w.-]+$/, {
        message: t('auth.errors.usernameRegex'),
      }),
    password: z.string().superRefine((pwd, ctx) => {
      const result = password.validate(pwd, { details: true });
      if (Array.isArray(result) && result.length > 0) {
        const msg = result[0].message;
        ctx.addIssue({ code: 'custom', message: msg });
      }
    }),
    email: z
      .union([
        z.literal(''),
        z.string().email({ message: t('auth.errors.emailInvalid') }),
      ])
      .transform((data) => data || null)
      .nullable(),
  });

  const methods = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
    },
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
    ({ password, username, email }) =>
      register.mutate({
        password,
        username,
        email,
      }),
    [register],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogContent
          showCloseButton
          className="gap-3 py-2 px-4 sm:gap-6 sm:p-6 w-full max-w-[90%] md:max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="mt-8">
              {register.data
                ? t('auth.headerAccountCreated')
                : t('auth.createAccount')}
            </DialogTitle>
          </DialogHeader>

          {register.data && !register.error ? (
            <div className="mb-8 flex flex-col items-center">
              <BsCheck className="my-8 text-black" size={80} />
              <DialogDescription>
                {t('auth.accountCreated', {
                  userName: register.data.user.username,
                })}
                <br />
                {t('auth.canSaveProgress')}
              </DialogDescription>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full px-0.5 sm:px-5">
              <DialogDescription className="hidden">Register</DialogDescription>

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
                        <Input
                          {...field}
                          id={field.name}
                          placeholder="username"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
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
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
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

              <p className="body-base text-center mt-4">
                {t('auth.alreadyHaveAccount')}
                <button
                  type="button"
                  onClick={() => goTo(AuthModalState.SignIn)}
                  className="ml-1 cursor-pointer underline italic"
                >
                  {t('menu.login')}
                </button>
              </p>
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
