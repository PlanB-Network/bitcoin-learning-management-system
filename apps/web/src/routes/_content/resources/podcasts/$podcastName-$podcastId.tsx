import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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

import ThumbUp from '#src/assets/icons/thumb-up-pixelated.svg';
import { useGreater } from '#src/hooks/use-greater.js';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import { BackLink } from '#src/molecules/backlink.tsx';
import { assetUrl, trpc } from '#src/utils/index.ts';
import { useSuggestedContent } from '#src/utils/resources-hook.ts';
import { formatNameForURL } from '#src/utils/string.ts';

import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute(
  '/_content/resources/podcasts/$podcastName-$podcastId',
)({
  params: {
    parse: (params) => {
      const podcastNameId = params['podcastName-$podcastId'];
      const podcastId = podcastNameId.split('-').pop();
      const podcastName = podcastNameId.slice(
        0,
        Math.max(0, podcastNameId.lastIndexOf('-')),
      );

      return {
        'podcastName-$podcastId': `${podcastName}-${podcastId}`,
        podcastName: z.string().parse(podcastName),
        podcastId: z.number().int().parse(Number(podcastId)),
      };
    },
    stringify: ({ podcastName, podcastId }) => ({
      'podcastName-$podcastId': `${podcastName}-${podcastId}`,
    }),
  },
  component: Podcast,
});

function Podcast() {
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: podcast, isFetched } = trpc.content.getPodcast.useQuery({
    id: params.podcastId,
    language: i18n.language ?? 'en',
  });

  const { data: suggestedPodcasts, isFetched: isFetchedSuggested } =
    useSuggestedContent('podcasts');

  const isScreenMd = useGreater('sm');

  useEffect(() => {
    if (podcast && params.podcastName !== formatNameForURL(podcast.name)) {
      navigate({
        to: `/resources/podcasts/${formatNameForURL(podcast.name)}-${podcast.id}`,
      });
    }
  }, [podcast, isFetched, navigateTo404, navigate, params.podcastName]);

  function displayAbstract() {
    return (
      <article>
        <h3 className="mb-4 lg:mb-5 body-16px-medium md:subtitle-large-med-20px text-white md:text-newGray-3">
          {t('podcast.abstract')}
        </h3>
        <p className="line-clamp-[20] max-w-[772px] text-white body-14px whitespace-pre-line lg:body-16px">
          {podcast?.description}
        </p>
      </article>
    );
  }

  const filteredSuggestedPodcasts = suggestedPodcasts?.filter(
    (suggestedPodcast) => suggestedPodcast.id !== params.podcastId,
  );

  return (
    <ResourceLayout
      title={t('podcasts.pageTitle')}
      tagLine={t('podcasts.pageSubtitle')}
      link={'/resources/podcasts'}
      activeCategory="podcasts"
      showPageHeader={false}
      showResourcesDropdownMenu={false}
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !podcast && (
        <div className="w-[768px] mx-auto text-white">
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.podcast'),
          })}
        </div>
      )}
      {podcast && (
        <div className="flex-col">
          <BackLink
            to={'/resources/podcasts'}
            label={t('resources.podcasts.title')}
          />

          <article className="w-full">
            <Card
              className="md:mx-auto w-full max-w-[1179px]"
              withPadding={false}
              paddingClass="p-5 md:p-[30px]"
              color="orange"
            >
              <div className="w-full flex flex-col md:flex-row gap-5 lg:gap-16">
                <div className="flex flex-col items-center justify-center">
                  <img
                    className="max-w-[219px] mx-auto object-cover [overflow-clip-margin:_unset] rounded-[10px] lg:max-w-[347px] md:mx-0 lg:rounded-none mb-5 lg:mb-[30px]"
                    alt={t('imagesAlt.bookCover')}
                    src={assetUrl(podcast.path, 'logo.webp')}
                  />
                  <div className="flex flex-row justify-evenly md:flex-col md:space-y-2 lg:flex-row lg:space-y-0">
                    {podcast?.podcastUrl && (
                      <Link to={podcast.podcastUrl}>
                        <Button
                          size={isScreenMd ? 'l' : 'm'}
                          variant="primary"
                          className="mx-2"
                        >
                          {t('podcast.check')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="w-full max-w-2xl flex flex-col md:mt-0">
                  <div>
                    <h2 className="title-large-24px md:display-large-med-48px text-white mb-5 lg:mb-[30px]">
                      {podcast?.name}
                    </h2>

                    <div className="flex flex-wrap gap-[10px] mb-5 lg:mb-8">
                      {podcast?.tags.map((tag, i) => (
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

                    <div className="flex items-center flex-wrap mb-5 md:mb-[30px]">
                      <span className="text-white subtitle-small-med-14px md:title-small-med-16px">
                        {podcast.host}
                      </span>
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

      <section className="mt-8 lg:mt-[100px]">
        <div className="flex items-center justify-center md:justify-start mb-5 lg:mb-10">
          <img
            src={ThumbUp}
            className="size-[20px] lg:size-[32px] mr-3 my-1"
            alt=""
          />
          <h3 className="flex items-center title-small-med-16px md:title-large-24px font-medium leading-none md:leading-[116%] text-white mt-2">
            <Trans i18nKey="resources.pageSubtitlePodcast">
              <span className="text-darkOrange-5 mr-1 title-small-med-16px md:title-large-24px">
                Other podcasts{''}
              </span>
            </Trans>
          </h3>
        </div>

        <Carousel>
          <CarouselContent>
            {isFetchedSuggested ? (
              filteredSuggestedPodcasts
                ?.sort(() => Math.random() - 0.5)
                .slice(0, 10)
                .map((podcast) => {
                  const isPodcast = 'name' in podcast;
                  if (isPodcast) {
                    return (
                      <CarouselItem
                        key={podcast.id}
                        className="basis-1/2 md:basis-1/4 text-white size-full bg-gradient-to-r max-w-[282px] max-h-[400px] rounded-[10px]"
                      >
                        <Link
                          to={`/resources/podcasts/${formatNameForURL(podcast.name)}-${podcast.id}`}
                        >
                          <div className="relative h-full">
                            <img
                              className="size-full min-h-[198px] max-h-[198px] lg:min-h-[400px] md:max-h-[400px] object-cover [overflow-clip-margin:_unset] rounded-[10px]"
                              alt={podcast.name}
                              src={assetUrl(podcast.path, 'logo.webp')}
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
                            {podcast.name}
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
