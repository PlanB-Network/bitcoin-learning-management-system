import { Button, ButtonWithArrow, customToast, Form } from '@blms/ui';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdMarkEmailRead } from 'react-icons/md';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { isUUID } from '#src/utils/index.ts';
import { trpc } from '#src/utils/trpc.ts';
import { FormCheckboxGroup } from '../../dashboard/_dashboard/profile.tsx';

export const Route = createFileRoute(
  '/$lang/_content/_misc/change-email-preferences/$unsubscribeId',
)({
  component: ChangeEmailPreferences,
});

function ChangeEmailPreferences() {
  const { t } = useTranslation();

  const params = Route.useParams();

  const FormSchema = z.object({
    emailNotifications: z.array(z.string()).default([]),
  });

  const { data: emailPreferences, isFetched } = useQuery(
    trpc.user.getEmailSettings.queryOptions(
      {
        unsubscribeId: params.unsubscribeId,
      },
      {
        enabled: isUUID(params.unsubscribeId),
      },
    ),
  );

  const getDefaultEmailNotifications = () => {
    const defaults = [];
    if (emailPreferences?.emailNotifyCourses) defaults.push('courses');
    if (emailPreferences?.emailNotifyGeneral) defaults.push('general');
    return defaults;
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      emailNotifications: [],
    },
    resolver: standardSchemaResolver(FormSchema),
  });

  const changeEmailSettings = useMutation(
    trpc.user.changeEmailSettings.mutationOptions({
      onSuccess: () => {
        customToast(
          t(
            'dashboard.profile.notificationSettings.emailPreferencesSavedSuccessfully',
          ),
          {
            closeButton: true,
            color: 'success',
            icon: MdMarkEmailRead,
            mode: 'light',
          },
        );
      },
    }),
  );

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const mutationPayload = {
      emailNotifyCourses: data.emailNotifications.includes('courses'),
      emailNotifyGeneral: data.emailNotifications.includes('general'),
      unsubscribeId: params.unsubscribeId,
    };

    changeEmailSettings.mutate(mutationPayload);
  }

  useEffect(() => {
    if (isFetched) {
      form.reset({
        emailNotifications: getDefaultEmailNotifications(),
      });
    }
  }, [isFetched]);

  if (!isFetched) return null;

  return (
    <PageLayout className="max-w-xl mx-auto">
      <h1 className="title-medium-sb-18px md:title-large-sb-24px mb-4 md:mb-8 text-newBlack-1">
        {t('dashboard.profile.notificationSettings.emailPreferencesTitle')}
      </h1>
      <p className="subtitle-small-14px md:subtitle-large-18px mb-4 md:mb-8 text-newBlack-1">
        {t(
          'dashboard.profile.notificationSettings.emailPreferencesDescription',
        )}
      </p>
      {emailPreferences ? (
        <>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, console.error)}
              className="flex flex-col gap-4 md:gap-8"
            >
              <div className="flex flex-col gap-2">
                <FormCheckboxGroup
                  id="emailNotifications"
                  control={form.control}
                  label={t('dashboard.profile.notificationSettings.emailTitle')}
                  options={[
                    {
                      label: t(
                        'dashboard.profile.notificationSettings.coursesOption',
                      ),
                      value: 'courses',
                    },
                    {
                      label: t(
                        'dashboard.profile.notificationSettings.generalOption',
                      ),
                      value: 'general',
                    },
                  ]}
                  addNoneButton
                />
              </div>

              <Button
                type={'submit'}
                size="s"
                disabled={changeEmailSettings.isPending}
                className="w-fit self-center"
              >
                {changeEmailSettings.isPending
                  ? t('words.saving')
                  : t('words.save')}
              </Button>
            </form>
          </Form>
        </>
      ) : (
        <div className="text-newBlack-1 body-14px md:body-16px">
          <p className="mb-2 font-medium">
            {t('dashboard.profile.notificationSettings.loadEmailSettingsError')}
          </p>
          <p className="mb-4">
            {t(
              'dashboard.profile.notificationSettings.loadEmailSettingsErrorDescription',
            )}
          </p>
          <p>
            {t(
              'dashboard.profile.notificationSettings.loadEmailSettingsErrorManage',
            )}
          </p>
          <ButtonWithArrow asChild size="s" className="self-center mt-4 w-fit">
            <Link to="/dashboard/profile">
              {t('dashboard.profile.notificationSettings.goToProfile')}
            </Link>
          </ButtonWithArrow>
        </div>
      )}
    </PageLayout>
  );
}
