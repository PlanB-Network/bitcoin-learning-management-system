import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import type { ChangeEvent } from 'react';
import { useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
} from '@blms/ui';

import SignInIconLight from '#src/assets/icons/profile_log_in_light.svg';
import { useDisclosure } from '#src/hooks/use-disclosure.js';
import { AppContext } from '#src/providers/context.js';
import { getPictureUrl, setProfilePicture } from '#src/services/user.js';

import { ChangePictureModal } from '../-components/change-picture-modal.tsx';

export const Route = createFileRoute('/dashboard/_dashboard/professor/profile')(
  {
    component: DashboardProfessorProfile,
  },
);

function DashboardProfessorProfile() {
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const { user, setUser, session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }

  const [file, setFile] = useState<File | null>(null);
  const pictureUrl = getPictureUrl(user);
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
      .then(setUser)
      .finally(profilePictureDisclosure.close)
      .catch((error) => console.error('Error:', error));
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <div className="flex items-center gap-5">
        <h3 className="display-small-reg-32px">
          {t('dashboard.teacher.profile.account')}
        </h3>
        <span className="flex h-fit p-1 lg:py-[3px] lg:px-2 justify-center items-center rounded-md bg-[rgba(204,204,204,0.50)] text-newBlack-3 desktop-typo1 uppercase max-lg:hidden">
          {t('dashboard.teacher.profile.teacher')}
        </span>
      </div>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger
            value="profile"
            className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
          >
            {t('dashboard.teacher.profile.publicProfile')}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-gray-500 data-[state=active]:text-black data-[state=inactive]:hover:text-black text-wrap"
            disabled
          >
            {t('dashboard.teacher.profile.notifications')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="flex flex-col mt-4 lg:mt-10">
          <h4 className="mb-4 text-[#060B15] title-large-sb-24px">
            {t('dashboard.teacher.profile.publicProfile')}
          </h4>
          <p className="mb-6 text-[#050A14BF] body-16px">
            {t('dashboard.teacher.profile.publicProfileDescription')}
          </p>
          <div className="flex flex-wrap gap-x-20 gap-y-5">
            {/* Short bio */}
            <div className="flex flex-col gap-2 w-full max-w-lg">
              <span className="text-[#050A14] text-sm font-medium leading-tight">
                {t('dashboard.teacher.profile.writeShortBio')}
                <span className="text-red-1 ml-1">*</span>
              </span>
              <p className="text-newGray-1 text-sm leading-tight">
                {t('dashboard.teacher.profile.publicDescription')}
              </p>
              <div className="flex items-end gap-9">
                <p className="h-[100px] py-1 px-4 bg-[#E9E9E9] w-[302px] rounded-md border border-[#7373731A] overflow-y-scroll text-newGray-1 body-14px">
                  {session?.user.professorShortBio[i18n.language] ||
                    t('dashboard.teacher.profile.noShortBio')}
                </p>
                <Link to="https://github.com/PlanB-Network/bitcoin-educational-content">
                  <Button variant="outline" size="s" mode="light">
                    {t('dashboard.profile.edit')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Profile picture */}
            <div className="flex flex-col">
              <label
                htmlFor="profilePictureFile"
                className="text-[#050A14] subtitle-small-med-14px"
              >
                {t('dashboard.profile.profilePicture')}
              </label>

              <div className="mt-3 flex gap-8 items-end">
                <img
                  src={pictureUrl ?? SignInIconLight}
                  alt="Profile"
                  className="rounded-full size-24"
                />

                <div>
                  <Button variant="outline" size="s" mode="light">
                    <label
                      htmlFor="profilePictureFile"
                      className="cursor-pointer"
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

          {/* Tags */}
          <div className="flex flex-col gap-2 w-full mt-5 lg:mt-12">
            <span className="text-[#050A14] text-sm font-medium leading-tight">
              {t('dashboard.teacher.profile.chooseTags')}
              <span className="text-red-1 ml-1">*</span>
            </span>
            <p className="text-newGray-1 text-sm leading-tight">
              {t('dashboard.teacher.profile.descriptionTags')}
            </p>
            <div className="flex flex-wrap items-end gap-x-9 gap-y-2">
              <p className="flex gap-1 flex-wrap py-1 px-4 bg-[#E9E9E9] w-min lg:max-w-[302px] rounded-md border border-[#7373731A]  text-newGray-1 body-14px">
                {session?.user.professorTags &&
                session?.user.professorTags[0] !== 'NULL'
                  ? session?.user.professorTags.map((tag) => (
                      <Tag
                        className="!bg-newGray-4 !text-newBlack-3 !border-newBlack-3 !text-sm"
                        key={tag}
                      >
                        {tag}
                      </Tag>
                    ))
                  : t('dashboard.teacher.profile.noTags')}
              </p>
              <Link to="https://github.com/PlanB-Network/bitcoin-educational-content">
                <Button variant="outline" size="s">
                  {t('dashboard.profile.edit')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Billing */}
          <div className="flex flex-col mt-10 lg:mt-16">
            <h4 className="mb-4 text-[#060B15] title-large-sb-24px">
              {t('dashboard.teacher.profile.billingInformations')}
            </h4>
            <p className="mb-6 text-[#050A14BF] body-16px">
              {t('dashboard.teacher.profile.enterTipsInformations')}
            </p>
            <div className="flex flex-col gap-2 w-full">
              <span className="text-[#050A14] text-sm font-medium leading-tight">
                {t('dashboard.teacher.profile.lightningAddress')}
              </span>
              <div className="flex flex-wrap items-end gap-x-9 gap-y-2">
                <p className="py-1 px-4 bg-[#E9E9E9] w-full lg:w-fit lg:max-w-lg rounded-md border border-[#7373731A] text-newGray-1 body-14px overflow-y-scroll">
                  {session?.user.professorLightningAddress ||
                    t('dashboard.teacher.profile.noLightningAddress')}
                </p>
                <Link to="https://github.com/PlanB-Network/bitcoin-educational-content">
                  <Button variant="outline" size="s" mode="light">
                    {t('dashboard.profile.edit')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Modification */}
          <div className="flex flex-col gap-2.5 mt-8 lg:mt-24">
            <Link
              to="https://github.com/PlanB-Network/bitcoin-educational-content"
              className="w-fit underline underline-offset-2 text-darkOrange-5 hover:text-darkOrange-6 leading-tight lg:text-xl"
            >
              {t('dashboard.teacher.profile.makeModifications')}
            </Link>
            <p className="label-normal-16px lg:label-large-20px text-[#050A14BF]">
              <Trans i18nKey="dashboard.teacher.profile.tutorialModification">
                <Link
                  className="text-newBlue-1 hover:text-darkOrange-5"
                  to="/tutorials/others/create-teacher-profile"
                >
                  Github Tutorial
                </Link>
              </Trans>
            </p>
          </div>
        </TabsContent>

        {/* To do later */}
        <TabsContent value="notifications"></TabsContent>
      </Tabs>

      <ChangePictureModal
        file={file}
        onChange={onPictureChange}
        onClose={profilePictureDisclosure.close}
        isOpen={profilePictureDisclosure.isOpen}
      />
    </div>
  );
}
