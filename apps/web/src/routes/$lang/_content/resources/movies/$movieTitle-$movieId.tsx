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
import Flag from '#src/molecules/Flag/index.tsx';
import { BackLink } from '#src/molecules/backlink.tsx';
import { assetUrl, trpc } from '#src/utils/index.ts';
import { useShuffleSuggestedContent } from '#src/utils/resources-hook.ts';
import { formatNameForURL } from '#src/utils/string.ts';

import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';
import { SuggestedHeader } from '../-components/suggested-header.tsx';

export const Route = createFileRoute(
  '/$lang/_content/resources/movies/$movieTitle-$movieId',
)({
  params: {
    parse: (params) => {
      const movieTitleId = params['movieTitle-$movieId'];
      const { id, name } = getNameAndIdFromUrl(movieTitleId);

      return {
        lang: z.string().parse(params.lang),
        'movieTitle-$movieId': `${name}-${id}`,
        movieTitle: z.string().parse(name),
        movieId: z.string().parse(id),
      };
    },
    stringify: ({ lang, movieTitle, movieId }) => ({
      lang: lang,
      'movieTitle-$movieId': `${movieTitle}-${movieId}`,
    }),
  },
  component: Movie,
});

function Movie() {
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: movie, isFetched } = trpc.content.getMovie.useQuery({
    id: params.movieId,
    language: i18n.language ?? 'en',
  });

  const { data: suggestedMovies, isFetched: isFetchedSuggested } =
    trpc.content.getMovies.useQuery({});

  const isScreenMd = useGreater('sm');

  useEffect(() => {
    if (movie && params.movieTitle !== formatNameForURL(movie.title)) {
      navigate({
        to: `/resources/movies/${formatNameForURL(movie.title)}-${movie.id}`,
        replace: true,
      });
    }
  }, [movie, isFetched, navigateTo404, navigate, params.movieTitle]);

  function displayAbstract() {
    return (
      <article>
        <h3 className="mb-4 lg:mb-5 body-16px-medium md:subtitle-large-med-20px text-white md:text-newGray-3">
          {t('words.abstract')}
        </h3>
        <p className="line-clamp-[20] max-w-[772px] text-white body-14px whitespace-pre-line lg:body-16px">
          {movie?.description}
        </p>
      </article>
    );
  }

  const shuffledSuggestedMovies = useShuffleSuggestedContent(
    suggestedMovies ?? [],
    movie,
  );

  return (
    <ResourceLayout
      link={'/resources/movies'}
      activeCategory="movies"
      showPageHeader={false}
      showResourcesDropdownMenu={true}
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !movie && (
        <div className="max-w-[768px] mx-auto text-white">
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.movie'),
          })}
        </div>
      )}
      {movie && (
        <>
          <div className="flex-col">
            <BackLink
              to={'/resources/movies'}
              label={t('resources.movies.title')}
            />

            <article className="w-full">
              <Card
                className="md:mx-auto w-full max-w-[1179px]"
                withPadding={false}
                paddingClass="p-5 md:p-[50px]"
                color="orange"
              >
                <div className="w-full flex flex-col md:flex-row gap-5 lg:gap-10">
                  <div className="flex flex-col items-center gap-5 md:gap-[30px] relative">
                    <div className="relative">
                      <img
                        className="max-w-[219px] mx-auto object-cover [overflow-clip-margin:_unset] lg:max-w-[347px] md:mx-0 shadow-course-navigation"
                        alt={'Movie thumbnail'}
                        src={assetUrl(movie.path, 'thumbnail.webp')}
                      />
                      <Flag
                        code={movie.language}
                        size="m"
                        className="shrink-0 md:hidden absolute top-[13px] right-[12px]"
                      />
                    </div>
                    <div className="flex flex-row justify-evenly md:flex-col lg:flex-row">
                      {movie?.platform && (
                        <Link to={movie.platform} target="_blank">
                          <Button
                            size={isScreenMd ? 'l' : 's'}
                            variant="primary"
                            className="mx-2"
                          >
                            {t('movies.goToMovie')}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="w-full max-w-2xl flex flex-col md:mt-0">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center gap-2 w-full lg:mb-5">
                        <h2 className="title-large-24px lg:display-small-med-32px text-white max-md:mb-4">
                          {movie.title}
                        </h2>
                        <Flag
                          code={movie.language}
                          size="xl"
                          className="shrink-0 max-md:hidden"
                        />
                      </div>

                      {(movie.author || movie.duration) && (
                        <div className="flex flex-col max-md:gap-[5px]">
                          {movie.author && (
                            <span className="text-newGray-3 subtitle-small-med-14px lg:subtitle-large-med-20px">
                              {t('words.producer')}:{' '}
                              <span className="text-white">{movie.author}</span>
                            </span>
                          )}
                          {movie.duration && (
                            <span className="text-newGray-3 subtitle-small-med-14px lg:subtitle-large-med-20px">
                              {t('words.duration')}:{' '}
                              <span className="text-white">
                                {`${Math.floor(movie.duration / 60)}h ${(movie.duration % 60).toString().padStart(2, '0')}m`}
                              </span>
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 my-4">
                        {movie.tags
                          ?.filter(
                            (tag: string) =>
                              tag && tag.toLowerCase() !== 'null',
                          )
                          .map((tag: string) => (
                            <TextTag
                              key={tag}
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

          <div className="flex flex-col mt-8 lg:mt-[100px] w-full">
            <h3 className="subtitle-medium-16px lg:display-small-32px text-white mb-5 lg:mb-8">
              {t('movies.watchTrailer')}
            </h3>

            <div className="mx-auto max-w-full w-full aspect-video">
              <iframe
                width={'100%'}
                height={'100%'}
                className="mx-auto rounded-lg"
                src={fixEmbedUrl(movie?.trailer ?? '')}
                title="Movie Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          <section className="mt-8 lg:mt-[100px]">
            <SuggestedHeader
              text="resources.pageSubtitleMovies"
              placeholder="Other movies"
            />

            <Carousel>
              <CarouselContent>
                {isFetchedSuggested ? (
                  shuffledSuggestedMovies.slice(0, 10).map((suggestedMovie) => {
                    const isMovie = 'title' in suggestedMovie;
                    if (isMovie) {
                      return (
                        <CarouselItem
                          key={suggestedMovie.id}
                          className="basis-1/2 md:basis-1/4 text-white size-full bg-gradient-to-r max-w-[282px] max-h-[400px] rounded-[10px]"
                        >
                          <Link
                            to={`/resources/movies/${formatNameForURL(suggestedMovie.title)}-${suggestedMovie.id}`}
                          >
                            <div className="relative h-full">
                              <img
                                className="size-full min-h-[198px] max-h-[198px] lg:min-h-[400px] md:max-h-[400px] object-cover [overflow-clip-margin:_unset] rounded-[10px]"
                                alt={suggestedMovie.title}
                                src={assetUrl(
                                  suggestedMovie.path,
                                  'thumbnail.webp',
                                )}
                              />
                            </div>
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
        </>
      )}
    </ResourceLayout>
  );
}
