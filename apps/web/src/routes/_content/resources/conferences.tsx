import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { JoinedConference } from '@sovereign-university/types';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { HorizontalCard } from '#src/molecules/HorizontalCard/index.js';
import { VerticalCard } from '#src/molecules/VerticalCard/index.tsx';
import { trpc } from '#src/utils/trpc.js';

import { ConferencesTable } from '../resources/-components/Tables/conferences-table.tsx';
import { ConferencesTimeLine } from '../resources/-components/Timelines/conferences-timeline.tsx';
import { ResourceLayout } from '../resources/-other/layout.tsx';

export const Route = createFileRoute('/_content/resources/conferences')({
  component: Conferences,
});

function Conferences() {
  const [activeYear, setActiveYear] = useState('2024');
  const [filteredConferences, setFilteredConferences] =
    useState<JoinedConference[]>();
  const [latestConferences, setLatestConferences] =
    useState<JoinedConference[]>();
  const [latestPlanBConferences, setLatestPlanBConferences] =
    useState<JoinedConference[]>();

  const { data: conferences, isFetched } = trpc.content.getConferences.useQuery(
    {},
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  useEffect(() => {
    const sortedConferences = conferences
      ? (conferences.sort((a, b) =>
          a.name.localeCompare(b.name),
        ) as JoinedConference[]) // Todo remove this as
      : [];

    setFilteredConferences(
      sortedConferences.filter((conference) =>
        conference.year.includes(activeYear),
      ),
    );

    setLatestConferences(
      conferences
        ? (conferences.sort((a, b) =>
            b.year.localeCompare(a.year),
          ) as JoinedConference[]) // Todo remove this as
        : [],
    );

    setLatestPlanBConferences(
      conferences
        ? (conferences
            .filter((conference) =>
              conference.builder?.toLowerCase().includes('plan'),
            )
            .sort((a, b) => b.year.localeCompare(a.year)) as JoinedConference[]) // Todo remove this as
        : [],
    );
  }, [conferences, activeYear]);

  const { t } = useTranslation();

  return (
    <ResourceLayout
      title={t('conferences.pageTitle')}
      tagLine={t('conferences.pageSubtitle')}
      activeCategory="conferences"
      maxWidth="1360"
      className="mx-0 px-0"
    >
      {/* Latest and Plan B Conferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-white gap-3 md:gap-7 mx-4">
        <div className="flex flex-col gap-1 md:gap-4 md:col-span-1 xl:col-span-2">
          <h3 className="md:text-xl font-medium leading-snug md:leading-relaxed tracking-[0.17px] md:tracking-015px max-md:text-center">
            {t('conferences.latestConferences')}
          </h3>
          <div className="grid max-md:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-2.5 md:gap-8 h-full">
            {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
            {latestConferences && latestConferences.length > 0 && (
              <>
                <VerticalCard
                  imageSrc={latestConferences[0].thumbnail}
                  title={latestConferences[0].name}
                  subtitle={latestConferences[0].location}
                  buttonText={t('events.card.watchReplay')}
                  buttonVariant="newPrimary"
                  buttonLink={
                    latestConferences[0].stages.length > 0
                      ? `/resources/conference/${latestConferences[0].id}`
                      : ''
                  }
                  languages={latestConferences[0].languages}
                />
                <VerticalCard
                  imageSrc={latestConferences[1].thumbnail}
                  title={latestConferences[1].name}
                  subtitle={latestConferences[1].location}
                  buttonText={t('events.card.watchReplay')}
                  buttonVariant="newPrimary"
                  buttonLink={
                    latestConferences[1].stages.length > 0
                      ? `/resources/conference/${latestConferences[1].id}`
                      : ''
                  }
                  languages={latestConferences[1].languages}
                  className="md:hidden xl:flex"
                />
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 md:gap-4 md:col-span-1 lg:col-span-2">
          <h3 className="md:text-xl font-medium leading-snug md:leading-relaxed tracking-[0.17px] md:tracking-015px max-md:text-center">
            {t('conferences.planBConferences')}
          </h3>
          <div className="grid max-md:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2.5 md:gap-8 h-full">
            {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
            {latestPlanBConferences && latestPlanBConferences.length > 0 && (
              <>
                <VerticalCard
                  imageSrc={latestPlanBConferences[0].thumbnail}
                  title={latestPlanBConferences[0].name}
                  subtitle={latestPlanBConferences[0].location}
                  buttonText={t('events.card.watchReplay')}
                  buttonVariant="newPrimary"
                  buttonLink={
                    latestPlanBConferences[0].stages.length > 0
                      ? `/resources/conference/${latestPlanBConferences[0].id}`
                      : ''
                  }
                  languages={latestPlanBConferences[0].languages}
                />
                <VerticalCard
                  imageSrc={latestPlanBConferences[1].thumbnail}
                  title={latestPlanBConferences[1].name}
                  subtitle={latestPlanBConferences[1].location}
                  buttonText={t('events.card.watchReplay')}
                  buttonVariant="newPrimary"
                  buttonLink={
                    latestPlanBConferences[1].stages.length > 0
                      ? `/resources/conference/${latestPlanBConferences[1].id}`
                      : ''
                  }
                  languages={latestPlanBConferences[1].languages}
                  className="md:hidden lg:flex"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="h-px bg-newBlack-5 md:bg-white/25 mt-3 mb-8 md:mt-10 md:mb-[60px] mx-4" />

      {/* Timeline and table */}
      <div className="flex flex-col justify-center items-center text-center mx-4">
        <h2 className="text-darkOrange-5 text-2xl md:text-[34px] leading-normal md:leading-tight md:tracking-[0.25px]">
          {t('conferences.conferencesSinceGenesis')}
        </h2>
        <p className="text-white leading-[175%] tracking-015px max-w-[817px] max-md:hidden mt-5">
          {t('conferences.description')}
        </p>
      </div>
      <ConferencesTimeLine
        activeYear={activeYear}
        setActiveYear={setActiveYear}
      />
      {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
      {filteredConferences && filteredConferences.length > 0 && (
        <>
          <ConferencesTable conferences={filteredConferences} />
          <div className="lg:hidden flex justify-center items-stretch flex-wrap gap-4 mx-4 mt-8">
            {filteredConferences?.map((conference) => (
              <HorizontalCard
                key={conference.id}
                title={conference.name}
                subtitle={conference.location}
                buttonText={t('events.card.watchReplay')}
                buttonVariant="newPrimary"
                buttonLink={
                  conference.stages.length > 0
                    ? `/resources/conference/${conference.id}`
                    : ''
                }
                languages={conference.languages}
              />
            ))}
          </div>
        </>
      )}

      {filteredConferences && filteredConferences.length === 0 && isFetched && (
        <p className="text-newGray-2 text-center mx-auto w-full mt-5 md:mt-10">
          {t('conferences.noConferences', { year: activeYear })}
        </p>
      )}

      <p className="text-newGray-2 text-center mx-auto w-full mt-5 md:mt-10">
        <Trans i18nKey="conferences.addConferences">
          <a
            className="underline underline-offset-2 hover:text-darkOrange-5"
            href="https://github.com/PlanB-Network/bitcoin-educational-content"
          >
            Github Repository
          </a>
        </Trans>
      </p>
    </ResourceLayout>
  );
}
