import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared';
import {
  Button,
  Checkbox,
  customToast,
  Field,
  FieldError,
  FieldLabel,
  Loader,
} from '@blms/ui';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TbCheck } from 'react-icons/tb';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.ts';
import { ChangePasswordModal } from '../dashboard/_dashboard/-components/change-password-modal.tsx';
import { showEmailProfileNotificationNavbar } from './index.tsx';

export const Route = createFileRoute('/$lang/account/settings')({
  component: AccountSettings,
});

function AccountSettings() {
  const navigate = useNavigate();
  const { session, user } = useContext(AppContext);

  const {
    open: openChangePasswordModal,
    isOpen: isChangePasswordModalOpen,
    close: onClosePasswordModal,
  } = useDisclosure();

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      layoutSize="base"
      title={t('words.settings')}
      tabs={[
        {
          id: 'account',
          label: t('account.profile'),
          href: '/account',
          notificationAmount: showEmailProfileNotificationNavbar(user)
            ? 1
            : undefined,
        },
        ...(user?.professorId && canAccess(UserRole.Professor)(user)
          ? [
              {
                id: 'teacher-profile',
                label: t('account.myTeacherProfile'),
                href: '/account/teacher-profile',
              },
            ]
          : []),
        {
          id: 'settings',
          label: t('words.settings'),
          href: '/account/settings',
        },
        {
          id: 'invoices',
          label: t('words.invoices'),
          href: '/account/invoices',
        },
      ]}
    >
      <section className="flex flex-col gap-2.5 md:gap-4">
        <h3 className="subtitle-large-18px font-medium md:subtitle-large-med-20px text-newBlack-1">
          {t('dashboard.profile.securitySettings')}
        </h3>
        <div className="flex flex-col gap-2">
          <span className="subtitle-medium-med-16px text-newBlack-1">
            {t('words.password')}
          </span>
          <div className="flex max-md:flex-col md:items-center w-full gap-4 md:gap-8 max-md:flex-wrap">
            <input
              type="text"
              disabled
              className="w-full border border-newGray-4 bg-newGray-5 rounded-lg px-4 py-1 placeholder:text-newGray-2"
              placeholder="**********"
            />
            <Button
              variant="primary"
              size="s"
              onClick={openChangePasswordModal}
              className="shrink-0 w-fit"
            >
              {t('dashboard.profile.change')}
            </Button>
          </div>
        </div>
      </section>
      <NotificationSettings />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={onClosePasswordModal}
      />
    </PageLayout>
  );
}

const NotificationSettings = () => {
  const { user, accountSettings, fetchUserDetailsAndSettings } =
    useContext(AppContext);

  const [isEditingNotificationsSettings, setIsEditingNotificationsSettings] =
    useState(false);

  const FormSchema = z.object({
    emailNotifications: z.array(z.string()).default([]),
    platformNotifications: z.array(z.string()).default([]),
  });

  const getDefaultPlatformNotifications = () => {
    const defaults = [];
    if (accountSettings?.platformNotifyEvents) defaults.push('events');
    if (accountSettings?.platformNotifyCourses) defaults.push('courses');
    if (accountSettings?.platformNotifyGeneral) defaults.push('general');
    return defaults;
  };

  const getDefaultEmailNotifications = () => {
    const defaults = [];
    if (accountSettings?.emailNotifyCourses) defaults.push('courses');
    if (accountSettings?.emailNotifyGeneral) defaults.push('general');
    return defaults;
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      emailNotifications: getDefaultEmailNotifications(),
      platformNotifications: getDefaultPlatformNotifications(),
    },
    resolver: standardSchemaResolver(FormSchema),
  });

  const changeNotificationSettings = useMutation(
    trpc.user.changeNotificationsSettings.mutationOptions({
      onSuccess: async () => {
        await fetchUserDetailsAndSettings();
        customToast(t('dashboard.profile.notificationSettings.settingsSaved'), {
          closeButton: true,
          color: 'success',
          icon: TbCheck,
          mode: 'light',
        });
      },
    }),
  );

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const mutationPayload = {
      emailNotifyCourses: data.emailNotifications.includes('courses'),
      emailNotifyGeneral: data.emailNotifications.includes('general'),
      platformNotifyCourses: data.platformNotifications.includes('courses'),
      platformNotifyEvents: data.platformNotifications.includes('events'),
      platformNotifyGeneral: data.platformNotifications.includes('general'),
    };

    changeNotificationSettings.mutate(mutationPayload);
  }

  return (
    <section className="flex flex-col mt-5 md:mt-8 gap-5 md:gap-8">
      <form
        onSubmit={form.handleSubmit(onSubmit, console.error)}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2.5 md:gap-4">
          <div className="flex justify-between w-full items-center flex-wrap">
            <h3 className="subtitle-large-18px font-medium md:subtitle-large-med-20px text-newBlack-1">
              {t('dashboard.profile.notificationSettings.title')}
            </h3>

            <Button
              type={isEditingNotificationsSettings ? 'button' : 'submit'}
              onClick={
                isEditingNotificationsSettings
                  ? () => setIsEditingNotificationsSettings(false)
                  : () => setIsEditingNotificationsSettings(true)
              }
              size="s"
              disabled={changeNotificationSettings.isPending}
              className="md:self-end w-fit"
            >
              {changeNotificationSettings.isPending
                ? t('words.saving')
                : !isEditingNotificationsSettings
                  ? t('words.edit')
                  : t('words.save')}
            </Button>
          </div>

          <p className="desktop-typo1 md:body-16px text-newBlack-1">
            {t('dashboard.profile.notificationSettings.description')}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex max-md:flex-col gap-4 md:gap-2 justify-between">
            <FormCheckboxGroup
              id="platformNotifications"
              control={form.control}
              label={t('dashboard.profile.notificationSettings.platformTitle')}
              options={[
                {
                  label: t(
                    'dashboard.profile.notificationSettings.eventsOption',
                  ),
                  value: 'events',
                },
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
              disabled={
                changeNotificationSettings.isPending ||
                !isEditingNotificationsSettings
              }
              addNoneButton
            />
          </div>

          <div className="flex max-md:flex-col gap-4 md:gap-2 justify-between">
            <div className="flex flex-col gap-2">
              <FormCheckboxGroup
                id="emailNotifications"
                control={form.control}
                label={t('dashboard.profile.notificationSettings.emailTitle')}
                options={[
                  {
                    label: t(
                      'dashboard.profile.notificationSettings.coursesEventsOption',
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
                disabled={
                  changeNotificationSettings.isPending ||
                  !isEditingNotificationsSettings
                }
                addNoneButton
              />

              {!user?.email && (
                <p className="body-14px text-red-6">
                  {t('dashboard.profile.notificationSettings.emailWarning')}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export const FormCheckboxGroup = ({
  id,
  control,
  label,
  subLabel,
  options,
  disabled,
  mandatory,
  addNoneButton,
}: {
  id: string;
  control: any;
  label: string;
  subLabel?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  mandatory?: boolean;
  addNoneButton?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={id}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className="w-full flex flex-col gap-2"
        >
          <FieldLabel htmlFor={id} required={mandatory}>
            <span className="text-black subtitle-medium-med-16px whitespace-pre-line">
              {label}
            </span>

            {subLabel && (
              <span className="text-newGray-1 body-14px">{subLabel}</span>
            )}
          </FieldLabel>

          <div className="flex flex-col gap-2 pl-4">
            {options.map((option) => (
              <div key={option.value} className="flex gap-4 items-center">
                <Checkbox
                  id={`${id}-${option.value}`}
                  value={option.value}
                  checked={field.value.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange([...field.value, option.value]);
                    } else {
                      field.onChange(
                        field.value.filter((v: string) => v !== option.value),
                      );
                    }
                  }}
                  disabled={disabled}
                />
                <label
                  htmlFor={`${id}-${option.value}`}
                  className="text-black label-medium-16px cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}

            {addNoneButton && (
              <div className="flex gap-4 items-center">
                <Checkbox
                  id={`${id}-no-preference`}
                  checked={field.value.length === 0}
                  onCheckedChange={(checked) => {
                    field.onChange(
                      checked ? [] : options.map((option) => option.value),
                    );
                  }}
                  disabled={disabled}
                />
                <label
                  htmlFor={`${id}-no-preference`}
                  className="text-black label-medium-16px cursor-pointer"
                >
                  {t('dashboard.profile.notificationSettings.none')}
                </label>
              </div>
            )}
          </div>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};
