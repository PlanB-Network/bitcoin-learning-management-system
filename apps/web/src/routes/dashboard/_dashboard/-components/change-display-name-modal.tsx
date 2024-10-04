import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@blms/ui';

import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

interface ChangeDisplayNameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeDisplayNameModal = ({
  isOpen,
  onClose,
}: ChangeDisplayNameModalProps) => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AppContext);

  const displayNameTooShortmsg = t('auth.errors.displayNameTooShort');
  const displayNameRegex = t('auth.errors.displayNameRegex');

  const changeDisplayNameSchema = z.object({
    displayName: z
      .string()
      .min(2, { message: displayNameTooShortmsg })
      .regex(/^[\w .\\-]+$/, {
        message: displayNameRegex,
      }),
  });
  type ChangeDisplayNameForm = z.infer<typeof changeDisplayNameSchema>;

  const changeDisplayName = trpc.user.changeDisplayName.useMutation({
    onSuccess: onClose,
  });

  const form = useForm<ChangeDisplayNameForm>({
    resolver: zodResolver(changeDisplayNameSchema),
    defaultValues: {
      displayName: '',
    },
  });

  const onSubmit: SubmitHandler<ChangeDisplayNameForm> = async (values) => {
    await changeDisplayName.mutateAsync({
      displayName: values.displayName,
    });
    if (user) {
      setUser({ ...user, displayName: values.displayName });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <button className="hidden" />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="px-4 py-2 sm:p-6 sm:gap-6 gap-3"
      >
        <DialogHeader>
          <DialogTitle>{t('settings.changeDisplayName')}</DialogTitle>
          <DialogDescription className="hidden">
            {t('settings.changeDisplayName')}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form
            className="flex w-full flex-col items-center py-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="displayName"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col justify-between text-center">
                  <div className="my-2 w-80">
                    <FormLabel className="text-sm font-normal !max-md:leading-[120%] !md:desktop-h7 !text-dashboardSectionText">
                      {t('auth.displayName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        error={fieldState.error?.message || null}
                      />
                    </FormControl>
                  </div>
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
