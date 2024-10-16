import { Link, createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

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

import { useGreater } from '#src/hooks/use-greater.js';
import { useSuggestedContent } from '#src/utils/resources-hook.ts';
import { trpc } from '#src/utils/trpc.js';

import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute('/_content/resources/podcasts/$podcastId')(
  {
    component: Podcast,
  },
);

function Podcast() {
  const { t, i18n } = useTranslation();
  const { podcastId } = useParams({
    from: '/resources/podcasts/$podcastId',
  });
  const { data: podcast, isFetched } = trpc.content.getPodcast.useQuery({
    id: Number(podcastId),
    language: i18n.language ?? 'en',
  });

  const { data: suggestedPodcasts, isFetched: isFetchedSuggested } =
    useSuggestedContent('podcasts');

  const isScreenMd = useGreater('sm');

  function displayAbstract() {
    return (
      <div className="mt-6">
        <h3 className="mb-4 lg:mb-5 body-16px-medium md:subtitle-large-med-20px text-white">
          {t('podcast.abstract')}
        </h3>
        <p className="line-clamp-[20] max-w-3xl text-ellipsis whitespace-pre-line text-white text-justify body-14px lg:body-16px">
          {podcast?.description}
        </p>
      </div>
    );
  }

  return (
    <ResourceLayout
      title={t('podcasts.pageTitle')}
      tagLine={t('podcasts.pageSubtitle')}
      link={'/resources/podcasts'}
      activeCategory="podcasts"
      showPageHeader={false}
      backToCategoryButton
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
        <article className="w-full">
          <Card className="md:mx-auto" color="orange">
            <div className="w-full flex flex-col md:flex-row gap-5 lg:gap-16">
              <div className="flex flex-col items-center justify-center">
                <img
                  className="max-w-[219px] mx-auto object-cover [overflow-clip-margin:_unset] rounded-[10px] lg:max-w-[347px] md:mx-0 lg:rounded-[22px] mb-8 lg:mb-12"
                  alt={t('imagesAlt.bookCover')}
                  src={podcast.logo}
                />
                <div className="flex flex-row justify-evenly md:flex-col md:space-y-2 lg:flex-row lg:space-y-0">
                  {podcast?.podcastUrl && (
                    <Link to={podcast.podcastUrl}>
                      <Button
                        size={isScreenMd ? 'l' : 'm'}
                        variant="primary"
                        className="mx-2"
                      >
                        {t('podcast.discover')}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="w-full max-w-2xl mt-4 flex flex-col md:mt-0">
                <div>
                  <h2 className="title-large-24px md:display-large-med-48px text-white mb-5 lg:mb-8">
                    {podcast?.name}
                  </h2>

                  <div className="flex flex-wrap gap-[10px] mb-5 lg:mb-8">
                    {podcast?.tags.map((tag, i) => (
                      <TextTag
                        key={i}
                        size="resourcesNewSize"
                        variant="newGray"
                      >
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </TextTag>
                    ))}
                  </div>

                  <div className="flex items-center flex-wrap">
                    <span className="text-white body-14px-medium md:body-16px-medium">
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
      )}

      <section className="mt-8 lg:mt-[100px]">
        <h3 className="label-medium-med-16px md:title-large-24px font-medium leading-none md:leading-[116%] text-white mb-5 md:mb-10">
          {t('resources.pageSubtitlePodcast')}
        </h3>
        <Carousel>
          <CarouselContent>
            {isFetchedSuggested ? (
              suggestedPodcasts?.map((suggestedPodcast) => {
                const isPodcast =
                  'logo' in suggestedPodcast && 'name' in suggestedPodcast;

                if (isPodcast) {
                  return (
                    <CarouselItem
                      key={suggestedPodcast.id}
                      className="text-white basis-1/2 md:basis-1/2 lg:basis-1/4 relative bg-gradient-to-r w-full max-w-[282px] max-h-[350px] rounded-[22px]"
                    >
                      <Link to={`/resources/podcasts/${suggestedPodcast.id}`}>
                        <div className="relative h-full">
                          <img
                            className="max-h-72 sm:max-h-96 size-full object-cover rounded-[10px]"
                            alt={suggestedPodcast.name}
                            src={suggestedPodcast.logo}
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

                        <h3 className="absolute px-2 lg:px-4 body-14px lg:title-large-24px mb-1 lg:mb-5 bottom-px line-clamp-2">
                          {suggestedPodcast.name}
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
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>
    </ResourceLayout>
  );
}
