import { zodResolver } from '@hookform/resolvers/zod';
import PasswordValidator from 'password-validator';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@blms/ui';

import { trpc } from '#src/utils/trpc.js';

const password = new PasswordValidator().is().min(10);

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({
  isOpen,
  onClose,
}: ChangePasswordModalProps) => {
  const { t } = useTranslation();
  const changePassword = trpc.user.changePassword.useMutation({
    onSuccess: onClose,
  });
  const passwordsDontMatchMessage = t('auth.passwordsDontMatch');

  const changePasswordSchema = z
    .object({
      oldPassword: z.string(),
      newPassword: z.string().refine(
        (pwd) => password.validate(pwd),
        (pwd) => {
          const result = password.validate(pwd, { details: true });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          return { message: Array.isArray(result) ? result[0].message : '' };
        },
      ),
      newPasswordConfirmation: z.string(),
    })
    .refine((data) => data.newPassword === data.newPasswordConfirmation, {
      message: passwordsDontMatchMessage,
      path: ['newPasswordConfirmation'],
    });

  type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      newPasswordConfirmation: '',
    },
  });

  const onSubmit: SubmitHandler<ChangePasswordForm> = async (values) => {
    await changePassword.mutateAsync({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    });
  };
  const methods = useForm();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <button className="hidden" />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        showAccountHelper={false}
        className="px-4 py-2 sm:p-6 sm:gap-6 gap-3"
      >
        <DialogHeader>
          <DialogTitle>{t('settings.changePassword')}</DialogTitle>
          <DialogDescription className="hidden">
            {t('settings.changePassword')}
          </DialogDescription>
        </DialogHeader>
        <Form {...methods}>
          <form
            className="flex w-full flex-col items-center py-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col justify-between text-center">
                  <div className="my-2 w-80">
                    <FormLabel className="text-sm font-normal !max-md:leading-[120%] !md:desktop-h7 !text-dashboardSectionText">
                      Old password
                    </FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col justify-between text-center">
                  <div className="my-2 w-80">
                    <FormLabel className="text-sm font-normal !max-md:leading-[120%] !md:desktop-h7 !text-dashboardSectionText">
                      New password
                    </FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPasswordConfirmation"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col justify-between text-center">
                  <div className="my-2 w-80">
                    <FormLabel className="text-sm font-normal !max-md:leading-[120%] !md:desktop-h7 !text-dashboardSectionText">
                      Confirmation
                    </FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="primary"
              mode="light"
              className="mt-6"
            >
              {t('words.update')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
