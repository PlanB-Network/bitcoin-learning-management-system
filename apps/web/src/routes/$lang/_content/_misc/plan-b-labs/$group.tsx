import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';

import {
  DividerVertical,
  Loader,
  Tabs,
  TabsList,
  TabsTrigger,
  TextTag,
} from '@blms/ui';
import { t } from 'i18next';
import { z } from 'zod';
import LabIcon from '#src/assets/icons/lab.svg';
import LightningWhiteIcon from '#src/assets/icons/lightning_white.svg';
import MiningIcon from '#src/assets/icons/mining_white.svg';
import PrivacyIcon from '#src/assets/icons/privacy.svg';
import PlanBLabsLogo from '#src/assets/logo/plan_b_labs_logo_horizontal.svg';

import type { FullProfessor } from '@blms/types';
import { Suspense } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdLiveTv, MdPerson } from 'react-icons/md';
import { AuthorCard } from '#src/components/author-card.tsx';
import { MainLayout } from '#src/components/main-layout.js';
import { ReactPlayer } from '#src/components/react-player.tsx';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import {
  formatDate,
  getDateString,
  getTimeString,
  userTimeZone,
} from '#src/utils/date.ts';
import { cdnUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.ts';
const GlossaryMarkdownBody = React.lazy(
  () => import('#src/components/Markdown/glossary-markdown-body.js'),
);

export const Route = createFileRoute(
  '/$lang/_content/_misc/plan-b-labs/$group',
)({
  params: {
    parse: (params) => ({
      lang: z.string().parse(params.lang),
      group: z.string().parse(params.group),
    }),
    stringify: ({ lang, group }) => ({
      lang: lang,
      group: `${group}`,
    }),
  },
  component: PlanBLabs,
});

export const labsTabs = [
  {
    id: 'lightning',
    label: 'Lightning',
    href: '/plan-b-labs/lightning',
    icon: LightningWhiteIcon,
  },
  {
    id: 'mining',
    label: 'Mining',
    href: '/plan-b-labs/mining',
    icon: MiningIcon,
  },
  {
    id: 'privacy',
    label: 'Privacy',
    href: '/plan-b-labs/privacy',
    icon: PrivacyIcon,
  },
];

function PlanBLabs() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const activeItem =
    labsTabs.find((tab) => tab.href.includes(params.group)) || labsTabs[0];

  const { data: lab, isFetched } = trpc.content.getLab.useQuery({
    group: params.group,
  });

  const { data: professor } = trpc.content.getProfessor.useQuery(
    {
      professorId: lab?.lab?.professorId!,
      language: i18n.language,
    },
    {
      enabled: lab?.lab?.professorId !== undefined,
    },
  );

  const lastSession = lab?.sessions?.at(0);

  return (
    <MainLayout variant="dark" footerVariant="dark">
      {/* Header */}
      <div className="flex flex-col items-center mt-12 text-center gap-6 self-center">
        <div className="flex flex-col items-center md:gap-6 md:flex-row lg:w-[800px] px-4">
          <img
            src={PlanBLabsLogo}
            alt="Logo Plan ₿ Labs"
            className="w-36 md:w-60"
          />
          <DividerVertical className="h-16 max-md:hidden" />
          <h1 className="text-lg lg:min-w-[500px] max-md:font-semibold md:display-small-med-32px text-center md:text-left">
            {t('labs.title')}
          </h1>
        </div>
        <div className="lg:w-[950px] px-4 max-lg:body-16px lg:subtitle-large-18px">
          <p>
            {t('labs.description1')} {t('labs.description2')}
          </p>
        </div>
      </div>

      {!isFetched ? (
        <Loader size={'s'} />
      ) : (
        <>
          <Tabs
            defaultValue={activeItem.label}
            className="pt-9 md:pt-12 border-b-[1px] border-newGray-1 bg-gradient-tabs pl-4 md:pl-[max(20px,calc((100vw-1200px)/2))]"
          >
            <TabsList size="l" mode="dark2" className="max-md:gap-3">
              <img
                src={LabIcon}
                alt="Lab logo"
                className="w-10 max-md:hidden"
              />
              {labsTabs.map((tab) => (
                <TabsTrigger
                  value={tab.label}
                  key={tab.id}
                  size="l"
                  mode="dark2"
                  role="tab"
                  onClick={() => {
                    if (activeItem.href !== tab.href) {
                      navigate({ to: tab.href });
                    }
                  }}
                >
                  <img
                    src={tab.icon}
                    alt="Lab logo"
                    className="w-6 mr-3 max-md:hidden"
                  />
                  {t(tab.label)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Study group presentation section */}
          {lastSession ? (
            <>
              <div className="flex flex-col lg:flex-row self-center pt-6 gap-6">
                <div className="max-w-[800px] flex flex-col gap-6 mt-7 px-4">
                  <div className="flex flex-row max-lg:justify-center gap-2">
                    <TextTag mode={'dark'} variant={'orange'} className="w-fit">
                      {lab?.lab?.studentCount ?? '0'} Students <MdPerson />
                    </TextTag>
                    <TextTag mode={'dark'} variant={'orange'} className="w-fit">
                      {lab?.sessions.length} sessions <MdLiveTv />
                    </TextTag>
                  </div>
                  <div className="flex flex-col max-lg:text-center gap-6 max-lg:body-16px lg:subtitle-large-18px">
                    {activeItem.id === 'lightning' ? (
                      <>
                        <div>
                          <p>
                            The Lightning study group is coordinated by Fanis
                            Michalakis.
                          </p>
                          <p>
                            To get involved and connect with the other students,
                            join the Telegram group.
                          </p>
                        </div>
                        <p>
                          Sessions are interactive live-stream on Youtube every
                          2 weeks on Tuesdays at 4pm (CET). Student
                          participation is expected. Sessions are recorded and
                          available below for replay.
                        </p>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="lg:w-[350px] self-center flex flex-col gap-2 lg:gap-5 max-lg:items-center">
                  {lab?.lab?.telegramUrl ? (
                    <a
                      href={lab?.lab?.telegramUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ButtonWithArrow className="w-fit">
                        Telegram group
                      </ButtonWithArrow>
                    </a>
                  ) : null}
                  <div className="flex flex-row gap-3">
                    <a
                      href="https://rumble.com/user/planb_network"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ButtonWithArrow className="w-fit" variant={'secondary'}>
                        Rumble
                      </ButtonWithArrow>
                    </a>
                    <a
                      href="https://www.youtube.com/@PlanBNetwork"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ButtonWithArrow className="w-fit" variant={'secondary'}>
                        Youtube
                      </ButtonWithArrow>
                    </a>
                  </div>
                </div>
              </div>

              {/* Study group main content */}
              <div className="flex flex-col max-w-[1200px] w-full md:flex-row px-4 self-center mt-7 lg:mt-14 pt-6 gap-6">
                {/* Next session */}
                <div className="relative w-full max-w-[800px] border-2 border-darkOrange-6 p-4 font-light rounded-b-2xl rounded-r-2xl">
                  <div className="absolute -mt-8 bg-black px-4 text-2xl lg:text-3xl xl:text-4xl italic text-darkOrange-6">
                    Next session
                  </div>
                  <>
                    <div className="flex flex-col lg:flex-row max-lg:items-center lg:absolute lg:-mt-10 lg:mr-5 lg:right-0 max-lg:mt-2 py-2 px-4 bg-darkOrange-5 subtitle-medium-16px md:font-normal md:text-xl text-black rounded-2xl md:max-w-[450px] md:whitespace-nowrap md:overflow-hidden">
                      <span>
                        {getDateString(
                          lastSession.startDate,
                          lastSession.endDate,
                          userTimeZone,
                        )}
                      </span>
                      <DividerVertical className="my-1 mx-2 bg-black" />
                      <span className="font-semibold uppercase">
                        {getTimeString(
                          lastSession.startDate,
                          lastSession.endDate,
                          userTimeZone,
                        )}
                      </span>
                    </div>
                    <div className="mt-6 w-full">
                      <span className="text-newGray-1 uppercase">
                        {'> TOPIC OF DISCUSSION'}
                      </span>
                      <div className="mx-auto lg:max-w-2x max-md:w-full lg:mx-8 xl:mx-auto md:max-w-none my-4 px-2">
                        {lastSession ? (
                          <Suspense fallback={<Loader size={'s'} />}>
                            <GlossaryMarkdownBody
                              content={lastSession.rawContent}
                              assetPrefix={cdnUrl(lab?.lab?.path || '')}
                            />
                            {lastSession.liveUrl ? (
                              <ReactPlayer
                                width={'100%'}
                                className="mx-auto top-0 left-0 mb-2 rounded-lg"
                                controls={true}
                                url={lastSession.liveUrl}
                                src="Session video"
                              />
                            ) : null}
                          </Suspense>
                        ) : (
                          <p>
                            The next session details are being prepared and will
                            be displayed here soon. You can join the telegram
                            group to be the first informed.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                </div>

                {/* Previous session */}
                <div className="relative md:w-[400px] border-l-2 border-newBlack-5 p-4 max-lg:mt-7">
                  {/* Top border */}
                  <div className="absolute top-0 left-0 w-[30px] border-t-2 border-newBlack-5" />
                  <div className="absolute -mt-8 bg-black px-4 text-xl lg:text-2xl xl:text-4xl italic text-newGray-2 font-light">
                    Previous sessions
                  </div>
                  <div className="mt-2 lg:mt-8 flex flex-col gap-4">
                    {lab?.sessions.slice(1, 9).map((session) => (
                      <div className="flex flex-col" key={session.id}>
                        <span className="text-white uppercase">
                          {'> '}
                          {formatDate(session.startDate)}
                        </span>
                        <a
                          href={session.liveUrl ?? ''}
                          target="_blank"
                          rel="noreferrer"
                          className="text-darkOrange-5 underline hover:font-medium"
                        >
                          {session.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {professor ? <Professor professor={professor} /> : <div> </div>}
            </>
          ) : null}

          {!lastSession ? (
            <div className="flex flex-col mt-12 gap-6 self-center px-4">
              <div className=" md:w-[1200px]">
                {activeItem.id === 'mining' ? (
                  <div>
                    <p>The Mining study group is looking for a coordinator.</p>
                    <p>
                      If you're interested to do it, please reach at
                      contact@planb.network.
                    </p>
                  </div>
                ) : null}
                {activeItem.id === 'privacy' ? (
                  <div>
                    <p>The Privacy study group is looking for a coordinator.</p>
                    <p>
                      If you're interested to do it, please reach at
                      contact@planb.network.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </MainLayout>
  );
}

const Professor = ({
  professor,
}: {
  professor: FullProfessor;
}) => {
  return (
    <section className="max-w-[1200px] w-full px-4 self-center flex flex-col mt-7 md:mt-16 text-white">
      <h4 className="subtitle-medium-caps-18px text-darkOrange-5">
        {t('words.professor')}
      </h4>
      <p className="mt-[15px] md:mt-6 label-large-20px md:display-small-32px text-white">
        {t('labs.coordinatedBy')}{' '}
        <span className="text-darkOrange-5 label-large-20px md:display-small-32px">
          <Link
            to={`/professor/${formatNameForURL(professor.name || '')}-${professor.id}`}
            className="hover:text-darkOrange-5 hover:font-medium"
          >
            {professor.name}
          </Link>
        </span>
      </p>
      <div className="flex h-fit flex-col max-md:gap-4">
        <AuthorCard
          key={professor.id}
          professor={professor}
          centeredContent={true}
          mobileSize="medium"
          mode="dark"
        />
      </div>
    </section>
  );
};
