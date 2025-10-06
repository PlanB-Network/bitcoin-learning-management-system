import type { JoinedConference } from '@blms/types';
import { Button, cn, EmptyState, Image, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { TbCalendarOff, TbChevronRight } from 'react-icons/tb';
import OrangePill from '#src/assets/icons/orange_pill_color.svg?react';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { assetUrl, trpc } from '#src/utils/index.ts';
import { ConferencesTimeLine } from '../-components/conferences-timeline.tsx';
import { ConferencesTable } from '../-components/tables/conferences-table.tsx';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/_content/resources/conferences/')({
  component: Conferences,
});

function Conferences() {
  const [activeYear, setActiveYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [filteredConferences, setFilteredConferences] =
    useState<JoinedConference[]>();
  const [latestConferences, setLatestConferences] =
    useState<JoinedConference[]>();
  const [latestPlanBConferences, setLatestPlanBConferences] =
    useState<JoinedConference[]>();

  const { data: conferences, isFetched } = useQuery(
    trpc.content.getConferences.queryOptions(
      {},
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  useEffect(() => {
    const sortedConferences = conferences
      ? conferences.sort((a, b) => a.name.localeCompare(b.name))
      : [];

    setFilteredConferences(
      sortedConferences.filter((conference) =>
        conference.year.includes(activeYear),
      ),
    );

    setLatestConferences(
      conferences
        ? conferences.sort((a, b) => b.year.localeCompare(a.year))
        : [],
    );

    setLatestPlanBConferences(
      conferences
        ? conferences
            .filter((conference) =>
              conference.projectName?.toLowerCase().includes('plan'),
            )
            .sort((a, b) => b.year.localeCompare(a.year))
        : [],
    );
  }, [conferences, activeYear]);

  return (
    <PageLayout
      title={t('resources.conferences.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
      actionButtons={[
        {
          text: t('resources.conferences.addConference'),
          href: '/tutorials/contribution/resource/add-conference-replay-3282deba-16ab-4dd9-8357-680902bfb527',
        },
      ]}
    >
      <div className="flex flex-wrap gap-4 mt-4 sm:mt-2 max-lg:hidden">
        <div className="flex flex-col gap-1 sm:gap-4">
          <h3 className="title-small text-black">
            {t('conferences.latestConferences')}
          </h3>
          <div className="flex flex-wrap gap-2.5 sm:gap-1 h-full">
            {!isFetched && <Loader size={'s'} />}
            {latestConferences && latestConferences.length > 0 && (
              <>
                <ConferenceCard conference={latestConferences[0]} />
                <ConferenceCard conference={latestConferences[1]} />
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 sm:gap-4">
          <h3 className="title-small text-black flex items-center gap-1">
            <OrangePill className="w-2 h-auto" />
            {t('conferences.planBConferences')}
          </h3>
          <div className="flex flex-wrap gap-2.5 sm:gap-1 h-full">
            {!isFetched && <Loader size={'s'} />}
            {latestPlanBConferences && latestPlanBConferences.length > 0 && (
              <>
                <ConferenceCard conference={latestPlanBConferences[0]} />
                <ConferenceCard conference={latestPlanBConferences[1]} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline and table */}
      <h2 className="text-black title-large max-sm:hidden mt-8 mb-4">
        {t('conferences.conferencesGenesis')}
      </h2>
      <ConferencesTimeLine
        activeYear={activeYear}
        setActiveYear={setActiveYear}
      />
      {!isFetched && <Loader size={'s'} />}
      {filteredConferences && filteredConferences.length > 0 && (
        <>
          <ConferencesTable conferences={filteredConferences} />
          <div className="xl:hidden flex flex-wrap sm:gap-6 mt-6">
            {filteredConferences?.map((conference) => (
              <ConferenceCard conference={conference} key={conference.id} />
            ))}
          </div>
        </>
      )}

      {filteredConferences && filteredConferences.length === 0 && isFetched && (
        <EmptyState
          title={t('conferences.noConferences', { year: activeYear })}
          icon={TbCalendarOff}
          className="mt-6 sm:mt-8"
        />
      )}
    </PageLayout>
  );
}

export const ConferenceCard = ({
  conference,
}: {
  conference: JoinedConference;
}) => {
  const isSmaller = useSmaller('sm');

  const Wrapper = isSmaller ? Link : 'article';

  const GeneralInfos = () => {
    return (
      <div className="flex flex-col justify-between sm:p-4 sm:pt-0 flex-grow sm:gap-7">
        <div className="flex flex-col gap-1 max-sm:grow max-sm:justify-center">
          <span className="title-small sm:title-base text-maroon-11 line-clamp-2">
            {conference.name}
          </span>

          <span className="text-newBlack-3 body-small sm:body-base">
            {conference.location}
          </span>
        </div>
        <Button asChild className="mt-auto w-full max-sm:hidden">
          <Link to={`/resources/conferences/${conference.id}`}>
            {t('events.card.watchReplay')}
          </Link>
        </Button>
      </div>
    );
  };

  const content = (
    <div className="flex max-sm:gap-2 sm:flex-col flex-grow w-full">
      <div className="w-22 sm:w-full overflow-hidden max-sm:rounded-lg sm:rounded-t-2xl sm:rounded-b-lg relative sm:mb-2 max-sm:shrink-0">
        <Image
          breakpoints={{ default: 180, sm: 480 }}
          loading="lazy"
          src={assetUrl(conference.path, 'thumbnail.webp')}
          alt={conference.name || 'Conference image'}
          className="object-cover [overflow-clip-margin:_unset] aspect-[88/56] sm:aspect-[240/135] sm:w-full max-sm:h-full max-sm:rounded-l-lg sm:rounded-t-2xl sm:rounded-b-lg"
        />
      </div>
      <GeneralInfos />
    </div>
  );

  return (
    <Wrapper
      to={isSmaller ? `/resources/conferences/${conference.id}` : undefined}
      className={cn(
        'flex justify-between max-sm:items-center w-full sm:w-60 sm:border border-neutral-100 rounded-lg sm:rounded-2xl max-sm:p-2',
      )}
    >
      {content}
      <TbChevronRight
        className="text-neutral-300 sm:hidden shrink-0"
        size={20}
      />
    </Wrapper>
  );
};
