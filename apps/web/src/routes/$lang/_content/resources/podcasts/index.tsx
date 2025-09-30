import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { resourceImgUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';
import { ResourceCard } from '../-components/cards/resource-card.tsx';
import {
  LanguageResourcesSectionHeader,
  SelectedLanguageSwitcher,
} from '../-components/selected-language-switcher.tsx';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/_content/resources/podcasts/')({
  component: Podcasts,
});

function Podcasts() {
  const { t, i18n } = useTranslation();
  const [showLocalOnly, setShowLocalOnly] = useState(false);

  const { data: podcasts, isFetched } = useQuery(
    trpc.content.getPodcasts.queryOptions({}, { staleTime: 300_000 }),
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
    <PageLayout
      title={t('resources.podcasts.title')}
      tabs={resourcesTabs}
      layoutSize="base"
      actionButtons={[
        {
          text: t('resources.podcasts.addPodcast'),
          href: '/tutorials/contribution/resource/add-podcast-7d66c440-d5f6-4a1f-b3f0-14ca4664f1c4',
        },
      ]}
    >
      <div className="flex flex-col max-sm:mt-4 mt-2">
        <SelectedLanguageSwitcher
          handleSwitchChange={handleSwitchChange}
          showLocalOnly={showLocalOnly}
        />

        <div className="flex flex-wrap gap-0.5 sm:gap-6 sm:justify-center">
          {!isFetched && <Loader size="s" />}
          {sortedPodcasts?.length ? (
            sortedPodcasts.map((podcast) => (
              <Link
                to={`/resources/podcasts/${formatNameForURL(podcast.name)}-${podcast.id}`}
                params={{
                  podcastId: podcast.id.toString(),
                }}
                key={podcast.id}
                className="max-sm:w-full"
              >
                <ResourceCard
                  name={podcast.name}
                  author={podcast.host}
                  imageSrc={resourceImgUrl(podcast, 'logo.webp')}
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
            <LanguageResourcesSectionHeader language="en" />
            <div className="flex flex-wrap gap-0.5 sm:gap-6 sm:justify-center">
              {englishPodcasts.map((podcast) => (
                <Link
                  to={`/resources/podcasts/${formatNameForURL(podcast.name)}-${podcast.id}`}
                  params={{
                    podcastId: podcast.id.toString(),
                  }}
                  key={podcast.id}
                  className="max-sm:w-full"
                >
                  <ResourceCard
                    name={podcast.name}
                    author={podcast.host}
                    imageSrc={resourceImgUrl(podcast, 'logo.webp')}
                    language={podcast.language}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}
