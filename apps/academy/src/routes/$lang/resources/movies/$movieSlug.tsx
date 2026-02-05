import { formatNameForURL } from '@blms/shared';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useNavigateMisc } from '#src/hooks/use-navigate-misc.ts';
import { getNameAndIdFromUrl } from '#src/services/utils.tsx';
import { resourceImgUrl, trpc } from '#src/utils/index.ts';
import { useShuffleSuggestedContent } from '#src/utils/resources-hook.ts';
import { ResourceDetails } from '../-components/resource-details.tsx';

export const Route = createFileRoute('/$lang/resources/movies/$movieSlug')({
  component: Movie,
  params: {
    parse: (params) => {
      const { id, name } = getNameAndIdFromUrl(params.movieSlug);

      return {
        lang: z.string().parse(params.lang),
        movieId: z.string().parse(id),
        movieTitle: z.string().parse(name),
        movieSlug: params.movieSlug,
      };
    },
    stringify: ({ lang, movieTitle, movieId }) => ({
      lang: lang,
      movieSlug: `${movieTitle}-${movieId}`,
    }),
  },
});

function Movie() {
  const navigate = useNavigate();
  const { navigateTo404 } = useNavigateMisc();
  const { t, i18n } = useTranslation();
  const params = Route.useParams();

  const { data: movie, isFetched } = useQuery(
    trpc.content.getMovie.queryOptions({
      id: params.movieId,
      language: i18n.language ?? 'en',
    }),
  );

  const { data: suggestedMovies, isFetched: isFetchedSuggested } = useQuery(
    trpc.content.getMovies.queryOptions({}),
  );

  useEffect(() => {
    if (movie && params.movieTitle !== formatNameForURL(movie.title)) {
      navigate({
        replace: true,
        to: `/resources/movies/${formatNameForURL(movie.title)}-${movie.id}`,
      });
    }
  }, [movie, isFetched, navigateTo404, navigate, params.movieTitle]);

  const shuffledSuggestedMovies = useShuffleSuggestedContent(
    suggestedMovies ?? [],
    movie,
  );

  return (
    <PageLayout
      backLink={{
        href: '/resources/movies',
        text: t('resources.movies.title'),
      }}
      layoutSize="wide"
      title={movie?.title ?? undefined}
      hideTitle
    >
      {!isFetched && <Loader size={'s'} />}
      {isFetched && !movie && (
        <div>
          {t('underConstruction.itemNotFoundOrTranslated', {
            item: t('words.movie'),
          })}
        </div>
      )}
      {movie && (
        <ResourceDetails
          title={movie.title}
          subtitle={movie.author || ''}
          language={movie.language}
          button={
            movie.platform
              ? {
                  href: movie.platform,
                  label: t('movies.checkTheMovie'),
                }
              : undefined
          }
          tags={movie.tags}
          imgSrc={resourceImgUrl(movie)}
          abstract={movie.description || ''}
          suggestedHeaderText="resources.pageSubtitleMovies"
          suggestedResources={
            isFetchedSuggested
              ? shuffledSuggestedMovies.map((suggestedMovie) => {
                  const isMovie = 'title' in suggestedMovie;
                  return {
                    title: isMovie ? suggestedMovie.title || '' : '',
                    href: isMovie
                      ? `/resources/movies/${formatNameForURL(suggestedMovie.title)}-${suggestedMovie.id}`
                      : '',
                    imgSrc: isMovie ? resourceImgUrl(suggestedMovie) : '',
                  };
                })
              : undefined
          }
        />
      )}
    </PageLayout>
  );
}
