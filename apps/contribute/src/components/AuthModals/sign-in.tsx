import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
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

        <Form {...methods}>
          <form
            onSubmit={methods.handleSubmit(handleLogin)}
            className="flex w-full flex-col items-center mt-3"
          >
            <FormField
              control={methods.control}
              name="username"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2 my-2 w-full md:w-80 text-center">
                  <FormLabel>{t('dashboard.profile.username')}</FormLabel>
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
                <FormItem className="space-y-2 my-2 w-full md:w-80 text-center">
                  <FormLabel>{t('dashboard.profile.password')}</FormLabel>
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

            <Button type="submit" className="my-8">
              {t('menu.login')}
            </Button>

            <p className="mobile-body2 md:desktop-body1 text-center">
              {t('auth.noAccountYet')}
              <button
                type="button"
                onClick={() => goTo(AuthModalState.Register)}
                className="ml-1 cursor-pointer underline italic"
              >
                {t('auth.createOne')}
              </button>
            </p>

            <p className="mb-0 mt-2 text-xs">
              <button
                type="button"
                onClick={() => goTo(AuthModalState.PasswordReset)}
                className="cursor-pointer border-none bg-transparent text-xs underline"
              >
                {t('auth.forgottenPassword')}
              </button>
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
