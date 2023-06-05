import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { ResourceLayout } from '../../components';
import { Routes } from '../../types';

export const Podcasts = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetching data from the API
  const { data: podcasts } = trpc.content.getPodcasts.useQuery({
    language: 'en',
  });

  // Adding a category to each builder
  const sortedPodcasts = podcasts
    ? podcasts.sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const categorizedPodcasts = sortedPodcasts.reduce((acc, podcast) => {
    if (!acc[podcast.name]) {
      acc[podcast.name] = [];
    }
    acc[podcast.name].push(podcast);
    return acc;
  }, {} as Record<string, typeof sortedPodcasts>);

  const categories = [
    ...new Set(sortedPodcasts.map((podcast) => podcast.name)),
  ].sort(
    (a, b) => categorizedPodcasts[b].length - categorizedPodcasts[a].length
  );

  return (
    <ResourceLayout
      title={t('podcasts.pageTitle')}
      tagLine={t('podcasts.pageSubtitle')}
      filterBar={{
        onChange: () => setSearchTerm,
        label: t('resources.filterBarLabel'),
      }}
    >
      <div className="my-20 grid grid-cols-4 gap-x-8 gap-y-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => {
          const filteredPodcats = categorizedPodcasts[category].filter(
            (podcast) =>
              podcast.name.toLowerCase().includes(searchTerm.toLowerCase())
          );

          // If no result, do not show an empty card.
          if (filteredPodcats.length === 0) {
            return null;
          }

          return (
            <div>
              {filteredPodcats.map((podcast, index) => (
                <Link
                  className="group z-10 m-auto mx-2 mb-5 h-fit w-20 min-w-[100px] delay-100 hover:z-20 hover:delay-0"
                  to={generatePath(Routes.Podcast, {
                    podcastId: podcast.id.toString(),
                  })}
                  key={podcast.id}
                >
                  <div className="group-hover:bg-secondary-400 z-10 mb-2 h-fit px-2 pt-2 transition duration-500 ease-in-out group-hover:scale-125">
                    <img
                      className="mx-auto"
                      src={podcast.logo}
                      alt={podcast.name}
                    />
                    <div className="wrap align-center inset-y-end group-hover:bg-secondary-400 absolute inset-x-0 rounded-b-lg px-4 py-2 text-left text-xs font-light text-white transition-colors duration-500 ease-in-out">
                      <ul className="opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100">
                        <li className={'pb-1 text-lg font-bold'}>
                          {podcast.name}
                        </li>
                        <li className={'pb-1 text-xs italic'}>
                          {t('podcasts.writtenBy', { host: podcast.host })}
                        </li>
                        <li className={'pb-1 text-xs italic'}>
                          {t('podcasts.publishedIn', { date: '' })}
                        </li>
                        <li className={'truncate pb-1 text-xs'}>
                          {podcast.description}
                        </li>
                      </ul>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </ResourceLayout>
  );
};
