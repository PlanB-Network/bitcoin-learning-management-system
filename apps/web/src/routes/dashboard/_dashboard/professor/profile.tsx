import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsTwitterX } from 'react-icons/bs';
import { FiGlobe } from 'react-icons/fi';

import { Tabs, TabsContent, TextTag, cn } from '@blms/ui';

import Nostr from '#src/assets/icons/nostr.svg?react';
import { TabsListUnderlined } from '#src/components/Tabs/TabsListUnderlined.js';
import { AppContext } from '#src/providers/context.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';

import { MakeModificationBlock } from './-components/make-modification.tsx';

export const Route = createFileRoute('/dashboard/_dashboard/professor/profile')(
  {
    component: DashboardProfessorProfile,
  },
);

function DashboardProfessorProfile() {
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const { session } = useContext(AppContext);
  if (!session) {
    navigate({ to: '/' });
  }

  const [currentValue, setCurrentTab] = useState('profile');

  const onTabChange = (value: string) => {
    setCurrentTab(value);
  };

  const tabs = [
    {
      value: 'profile',
      key: 'profile',
      text: t('dashboard.teacher.profile.publicProfile'),
      active: currentValue === 'profile',
    },
    {
      value: 'notifications',
      key: 'notifications',
      text: t('dashboard.teacher.profile.notifications'),
      active: currentValue === 'notifications',
      disabled: true,
    },
  ];

  const infoTextClasses =
    'flex flex-col py-1 px-4 bg-white rounded-md border border-newGray-4 overflow-y-scroll text-newBlack-3 body-14px !leading-[120%] whitespace-pre-line scrollbar-thin';

  return (
    <div className="flex flex-col gap-4 lg:gap-8">
      <div className="flex max-lg:flex-col lg:items-center gap-2 lg:gap-5">
        <h3 className="display-small-reg-32px">
          {t('dashboard.teacher.profile.account')}
        </h3>
        <TextTag
          size={window.innerWidth < 1024 ? 'verySmall' : 'large'}
          className="uppercase w-fit"
        >
          {t('dashboard.teacher.profile.teacher')}
        </TextTag>
      </div>
      <Tabs
        defaultValue="profile"
        value={currentValue}
        onValueChange={onTabChange}
        className="w-full"
      >
        <TabsListUnderlined tabs={tabs} />
        <TabsContent value="profile" className="flex flex-col mt-4 lg:mt-10">
          <h4 className="mb-2.5 lg:mb-4 text-[#060B15] title-medium-sb-18px lg:title-large-sb-24px">
            {t('dashboard.teacher.profile.teacherProfile')}
          </h4>
          <p className="mb-5 lg:mb-6 text-[#050A14BF] body-14px lg:body-16px">
            {t('dashboard.teacher.profile.publicProfileDescription')}
          </p>

          <section className="flex max-lg:flex-col gap-5 lg:gap-12 lg:bg-newGray-6 lg:shadow-course-navigation rounded-[20px] lg:p-5 w-full max-w-[820px] max-lg:max-w-md mb-9">
            <div className="flex flex-col lg:items-center gap-5 lg:gap-7 w-[227px] shrink-0">
              <span className="subtitle-large-med-20px text-black lg:text-center">
                {session?.user.professorName}
              </span>
              <img
                src={computeAssetCdnUrl(
                  session?.user.professorLastCommit || '',
                  `${session?.user.professorPath}/assets/profile.webp`,
                )}
                alt={session?.user.professorName}
                className="rounded-full size-[154px]"
              />
            </div>
            <div className="flex flex-col gap-5">
              {/* Description */}
              <div className="flex flex-col gap-2">
                <span className="leading-tight font-medium text-[#050A14]">
                  {t('dashboard.teacher.profile.description')}
                </span>
                <p className="text-sm text-newGray-1 leading-tight">
                  {t('dashboard.teacher.profile.publicDescription')}
                </p>
                <p className={cn('h-[100px]', infoTextClasses)}>
                  {session?.user.professorShortBio[i18n.language] ||
                    t('dashboard.teacher.profile.noShortBio')}
                </p>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap w-full gap-2 lg:gap-3">
                {session?.user.professorTags &&
                session?.user.professorTags[0] !== 'NULL'
                  ? session?.user.professorTags.map((tag) => (
                      <TextTag
                        key={tag}
                        size={window.innerWidth < 1024 ? 'verySmall' : 'large'}
                        className="capitalize"
                      >
                        {tag}
                      </TextTag>
                    ))
                  : t('dashboard.teacher.profile.noTags')}
              </div>
              {/* Links */}
              <div className="flex max-xl:flex-col w-full gap-2.5 xl:gap-5 lg:border-l xl:border-none border-newGray-1">
                <div className="flex flex-col gap-2.5 xl:border-l border-newGray-1 lg:pl-2.5 w-full max-w-[280px] xl:w-[240px]">
                  {session?.user.professorTwitterUrl && (
                    <div className="flex gap-5 items-center">
                      <BsTwitterX size={18} className="shrink-0" />
                      <Link
                        to={session.user.professorTwitterUrl}
                        className="w-fit truncate body-14px text-black"
                        target="_blank"
                      >
                        {session.user.professorTwitterUrl}
                      </Link>
                    </div>
                  )}
                  {session?.user.professorWebsiteUrl && (
                    <div className="flex gap-5 items-center">
                      <FiGlobe size={18} className="shrink-0" />
                      <Link
                        to={session.user.professorWebsiteUrl}
                        className="w-fit truncate body-14px text-black"
                        target="_blank"
                      >
                        {session.user.professorWebsiteUrl}
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2.5 xl:border-l border-newGray-1 lg:pl-2.5 w-full max-w-[280px] xl:w-[240px]">
                  {session?.user.professorNostr && (
                    <div className="flex gap-5 items-center">
                      <Nostr className="size-[18px] fill-black shrink-0" />
                      <div
                        className="w-fit truncate body-14px text-black cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            session.user.professorNostr,
                          );
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            navigator.clipboard.writeText(
                              session.user.professorNostr,
                            );
                          }
                        }}
                        title="Click to copy Nostr address"
                      >
                        {session.user.professorNostr}
                      </div>
                    </div>
                  )}
                  {session?.user.professorGithubUrl && (
                    <div className="flex gap-5 items-center">
                      <BsGithub size={18} className="shrink-0" />
                      <Link
                        to={session.user.professorGithubUrl}
                        className="w-fit truncate body-14px text-black"
                        target="_blank"
                      >
                        {session.user.professorGithubUrl}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Billing */}
          <div className="flex flex-col">
            <h4 className="mb-2.5 lg:mb-4 text-[#060B15] title-medium-sb-18px lg:title-large-sb-24px">
              {t('dashboard.teacher.profile.billingInformations')}
            </h4>
            <p className="mb-5 lg:mb-6 text-[#050A14BF] body-14px lg:body-16px">
              {t('dashboard.teacher.profile.enterTipsInformations')}
            </p>
            <div className="flex flex-col gap-2 w-full">
              <span className="text-[#050A14] font-medium leading-tight">
                {t('dashboard.teacher.profile.lightningAddress')}
              </span>
              <div className="flex flex-wrap items-end gap-x-9 gap-y-2">
                <p className="py-2 px-4 bg-white w-full max-w-[302px] rounded-md border border-newGray-4 text-sm leading-tight text-newBlack-3 overflow-hidden text-ellipsis body-14px overflow-y-scroll no-scrollbar">
                  {session?.user.professorLightningAddress ||
                    t('dashboard.teacher.profile.noLightningAddress')}
                </p>
              </div>
            </div>
          </div>

          {/* Modification */}
          <MakeModificationBlock
            title={t('dashboard.teacher.profile.makeModifications')}
            titleLink={`https://github.com/PlanB-Network/bitcoin-educational-content`}
            text="dashboard.teacher.profile.tutorialModification"
            textLink="/tutorials/others/create-teacher-profile"
          />
        </TabsContent>

        <TabsContent value="notifications"></TabsContent>
      </Tabs>
    </div>
  );
}
