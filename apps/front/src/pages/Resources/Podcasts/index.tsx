import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { ResourceLayout } from '../../../components';
import { Routes } from '../../../types';

export const Podcasts = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetching data from the API
  const { data: podcasts } = trpc.content.getPodcasts.useQuery({
    language: i18n.language ?? 'en',
  });

  // Sort podcasts alphabetically
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
      <div className="grid grid-cols-2 gap-4 px-10 sm:grid-cols-3 sm:px-0 md:grid-cols-4 md:gap-8 lg:grid-cols-5">
        {sortedPodcasts
          .filter((podcast) =>
            podcast.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((podcast) => (
            <div>
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
                  <div className="group-hover:bg-secondary-400 absolute inset-x-0 rounded-b-lg px-4 py-2 text-left text-xs font-thin text-white transition-colors duration-500 ease-in-out">
                    <ul className="opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100">
                      <li className={'pb-1 text-lg font-bold'}>
                        {podcast.name}
                      </li>
                      {podcast.host && (
                        <li className={'pb-1 text-xs italic'}>
                          {t('podcasts.hostedBy', { host: podcast.host })}
                        </li>
                      )}
                      {/* <li className={'truncate pb-1 text-xs'}>
                          {podcast.description}
                        </li> */}
                    </ul>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </ResourceLayout>
  );
};
