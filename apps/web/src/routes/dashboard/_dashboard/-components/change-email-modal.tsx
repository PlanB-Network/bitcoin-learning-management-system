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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@blms/ui';

import { trpc } from '#src/utils/trpc.js';

const changeEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ChangeEmailForm = z.infer<typeof changeEmailSchema>;

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onEmailSent: () => void;
}

export const ChangeEmailModal = ({
  isOpen,
  onClose,
  email,
  onEmailSent,
}: ChangeEmailModalProps) => {
  const { t } = useTranslation();
  const changeEmail = trpc.user.changeEmail.useMutation({
    onSuccess: () => {
      onClose();
      onEmailSent();
    },
    onError: (error) => {
      console.error('Error changing email:', error.message);
    },
  });

  const form = useForm<ChangeEmailForm>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email },
  });

  const onSubmit: SubmitHandler<ChangeEmailForm> = useCallback(
    async (values) => {
      await changeEmail.mutateAsync(values);
    },
    [changeEmail],
  );

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
          <DialogTitle>{t('settings.changeEmail')}</DialogTitle>
          <DialogDescription className="hidden">
            {t('settings.changeEmail')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex w-full flex-col items-center py-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col justify-between text-center">
                  <div className="my-2 w-80">
                    <FormLabel className="text-sm font-normal !max-md:leading-[120%] !md:desktop-h7 !text-dashboardSectionText">
                      Email{' '}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        error={fieldState.error?.message || null}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <div className="p-4 flex gap-4 justify-between">
              <Button variant="primary" size="m" type="submit">
                {t('dashboard.profile.save')}
              </Button>
              <Button
                variant="secondary"
                size="m"
                type="button"
                onClick={onClose}
              >
                {t('dashboard.profile.cancel')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
