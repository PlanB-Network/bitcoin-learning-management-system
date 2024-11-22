import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader } from '@blms/ui';

import { assetUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { ResourceCard } from '../-components/cards/resource-card.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute('/_content/resources/podcasts/')({
  component: Podcasts,
});

function Podcasts() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: podcasts, isFetched } = trpc.content.getPodcasts.useQuery(
    {
      language: i18n.language ?? 'en',
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

  const sortedPodcasts = podcasts
    ? podcasts.sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <ResourceLayout
      title={t('podcasts.pageTitle')}
      tagLine={t('podcasts.pageSubtitle')}
      filterBar={{
        onChange: setSearchTerm,
        label: t('resources.filterBarLabel'),
      }}
      activeCategory="podcasts"
    >
      <div className="flex flex-wrap md:justify-center gap-4 md:gap-10 mt-6 md:mt-12 mx-auto">
        {!isFetched && <Loader size={'s'} />}
        {sortedPodcasts
          .filter((podcast) =>
            podcast.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((podcast) => (
            <Link
              to={`/resources/podcasts/${formatNameForURL(podcast.name)}-${podcast.id}`}
              params={{
                podcastId: podcast.id.toString(),
              }}
              key={podcast.id}
              className="grow"
            >
              <ResourceCard
                name={podcast.name}
                author={podcast.host}
                imageSrc={assetUrl(podcast.path, 'logo.webp')}
              />
            </Link>
          ))}
      </div>
    </ResourceLayout>
  );
}
