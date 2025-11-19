import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared';
import { cn, Loader, TextTag } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TbBrandGithub,
  TbBrandLinkedin,
  TbBrandX,
  TbLink,
} from 'react-icons/tb';
import Nostr from '#src/assets/icons/nostr.svg?react';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.js';
import { isUUID, resourceImgUrl, trpc } from '#src/utils/index.ts';
import { MakeModificationBlock } from '../dashboard/_dashboard/professor/-components/make-modification.tsx';

export const Route = createFileRoute('/$lang/account/teacher-profile')({
  component: ProfessorProfile,
});

function ProfessorProfile() {
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();

  const { session, user } = useContext(AppContext);

  const { data: professor, isFetched } = useQuery(
    trpc.content.getProfessor.queryOptions(
      {
        language: i18n.language,
        professorId: user?.professorId ?? '',
      },
      {
        enabled: isUUID(user?.professorId),
      },
    ),
  );

  const infoTextClasses =
    'flex flex-col py-1 px-4 bg-white rounded-md border border-newGray-4 overflow-y-scroll text-newBlack-3 body-14px !leading-[120%] whitespace-pre-line scrollbar-light';

  useEffect(() => {
    if (session === null) {
      navigate({ to: '/' });
    } else if (!canAccess(UserRole.Professor)(session?.user)) {
      navigate({ to: '/my-courses' });
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  return (
    <PageLayout
      layoutSize="base"
      title={t('account.myTeacherProfile')}
      tabs={[
        { id: 'account', label: t('words.account'), href: '/account' },
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
      <div className="flex flex-col gap-4 lg:gap-8">
        {!isFetched && <Loader size="s" />}
        {isFetched && professor && (
          <div className="flex flex-col">
            <p className="mb-5 lg:mb-6 text-dashboardSectionText/75 body-14px lg:body-16px">
              {t('dashboard.teacher.profile.publicProfileDescription')}
            </p>

            <section className="flex max-lg:flex-col gap-5 lg:gap-12 lg:bg-newGray-6 lg:shadow-course-navigation rounded-[20px] lg:p-5 w-full mb-9">
              <div className="flex flex-col lg:items-center gap-5 lg:gap-7 w-[227px] shrink-0">
                <span className="subtitle-large-med-20px text-black lg:text-center">
                  {professor.name}
                </span>
                <img
                  src={resourceImgUrl(professor, 'profile.webp')}
                  alt={professor.name}
                  className="rounded-full size-[154px]"
                />
              </div>
              <div className="flex flex-col gap-5 w-full">
                {/* Description */}
                <div className="flex flex-col gap-2">
                  <span className="leading-tight font-medium text-dashboardSectionText">
                    {t('dashboard.teacher.profile.description')}
                  </span>
                  <p className="text-sm text-newGray-1 leading-tight">
                    {t('dashboard.teacher.profile.publicDescription')}
                  </p>
                  <p className={cn('h-25', infoTextClasses)}>
                    {professor.shortBio ||
                      t('dashboard.teacher.profile.noShortBio')}
                  </p>
                </div>
                {/* Tags */}
                <div className="flex flex-wrap w-full gap-2 lg:gap-3">
                  {professor.tags && professor.tags[0] !== 'NULL'
                    ? professor.tags.map((tag) => (
                        <TextTag
                          key={tag}
                          size={window.innerWidth < 1024 ? 'small' : 'base'}
                          className="capitalize"
                          mode="light100"
                        >
                          {tag}
                        </TextTag>
                      ))
                    : t('dashboard.teacher.profile.noTags')}
                </div>
                {/* Links */}
                <div className="flex flex-col gap-2.5 lg:border-l border-newGray-1 lg:pl-2.5 w-full max-w-[280px]">
                  {professor.links.twitter && (
                    <div className="flex gap-5 items-center">
                      <TbBrandX size={18} className="shrink-0" />
                      <Link
                        to={professor.links.twitter}
                        className="w-fit truncate body-14px text-black"
                        target="_blank"
                      >
                        {professor.links.twitter}
                      </Link>
                    </div>
                  )}
                  {professor.links.website && (
                    <div className="flex gap-5 items-center">
                      <TbLink size={18} className="shrink-0" />
                      <Link
                        to={professor.links.website}
                        className="w-fit truncate body-14px text-black"
                        target="_blank"
                      >
                        {professor.links.website}
                      </Link>
                    </div>
                  )}
                  {professor.links.linkedin && (
                    <div className="flex gap-5 items-center">
                      <TbBrandLinkedin size={18} className="shrink-0" />
                      <Link
                        to={professor.links.linkedin}
                        className="w-fit truncate body-14px text-black"
                        target="_blank"
                      >
                        {professor.links.linkedin}
                      </Link>
                    </div>
                  )}
                  {professor.links.nostr && (
                    <div className="flex gap-5 items-center">
                      <Nostr className="size-[18px] fill-black shrink-0" />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            professor.links.nostr || '',
                          );
                        }}
                        className="w-fit truncate body-14px text-black cursor-pointer"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            navigator.clipboard.writeText(
                              professor.links.nostr || '',
                            );
                          }
                        }}
                        title="Click to copy Nostr address"
                      >
                        {professor.links.nostr}
                      </button>
                    </div>
                  )}
                  {professor.links.github && (
                    <div className="flex gap-5 items-center">
                      <TbBrandGithub size={18} className="shrink-0" />
                      <Link
                        to={professor.links.github}
                        className="w-fit truncate body-14px text-black"
                        target="_blank"
                      >
                        {professor.links.github}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Billing */}
            <div className="flex flex-col">
              <h4 className="mb-2.5 lg:mb-4 text-dashboardSectionTitle title-medium-sb-18px lg:title-large-sb-24px">
                {t('dashboard.teacher.profile.billingInformation')}
              </h4>
              <p className="mb-5 lg:mb-6 text-dashboardSectionText/75 body-14px lg:body-16px">
                {t('dashboard.teacher.profile.enterTipsInformation')}
              </p>
              <div className="flex flex-col gap-2 w-full">
                <span className="text-dashboardSectionText font-medium leading-tight">
                  {t('dashboard.teacher.profile.lightningAddress')}
                </span>
                <div className="flex flex-wrap items-end gap-x-9 gap-y-2">
                  <p className="py-2 px-4 bg-white w-full max-w-[302px] rounded-md border border-newGray-4 text-sm leading-tight text-newBlack-3 overflow-hidden text-ellipsis body-14px overflow-y-scroll no-scrollbar">
                    {professor.tips.lightningAddress ||
                      t('dashboard.teacher.profile.noLightningAddress')}
                  </p>
                </div>
              </div>
            </div>

            {/* Modification */}
            <MakeModificationBlock
              title={t('dashboard.teacher.profile.makeModifications')}
              titleLink="https://github.com/PlanB-Network/bitcoin-educational-content"
              text="dashboard.teacher.profile.tutorialModification"
              textLink="/tutorials/others/contribution/8ba9ba49-8fac-437a-a435-c38eebc8f8a4"
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
