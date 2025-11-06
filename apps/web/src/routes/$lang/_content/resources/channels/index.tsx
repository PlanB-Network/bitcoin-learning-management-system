import { formatNameForURL } from '@blms/shared';
import { EmptyState, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';
import { resourceImgUrl } from '#src/utils/index.ts';
import { trpc } from '#src/utils/trpc.js';
import { SearchInput } from '../../learn-anytime/index.tsx';
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
  const [searchTerm, setSearchTerm] = useState('');

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
  )
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(
      (youtubeChannel) =>
        youtubeChannel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        youtubeChannel.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );

  const isEnglishLanguage = i18n.language === 'en';

  return (
    <PageLayout
      title={t('resources.channels.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
    >
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        className="ml-auto max-sm:mt-4 mt-2 mb-4 sm:mb-6"
      />
      <div className="flex flex-col">
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
            <EmptyState title={t('resources.channels.noYoutubeChannels')} />
          )}
        </div>

        {showLocalOnly &&
          !isEnglishLanguage &&
          englishYoutubeChannels.length > 0 && (
            <section>
              <LanguageResourcesSectionHeader language="en" />
              <div className="flex flex-wrap gap-0.5 sm:gap-6">
                {englishYoutubeChannels
                  .filter(
                    (youtubeChannel) =>
                      youtubeChannel.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      youtubeChannel.description
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                  )
                  .map((youtubeChannel) => (
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
