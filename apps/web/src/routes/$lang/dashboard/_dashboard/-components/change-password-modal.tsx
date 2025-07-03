import {
  BasicModal,
  Button,
  customToast,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@blms/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import PasswordValidator from 'password-validator';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ImCheckmark } from 'react-icons/im';
import { z } from 'zod';
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
  const changePassword = useMutation(
    trpc.user.changePassword.mutationOptions({
      onSuccess: () => {
        customToast(t('auth.passwordChangedSuccess'), {
          closeButton: true,
          color: 'success',
          icon: ImCheckmark,
          mode: 'light',
        });
        onClose();
      },
    }),
  );

  const passwordsDontMatchMessage = t('auth.passwordsDontMatch');

  const changePasswordSchema = z
    .object({
      newPassword: z.string().refine(
        (pwd) => password.validate(pwd),
        (pwd) => {
          const result = password.validate(pwd, { details: true });
          return { message: Array.isArray(result) ? result[0].message : '' };
        },
      ),
      newPasswordConfirmation: z.string(),
      oldPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.newPasswordConfirmation, {
      message: passwordsDontMatchMessage,
      path: ['newPasswordConfirmation'],
    });

  type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

  const form = useForm({
    defaultValues: {
      newPassword: '',
      newPasswordConfirmation: '',
      oldPassword: '',
    },
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit: SubmitHandler<ChangePasswordForm> = async (values) => {
    await changePassword.mutateAsync({
      newPassword: values.newPassword,
      oldPassword: values.oldPassword,
    });
  };
  const methods = useForm();

  return (
    <BasicModal
      trigger={<button type="button" className="hidden" />}
      title={t('settings.changePassword')}
      open={isOpen}
      onOpenChange={onClose}
      contentClassName="!max-w-xs md:!max-w-fit"
    >
      <Form {...methods}>
        <form
          className="flex w-full flex-col items-center"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field, fieldState }) => (
              <FormItem className="gap-2 w-full flex flex-col justify-between text-center">
                <div className="my-2 w-full md:w-80">
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
              <FormItem className="gap-2 w-full flex flex-col justify-between text-center">
                <div className="my-2 w-full md:w-80">
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
              <FormItem className="gap-2 w-full flex flex-col justify-between text-center">
                <div className="my-2 w-full md:w-80">
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
            className="mt-4 md:mt-6"
          >
            {t('words.update')}
          </Button>
        </form>
      </Form>
    </BasicModal>
  );
};
