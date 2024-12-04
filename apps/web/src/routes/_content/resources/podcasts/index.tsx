import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader, Switch } from '@blms/ui';

import { useSmaller } from '#src/hooks/use-smaller.ts';
import Flag from '#src/molecules/Flag/index.tsx';
import { LANGUAGES_MAP } from '#src/utils/i18n.ts';
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
  const isMobile = useSmaller('md');
  const [showLocalOnly, setShowLocalOnly] = useState(true);

  const { data: podcasts, isFetched } = trpc.content.getPodcasts.useQuery(
    {},
    { staleTime: 300_000 },
  );

  const localPodcasts =
    podcasts?.filter((podcast) => podcast.language === i18n.language) ?? [];

  const englishPodcasts =
    podcasts?.filter((podcast) => podcast.language === 'en') ?? [];

  const handleSwitchChange = (checked: boolean) => {
    setShowLocalOnly(checked);
  };

  const sortedPodcasts = (
    showLocalOnly ? [...localPodcasts] : [...(podcasts ?? [])]
  ).sort((a, b) => a.name.localeCompare(b.name));

  const isEnglishLanguage = i18n.language === 'en';

  return (
    <ResourceLayout
      title={t('podcasts.pageTitle')}
      tagLine={t('podcasts.pageSubtitle')}
      activeCategory="podcasts"
    >
      <div className="flex flex-col gap-4 md:gap-9 mt-4 md:mt-12 mx-auto">
        <div className="flex items-center gap-1 md:gap-2.5 pb-2 md:pb-2.5 border-b border-b-newGray-1">
          <span className="label-small-12px md:label-large-med-20px text-white">
            {t('resources.podcasts.toggleLabelAll')}
          </span>
          <Switch onCheckedChange={handleSwitchChange} defaultChecked />
          <span className="label-small-12px md:label-large-med-20px text-white">
            {t('resources.podcasts.toggleLabelSelectedLanguage')}
          </span>
        </div>

        {showLocalOnly && (
          <div className="flex items-center gap-3">
            <Flag
              code={i18n.language}
              size={isMobile ? 'm' : 'l'}
              className="shrink-0 !rounded-none mb-0.5 md:mb-0"
            />
            <span className="text-white subtitle-medium-caps-18px md:subtitle-large-caps-22px">
              {LANGUAGES_MAP[i18n.language] || 'Language'}
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-4 md:gap-11">
          {!isFetched && <Loader size="s" />}
          {sortedPodcasts?.length ? (
            sortedPodcasts.map((podcast) => (
              <Link
                to={`/resources/podcasts/${formatNameForURL(podcast.name)}-${podcast.id}`}
                params={{
                  podcastId: podcast.id.toString(),
                }}
                key={podcast.id}
                className="grow md:grow-0"
              >
                <ResourceCard
                  name={podcast.name}
                  author={podcast.host}
                  imageSrc={assetUrl(podcast.path, 'logo.webp')}
                  language={podcast.language}
                />
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500">
              {t('resources.podcasts.noPodcasts')}
            </p>
          )}
        </div>

        {showLocalOnly && !isEnglishLanguage && englishPodcasts.length > 0 && (
          <section>
            <div className="flex items-center gap-3 pt-6 border-t border-t-newGray-1 mb-4 md:mb-9">
              <Flag
                code="en"
                size={isMobile ? 'm' : 'l'}
                className="shrink-0 !rounded-none mb-0.5 md:mb-0"
              />
              <span className="text-white subtitle-medium-caps-18px md:subtitle-large-caps-22px">
                {LANGUAGES_MAP['en']}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 md:gap-11">
              {englishPodcasts.map((podcast) => (
                <Link
                  to={`/resources/podcasts/${formatNameForURL(podcast.name)}-${podcast.id}`}
                  params={{
                    podcastId: podcast.id.toString(),
                  }}
                  key={podcast.id}
                  className="grow md:grow-0"
                >
                  <ResourceCard
                    name={podcast.name}
                    author={podcast.host}
                    imageSrc={assetUrl(podcast.path, 'logo.webp')}
                    language={podcast.language}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </ResourceLayout>
  );
}
