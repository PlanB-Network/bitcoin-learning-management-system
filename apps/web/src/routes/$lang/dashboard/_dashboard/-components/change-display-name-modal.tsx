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
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
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

  const displayNameTooShortMsg = t('auth.errors.displayNameTooShort');

  const changeDisplayNameSchema = z.object({
    displayName: z.string().min(2, { message: displayNameTooShortMsg }),
  });

  type ChangeDisplayNameForm = z.infer<typeof changeDisplayNameSchema>;

  const changeDisplayName = useMutation(
    trpc.user.changeDisplayName.mutationOptions({
      onSuccess: onClose,
    }),
  );

  const form = useForm({
    defaultValues: {
      displayName: '',
    },
    resolver: zodResolver(changeDisplayNameSchema),
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
    <>
      <BasicModal
        trigger={<button type="button" className="hidden" />}
        title={t('settings.changeDisplayName')}
        open={isOpen}
        onOpenChange={onClose}
        contentClassName="!max-w-xs md:!max-w-fit"
      >
        <Form {...form}>
          <form
            className="flex w-full flex-col items-center"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="displayName"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2 flex flex-col justify-between text-center">
                  <div className="my-2 w-full md:w-80">
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
        </Form>
      </BasicModal>
    </>
  );
};
