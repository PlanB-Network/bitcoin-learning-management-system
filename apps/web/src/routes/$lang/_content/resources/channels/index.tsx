import { formatNameForURL } from '@blms/shared';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { resourceImgUrl } from '#src/utils/index.ts';
import { trpc } from '#src/utils/trpc.js';
import { ResourceCard } from '../-components/cards/resource-card.tsx';
import {
  LanguageResourcesSectionHeader,
  SelectedLanguageSwitcher,
} from '../-components/selected-language-switcher.tsx';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/_content/resources/channels/')({
  component: YoutubeChannels,
});

function YoutubeChannels() {
  const { t, i18n } = useTranslation();
  const [showLocalOnly, setShowLocalOnly] = useState(false);

  const { data: youtubeChannels, isFetched } = useQuery(
    trpc.content.getYoutubeChannels.queryOptions({}, { staleTime: 300_000 }),
  );

  const localYoutubeChannels =
    youtubeChannels?.filter(
      (youtubeChannel) => youtubeChannel.language === i18n.language,
    ) ?? [];

  const englishYoutubeChannels =
    youtubeChannels?.filter(
      (youtubeChannel) => youtubeChannel.language === 'en',
    ) ?? [];

  const handleSwitchChange = (checked: boolean) => {
    setShowLocalOnly(checked);
  };

  const sortedYoutubeChannels = (
    showLocalOnly ? [...localYoutubeChannels] : [...(youtubeChannels ?? [])]
  ).sort((a, b) => a.name.localeCompare(b.name));

  const isEnglishLanguage = i18n.language === 'en';

  return (
    <PageLayout
      title={t('resources.channels.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
    >
      <div className="flex flex-col max-sm:mt-4 mt-2">
        <SelectedLanguageSwitcher
          handleSwitchChange={handleSwitchChange}
          showLocalOnly={showLocalOnly}
        />

        <div className="flex flex-wrap gap-0.5 sm:gap-6">
          {!isFetched && <Loader size="s" />}
          {sortedYoutubeChannels?.length ? (
            sortedYoutubeChannels.map((youtubeChannel) => (
              <Link
                to={`/resources/channels/${formatNameForURL(youtubeChannel.name)}-${youtubeChannel.id}`}
                params={{
                  youtubeChannelId: youtubeChannel.id.toString(),
                }}
                className="max-sm:w-full"
                key={youtubeChannel.id}
              >
                <ResourceCard
                  name={youtubeChannel.name}
                  imageSrc={resourceImgUrl(youtubeChannel)}
                  language={youtubeChannel.language}
                />
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500">
              {t('resources.channels.noYoutubeChannels')}
            </p>
          )}
        </div>

        {showLocalOnly &&
          !isEnglishLanguage &&
          englishYoutubeChannels.length > 0 && (
            <section>
              <LanguageResourcesSectionHeader language="en" />
              <div className="flex flex-wrap gap-0.5 sm:gap-6 sm:justify-center">
                {englishYoutubeChannels.map((youtubeChannel) => (
                  <Link
                    to={`/resources/channels/${formatNameForURL(youtubeChannel.name)}-${youtubeChannel.id}`}
                    params={{
                      youtubeChannelId: youtubeChannel.id.toString(),
                    }}
                    key={youtubeChannel.id}
                    className="max-sm:w-full"
                  >
                    <ResourceCard
                      name={youtubeChannel.name}
                      imageSrc={resourceImgUrl(youtubeChannel)}
                      language={youtubeChannel.language}
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
