import { ResourceType } from '@blms/constants';
import { formatNameForURL } from '@blms/shared';
import { EmptyState, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { PageLayout } from '#src/components/page-layout.tsx';
import { SearchInput } from '#src/components/search-input.tsx';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { AppContext } from '#src/providers/context.tsx';
import { resourceImgUrl } from '#src/utils/index.ts';
import { trpc } from '#src/utils/trpc.js';
import { AddResourceModal } from '../-components/add-resource-modal.tsx';
import { ResourceCard } from '../-components/cards/resource-card.tsx';
import {
  LanguageResourcesSectionHeader,
  SelectedLanguageSwitcher,
} from '../-components/selected-language-switcher.tsx';
import { resourcesTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/resources/movies/')({
  component: Movies,
});

function Movies() {
  const { session } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  const [showLocalOnly, setShowLocalOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const isLoggedIn = !!session?.user;

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

  const sortedMovies = (showLocalOnly ? [...localMovies] : [...(movies ?? [])])
    .sort((a, b) => a.title.localeCompare(b.title))
    .filter(
      (movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const isEnglishLanguage = i18n.language === 'en';

  return (
    <PageLayout
      title={t('resources.movies.title')}
      tabs={resourcesTabs}
      layoutSize="wide"
      actionButtons={[
        {
          text: t('resources.addResource.movie'),
          onClick: isLoggedIn ? () => setIsModalOpen(true) : openAuthModal,
        },
      ]}
    >
      <AddResourceModal
        resourceType={ResourceType.Movie}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        className="ml-auto max-sm:mt-4 mt-2 mb-4 sm:mb-6"
        fullWidthOnMobile
      />
      <div className="flex flex-col">
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
            <EmptyState title={t('resources.movies.noMovies')} />
          )}
        </div>

        {showLocalOnly && !isEnglishLanguage && englishMovies.length > 0 && (
          <section>
            <LanguageResourcesSectionHeader language="en" />
            <div className="flex flex-wrap gap-0.5 sm:gap-6">
              {englishMovies
                .filter(
                  (movie) =>
                    movie.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    movie.author
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    movie.description
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                )
                .map((movie) => (
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
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialState={AuthModalState.Register}
        />
      )}
    </PageLayout>
  );
}
