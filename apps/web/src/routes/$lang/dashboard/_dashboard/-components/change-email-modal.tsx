import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  BasicModal,
  Button,
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

interface EmailSentReturn {
  success?: boolean;
  error?: string;
}

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onEmailSent: (data: EmailSentReturn) => void;
}

export const ChangeEmailModal = ({
  isOpen,
  onClose,
  email,
  onEmailSent,
}: ChangeEmailModalProps) => {
  const { t } = useTranslation();
  const changeEmail = trpc.user.changeEmail.useMutation({
    onSuccess: (data) => {
      onClose();
      onEmailSent(data);
    },
    onError: (error) => {
      console.error('Error changing email:', error.message);
    },
  });

  const form = useForm({
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
    <>
      <BasicModal
        trigger={<button type="button" className="hidden" />}
        title={t('settings.changeEmail')}
        open={isOpen}
        onOpenChange={onClose}
        contentClassName="!max-w-xs md:!max-w-fit"
      >
        <Form {...form}>
          <form
            className="flex w-full flex-col items-center gap-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col justify-between text-center w-full md:w-80">
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
                </FormItem>
              )}
            />

            <div className="flex gap-4 justify-between">
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
      </BasicModal>
    </>
  );
};
