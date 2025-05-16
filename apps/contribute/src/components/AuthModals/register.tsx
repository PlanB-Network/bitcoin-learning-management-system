import { zodResolver } from '@hookform/resolvers/zod';
import PasswordValidator from 'password-validator';
import { useCallback } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BsCheck } from 'react-icons/bs';
import { z } from 'zod';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@blms/ui';

import { trpc } from '../../utils/trpc.ts';

import { useMutation } from '@tanstack/react-query';
import { AuthModalState } from './props.ts';

interface RegisterFormData {
  username: string;
  password: string;
  confirmation: string;
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
  const { t } = useTranslation();
  const password = new PasswordValidator().is().min(10);

  const registerSchema = z
    .object({
      username: z
        .string({ required_error: t('auth.errors.usernameRequired') })
        .min(5, { message: t('auth.errors.usernameTooShort') })
        .regex(/^[\w.\\-]+$/, {
          message: t('auth.errors.usernameRegex'),
        }),
      password: z.string().refine(
        (pwd) => password.validate(pwd),
        (pwd) => {
          const result = password.validate(pwd, { details: true });
          return { message: Array.isArray(result) ? result[0].message : '' };
        },
      ),
      confirmation: z.string(),
      email: z
        .union([
          z.literal(''),
          z.string().email({ message: t('auth.errors.emailInvalid') }),
        ])
        .transform((data) => data || null)
        .nullable(),
    })
    .refine((data) => data.password === data.confirmation, {
      message: t('auth.passwordsDontMatch'),
      path: ['confirmation'],
    });

  const methods = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmation: '',
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
            <>
              <div className="flex flex-col items-center w-full px-0.5 sm:px-5">
                <DialogDescription className="hidden">
                  Register
                </DialogDescription>

                <Form {...methods}>
                  <form
                    onSubmit={methods.handleSubmit(handleCreateUserAccount)}
                    className="flex w-full flex-col items-center mt-3"
                  >
                    <FormField
                      control={methods.control}
                      name="username"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-2 my-2 w-full">
                          <FormLabel required>
                            {t('dashboard.profile.username')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="username"
                              {...field}
                              error={fieldState.error?.message || null}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="password"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-2 my-2 w-full">
                          <FormLabel required>
                            {t('dashboard.profile.password')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="password"
                              type="password"
                              {...field}
                              error={fieldState.error?.message || null}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="confirmation"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-2 my-2 w-full">
                          <FormLabel required>
                            {t('auth.confirmation')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="password"
                              type="password"
                              {...field}
                              error={fieldState.error?.message || null}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="email"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-2 my-2 w-full">
                          <FormLabel>{t('auth.emailAddress')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="email"
                              type="email"
                              {...field}
                              value={field.value ?? ''}
                              error={fieldState.error?.message || null}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <p className="mt-4 text-sm text-gray-400">
                      {t('auth.emailTip')}
                    </p>

                    {register.error && (
                      <p className="mt-2 text-base font-semibold text-red-300">
                        {register.error.message}
                      </p>
                    )}

                    <Button
                      variant="primary"
                      size="m"
                      type="submit"
                      className="my-8"
                    >
                      {t('auth.createAccount')}
                    </Button>
                  </form>
                </Form>

                <p className="mobile-body2 md:desktop-body1 text-center max-md:max-w-[198px] mx-auto">
                  {t('auth.alreadyHaveAccount')}
                  <button
                    type="button"
                    onClick={() => goTo(AuthModalState.SignIn)}
                    className="cursor-pointer underline italic"
                  >
                    {t('menu.login')}
                  </button>
                </p>
              </div>
            </>
          )}

          <div className="flex flex-col items-center text-center px-0.5 sm:px-5 mx-auto">
            <div className="h-px bg-darkOrange-5 w-full max-w-40 rounded-3xl mb-2.5" />
            <span className="max-md:mobile-h3 md:desktop-h7 text-darkOrange-5">
              {t('auth.didYouKnow')}
            </span>
            <span className="text-darkOrange-5">
              {t('auth.noAccountNeeded')}
            </span>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
