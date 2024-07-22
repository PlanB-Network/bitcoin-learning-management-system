import { Link, createFileRoute } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@blms/ui';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { CategoryIcon } from '#src/components/CategoryIcon/index.js';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { MainLayout } from '#src/components/MainLayout/index.js';
import { PageHeader } from '#src/components/PageHeader/index.js';
import { AppContext } from '#src/providers/context.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';
import { SITE_NAME } from '#src/utils/meta.js';

import { FilterBar } from '../resources/-components/FilterBar/index.tsx';

import { TUTORIALS_CATEGORIES } from './-other/utils.tsx';

export const Route = createFileRoute('/_content/tutorials/')({
  component: TutorialExplorer,
});

function TutorialExplorer() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { tutorials } = useContext(AppContext);
  const isFetchedTutorials = tutorials && tutorials.length > 0;

  return (
    <MainLayout variant="gray">
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

        <div className="mt-10 md:mt-20 px-4 md:px-8">
          <div className="flex flex-wrap justify-center items-center content-center max-w-xl md:max-w-5xl md:p-[30px] mx-auto gap-4 sm:gap-5 md:gap-12 md:bg-[#1A1A1A40] md:shadow-[0px_5px_30px_0px_rgba(255,255,255,0.49)] md:rounded-3xl md:border border-white">
            {TUTORIALS_CATEGORIES.map((tutorialCategory) => (
              <Link
                key={tutorialCategory.name}
                to={`/tutorials/${tutorialCategory.name}`}
                className="group"
              >
                <div
                  className={cn(
                    'max-md:size-[135px] md:w-[272px] flex max-md:flex-col max-md:justify-center items-center rounded-2xl p-5 md:py-2.5 md:px-5 gap-3 md:gap-6 transition-all max-md:bg-newBlack-2 max-md:border max-md:border-newGray-1 opacity-100 md:group-hover:bg-newBlack-3 max-md:group-hover:border-darkOrange-5',
                  )}
                >
                  <CategoryIcon
                    src={tutorialCategory.image}
                    variant="resources"
                    imgClassName={cn(
                      'max-md:filter-white max-md:group-hover:filter-newOrange1',
                    )}
                  />
                  <h3
                    className={cn(
                      'max-md:desktop-body1 md:text-2xl text-white max-md:text-center',
                      tutorialCategory
                        ? ''
                        : 'max-md:group-hover:text-darkOrange-5 group-hover:font-medium',
                    )}
                  >
                    {t(`tutorials.${tutorialCategory.name}.title`)}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="mb-6 flex w-full flex-col items-center mt-4 md:mt-10">
          <FilterBar onChange={setSearchTerm} />
          <p className="max-md:hidden max-w-xl text-center body-16px">
            <span className="font-medium">
              {t('tutorials.explorer.didYouKnow')}
            </span>{' '}
            {t('tutorials.explorer.description')}
          </p>
        </div>
        <div className="flex flex-col items-center bg-newGray-6 pt-10 text-blue-800">
          <div className="flex max-w-3xl flex-wrap justify-center gap-6 px-2">
            {!isFetchedTutorials && (
              <Spinner className="size-24 md:size-32 mx-auto" />
            )}
            {tutorials
              ?.filter((tutorial) =>
                tutorial.name.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((tutorial) => (
                <Link
                  to={'/tutorials/$category/$name'}
                  params={{
                    category: tutorial.category,
                    name: tutorial.name,
                  }}
                  key={tutorial.id}
                  className="group/builder relative flex flex-col items-center justify-center"
                >
                  <img
                    className="size-12 sm:size-14 md:size-16 lg:size-20 rounded-full group-hover/builder:blur-sm group-focus/builder:blur-sm group-focus/builder:brightness-[30%] transition-all"
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
              ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
