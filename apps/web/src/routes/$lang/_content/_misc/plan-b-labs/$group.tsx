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
import LightningIcon from '#src/assets/icons/lightning.svg';
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
    icon: LightningIcon,
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
      <div className="flex flex-col items-center mt-12 text-center gap-6 self-center">
        <div className="flex flex-col items-center lg:gap-6 lg:flex-row lg:w-[800px]">
          <img
            src={PlanBLabsLogo}
            alt="Logo Plan ₿ Labs"
            className="w-36 lg:w-60"
          />
          <DividerVertical className="h-16 max-lg:hidden" />
          <h1 className="display-small-med-32px text-center lg:text-left">
            {t('labs.title')}
          </h1>
        </div>
        <div className="lg:w-[950px] ">
          <p>{t('labs.description1')}</p>
          <p>{t('labs.description2')}</p>
        </div>
      </div>
      {!isFetched ? (
        <Loader size={'s'} />
      ) : (
        <>
          <Tabs
            defaultValue={activeItem.label}
            className="pt-7 border-b-[1px] border-newGray-1 bg-gradient-tabs pl-[max(20px,calc((100vw-1200px)/2))]"
          >
            <TabsList size="l" mode="dark2">
              <img src={LabIcon} alt="Lab logo" className="w-10" />
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
                  <img src={tab.icon} alt="Lab logo" className="w-6 mr-3" />
                  {t(tab.label)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Study group presentation section */}
          <div className="flex flex-col lg:flex-row self-center pt-6 gap-6">
            <div className="w-[800px] flex flex-col gap-6 mt-7 ">
              <div className="flex flex-row gap-2">
                <TextTag mode={'dark'} variant={'darkMaroon'} className="w-fit">
                  {lab?.lab?.studentCount ?? '0'} Students <MdPerson />
                </TextTag>
                <TextTag mode={'dark'} variant={'darkMaroon'} className="w-fit">
                  {lab?.sessions.length} sessions <MdLiveTv />
                </TextTag>
              </div>
              <div className="flex flex-col gap-6 subtitle-large-18px">
                <div>
                  <p>
                    The Lightning study group is coordinated by Fanis
                    Michalakis.
                  </p>
                  <p>
                    To get involved and connect with the other students, join
                    the Telegram group.
                  </p>
                </div>
                <p>
                  Sessions are interactive live-stream on Youtube every 2 weeks
                  on Tuesdays at 4pm (CET). Student participation is expected.
                  Sessions are recorded and available below for replay.
                </p>
              </div>
            </div>
            <div className="w-[350px] self-center flex flex-col gap-5">
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

          {/* Study group main content */}
          <div className="flex flex-col lg:flex-row self-center mt-14 pt-6 gap-6">
            <div className="relative w-[750px] border-2 border-darkOrange-6 p-4 font-light rounded-b-2xl rounded-r-2xl">
              <div className="absolute -mt-8 bg-black px-4 text-4xl italic text-darkOrange-6">
                Next session
              </div>
              <>
                {lastSession ? (
                  <div className="flex flex-row absolute -mt-10 mr-5 right-0 py-2 px-4  bg-darkOrange-5 font-normal  text-xl text-black rounded-2xl max-w-[450px] whitespace-nowrap overflow-hidden">
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
                ) : null}
                <div className="mt-6">
                  <span className="text-newGray-1 uppercase">
                    {'> TOPIC OF DISCUSSION'}
                  </span>
                  <div className="mx-auto max-w-2xl md:mx-8 xl:mx-auto md:max-w-none my-4 px-2">
                    {lastSession ? (
                      <Suspense fallback={<Loader size={'s'} />}>
                        <GlossaryMarkdownBody
                          content={lastSession.rawContent}
                          assetPrefix={cdnUrl(lab?.lab?.path || '')}
                        />
                        <p>{}</p>
                        {lastSession.liveUrl ? (
                          <ReactPlayer
                            width={'100%'}
                            style={{ top: 0, left: 0 }}
                            className="mx-auto mb-2 rounded-lg"
                            controls={true}
                            url={lastSession.liveUrl}
                            src="Session video"
                          />
                        ) : null}
                      </Suspense>
                    ) : (
                      <p>
                        The next session details are being prepared and will be
                        displayed here soon. You can join the telegram group to
                        be the first informed.
                      </p>
                    )}
                  </div>
                </div>
              </>
            </div>
            <div className="relative w-[400px] border-l-2 border-newBlack-5 p-4">
              {/* Top border */}
              <div className="absolute top-0 left-0 w-[30px] border-t-2 border-newBlack-5" />
              <div className="absolute -mt-8 bg-black px-4 text-4xl italic text-newGray-2 font-light">
                Previous sessions
              </div>
              <div className="mt-8 flex flex-col gap-4">
                {lab?.sessions.slice(1, 9).map((session) => (
                  <div className="flex flex-col" key={session.id}>
                    <span className="text-newGray-1 uppercase">
                      {'> '}
                      {formatDate(session.startDate)}
                    </span>
                    <span>{session.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {professor ? <Professor professor={professor} /> : <div> </div>}
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
    <section className="w-[1150px] self-center flex flex-col mt-5 md:mt-16 text-white">
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
        />
      </div>
    </section>
  );
};
