import type { JobTitle } from '@blms/types';
import {
  Button,
  Dialog,
  DialogClose,
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
  Loader,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  cn,
  customToast,
} from '@blms/ui';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Trans } from 'react-i18next';
import { BiPlus } from 'react-icons/bi';
import { FaRegTrashAlt } from 'react-icons/fa';
import { ImCheckmark } from 'react-icons/im';
import { IoMdCheckmarkCircle } from 'react-icons/io';
import { IoCheckmarkOutline, IoWarningOutline } from 'react-icons/io5';
import { MdOutlineEdit } from 'react-icons/md';
import { z } from 'zod';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { trpc } from '#src/utils/trpc.ts';

import {
  CareerCompanySize,
  CareerLanguageLevel,
  CareerRemote,
  CareerRoleLevel,
  JobCategory,
} from '@blms/constants';
import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black.svg';
import { AppContext } from '#src/providers/context.tsx';
import { BTC402ID } from '#src/utils/courses.ts';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/career-portal',
)({
  component: CareerPortal,
});

function CareerPortal() {
  const isMobile = useSmaller('md');

  const [step, setStep] = useState(0);
  const [validatedSteps, setValidatedSteps] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [cvErrorMessage, setCvErrorMessage] = useState('');

  const navigate = useNavigate();
  const { user } = useContext(AppContext);

  const Step1FormSchema = z.object({
    firstName: z
      .string()
      .min(1, { message: t('courses.review.fieldRequired') }),
    lastName: z.string().optional(),
    country: z.string().min(1, { message: t('courses.review.fieldRequired') }),
    email: z
      .string()
      .email({ message: t('dashboard.careerPortal.provideValidEmail') }),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    telegram: z.string().optional(),
    otherContact: z.string().optional(),
    isBitcoinCommunityParticipant: z.boolean().default(false),
    bitcoinCommunityText: z
      .string()
      .max(600, {
        message: t('dashboard.careerPortal.maxCharacters', {
          characters: 600,
        }),
      })
      .optional(),
    isBitcoinProjectParticipant: z.boolean().default(false),
    bitcoinProjectText: z
      .string()
      .max(600, {
        message: t('dashboard.careerPortal.maxCharacters', {
          characters: 600,
        }),
      })
      .optional(),
    languages: z
      .array(
        z.object({
          languageCode: z.string(),
          level: z.nativeEnum(CareerLanguageLevel),
        }),
      )
      .min(1, { message: t('dashboard.careerPortal.languageRequired') }),
  });

  const Step2FormSchema = z.object({
    isAvailableFullTime: z.boolean().default(true),
    remoteWorkPreference: z.nativeEnum(CareerRemote).default(CareerRemote.Yes),
    expectedSalary: z.string().optional(),
    availabilityStart: z.string().optional(),
    roles: z
      .array(
        z.object({
          roleId: z.string(),
          level: z.nativeEnum(CareerRoleLevel),
        }),
      )
      .min(1, { message: t('dashboard.careerPortal.roleRequired') })
      .max(3, { message: t('dashboard.careerPortal.maxRoles') }),
    companySizes: z
      .array(z.nativeEnum(CareerCompanySize))
      .min(1, { message: t('dashboard.careerPortal.companySizeRequired') }),
  });

  const Step3FormSchema = z.object({
    cvUrl: z.string().min(1),
    motivationLetter: z
      .string()
      .min(1, { message: t('courses.review.fieldRequired') })
      .max(600, {
        message: t('dashboard.careerPortal.maxCharacters', {
          characters: 600,
        }),
      }),
  });

  const Step4FormSchema = z.object({
    areTermsAccepted: z.boolean().default(false),
    allowReceivingEmails: z.boolean().default(false),
  });

  const FormSchema = z.object({
    ...Step1FormSchema.shape,
    ...Step2FormSchema.shape,
    ...Step3FormSchema.shape,
    ...Step4FormSchema.shape,
  });

  const schemas = [
    Step1FormSchema,
    Step2FormSchema,
    Step3FormSchema,
    Step4FormSchema,
  ];

  const {
    data: careerProfile,
    refetch: refetchCareerProfile,
    fetchStatus: isCareerProfileFetching,
  } = trpc.user.career.getCareerProfile.useQuery();

  const existingCareerProfile = careerProfile !== null;
  const showLoader = isCareerProfileFetching === 'fetching';

  const createCareerProfile = trpc.user.career.insertCareerProfile.useMutation({
    onSuccess: async () => {
      await refetchCareerProfile();
      setStep(1);
    },
  });

  const updateCareerProfile = trpc.user.career.updateCareerProfile.useMutation({
    onSuccess: async () => {
      await refetchCareerProfile();
      if (step < 4) {
        setStep((prev) => prev + 1);
      } else {
        setStep(0);
      }
    },
  });

  const deleteCareerProfile = trpc.user.career.deleteCareerProfile.useMutation({
    onSuccess: async () => {
      await refetchCareerProfile();
      setStep(0);
    },
  });

  const getValidatedSteps = () => {
    const values = form.getValues();
    if (values.areTermsAccepted && values.allowReceivingEmails) {
      return 4;
    }
    if (values.motivationLetter) {
      return 3;
    }
    if (values.roles.length > 0 && values.companySizes.length > 0) {
      return 2;
    }
    if (
      values.firstName &&
      values.country &&
      values.email &&
      values.languages.length > 0
    ) {
      return 1;
    }
    return 0;
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setCvErrorMessage(t('dashboard.careerPortal.invalidFile'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setCvErrorMessage(t('dashboard.careerPortal.fileTooLarge'));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/career/cvs/${careerProfile?.id}`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 200) {
        form.setValue('cvUrl', `/api/files/cvs/${careerProfile?.id}`);
        setCvErrorMessage('');
        customToast(t('dashboard.careerPortal.fileUploaded'), {
          mode: 'light',
          color: 'success',
          icon: IoCheckmarkOutline,
          closeButton: true,
        });
      } else {
        customToast(t('dashboard.careerPortal.fileUploadError'), {
          mode: 'light',
          color: 'warning',
          icon: IoWarningOutline,
          closeButton: true,
        });
      }
    }
  };

  const { data: languages } = trpc.user.career.getLanguages.useQuery();
  const sortedLanguages = languages
    ? [...languages].sort((a, b) => a.code.localeCompare(b.code))
    : [];

  const { data: jobTitles } = trpc.user.career.getJobTitles.useQuery();

  const sortedJobTitles = jobTitles
    ? [...jobTitles].sort((a, b) => {
        return a.name.localeCompare(b.name);
      })
    : [];

  const sortedJobsByCategory = Object.values(JobCategory).reduce<
    Record<string, JobTitle[]>
  >((acc, category) => {
    acc[category] =
      sortedJobTitles?.filter((jobTitle) => jobTitle.category === category) ||
      [];
    return acc;
  }, {});

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: standardSchemaResolver(schemas[step - 1]),
    defaultValues: {
      firstName: '',
      lastName: '',
      country: '',
      email: '',
      linkedin: '',
      github: '',
      telegram: '',
      otherContact: '',
      isBitcoinCommunityParticipant: false,
      bitcoinCommunityText: '',
      isBitcoinProjectParticipant: false,
      bitcoinProjectText: '',
      isAvailableFullTime: true,
      remoteWorkPreference: CareerRemote.Yes,
      expectedSalary: '',
      availabilityStart: '',
      cvUrl: '',
      motivationLetter: '',
      areTermsAccepted: false,
      allowReceivingEmails: false,
      languages: [],
      roles: [],
      companySizes: [],
    },
    mode: 'onTouched',
  });

  const {
    fields: languageSkillsFields,
    append: languageSkillsAppend,
    remove: languageSkillsRemove,
  } = useFieldArray({
    control: form.control,
    name: 'languages',
  });

  const {
    fields: rolesFields,
    append: rolesAppend,
    remove: rolesRemove,
  } = useFieldArray({
    control: form.control,
    name: 'roles',
  });

  useEffect(() => {
    if (user !== undefined && !user?.boughtCourses.includes(BTC402ID)) {
      navigate({ to: '/' });
    }
  }, [user]);

  useEffect(() => {
    form.reset({
      firstName: careerProfile?.firstName ?? '',
      lastName: careerProfile?.lastName ?? '',
      country: careerProfile?.country ?? '',
      email: careerProfile?.email ?? '',
      linkedin: careerProfile?.linkedin ?? '',
      github: careerProfile?.github ?? '',
      telegram: careerProfile?.telegram ?? '',
      otherContact: careerProfile?.otherContact ?? '',
      isBitcoinCommunityParticipant:
        careerProfile?.isBitcoinCommunityParticipant ?? false,
      bitcoinCommunityText: careerProfile?.bitcoinCommunityText ?? '',
      isBitcoinProjectParticipant:
        careerProfile?.isBitcoinProjectParticipant ?? false,
      bitcoinProjectText: careerProfile?.bitcoinProjectText ?? '',
      isAvailableFullTime: careerProfile?.isAvailableFullTime ?? true,
      remoteWorkPreference:
        careerProfile?.remoteWorkPreference ?? CareerRemote.Yes,
      expectedSalary: careerProfile?.expectedSalary ?? '',
      availabilityStart: careerProfile?.availabilityStart ?? '',
      cvUrl: careerProfile?.cvUrl ?? '',
      motivationLetter: careerProfile?.motivationLetter ?? '',
      areTermsAccepted: careerProfile?.areTermsAccepted ?? false,
      allowReceivingEmails: careerProfile?.allowReceivingEmails ?? false,
      languages: careerProfile?.languages ?? [],
      roles: careerProfile?.roles ?? [],
      companySizes: careerProfile?.companySizes ?? ([] as CareerCompanySize[]),
    });
    setValidatedSteps(getValidatedSteps());
  }, [careerProfile, form.reset]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const inputRowFlexClasses = 'flex max-md:flex-col gap-5 md:gap-[70px]';
  const inputRowMarginClasses = 'mb-5 md:mb-4';

  return (
    <div className="max-w-[1066px] flex flex-col">
      <h1 className="title-large-24px md:display-small-32px text-dashboardSectionText mb-[15px] md:mb-[40px]">
        {t('words.careerPortal')}
      </h1>
      {showLoader && <Loader />}

      {step > 0 && (
        <>
          <StepsProcess currentStep={step} validatedSteps={validatedSteps} />
          <StepsProcessMobile currentStep={step} />
        </>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() => {
            updateCareerProfile.mutate(form.getValues());
            if (step === 4) {
              customToast(t('dashboard.careerPortal.applicationSaved'), {
                mode: 'light',
                color: 'success',
                icon: IoCheckmarkOutline,
                closeButton: true,
              });
            }
          }, console.error)}
        >
          {/* Step 0 */}
          {!showLoader && step === 0 && (
            <>
              <h2 className="title-medium-sb-18px md:title-large-sb-24px text-dashboardSectionTitle mb-2.5 md:mb-[15px]">
                {t('dashboard.careerPortal.welcome')}
              </h2>
              <p className="text-black body-14px md:label-medium-16px mb-[25px] md:mb-[60px]">
                {t('dashboard.careerPortal.description')}
              </p>
              {existingCareerProfile ? (
                <>
                  <p className="bg-newGray-6 text-center text-lg font-medium text-newBlack-1 px-4 py-2 md:px-8 md:py-4 rounded-[16px] border-b border-b-newGray-4 uppercase w-fit mx-auto mb-2">
                    <Trans
                      i18nKey={
                        validatedSteps === 4
                          ? 'dashboard.careerPortal.applicationComplete'
                          : 'dashboard.careerPortal.applicationIncomplete'
                      }
                      components={{
                        highlight: <span className="text-darkOrange-5" />,
                      }}
                    />
                  </p>
                  <p className="w-full text-center text-newBlack-5 body-16px md:label-medium-16px mb-[25px] md:mb-[60px] whitespace-pre-line">
                    {validatedSteps === 4
                      ? t('dashboard.careerPortal.lookingForJob')
                      : t('dashboard.careerPortal.followProcess')}
                  </p>
                </>
              ) : (
                <p className="w-full text-center text-black body-16px-medium md:label-medium-med-16px mb-[25px] md:mb-[60px] whitespace-pre-line">
                  {t('dashboard.careerPortal.followProcess')}
                </p>
              )}

              <StepsProcess
                currentStep={step}
                validatedSteps={validatedSteps}
              />

              {!existingCareerProfile && (
                <ButtonWithArrow
                  variant="primary"
                  mode="light"
                  size="m"
                  onClick={() => createCareerProfile.mutate()}
                  className="mb-5 md:mb-[30px] mx-auto"
                  type="button"
                >
                  {t('dashboard.careerPortal.startApplication')}
                </ButtonWithArrow>
              )}
              {existingCareerProfile && (
                <div className="flex max-md:flex-col items-center justify-center gap-4 md:gap-[30px] mb-5 md:mb-[30px] mx-auto">
                  <Button
                    variant="primary"
                    mode="light"
                    size="m"
                    onClick={() =>
                      setStep(validatedSteps === 4 ? 1 : validatedSteps + 1)
                    }
                    type="button"
                  >
                    {t('dashboard.careerPortal.seeOrEditProfile')}
                    <MdOutlineEdit className="ml-2" />
                  </Button>
                  <DeleteProfileDialog
                    onConfirm={() => deleteCareerProfile.mutate()}
                  />
                </div>
              )}
              <p className="max-w-[738px] mx-auto text-newBlack-4 text-center body-14px">
                <Trans i18nKey={'dashboard.careerPortal.beAware'}>
                  <a
                    href="https://workspace.planb.network/s/EKLJPd8YnH3ooft"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="body-14px-medium hover:text-darkOrange-5"
                  >
                    here
                  </a>
                </Trans>
              </p>
            </>
          )}

          {/* Step 1 - Personal information */}
          {!showLoader && step === 1 && (
            <>
              <TitleAndSubtitle
                title={t('dashboard.careerPortal.personalInformation')}
                subtitle={t(
                  'dashboard.careerPortal.personalInformationSubtitle',
                )}
              />
              <div className={cn(inputRowFlexClasses, inputRowMarginClasses)}>
                <FormText
                  id="firstName"
                  control={form.control}
                  label={t('dashboard.careerPortal.firstName')}
                  placeholder="Satoshi"
                  type="text"
                  mandatory
                />
                <FormText
                  id="lastName"
                  control={form.control}
                  label={t('dashboard.careerPortal.lastName')}
                  placeholder="Nakamoto"
                  type="text"
                />
              </div>
              <div>
                <FormText
                  id="country"
                  control={form.control}
                  label={t('dashboard.careerPortal.countryResidence')}
                  placeholder={t('words.country')}
                  type="text"
                  mandatory
                />
              </div>

              <TitleAndSubtitle
                title={t('dashboard.careerPortal.contactInformation')}
                subtitle={t(
                  'dashboard.careerPortal.contactInformationSubtitle',
                )}
                className="mt-5 md:mt-10"
              />
              <div className={cn(inputRowFlexClasses, inputRowMarginClasses)}>
                <FormText
                  id="email"
                  control={form.control}
                  label={t('dashboard.careerPortal.emailAddress')}
                  placeholder={t('dashboard.careerPortal.emailPlaceholder')}
                  type="text"
                  mandatory
                />
              </div>
              <div className={cn(inputRowFlexClasses, inputRowMarginClasses)}>
                <FormText
                  id="linkedin"
                  control={form.control}
                  label={t('words.linkedin')}
                  placeholder={t('words.username')}
                  type="text"
                />
                <FormText
                  id="github"
                  control={form.control}
                  label={t('words.github')}
                  placeholder={t('words.username')}
                  type="text"
                />
              </div>
              <div className={cn(inputRowFlexClasses)}>
                <FormText
                  id="telegram"
                  control={form.control}
                  label={t('words.telegram')}
                  placeholder={`@${t('words.username')}`}
                  type="text"
                />
                <FormText
                  id="other"
                  control={form.control}
                  label={t('dashboard.careerPortal.other')}
                  placeholder={t('words.username')}
                  type="text"
                />
              </div>

              <TitleAndSubtitle
                title={t('dashboard.careerPortal.languageSkills')}
                subtitle={t('dashboard.careerPortal.languageSkillsSubtitle')}
                className="mt-5 md:mt-10"
              />

              <section>
                <div className="w-full flex max-md:flex-col gap-5 md:gap-[60px] md:items-center">
                  <div className="w-full max-w-xs md:max-w-[450px] flex flex-col gap-2">
                    <FormHeader
                      label={t('dashboard.careerPortal.selectLanguage')}
                      mandatory
                    />
                    <Select
                      onValueChange={(value) => {
                        setSelectedLanguage(value);
                      }}
                    >
                      <SelectTrigger className="w-full" mode="light">
                        <SelectValue
                          placeholder={t(
                            'dashboard.careerPortal.selectLanguage',
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent mode="light">
                        {sortedLanguages.map((language) => (
                          <SelectItem
                            key={language.code}
                            value={language.code}
                            className="text-sm truncate leading-[120%]"
                          >
                            {language.nativeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="primary"
                    mode="light"
                    size={isMobile ? 'm' : 's'}
                    className="max-md:w-full max-md:max-w-xs md:self-end flex gap-2.5"
                    type="button"
                    onClick={() => {
                      languageSkillsAppend({
                        languageCode: selectedLanguage,
                        level: CareerLanguageLevel.Beginner,
                      });
                    }}
                    disabled={
                      form
                        .getValues()
                        .languages.some(
                          (lang) => lang.languageCode === selectedLanguage,
                        ) || selectedLanguage === ''
                    }
                  >
                    {t('dashboard.careerPortal.add')} <BiPlus />
                  </Button>
                </div>

                {form.formState.errors.languages && (
                  <FormMessage className="mt-2">
                    {t('dashboard.careerPortal.languageRequired')}
                  </FormMessage>
                )}

                {languageSkillsFields.length > 0 && (
                  <div className="w-full bg-newGray-6 rounded-[10px] shadow-course-navigation-sm flex flex-col gap-5 md:gap-[15px] p-4 mt-5 md:mt-4">
                    <h3 className="subtitle-small-caps-14px md:subtitle-medium-caps-18px text-newGray-1">
                      {t('dashboard.careerPortal.yourLanguages')}
                    </h3>
                    {languageSkillsFields.map((field, index) => (
                      <div
                        key={field.languageCode}
                        className="flex max-md:flex-col gap-1 md:gap-[30px]"
                      >
                        <span className="w-full md:min-w-[194px] md:max-w-[194px] subtitle-large-18px md:subtitle-medium-med-16px text-black">
                          {
                            sortedLanguages?.find(
                              (language) =>
                                language.code === field.languageCode,
                            )?.nativeName
                          }
                        </span>
                        <FormSelect
                          {...form}
                          id={`languages[${index}].level`}
                          control={form.control}
                          label={t('dashboard.careerPortal.languageLevel')}
                          subLabel={t(
                            'dashboard.careerPortal.languageLevelSubLabel',
                          )}
                          options={Object.values(CareerLanguageLevel).map(
                            (level) => ({
                              value: level,
                              label: t(
                                `dashboard.careerPortal.languageLevels.${level}`,
                              ),
                            }),
                          )}
                          className="w-full md:max-w-[450px]"
                          mandatory
                        />
                        <div className="flex w-full">
                          <span className="w-full max-w-[224px] md:hidden" />
                          <Button
                            className="md:self-end max-md:mt-[11px] md:ml-auto flex gap-2.5 shrink-0"
                            type="button"
                            variant="outline"
                            mode="light"
                            size="s"
                            onClick={() => languageSkillsRemove(index)}
                          >
                            {t('words.delete')}
                            <FaRegTrashAlt />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <TitleAndSubtitle
                title={t('dashboard.careerPortal.bitcoinRelatedExperience')}
                subtitle={t(
                  'dashboard.careerPortal.bitcoinRelatedExperienceSubtitle',
                )}
                className="mt-5 md:mt-10"
              />

              <div className="flex flex-col gap-[30px] md:gap-5">
                <FormSwitch
                  id="isBitcoinCommunityParticipant"
                  control={form.control}
                  label={t(
                    'dashboard.careerPortal.bitcoinCommunityParticipant',
                  )}
                  trueText={t('words.yes')}
                  falseText={t('words.no')}
                />
                <FormText
                  id="bitcoinCommunityText"
                  control={form.control}
                  label={t('dashboard.careerPortal.bitcoinCommunityText')}
                  placeholder="..."
                  type="area"
                />
                <FormSwitch
                  id="isBitcoinProjectParticipant"
                  control={form.control}
                  label={t('dashboard.careerPortal.bitcoinProjectParticipant')}
                  trueText={t('words.yes')}
                  falseText={t('words.no')}
                />
                <FormText
                  id="bitcoinProjectText"
                  control={form.control}
                  label={t('dashboard.careerPortal.bitcoinProjectText')}
                  subLabel={t('dashboard.careerPortal.bitcoinProjectSubLabel')}
                  placeholder={t(
                    'dashboard.careerPortal.bitcoinProjectPlaceholder',
                  )}
                  type="area"
                />
              </div>

              <ButtonWithArrow
                variant="primary"
                mode="light"
                size="m"
                className="ml-auto mt-5 md:mt-10"
                type="submit"
              >
                {t('words.next')}
              </ButtonWithArrow>
            </>
          )}

          {/* Step 2 - Job search */}
          {!showLoader && step === 2 && (
            <>
              <TitleAndSubtitle
                title={t('dashboard.careerPortal.jobSearch')}
                subtitle={t('dashboard.careerPortal.jobSearchSubtitle')}
              />

              <section className="mb-5 md:mb-10">
                <div className="w-full flex max-md:flex-col gap-5 md:gap-[60px] md:items-center">
                  <div className="w-full max-w-xs md:max-w-[450px] flex flex-col gap-2">
                    <FormHeader
                      label={t('dashboard.careerPortal.selectRole')}
                      subLabel={t('dashboard.careerPortal.selectRoleSubLabel')}
                      mandatory
                    />
                    <Select
                      onValueChange={(value) => {
                        setSelectedRole(value);
                      }}
                    >
                      <SelectTrigger className="w-full" mode="light">
                        <SelectValue
                          placeholder={t(
                            'dashboard.careerPortal.selectJobTitle',
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent mode="light">
                        {Object.entries(sortedJobsByCategory ?? {}).map(
                          ([category, jobTitles]) => (
                            <SelectGroup key={category} className="mb-2">
                              <SelectLabel>
                                {t(
                                  `dashboard.careerPortal.jobCategories.${category}`,
                                )}
                              </SelectLabel>
                              {jobTitles.map((jobTitle) => (
                                <SelectItem
                                  key={jobTitle.id}
                                  value={jobTitle.id}
                                  className="text-sm truncate leading-[120%]"
                                >
                                  {t(
                                    `dashboard.careerPortal.jobTitles.${jobTitle.name}`,
                                  )}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="primary"
                    mode="light"
                    size={isMobile ? 'm' : 's'}
                    className="max-md:w-full max-md:max-w-xs md:self-end flex gap-2.5"
                    type="button"
                    onClick={() => {
                      rolesAppend({
                        roleId: selectedRole,
                        level: CareerRoleLevel.Student,
                      });
                    }}
                    disabled={
                      form
                        .getValues()
                        .roles.some((r) => r.roleId === selectedRole) ||
                      selectedRole === '' ||
                      rolesFields.length === 3
                    }
                  >
                    {t('dashboard.careerPortal.add')} <BiPlus />
                  </Button>
                </div>

                {form.formState.errors.roles && (
                  <FormMessage className="mt-2">
                    {t('dashboard.careerPortal.roleRequired')}
                  </FormMessage>
                )}

                {form.getValues().roles.length === 3 && (
                  <FormMessage className="mt-2">
                    {t('dashboard.careerPortal.maxRoles')}
                  </FormMessage>
                )}

                {rolesFields.length > 0 && (
                  <div className="w-full bg-newGray-6 rounded-[10px] shadow-course-navigation-sm flex flex-col gap-5 md:gap-[15px] p-4 mt-5 md:mt-4">
                    <h3 className="subtitle-small-caps-14px md:subtitle-medium-caps-18px text-newGray-1">
                      {t('dashboard.careerPortal.yourRoles')}
                    </h3>
                    {rolesFields.map((field, index) => (
                      <div
                        key={field.roleId}
                        className="flex max-md:flex-col gap-1 md:gap-[30px]"
                      >
                        <span className="w-full md:min-w-[194px] md:max-w-[194px] subtitle-large-18px md:subtitle-medium-med-16px text-black">
                          {t(
                            `dashboard.careerPortal.jobTitles.${
                              sortedJobTitles?.find(
                                (jobTitle) => jobTitle.id === field.roleId,
                              )?.name
                            }`,
                          )}
                        </span>
                        <FormSelect
                          {...form}
                          id={`roles[${index}].level`}
                          control={form.control}
                          label={t('dashboard.careerPortal.roleLevel')}
                          subLabel={t(
                            'dashboard.careerPortal.roleLevelSubLabel',
                          )}
                          options={Object.values(CareerRoleLevel).map(
                            (roleLevel) => ({
                              value: roleLevel,
                              label: t(
                                `dashboard.careerPortal.roleLevels.${roleLevel}`,
                              ),
                            }),
                          )}
                          className="w-full md:max-w-[450px]"
                          mandatory
                        />
                        <div className="flex w-full">
                          <span className="w-full max-w-[224px] md:hidden" />
                          <Button
                            className="md:self-end max-md:mt-[11px] md:ml-auto flex gap-2.5 shrink-0"
                            type="button"
                            variant="outline"
                            mode="light"
                            size="s"
                            onClick={() => rolesRemove(index)}
                          >
                            {t('words.delete')}
                            <FaRegTrashAlt />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <FormCheckboxGroup
                id="companySizes"
                control={form.control}
                label={t('dashboard.careerPortal.companySizePreference')}
                subLabel={t(
                  'dashboard.careerPortal.companySizePreferenceSubLabel',
                )}
                options={Object.values(CareerCompanySize).map(
                  (companySize) => ({
                    value: companySize,
                    label: t(
                      `dashboard.careerPortal.companySizes.${companySize}`,
                    ),
                  }),
                )}
                mandatory
                addNoPreferenceButton
              />

              <div className="flex flex-col mt-5 md:mt-10 gap-5 md:gap-10">
                <FormRadio
                  id="isAvailableFullTime"
                  control={form.control}
                  label={t('dashboard.careerPortal.availability')}
                  options={[
                    {
                      value: true,
                      label: t('dashboard.careerPortal.fullTime'),
                    },
                    {
                      value: false,
                      label: t('dashboard.careerPortal.partTime'),
                    },
                  ]}
                  mandatory
                />

                <FormSelect
                  id="remoteWorkPreference"
                  control={form.control}
                  label={t('dashboard.careerPortal.remoteWorkPreference')}
                  options={Object.values(CareerRemote).map((remote) => ({
                    value: remote,
                    label: t(
                      `dashboard.careerPortal.remoteWorkPreferences.${remote}`,
                    ),
                  }))}
                  mandatory
                />

                <FormText
                  id="expectedSalary"
                  control={form.control}
                  label={t('dashboard.careerPortal.expectedSalary')}
                  subLabel={t('dashboard.careerPortal.expectedSalarySubLabel')}
                  placeholder={t(
                    'dashboard.careerPortal.expectedSalaryPlaceholder',
                  )}
                  type="text"
                  hasMaxWidth={true}
                />
                <FormText
                  id="availabilityStart"
                  control={form.control}
                  label={t('dashboard.careerPortal.availabilityStart')}
                  placeholder={t(
                    'dashboard.careerPortal.availabilityStartPlaceholder',
                  )}
                  type="text"
                  hasMaxWidth={true}
                />
              </div>

              <div className="flex w-full justify-between items-center mt-5 md:mt-10">
                <Button
                  variant="outline"
                  mode="light"
                  size="m"
                  onClick={() => setStep(1)}
                  type="button"
                >
                  {t('words.previous')}
                </Button>

                <ButtonWithArrow
                  variant="primary"
                  mode="light"
                  size="m"
                  type="submit"
                >
                  {t('words.next')}
                </ButtonWithArrow>
              </div>
            </>
          )}

          {/* Step 3 - CV upload */}
          {!showLoader && step === 3 && (
            <>
              <TitleAndSubtitle
                title={t('dashboard.careerPortal.cvUpload')}
                subtitle={t('dashboard.careerPortal.cvUploadSubtitle')}
              />

              <div className="flex flex-col gap-1 md:gap-2 mb-5 md:mb-10">
                {/* Hidden file input */}
                <input
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    handleCVUpload(e);
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFileName(file.name);
                    }
                  }}
                />
                <div className="flex items-center rounded-[10px] overflow-hidden max-w-[614px] w-full hover:shadow-course-navigation-sm h-[46px]">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-full flex items-center px-3.5 rounded-l-[10px] border border-newBlack-4 md:text-lg leading-normal font-medium bg-darkOrange-5 text-white hover:cursor-pointer shrink-0 focus:border-newBlack-2 focus:bg-darkOrange-6"
                  >
                    {t('dashboard.careerPortal.chooseFile')}
                  </button>
                  <span className="h-full flex items-center px-3.5 body-16px md:label-medium-16px text-newBlack-5 truncate w-full border-r border-y border-newBlack-4 rounded-r-[10px]">
                    {selectedFileName ||
                      t('dashboard.careerPortal.noFileSelected')}
                  </span>
                </div>
                <p className="body-14px text-newGray-1">
                  {t('dashboard.careerPortal.acceptedFormat')}
                </p>
                {cvErrorMessage && <FormMessage>{cvErrorMessage}</FormMessage>}
                {form.formState.errors.cvUrl && (
                  <FormMessage>
                    {t('dashboard.careerPortal.cvRequired')}
                  </FormMessage>
                )}
              </div>

              <TitleAndSubtitle
                title={t('dashboard.careerPortal.motivation')}
                subtitle={t('dashboard.careerPortal.motivationSubtitle')}
              />

              <FormText
                id="motivationLetter"
                control={form.control}
                label={t('dashboard.careerPortal.motivationLetter')}
                subLabel={t('dashboard.careerPortal.motivationLetterSubLabel')}
                placeholder={t(
                  'dashboard.careerPortal.motivationLetterPlaceholder',
                )}
                type="area"
                hasMaxWidth={false}
                mandatory
              />

              <div className="flex w-full justify-between items-center mt-5 md:mt-10">
                <Button
                  variant="outline"
                  mode="light"
                  size="m"
                  onClick={() => setStep(2)}
                  type="button"
                >
                  {t('words.previous')}
                </Button>

                <ButtonWithArrow
                  variant="primary"
                  mode="light"
                  size="m"
                  type="submit"
                >
                  {t('words.next')}
                </ButtonWithArrow>
              </div>
            </>
          )}

          {/* Step 4 - Legal terms */}
          {!showLoader && step === 4 && (
            <>
              <TitleAndSubtitle
                title={t('dashboard.careerPortal.legalInformation')}
                subtitle={t('dashboard.careerPortal.legalInformationSubtitle')}
              />

              <article className="w-full bg-newGray-6 p-5 mt-5 md:mt-10 rounded-[10px] flex flex-col gap-5 md:gap-10">
                <h3 className="subtitle-medium-med-16px md:subtitle-large-med-20px text-dashboardSectionText">
                  {t('dashboard.careerPortal.termsAndConditions')}
                </h3>
                {/* TODO: add markdown support and backend automation of terms and conditions retrieval + handle language */}
                <p className="text-newBlack-1 label-medium-16px whitespace-pre-line pr-3.5 md:pr-10 max-h-[439px] md:max-h-[385px] overflow-y-scroll scrollbar-light">
                  <TermsAndConditions />
                </p>
              </article>

              <div className="flex flex-col gap-4 mt-5 md:mt-10">
                <FormCheckbox
                  id="areTermsAccepted"
                  control={form.control}
                  label={t('dashboard.careerPortal.acceptTermsAndConditions')}
                  mandatory
                />

                <FormCheckbox
                  id="allowReceivingEmails"
                  control={form.control}
                  label={t('dashboard.careerPortal.allowReceivingEmails')}
                  mandatory
                />
              </div>

              <div className="flex w-full justify-between items-center mt-5 md:mt-10">
                <Button
                  variant="outline"
                  mode="light"
                  size="m"
                  onClick={() => setStep(3)}
                  type="button"
                >
                  {t('words.previous')}
                </Button>

                <ButtonWithArrow
                  variant="primary"
                  mode="light"
                  size="m"
                  type="submit"
                  disabled={
                    form.getValues().areTermsAccepted === false ||
                    form.getValues().allowReceivingEmails === false
                  }
                >
                  {isMobile
                    ? t('words.next')
                    : t('dashboard.careerPortal.completeApplication')}
                </ButtonWithArrow>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  );
}

// Additional components

const StepsProcess = ({
  currentStep,
  validatedSteps,
}: {
  currentStep: number;
  validatedSteps: number;
}) => {
  const processSteps = [
    { label: t('dashboard.careerPortal.personalInformation'), stepNumber: 1 },
    { label: t('dashboard.careerPortal.jobSearch'), stepNumber: 2 },
    { label: t('dashboard.careerPortal.cvUploadLabel'), stepNumber: 3 },
    { label: t('dashboard.careerPortal.legalTerms'), stepNumber: 4 },
  ];

  return (
    <section
      className={cn(
        'w-full flex max-md:flex-col md:justify-between md:px-[30px]',
        currentStep === 0 ? 'mb-8 md:mb-[60px]' : 'max-md:hidden mb-10',
      )}
    >
      {processSteps.map((step) => (
        <React.Fragment key={step.stepNumber}>
          <StepIndicator
            highlighted={
              (currentStep === 0 && step.stepNumber <= validatedSteps) ||
              step.stepNumber <= currentStep
            }
            validated={
              step.stepNumber <= validatedSteps &&
              currentStep !== step.stepNumber
            }
            {...step}
          />
          {step.stepNumber !== 4 && (
            <div className="max-md:hidden w-full relative flex justify-center">
              <div
                className={cn(
                  'absolute bottom-4 w-full max-w-[80px] h-[6px] rounded-full',
                  (currentStep === 0 && step.stepNumber < validatedSteps) ||
                    step.stepNumber < currentStep
                    ? 'bg-darkOrange-5'
                    : 'bg-newGray-5',
                )}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </section>
  );
};

const StepsProcessMobile = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="w-full flex-col md:hidden mb-5">
      <span className="flex gap-1 items-center body-14px text-newGray-1">
        <IoMdCheckmarkCircle size={16} className="text-darkOrange-5" />
        {t('words.progress')} : {currentStep} / 4
      </span>
      <div className="flex gap-1 w-full">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            className={cn(
              'w-full h-1.5 rounded-full',
              currentStep >= index + 1 ? 'bg-darkOrange-5' : 'bg-newGray-5',
            )}
          />
        ))}
      </div>
    </div>
  );
};

const StepIndicator = ({
  stepNumber,
  label,
  highlighted,
  validated,
}: {
  stepNumber: number;
  label: string;
  highlighted: boolean;
  validated: boolean;
}) => {
  return (
    <div className="flex justify-center items-center w-full md:max-w-[95px] md:flex-col gap-4 md:gap-3 max-md:p-2 md:px-2.5">
      <span
        className={cn(
          'max-md:order-2 w-full md:text-center title-small-med-16px',
          highlighted ? 'text-newBlack-1' : 'text-newBlack-5',
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          'flex justify-center items-center rounded-full size-10 p-0.5 shrink-0 max-md:order-1 text-white text-xl leading-normal font-medium text-center',
          highlighted ? 'bg-darkOrange-5' : 'bg-newGray-3',
        )}
      >
        {validated ? <ImCheckmark /> : stepNumber}
      </div>
    </div>
  );
};

const DeleteProfileDialog = ({ onConfirm }: { onConfirm: () => void }) => {
  const isMobile = useSmaller('md');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'outline'} mode="light" size="m" type="button">
          {t('dashboard.careerPortal.deleteCareerProfile')}
          <FaRegTrashAlt className="ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="!bg-white !shadow-course-navigation !border-[#D1D5DB] !rounded-[20px] !flex !flex-col !w-full max-w-[87.5%] md:!max-w-[530px] !px-[15px] !py-5 md:!p-6 gap-6 md:!gap-10 !items-center"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="hidden">
            {t('dashboard.careerPortal.deleteCareerProfileTitle')}
          </DialogTitle>
          <DialogDescription className="hidden">
            {t('dashboard.careerPortal.deleteCareerProfileTitle')}
          </DialogDescription>
        </DialogHeader>

        <img
          src={PlanBLogoBlack}
          alt="Logo Plan ₿ Network"
          className="w-[186px] md:w-[266px] mx-auto"
        />

        <div className="w-full justify-center items-center flex flex-col gap-5 md:gap-6 md:py-5">
          <p className="text-darkOrange-5 title-medium-sb-18px md:title-large-24px text-center px-7">
            {t('dashboard.careerPortal.deleteCareerProfileTitle')}
          </p>

          <p className="subtitle-medium-16px md:subtitle-large-18px text-newBlack-1 text-center">
            {t('dashboard.careerPortal.cannotUndo')}
          </p>
        </div>

        <div className="!flex gap-4 md:!gap-[30px] pb-[30px]">
          <DialogClose asChild>
            <Button
              variant="primary"
              size={isMobile ? 's' : 'l'}
              className="!w-fit"
              onClick={onConfirm}
            >
              {t('words.delete')}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="outline"
              size={isMobile ? 's' : 'l'}
              className="w-fit"
            >
              {t('words.cancel')}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Form components

const TitleAndSubtitle = ({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle: string;
  className?: string;
}) => (
  <div
    className={cn(
      'flex flex-col mb-5 md:mb-10 gap-[5px] md:gap-[15px]',
      className,
    )}
  >
    <h3 className="text-dashboardSectionTitle title-medium-sb-18px md:title-large-sb-24px">
      {title}
    </h3>
    <p className="text-dashboardSectionText/75 body-14px md:body-16px">
      {subtitle}
    </p>
  </div>
);

const FormText = ({
  id,
  control,
  label,
  subLabel,
  placeholder,
  disabled,
  type = 'text',
  mandatory,
  hasMaxWidth = true,
}: {
  id: string;
  control: any;
  label: string;
  subLabel?: string;
  placeholder: string;
  disabled?: boolean;
  type: 'text' | 'area';
  mandatory?: boolean;
  hasMaxWidth?: boolean;
}) => {
  return (
    <FormField
      control={control}
      name={id}
      render={({ field }) => (
        <FormItem
          className={cn(
            'flex flex-col gap-y-2 w-full',
            hasMaxWidth
              ? type === 'text'
                ? 'max-w-[450px]'
                : 'max-w-[596px]'
              : '',
          )}
        >
          <FormHeader label={label} subLabel={subLabel} mandatory={mandatory} />
          <FormControl
            className={cn(
              'w-full',
              hasMaxWidth
                ? type === 'text'
                  ? 'max-w-[450px]'
                  : 'max-w-[596px]'
                : '',
            )}
          >
            {type === 'text' ? (
              <input
                type="text"
                placeholder={placeholder}
                className="w-full border border-newGray-4 bg-white rounded-lg px-4 py-[5px] placeholder:text-sm placeholder:leading-tight placeholder:text-newGray-3 placeholder:truncate"
                {...field}
              />
            ) : (
              <Textarea
                placeholder={placeholder}
                rows={3}
                disabled={disabled}
                className="!w-full !bg-white !border-newGray-4 placeholder:text-sm placeholder:leading-tight placeholder:text-newGray-3 placeholder:truncate"
                {...field}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const FormSwitch = ({
  id,
  control,
  label,
  trueText,
  falseText,
  disabled,
  mandatory,
}: {
  id: string;
  control: any;
  label: string;
  trueText: string;
  falseText: string;
  disabled?: boolean;
  mandatory?: boolean;
}) => {
  return (
    <FormField
      control={control}
      name={id}
      render={({ field }) => (
        <FormItem className="w-full flex max-md:flex-col gap-[15px] md:gap-10 md:items-center">
          <FormHeader label={label} mandatory={mandatory} />
          <FormControl>
            <div className="flex gap-2.5 items-center">
              <span className="text-black label-medium-16px">{falseText}</span>
              <Switch
                {...field}
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
                mode="light"
              />
              <span className="text-black label-medium-16px">{trueText}</span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const FormRadio = ({
  id,
  control,
  label,
  options,
  disabled,
  mandatory,
}: {
  id: string;
  control: any;
  label: string;
  options: { value: string | boolean; label: string }[];
  disabled?: boolean;
  mandatory?: boolean;
}) => {
  return (
    <FormField
      control={control}
      name={id}
      render={({ field }) => (
        <FormItem className="w-full flex flex-col gap-2">
          <FormHeader label={label} mandatory={mandatory} />
          <FormControl>
            <div className="flex flex-col gap-2 pl-[18px]">
              {options.map((option) => (
                <React.Fragment key={String(option.value)}>
                  <label className="flex gap-4 items-start">
                    <div className="mt-1 grid place-items-center">
                      <input
                        type="radio"
                        value={String(option.value)}
                        checked={String(field.value) === String(option.value)}
                        onChange={() => field.onChange(option.value)}
                        disabled={disabled}
                        className="peer col-start-1 row-start-1 size-3.5 appearance-none rounded-full border bg-white border-darkOrange-5 shrink-0"
                      />
                      <div className="col-start-1 row-start-1 w-2 h-2 rounded-full peer-checked:bg-darkOrange-5" />
                    </div>
                    <span className="text-black label-medium-16px">
                      {option.label}
                    </span>
                  </label>
                </React.Fragment>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const FormCheckbox = ({
  id,
  control,
  label,
  disabled,
  mandatory,
}: {
  id: string;
  control: any;
  label: string;
  disabled?: boolean;
  mandatory?: boolean;
}) => {
  return (
    <FormField
      control={control}
      name={id}
      render={({ field }) => (
        <FormItem className="w-full">
          <label className="w-full flex items-center gap-4">
            <FormControl>
              <div className="grid place-items-center">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={disabled}
                  className="peer col-start-1 row-start-1 size-3.5 appearance-none rounded-full border bg-transparent checked:bg-darkOrange-5 border-darkOrange-5 shrink-0"
                />
                <ImCheckmark
                  size={8}
                  className="col-start-1 row-start-1 text-transparent peer-checked:text-white shrink-0 pointer-events-none"
                />
              </div>
            </FormControl>
            <span className="text-black subtitle-medium-med-16px">
              {label}
              {mandatory && <span className="text-red-5 ml-0.5">*</span>}
            </span>
          </label>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const FormCheckboxGroup = ({
  id,
  control,
  label,
  subLabel,
  options,
  disabled,
  mandatory,
  addNoPreferenceButton,
}: {
  id: string;
  control: any;
  label: string;
  subLabel?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  mandatory?: boolean;
  addNoPreferenceButton?: boolean;
}) => {
  return (
    <FormField
      control={control}
      name={id}
      render={({ field }) => (
        <FormItem className="w-full flex flex-col gap-2">
          <FormHeader label={label} subLabel={subLabel} mandatory={mandatory} />
          <FormControl>
            <div className="flex flex-col gap-2 pl-[18px]">
              {options.map((option) => (
                <label key={option.value} className="flex gap-4 items-center">
                  <div className="grid place-items-center">
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={field.value.includes(option.value)}
                      onChange={(e) => {
                        const newValue = e.target.checked
                          ? [...field.value, option.value]
                          : field.value.filter(
                              (v: string) => v !== option.value,
                            );
                        field.onChange(newValue);
                      }}
                      disabled={disabled}
                      className="peer col-start-1 row-start-1 size-3.5 appearance-none rounded-full border bg-white checked:bg-darkOrange-5 border-darkOrange-5 shrink-0"
                    />
                    <ImCheckmark
                      size={8}
                      className="col-start-1 row-start-1 text-transparent peer-checked:text-white shrink-0 pointer-events-none"
                    />
                  </div>
                  <span className="text-black label-medium-16px">
                    {option.label}
                  </span>
                </label>
              ))}
              {addNoPreferenceButton && (
                <label className="flex gap-4 items-center">
                  <div className="grid place-items-center">
                    <input
                      type="checkbox"
                      checked={field.value.length === options.length}
                      onChange={(e) => {
                        const newValue = e.target.checked
                          ? options.map((option) => option.value)
                          : [];
                        field.onChange(newValue);
                      }}
                      disabled={disabled}
                      className="peer col-start-1 row-start-1 size-3.5 appearance-none rounded-full border bg-white checked:bg-darkOrange-5 border-darkOrange-5 shrink-0"
                    />
                    <ImCheckmark
                      size={8}
                      className="col-start-1 row-start-1 text-transparent peer-checked:text-white shrink-0 pointer-events-none"
                    />
                  </div>
                  <span className="text-black label-medium-16px">
                    {t('dashboard.careerPortal.companySizes.noPreference')}
                  </span>
                </label>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const FormSelect = ({
  id,
  control,
  label,
  subLabel,
  options,
  disabled,
  mandatory,
  className,
}: {
  id: string;
  control: any;
  label: string;
  subLabel?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  mandatory?: boolean;
  className?: string;
}) => {
  return (
    <FormField
      control={control}
      name={id}
      render={({ field }) => (
        <FormItem className="w-full flex flex-col gap-2">
          <FormHeader label={label} subLabel={subLabel} mandatory={mandatory} />
          <FormControl>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn('w-full max-w-xs md:max-w-[268px]', className)}
                mode="light"
              >
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent mode="light">
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-sm truncate leading-[120%]"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const FormHeader = ({
  label,
  subLabel,
  mandatory,
}: {
  label: string;
  subLabel?: string;
  mandatory?: boolean;
}) => {
  return (
    <FormLabel className="flex flex-col gap-2" removeDefaultClasses>
      <span className="text-black subtitle-medium-med-16px whitespace-pre-line">
        {label}
        {mandatory && <span className="text-red-5 ml-0.5">*</span>}
      </span>

      {subLabel && <span className="text-newGray-1 body-14px">{subLabel}</span>}
    </FormLabel>
  );
};

// Todo : sync term and conditions from repo + add markdown support
const TermsAndConditions = () => {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-bold">Terms and Conditions - Job Portal</h1>
      <p>Last Update: January 10, 2025</p>

      <h2 className="font-bold">1. Acceptance of Terms</h2>
      <p>
        By accessing and using the Plan ₿ Network job portal ("Portal"), you
        agree to be bound by these Terms and Conditions ("Terms"). If you do not
        agree to these Terms, please do not use the Portal.
      </p>

      <h2 className="font-bold">2. User Eligibility</h2>
      <ul className="list-disc ml-5">
        <li>
          You must be of legal working age in your jurisdiction to use the
          Portal
        </li>
        <li>
          You must have the legal capacity to enter into a binding agreement
        </li>
        <li>
          You warrant that all information provided is accurate and current
        </li>
      </ul>

      <h2 className="font-bold">3. Account Creation and Security</h2>
      <ul className="list-disc ml-5">
        <li>
          You are responsible for maintaining the confidentiality of your
          account credentials
        </li>
        <li>You agree to notify us immediately of any unauthorized access</li>
        <li>
          We reserve the right to suspend or terminate accounts that violate
          these Terms
        </li>
      </ul>

      <h2 className="font-bold">4. Data Collection and Privacy</h2>
      <ul className="list-disc ml-5">
        <li>
          Your use of the Portal is subject to our Candidate Privacy Notice
          dated January 10th, 2025.
        </li>
        <li>
          We collect and process personal data in accordance with GDPR standards
        </li>
        <li>
          By using the Portal, you consent to:
          <ul className="list-disc ml-5">
            <li>
              The collection of your personal and professional information
            </li>
            <li>
              Storage of your information permanently unless deletion is
              requested
            </li>
            <li>
              Transfer of your data to international locations with appropriate
              security measures
            </li>
            <li>
              Sharing of your information with business partners under Fulgur
              Ventures
            </li>
          </ul>
        </li>
      </ul>

      <h2 className="font-bold">5. User Obligations</h2>
      <p>You agree to:</p>
      <ul className="list-disc ml-5">
        <li>Provide accurate and truthful information</li>
        <li>Keep your profile information updated</li>
        <li>Not submit any false, misleading, or fraudulent applications</li>
        <li>Not use the Portal for any unauthorized or illegal purposes</li>
        <li>Not attempt to circumvent any security measures</li>
      </ul>

      <h2 className="font-bold">6. Intellectual Property</h2>
      <ul className="list-disc ml-5">
        <li>
          All content on the Portal is the property of Plan ₿ Network or its
          licensors
        </li>
        <li>
          You may not copy, modify, or distribute Portal content without
          authorization
        </li>
        <li>
          You retain ownership of your submitted content but grant us a license
          to use it for recruitment purposes
        </li>
      </ul>

      <h2 className="font-bold">7. Application Process</h2>
      <ul className="list-disc ml-5">
        <li>
          Submission of an application does not guarantee consideration or
          employment
        </li>
        <li>
          Applications will be shared with business partners for recruitment
          purposes
        </li>
      </ul>

      <h2 className="font-bold">8. Data Protection Rights</h2>
      <p>You have the right to:</p>
      <ul className="list-disc ml-5">
        <li>Access your personal data</li>
        <li>Request corrections to inaccurate information</li>
        <li>Request deletion of your data</li>
        <li>Object to certain types of data processing</li>
        <li>Request data portability</li>
        <li>Withdraw consent at any time</li>
      </ul>
      <p>Please find more information in our Candidate Privacy Notice.</p>

      <h2 className="font-bold">9. Modifications to Terms</h2>
      <ul className="list-disc ml-5">
        <li>We reserve the right to modify these Terms at any time</li>
        <li>
          Continued use of the Portal after changes constitutes acceptance of
          modified Terms
        </li>
        <li>Users should regularly review Terms for updates</li>
      </ul>

      <h2 className="font-bold">10. Governing Law</h2>
      <ul className="list-disc ml-5">
        <li>
          These Terms are governed by applicable laws detailed in General Terms
          and Conditions of Sale
        </li>
        <li>
          Any disputes shall be subject to the exclusive jurisdiction of
          competent courts
        </li>
        <li>We apply European data protection standards (GDPR) globally</li>
      </ul>

      <h2 className="font-bold">11. Termination</h2>
      <p>We reserve the right to:</p>
      <ul className="list-disc ml-5">
        <li>Terminate or suspend access to the Portal without prior notice</li>
        <li>Remove or disable access to content at our discretion</li>
        <li>Take action against users violating these Terms</li>
      </ul>

      <h2 className="font-bold">12. Contact Information</h2>
      <p>For questions or concerns regarding these Terms, contact:</p>
      <ul className="list-disc ml-5">
        <li>Email: contact@planb.network</li>
      </ul>

      <h2 className="font-bold">13. Severability</h2>
      <p>
        If any provision of these Terms is found to be unenforceable, the
        remaining provisions will continue in full force and effect.
      </p>
    </div>
  );
};
