import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  Button,
  Card,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Loader,
  TextTag,
} from '@blms/ui';

import { fixEmbedUrl } from '#src/components/Markdown/conference-markdown-body.tsx';
import { useGreater } from '#src/hooks/use-greater.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import { BackLink } from '#src/molecules/backlink.tsx';
import Flag from '#src/molecules/Flag/index.tsx';
import { assetUrl, trpc } from '#src/utils/index.ts';
import { useShuffleSuggestedContent } from '#src/utils/resources-hook.ts';
import { formatNameForURL } from '#src/utils/string.ts';

import { ResourceLayout } from '../-components/resource-layout.js';
import { SuggestedHeader } from '../-components/suggested-header.tsx';

export const Route = createFileRoute(
  '/_content/resources/channels/$channelName-$channelId',
)({
  params: {
    parse: (params) => {
      const channelNameId = params['channelName-$channelId'];
      const channelId = channelNameId.split('-').pop();
      const channelName = channelNameId.slice(
        0,
        Math.max(0, channelNameId.lastIndexOf('-')),
      );

      return {
        'channelName-$channelId': `${channelName}-${channelId}`,
        channelName: z.string().parse(channelName),
        channelId: z.number().int().parse(Number(channelId)),
      };
    },
    stringify: ({ channelName, channelId }) => ({
      'channelName-$channelId': `${channelName}-${channelId}`,
    }),
  },
  component: Channel,
});

function Channel() {
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: channel, isFetched } = trpc.content.getYoutubeChannel.useQuery({
    id: params.channelId,
    language: i18n.language ?? 'en',
  });

  const { data: suggestedChannels, isFetched: isFetchedSuggested } =
    trpc.content.getYoutubeChannels.useQuery({});

  const isScreenMd = useGreater('sm');

  useEffect(() => {
    if (channel && params.channelName !== formatNameForURL(channel.name)) {
      navigate({
        to: `/resources/channels/${formatNameForURL(channel.name)}-${channel.id}`,
      });
    }
  }, [channel, isFetched, navigateTo404, navigate, params.channelName]);

  function displayAbstract() {
    return (
      <article>
        <h3 className="mb-4 lg:mb-5 body-16px-medium md:subtitle-large-med-20px text-white md:text-newGray-3">
          {t('words.abstract')}
        </h3>
        <p className="line-clamp-[20] max-w-[772px] text-white body-14px whitespace-pre-line lg:body-16px">
          {channel?.description}
        </p>
      </article>
    );
  }

  const shuffledSuggestedChannels = useShuffleSuggestedContent(
    suggestedChannels ?? [],
    channel,
  );

  return (
    <ResourceLayout
      title={t('channels.pageTitle')}
      tagLine={t('channels.pageSubtitle')}
      link={'/resources/channels'}
      activeCategory="channels"
      showPageHeader={false}
      showResourcesDropdownMenu={true}
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !channel && (
        <div className="w-[768px] mx-auto text-white">
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.channel'),
          })}
        </div>
      )}
      {channel && (
        <div className="flex-col">
          <BackLink
            to={'/resources/channels'}
            label={t('resources.channels.title')}
          />

          <article className="w-full">
            <Card
              className="md:mx-auto w-full max-w-[1179px]"
              withPadding={false}
              paddingClass="p-5 md:p-[50px]"
              color="orange"
            >
              <div className="w-full flex flex-col md:flex-row gap-5 lg:gap-16">
                <div className="flex flex-col items-center">
                  <img
                    className="max-w-[219px] mx-auto object-cover [overflow-clip-margin:_unset] rounded-[10px] lg:max-w-[347px] md:mx-0 lg:rounded-none mb-5 lg:mb-[30px]"
                    alt={t('imagesAlt.bookCover')}
                    src={assetUrl(channel.path, 'thumbnail.webp')}
                  />
                  <div className="flex flex-row justify-evenly md:flex-col md:space-y-2 lg:flex-row lg:space-y-0">
                    {channel?.channel && (
                      <Link to={channel.channel} target="_blank">
                        <Button
                          size={isScreenMd ? 'l' : 'm'}
                          variant="primary"
                          className="mx-2"
                        >
                          {t('youtubeChannels.view')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="w-full max-w-2xl flex flex-col md:mt-0">
                  <div>
                    <div className="flex justify-between items-center gap-2 w-full mb-5 lg:mb-[30px]">
                      <h2 className="title-large-24px md:display-large-med-48px text-white">
                        {channel.name}
                      </h2>
                      <Flag
                        code={channel.language}
                        size="xl"
                        className="shrink-0 max-md:hidden"
                      />
                    </div>

                    <div className="flex flex-wrap gap-[10px] mb-5 lg:mb-8">
                      {channel.tags
                        ?.filter((tag) => tag && tag.toLowerCase() !== 'null')
                        .map((tag, i) => (
                          <TextTag
                            key={i}
                            size="small"
                            variant="lightMaroon"
                            mode="dark"
                          >
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                          </TextTag>
                        ))}
                    </div>
                  </div>

                  {isScreenMd && displayAbstract()}
                </div>
              </div>

              {!isScreenMd && displayAbstract()}
            </Card>
          </article>
        </div>
      )}

      <div className="flex flex-col mt-10 lg:mt-20 w-full">
        <h3 className="subtitle-medium-16px lg:display-small-32px text-white mb-2.5 lg:mb-8">
          {t('youtubeChannels.watchTrailer')}
        </h3>

        <div className="mx-auto max-w-full w-full aspect-video">
          <iframe
            width={'100%'}
            height={'100%'}
            className="mx-auto rounded-lg"
            src={fixEmbedUrl(channel?.trailer ?? '')}
            title="Channel Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>

      <section className="mt-10 lg:mt-20">
        <SuggestedHeader
          text="resources.pageSubtitleChannels"
          placeholder="Other channels"
        />

        <Carousel>
          <CarouselContent>
            {isFetchedSuggested ? (
              shuffledSuggestedChannels.slice(0, 10).map((suggestedChannel) => {
                const isChannel = 'name' in suggestedChannel;
                if (isChannel) {
                  return (
                    <CarouselItem
                      key={suggestedChannel.id}
                      className="basis-1/2 md:basis-1/4 text-white size-full bg-gradient-to-r max-w-[282px] max-h-[400px] rounded-[10px]"
                    >
                      <Link
                        to={`/resources/channels/${formatNameForURL(suggestedChannel.name)}-${suggestedChannel.id}`}
                      >
                        <div className="relative h-full">
                          <img
                            className="size-full min-h-[198px] max-h-[198px] lg:min-h-[400px] md:max-h-[400px] object-cover [overflow-clip-margin:_unset] rounded-[10px]"
                            alt={suggestedChannel.name}
                            src={assetUrl(
                              suggestedChannel.path,
                              'thumbnail.webp',
                            )}
                          />
                          <div
                            className="absolute inset-0 -bottom-px rounded-[10px]"
                            style={{
                              background: `linear-gradient(360deg, rgba(40, 33, 33, 0.90) 10%, rgba(0, 0, 0, 0.00) 60%),
                                  linear-gradient(0deg, rgba(57, 53, 49, 0.20) 0%, rgba(57, 53, 49, 0.20) 100%)`,
                              backgroundSize: '153.647% 100%',
                              backgroundPosition: '-5.216px 0px',
                              backgroundRepeat: 'no-repeat',
                            }}
                          />
                        </div>

                        <h3 className="absolute w-full max-w-[140px] lg:max-w-[220px] lg:w-[220px] px-2 lg:px-4 body-14px lg:title-large-24px mb-1 lg:mb-5 bottom-px line-clamp-2">
                          {suggestedChannel.name}
                        </h3>
                      </Link>
                    </CarouselItem>
                  );
                }
                return null;
              })
            ) : (
              <Loader size={'s'} />
            )}
          </CarouselContent>
          <CarouselPrevious className="*:size-5 md:*:size-8" />
          <CarouselNext className="*:size-5 md:*:size-8" />
        </Carousel>
      </section>
    </ResourceLayout>
  );
}
