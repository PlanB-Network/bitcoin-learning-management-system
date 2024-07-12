import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Spinner from '#src/assets/spinner_orange.svg?react';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { SITE_NAME } from '#src/utils/meta.js';

import { CategoryIcon } from '../../components/CategoryIcon/index.tsx';
import { MainLayout } from '../../components/MainLayout/index.tsx';
import { PageHeader } from '../../components/PageHeader/index.tsx';
import { computeAssetCdnUrl, trpc } from '../../utils/index.ts';
import { FilterBar } from '../resources/-components/FilterBar/index.tsx';

import { TUTORIALS_CATEGORIES } from './-other/utils.tsx';

export const Route = createFileRoute('/tutorials/')({
  component: TutorialExplorer,
});

function TutorialExplorer() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: tutorials, isFetched } = trpc.content.getTutorials.useQuery(
    {
      language: i18n.language,
    },
    {
      staleTime: 300_000, // 5 minutes
    },
  );

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

        <div className="flex w-full content-center justify-center p-4 sm:px-8 md:pb-16 md:pt-10 ">
          <div className="grid w-[64rem] grid-cols-2 gap-x-8 sm:gap-x-12 md:grid-cols-3">
            {TUTORIALS_CATEGORIES.map((tutorialCategory) => (
              <Link
                key={tutorialCategory.name}
                to={'/tutorials/$category'}
                params={{ category: tutorialCategory.name }}
              >
                <div className="flex items-center space-x-2 rounded-lg py-2 sm:space-x-4 sm:p-2">
                  <CategoryIcon src={tutorialCategory.image} />
                  <h3 className="text-sm min-[420px]:text-lg font-semibold text-white sm:text-xl lg:text-2xl">
                    {t(`tutorials.${tutorialCategory.name}.title`)}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="mb-6 flex w-full flex-col items-center md:-mt-10">
          <FilterBar
            label={t('resources.filterBarLabel')}
            onChange={setSearchTerm}
          />
        </div>
        <div className="flex flex-col items-center bg-newGray-6 pt-10 text-blue-800">
          <div className="-mt-6 hidden max-w-2xl pb-6 text-center sm:block">
            <span className="font-medium">
              {t('tutorials.explorer.didYouKnow')}
            </span>
            <span>{t('tutorials.explorer.description')}</span>
          </div>
          <div className="flex max-w-3xl flex-wrap justify-center gap-6">
            {!isFetched && <Spinner className="size-48 md:size-64 mx-auto" />}
            {tutorials
              ?.filter((tutorial) =>
                tutorial.name.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((tutorial) => (
                <Link
                  to={'/tutorials-category/$category/$name'}
                  params={{
                    category: tutorial.category,
                    name: tutorial.name,
                  }}
                  key={tutorial.id}
                  className="group/builder relative flex flex-col items-center justify-center"
                >
                  <img
                    className="size-20 rounded-full group-hover/builder:blur-sm group-focus/builder:blur-sm group-focus/builder:brightness-[30%] transition-all"
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
