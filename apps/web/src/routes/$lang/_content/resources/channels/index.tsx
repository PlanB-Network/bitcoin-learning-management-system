import { Link, createFileRoute } from '@tanstack/react-router';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Flag, Loader, Switch, VerticalCard } from '@blms/ui';

import { LANGUAGES_MAP } from '@blms/shared';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { resourceImgUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { useQuery } from '@tanstack/react-query';
import { useGreater } from '#src/hooks/use-greater.ts';
import { ResourceCard } from '../-components/cards/resource-card.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute('/$lang/_content/resources/channels/')({
  component: YoutubeChannels,
});

function YoutubeChannels() {
  const { t, i18n } = useTranslation();
  const isMobile = useSmaller('md');
  const isScreenMd = useGreater('md');
  const [showLocalOnly, setShowLocalOnly] = useState(true);

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
    <ResourceLayout
      title={t('youtubeChannels.pageTitle')}
      activeCategory="channels"
    >
      <div className="flex flex-col gap-4 md:gap-9 mt-4 md:mt-12 mx-auto">
        <div className="flex items-center gap-1 md:gap-2.5 pb-2 md:pb-2.5 border-b border-b-newGray-1">
          <span className="label-small-12px md:label-large-med-20px text-white">
            {t('resources.toggleLabelAll')}
          </span>
          <Switch onCheckedChange={handleSwitchChange} defaultChecked />
          <span className="label-small-12px md:label-large-med-20px text-white">
            {t('resources.toggleLabelSelectedLanguage')}
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

        <div className="flex flex-wrap gap-4 md:gap-11 max-lg:justify-center">
          {!isFetched && <Loader size="s" />}
          {sortedYoutubeChannels?.length ? (
            sortedYoutubeChannels.map((youtubeChannel) => (
              <Fragment key={youtubeChannel.id}>
                <Link
                  to={`/resources/channels/${formatNameForURL(youtubeChannel.name)}-${youtubeChannel.id}`}
                  params={{
                    youtubeChannelId: youtubeChannel.id.toString(),
                  }}
                  className="grow md:grow-0 max-md:hidden"
                >
                  <ResourceCard
                    name={youtubeChannel.name}
                    imageSrc={resourceImgUrl(youtubeChannel)}
                    language={youtubeChannel.language}
                  />
                </Link>
                <VerticalCard
                  imageSrc={resourceImgUrl(youtubeChannel)}
                  title={youtubeChannel.name}
                  buttonVariant="primary"
                  buttonLink={`/resources/channels/${formatNameForURL(youtubeChannel.name)}-${youtubeChannel.id}`}
                  buttonText={t('words.viewMore')}
                  languages={[youtubeChannel.language]}
                  className="md:hidden w-[137px]"
                  flagsOnMobile
                  isScreenMd={isScreenMd}
                />
              </Fragment>
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
              <div className="flex items-center gap-3 pt-6 border-t border-t-newGray-1 mb-4 md:mb-9">
                <Flag
                  code="en"
                  size={isMobile ? 'm' : 'l'}
                  className="shrink-0 !rounded-none mb-0.5 md:mb-0"
                />
                <span className="text-white subtitle-medium-caps-18px md:subtitle-large-caps-22px">
                  {LANGUAGES_MAP.en}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 md:gap-11 max-lg:justify-center">
                {englishYoutubeChannels.map((youtubeChannel) => (
                  <Fragment key={youtubeChannel.id}>
                    <Link
                      to={`/resources/channels/${formatNameForURL(youtubeChannel.name)}-${youtubeChannel.id}`}
                      params={{
                        youtubeChannelId: youtubeChannel.id.toString(),
                      }}
                      key={youtubeChannel.id}
                      className="grow md:grow-0 max-md:hidden"
                    >
                      <ResourceCard
                        name={youtubeChannel.name}
                        imageSrc={resourceImgUrl(youtubeChannel)}
                        language={youtubeChannel.language}
                      />
                    </Link>
                    <VerticalCard
                      imageSrc={resourceImgUrl(youtubeChannel)}
                      title={youtubeChannel.name}
                      buttonVariant="primary"
                      buttonLink={`/resources/channels/${formatNameForURL(youtubeChannel.name)}-${youtubeChannel.id}`}
                      buttonText={t('words.viewMore')}
                      languages={[youtubeChannel.language]}
                      className="md:hidden w-[137px]"
                      flagsOnMobile
                      isScreenMd={isScreenMd}
                    />
                  </Fragment>
                ))}
              </div>
            </section>
          )}
      </div>
    </ResourceLayout>
  );
}
