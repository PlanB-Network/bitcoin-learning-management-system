import {
  Button,
  Checkbox,
  customToast,
  DividerSimple,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Loader,
  Tabs,
  TabsContent,
  TabsListUnderlined,
} from '@blms/ui';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import type { ChangeEvent } from 'react';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoCheckmarkOutline } from 'react-icons/io5';
import { z } from 'zod';
import SignInIconLight from '#src/assets/icons/profile_log_in_light.svg';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl, setProfilePicture } from '#src/services/user.js';
import { trpc } from '#src/utils/trpc.ts';
import { ChangeDisplayNameModal } from './-components/change-display-name-modal.tsx';
import { ChangeEmailModal } from './-components/change-email-modal.tsx';
import { ChangePasswordModal } from './-components/change-password-modal.tsx';
import { ChangePictureModal } from './-components/change-picture-modal.tsx';

export const Route = createFileRoute('/$lang/dashboard/_dashboard/profile')({
  component: DashboardProfile,
});

function DashboardProfile() {
  const isMobile = useSmaller('md');
  const navigate = useNavigate();
  const { user, setUser, session } = useContext(AppContext);

  const [file, setFile] = useState<File | null>(null);
  const pictureUrl = getPictureUrl(user ? user : null);
  const profilePictureDisclosure = useDisclosure();

  // Called when the user selects a profile picture to upload
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setFile(target.files![0]);
    profilePictureDisclosure.open();
    target.value = '';
  };

  // Called when the user has cropped his profile picture
  const onPictureChange = (file: File) => {
    setProfilePicture(file)
      .then((update) => {
        setUser({ ...user, ...update });
      })
      .finally(profilePictureDisclosure.close)
      .catch((error) => console.error('Error:', error));
  };

  const {
    open: openChangePasswordModal,
    isOpen: isChangePasswordModalOpen,
    close: onClosePasswordModal,
  } = useDisclosure();

  const {
    open: openChangeDisplayNameModal,
    isOpen: isChangeDisplayNameModalOpen,
    close: onCloseDisplayNameModal,
  } = useDisclosure();

  const changeEmailModal = useDisclosure();
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState('info');

  const onTabChange = (value: string) => {
    setCurrentTab(value);
  };

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <div className="text-2xl">
        {t('dashboard.profile.profileInformation')}
      </div>
      <Tabs
        defaultValue="info"
        value={currentTab}
        onValueChange={onTabChange}
        className="max-w-[657px]"
      >
        <TabsListUnderlined
          tabs={[
            {
              active: 'info' === currentTab,
              key: 'info',
              text: t('dashboard.profile.profile'),
              value: 'info',
            },
            {
              active: 'settings' === currentTab,
              key: 'settings',
              text: t('dashboard.profile.settings'),
              value: 'settings',
            },
          ]}
          size={isMobile ? 's' : 'm'}
        />
        <TabsContent value="info">
          <div className="flex w-full flex-col">
            <div className="mt-6 flex flex-col">
              <label htmlFor="usernameId">
                {t('dashboard.profile.username')}
              </label>
              <input
                id="usernameId"
                type="text"
                value={user?.username}
                disabled
                className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10"
              />
            </div>
            <div className="mt-6">
              <label htmlFor="displayName">
                {t('dashboard.profile.displayName')}
              </label>
              <div className="flex max-lg:flex-col lg:items-center gap-4">
                <input
                  id="displayName"
                  type="text"
                  value={user?.displayName || ''}
                  disabled
                  className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10 grow"
                />
                <Button
                  variant="outline"
                  size="s"
                  onClick={openChangeDisplayNameModal}
                  className="h-[34px] px-3 w-fit"
                >
                  {t('dashboard.profile.edit')}
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex flex-col">
                <label htmlFor="emailId">{t('dashboard.profile.email')}</label>

                <div className="flex max-lg:flex-col lg:items-center gap-4">
                  <input
                    id="emailId"
                    type="text"
                    value={user?.email ?? ''}
                    disabled
                    className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10 grow"
                  />

                  <Button
                    variant="outline"
                    size="s"
                    onClick={changeEmailModal.open}
                    className="h-[34px] px-3 w-fit"
                  >
                    {t('dashboard.profile.edit')}
                  </Button>
                </div>
              </div>

              {/* Confirmation message */}
              <div>
                {emailSent && (
                  <div className="mt-6 text-green-500">
                    {t('dashboard.profile.emailChangeConfirmation')}
                  </div>
                )}
                {emailError && (
                  <div className="mt-6 text-red-5">
                    {t(`dashboard.profile.${emailError}`)}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Picture Zone */}
            <div className="mt-6 flex flex-col">
              <label htmlFor="profilePictureFile">
                {t('dashboard.profile.profilePicture')}
              </label>

              <div className="mt-2 max-md:flex-col flex gap-8 lg:items-end">
                <img
                  src={pictureUrl ?? SignInIconLight}
                  alt="Profile"
                  className="rounded-full size-32"
                />

                <div>
                  <Button variant="outline" size="m" className="p-0">
                    <label
                      htmlFor="profilePictureFile"
                      className="px-2.5 py-1.5 cursor-pointer"
                    >
                      {t('dashboard.profile.edit')}
                    </label>
                  </Button>
                  <input
                    className="hidden"
                    type="file"
                    name="file"
                    id="profilePictureFile"
                    accept="image/*"
                    onChange={onFileChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <section className="flex flex-col my-5 md:my-8 gap-2.5 md:gap-4">
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
                  className="w-full border border-newGray-4 bg-newGray-5 rounded-lg px-4 py-[5px] placeholder:text-newGray-2"
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
          <DividerSimple mode="light" />
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="document" />
      </Tabs>

      <ChangeDisplayNameModal
        isOpen={isChangeDisplayNameModalOpen}
        onClose={() => {
          onCloseDisplayNameModal();
        }}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={onClosePasswordModal}
      />

      <ChangePictureModal
        file={file}
        onChange={onPictureChange}
        onClose={profilePictureDisclosure.close}
        isOpen={profilePictureDisclosure.isOpen}
      />

      <ChangeEmailModal
        isOpen={changeEmailModal.isOpen}
        onClose={changeEmailModal.close}
        onEmailSent={(data) => {
          if (data.success) {
            setEmailSent(true);
          } else {
            setEmailSent(false);
            setEmailError(data.error ?? 'An error occurred');
          }
        }}
        email={user?.email || ''}
      />
    </div>
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
          icon: IoCheckmarkOutline,
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
      <Form {...form}>
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
                label={t(
                  'dashboard.profile.notificationSettings.platformTitle',
                )}
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

                {!user?.email && (
                  <p className="body-14px text-red-6">
                    {t('dashboard.profile.notificationSettings.emailWarning')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>
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
  return (
    <FormField
      control={control}
      name={id}
      render={({ field }) => (
        <FormItem className="w-full flex flex-col gap-2">
          <FormLabel className="flex flex-col gap-2" removeDefaultClasses>
            <span className="text-black subtitle-medium-med-16px whitespace-pre-line">
              {label}
              {mandatory && <span className="text-red-5 ml-0.5">*</span>}
            </span>

            {subLabel && (
              <span className="text-newGray-1 body-14px">{subLabel}</span>
            )}
          </FormLabel>
          <FormControl>
            <div className="flex flex-col gap-2 pl-[18px]">
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
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
