import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { trpc } from '../../../utils/index.ts';
import { ResourceCard } from '../components/Cards/resource-card.tsx';
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
      <div className="flex flex-wrap justify-center gap-5 lg:gap-[30px] mt-6 md:mt-12 mx-auto">
        {sortedPodcasts
          .filter((podcast) =>
            podcast.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((podcast) => (
            <Link
              to={'/resources/podcast/$podcastId'}
              params={{
                podcastId: podcast.id.toString(),
              }}
              className="w-[288px]  md:max-w-64"
              key={podcast.id}
            >
              <ResourceCard
                name={podcast.name}
                author={podcast.host}
                imageSrc={podcast.logo}
              />
            </Link>
          ))}
      </div>
    </ResourceLayout>
  );
};
