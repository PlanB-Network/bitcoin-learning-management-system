import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { trpc } from '../../../utils/index.ts';
import { PodcastCard } from '../components/Cards/podcast-card.tsx';
import { ResourceLayout } from '../layout.tsx';

export const Podcasts = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: podcasts } = trpc.content.getPodcasts.useQuery({
    language: i18n.language ?? 'en',
  });

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
    >
      <div className="grid grid-cols-1 gap-4 md:mt-10 sm:grid-cols-2 sm:px-0 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        {sortedPodcasts
          .filter((podcast) =>
            podcast.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((podcast) => (
            <PodcastCard podcast={podcast} key={podcast.id} />
          ))}
      </div>
    </ResourceLayout>
  );
};
