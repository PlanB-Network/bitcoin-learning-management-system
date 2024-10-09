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
  DialogOverlay,
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

import { AuthModalState } from './props.ts';

interface RegisterFormData {
  username: string;
  password: string;
  confirmation: string;
}

interface RegisterProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

export const Register = ({ isOpen, onClose, goTo }: RegisterProps) => {
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
    })
    .refine((data) => data.password === data.confirmation, {
      message: t('auth.passwordsDontMatch'),
      path: ['confirmation'],
    });

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmation: '',
    },
  });

  const register = trpc.auth.credentials.register.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        window.location.reload();
        // TODO log in the user
      }, 2000);
    },
  });

  const handleCreateUserAccount: SubmitHandler<RegisterFormData> = useCallback(
    (values) => {
      register.mutate({
        password: values.password,
        username: values.username,
      });
    },
    [register],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          showCloseButton
          className="gap-3 py-2 px-4 sm:gap-6 sm:p-6 w-full max-w-[90%] md:max-w-sm"
          showAccountHelper
        >
          <DialogHeader>
            <DialogTitle>
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
                        <FormItem className="my-2 w-full">
                          <FormLabel>
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
                        <FormItem className="my-2 w-full">
                          <FormLabel>
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
                        <FormItem className="my-2 w-full">
                          <FormLabel>{t('auth.confirmation')}</FormLabel>
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
                  {t('auth.alreadyHaveAccount')}{' '}
                  <button
                    className="cursor-pointer underline italic"
                    onClick={() => goTo(AuthModalState.SignIn)}
                  >
                    {t('menu.login')}
                  </button>
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
