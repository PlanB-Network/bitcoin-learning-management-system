import { Link, createFileRoute } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Loader } from '@blms/ui';

import PageMeta from '#src/components/Head/PageMeta/index.js';
import { MainLayout } from '#src/components/main-layout.js';
import { PageHeader } from '#src/components/page-header.js';
import CategoryContainer from '#src/organisms/category-container.tsx';
import { AppContext } from '#src/providers/context.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';
import { SITE_NAME } from '#src/utils/meta.js';

import { TUTORIALS_CATEGORIES } from '../../../services/utils.tsx';
import { FilterBar } from '../resources/-components/filter-bar.tsx';

export const Route = createFileRoute('/_content/tutorials/')({
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
                      <div
                        key={tutorial.id}
                        className="flex flex-col gap-2 items-center justify-center w-20 lg:w-24 h-full"
                      >
                        <Link
                          to={'/tutorials/$category/$name'}
                          params={{
                            category: tutorial.category,
                            name: tutorial.name,
                          }}
                          className="group/builder relative flex flex-col items-center justify-center"
                        >
                          <img
                            className="size-12 sm:size-14 md:size-16 lg:size-20 rounded-full group-hover/builder:blur-sm group-focus/builder:blur-sm group-focus/builder:brightness-[30%] transition-all bg-white/20"
                            src={
                              tutorial.builder
                                ? computeAssetCdnUrl(
                                    tutorial.builder.lastCommit,
                                    `${tutorial.builder.path}/assets/logo.webp`,
                                  )
                                : computeAssetCdnUrl(
                                    tutorial.lastCommit,
                                    `${tutorial.path}/assets/logo.webp`,
                                  )
                            }
                            alt={tutorial.title}
                          />
                          <p className="absolute flex justify-center items-center size-full p-1 rounded-full text-center text-xs font-bold text-white group-hover/builder:bg-black/60 opacity-0 group-hover/builder:opacity-100 group-focus/builder:opacity-100 transition-all">
                            {tutorial.title.slice(0, 18)}
                          </p>
                        </Link>
                        <Link
                          to={'/tutorials/$category/$name'}
                          params={{
                            category: tutorial.category,
                            name: tutorial.name,
                          }}
                          key={tutorial.id}
                          className="text-xs font-bold text-white max-md:hidden text-center line-clamp-2"
                        >
                          {tutorial.title}
                        </Link>
                      </div>
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
