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

export const Route = createFileRoute('/$lang/_content/resources/movies/')({
  component: Movies,
});

function Movies() {
  const { t, i18n } = useTranslation();
  const [showLocalOnly, setShowLocalOnly] = useState(false);

  const { data: movies, isFetched } = useQuery(
    trpc.content.getMovies.queryOptions({}, { staleTime: 300_000 }),
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
    <PageLayout
      title={t('resources.movies.title')}
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
          {sortedMovies?.length ? (
            sortedMovies.map((movie) => (
              <Link
                to={`/resources/movies/${formatNameForURL(movie.title)}-${movie.id}`}
                params={{
                  movieId: movie.id.toString(),
                }}
                className="max-sm:w-full"
                key={movie.id}
              >
                <ResourceCard
                  name={movie.title}
                  author={movie.author}
                  imageSrc={resourceImgUrl(movie)}
                  language={movie.language}
                />
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500">
              {t('resources.movies.noMovies')}
            </p>
          )}
        </div>

        {showLocalOnly && !isEnglishLanguage && englishMovies.length > 0 && (
          <section>
            <LanguageResourcesSectionHeader language="en" />
            <div className="flex flex-wrap gap-0.5 sm:gap-6 sm:justify-center">
              {englishMovies.map((movie) => (
                <Link
                  to={`/resources/movies/${formatNameForURL(movie.title)}-${movie.id}`}
                  params={{
                    movieId: movie.id.toString(),
                  }}
                  key={movie.id}
                  className="max-sm:w-full"
                >
                  <ResourceCard
                    name={movie.title}
                    author={movie.author}
                    imageSrc={resourceImgUrl(movie)}
                    language={movie.language}
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
