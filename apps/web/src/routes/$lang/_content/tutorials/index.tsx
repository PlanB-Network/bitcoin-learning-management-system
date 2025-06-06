import { Link, createFileRoute } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader } from '@blms/ui';

import PageMeta from '#src/components/Head/PageMeta/index.js';
import { MainLayout } from '#src/components/main-layout.js';
import { PageHeader } from '#src/components/page-header.js';
import CategoryContainer from '#src/patterns/category-container.tsx';
import { AppContext } from '#src/providers/context.js';
import { SITE_NAME } from '#src/utils/meta.js';

import { TUTORIALS_CATEGORIES } from '../../../../services/utils.tsx';
import { FilterBar } from '../resources/-components/filter-bar.tsx';

import { TutorialTile } from './-components/tutorial-tile.tsx';

export const Route = createFileRoute('/$lang/_content/tutorials/')({
  component: TutorialExplorer,
});

function TutorialExplorer() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { tutorials } = useContext(AppContext);
  const isFetchedTutorials = tutorials && tutorials.length > 0;

  return (
    <MainLayout footerVariant="dark">
      <PageMeta
        title={`${SITE_NAME} - ${t('tutorials.pageTitle')}`}
        description={t('tutorials.pageDescription')}
      />
      <div className="bg-black flex flex-col justify-center">
        <PageHeader
          title={t('tutorials.pageTitle')}
          subtitle={t('tutorials.pageSubtitle')}
          description={t('tutorials.pageDescription')}
        />

        <CategoryContainer
          categories={[...TUTORIALS_CATEGORIES]}
          baseUrl="/tutorials"
          getTitle={(category) => t(`tutorials.${category.name}.title`)}
        />
        <div className="flex w-full flex-col items-center mt-10 max-md:hidden">
          <FilterBar onChange={setSearchTerm} />
          <p className="max-md:hidden max-w-xl text-center body-16px">
            <span className="font-medium">
              {t('tutorials.explorer.didYouKnow')}
            </span>{' '}
            {t('tutorials.explorer.description')}
          </p>
          <h3 className="mt-8 display-small-32px">
            {t('tutorials.explorer.exploreAllTutorials')}
          </h3>
        </div>
        <div className="flex flex-col items-center pt-10 text-blue-800 max-md:hidden gap-16">
          {!isFetchedTutorials && <Loader size={'s'} />}
          {TUTORIALS_CATEGORIES.map((category) => {
            return (
              <section
                key={category.name}
                className="flex flex-col gap-16 items-center justify-center"
              >
                <Link
                  to={`/tutorials/${category.name}`}
                  className="flex gap-7 capitalize text-white display-medium-40px hover:text-darkOrange-5 w-fit py-5"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="size-11"
                  />
                  {category.name}
                </Link>
                <div className="flex max-w-5xl flex-wrap justify-center gap-11 px-2">
                  {tutorials
                    ?.filter(
                      (tutorial) =>
                        tutorial.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) &&
                        tutorial.category.toLowerCase() === category.name,
                    )
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((tutorial) => (
                      <TutorialTile key={tutorial.id} tutorial={tutorial} />
                    ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
