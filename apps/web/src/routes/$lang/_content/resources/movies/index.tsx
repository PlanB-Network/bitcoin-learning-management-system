import { Link, createFileRoute } from '@tanstack/react-router';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Flag, Loader, Switch, VerticalCard } from '@blms/ui';

import { LANGUAGES_MAP } from '@blms/shared';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { resourceImgUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { trpc } from '#src/utils/trpc.js';

import { ResourceCard } from '../-components/cards/resource-card.tsx';
import { ResourceLayout } from '../-components/resource-layout.tsx';

export const Route = createFileRoute('/$lang/_content/resources/movies/')({
  component: Movies,
});

function Movies() {
  const { t, i18n } = useTranslation();
  const isMobile = useSmaller('md');
  const [showLocalOnly, setShowLocalOnly] = useState(true);

  const { data: movies, isFetched } = trpc.content.getMovies.useQuery(
    {},
    { staleTime: 300_000 },
  );

  const localMovies =
    movies?.filter((movie) => movie.language === i18n.language) ?? [];

  const englishMovies =
    movies?.filter((movie) => movie.language === 'en') ?? [];

  const handleSwitchChange = (checked: boolean) => {
    setShowLocalOnly(checked);
  };

  const sortedMovies = (
    showLocalOnly ? [...localMovies] : [...(movies ?? [])]
  ).sort((a, b) => a.title.localeCompare(b.title));

  const isEnglishLanguage = i18n.language === 'en';

  return (
    <ResourceLayout title={t('movies.pageTitle')} activeCategory="movies">
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

        <div className="flex flex-wrap max-md:justify-center gap-4 md:gap-11">
          {!isFetched && <Loader size="s" />}
          {sortedMovies?.length ? (
            sortedMovies.map((movie) => (
              <Fragment key={movie.id}>
                <Link
                  to={`/resources/movies/${formatNameForURL(movie.title)}-${movie.id}`}
                  params={{
                    movieId: movie.id.toString(),
                  }}
                  className="grow md:grow-0"
                >
                  <ResourceCard
                    name={movie.title}
                    author={movie.author}
                    imageSrc={resourceImgUrl(movie)}
                    language={movie.language}
                  />
                </Link>
              </Fragment>
            ))
          ) : (
            <p className="text-center text-gray-500">
              {t('resources.movies.noMovies')}
            </p>
          )}
        </div>

        {showLocalOnly && !isEnglishLanguage && englishMovies.length > 0 && (
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
            <div className="flex flex-wrap gap-4 md:gap-11">
              {englishMovies.map((movie) => (
                <Fragment key={movie.id}>
                  <Link
                    to={`/resources/movies/${formatNameForURL(movie.title)}-${movie.id}`}
                    params={{
                      movieId: movie.id.toString(),
                    }}
                    key={movie.id}
                    className="grow md:grow-0 max-md:hidden"
                  >
                    <ResourceCard
                      name={movie.title}
                      author={movie.author}
                      imageSrc={resourceImgUrl(movie)}
                      language={movie.language}
                    />
                  </Link>
                  <VerticalCard
                    imageSrc={resourceImgUrl(movie)}
                    title={movie.title}
                    subtitle={movie.author}
                    buttonVariant="primary"
                    buttonLink={`/resources/movies/${formatNameForURL(movie.title)}-${movie.id}`}
                    buttonText={t('words.viewMore')}
                    languages={[movie.language]}
                    className="md:hidden w-[137px]"
                    flagsOnMobile
                    isScreenMd={!isMobile}
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
