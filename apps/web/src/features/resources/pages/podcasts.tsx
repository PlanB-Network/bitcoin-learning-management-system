import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { trpc } from '../../../utils';
import { ResourceLayout } from '../layout';

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
      <div className="grid grid-cols-2 gap-4 px-10 sm:grid-cols-3 sm:px-0 md:grid-cols-4 md:gap-8 lg:grid-cols-5">
        {sortedPodcasts
          .filter((podcast) =>
            podcast.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((podcast) => (
            <div key={podcast.id}>
              <Link
                className="group z-10 m-auto mx-2 mb-5 h-fit w-20 min-w-[100px] delay-100 hover:z-20 hover:delay-0"
                to={'/resources/podcast/$podcastId'}
                params={{
                  podcastId: podcast.id.toString(),
                }}
                key={podcast.id}
              >
                <div className="z-10 mb-2 h-fit px-2 pt-2 transition duration-500 ease-in-out group-hover:scale-125 group-hover:bg-orange-400">
                  <img
                    className="mx-auto"
                    src={podcast.logo}
                    alt={podcast.name}
                  />
                  <div className="absolute inset-x-0 rounded-b-lg px-4 py-2 text-left text-xs font-light text-white transition-colors duration-500 ease-in-out group-hover:bg-orange-400">
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
