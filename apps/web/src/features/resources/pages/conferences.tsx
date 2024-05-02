import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { JoinedConference } from '@sovereign-university/types';

import { HorizontalCard } from '#src/atoms/HorizontalCard/index.js';
import { VerticalCard } from '#src/atoms/VerticalCard/index.js';
import { trpc } from '#src/utils/trpc.js';

import { ConferencesTable } from '../components/Tables/conferences-table.tsx';
import { ConferencesTimeLine } from '../components/Timelines/conferences.tsx';
import { ResourceLayout } from '../layout.tsx';

export const Conferences = () => {
  const [activeYear, setActiveYear] = useState('2024');
  const [filteredConferences, setFilteredConferences] =
    useState<JoinedConference[]>();
  const [latestConferences, setLatestConferences] =
    useState<JoinedConference[]>();
  const [latestPlanBConferences, setLatestPlanBConferences] =
    useState<JoinedConference[]>();

  const { data: conferences } = trpc.content.getConferences.useQuery();

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
          <h3 className="text-sm md:text-xl md:font-medium leading-snug md:leading-relaxed tracking-[0.17px] md:tracking-[0.15px]">
            {t('conferences.latestConferences')}
          </h3>
          <div className="grid max-md:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-2.5 md:gap-8">
            {latestConferences && latestConferences.length > 0 && (
              <>
                <VerticalCard
                  imageSrc={latestConferences[0].thumbnail as string}
                  title={latestConferences[0].name}
                  subtitle={latestConferences[0].location}
                  buttonText={t('events.card.watchReplay')}
                  buttonVariant="newPrimary"
                  link={
                    latestConferences[0].stages.length > 0
                      ? `/resources/conference/${latestConferences[0].id}`
                      : ''
                  }
                  languages={latestConferences[0].languages}
                />
                <VerticalCard
                  imageSrc={latestConferences[1].thumbnail as string}
                  title={latestConferences[1].name}
                  subtitle={latestConferences[1].location}
                  buttonText={t('events.card.watchReplay')}
                  buttonVariant="newPrimary"
                  link={
                    latestConferences[1].stages.length > 1
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
          <h3 className="text-sm md:text-xl md:font-medium leading-snug md:leading-relaxed tracking-[0.17px] md:tracking-[0.15px]">
            {t('conferences.planBConferences')}
          </h3>
          <div className="grid max-md:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2.5 md:gap-8">
            {latestPlanBConferences && latestPlanBConferences.length > 0 && (
              <>
                <VerticalCard
                  imageSrc={latestPlanBConferences[0].thumbnail as string}
                  title={latestPlanBConferences[0].name}
                  subtitle={latestPlanBConferences[0].location}
                  buttonText={t('events.card.watchReplay')}
                  buttonVariant="newPrimary"
                  link={
                    latestPlanBConferences[0].stages.length > 0
                      ? `/resources/conference/${latestPlanBConferences[0].id}`
                      : ''
                  }
                  languages={latestPlanBConferences[0].languages}
                />
                <VerticalCard
                  imageSrc={latestPlanBConferences[1].thumbnail as string}
                  title={latestPlanBConferences[1].name}
                  subtitle={latestPlanBConferences[1].location}
                  buttonText={t('events.card.watchReplay')}
                  buttonVariant="newPrimary"
                  link={
                    latestPlanBConferences[1].stages.length > 1
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
        <p className="text-white leading-[175%] tracking-[0.15px] max-w-[817px] max-md:hidden mt-5">
          {t('conferences.description')}
        </p>
      </div>
      <ConferencesTimeLine
        activeYear={activeYear}
        setActiveYear={setActiveYear}
      />
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
                link={
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

      {filteredConferences && filteredConferences.length === 0 && (
        <p className="text-newGray-2 text-center mx-auto w-full mt-5 md:mt-10">
          No conferences added for {activeYear} yet.
        </p>
      )}
    </ResourceLayout>
  );
};
