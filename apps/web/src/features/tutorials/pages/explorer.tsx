import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageMeta from '#src/components/Head/PageMeta/index.js';

import { CategoryIcon } from '../../../components/CategoryIcon/index.tsx';
import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { PageHeader } from '../../../components/PageHeader/index.tsx';
import { computeAssetCdnUrl, trpc } from '../../../utils/index.ts';
import { FilterBar } from '../../resources/components/FilterBar/index.tsx';
import { TUTORIALS_CATEGORIES } from '../utils.tsx';

export const TutorialExplorer = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: tutorials } = trpc.content.getTutorials.useQuery({
    language: i18n.language,
  });

  return (
    <MainLayout variant="light">
      <PageMeta
        title={`Plan B Network - ${t('tutorials.pageTitle')}`}
        description={t('tutorials.pageDescription')}
      />
      <div className="bg-blue-1000 flex flex-col justify-center">
        <PageHeader
          title={t('tutorials.pageTitle')}
          subtitle={t('tutorials.pageSubtitle')}
          description={t('tutorials.pageDescription')}
        />

        <div className="flex w-full content-center justify-center px-8 pb-10 sm:pb-32 sm:pt-10 ">
          <div className="grid w-[64rem] grid-cols-2 gap-x-12 md:grid-cols-3">
            {TUTORIALS_CATEGORIES.map((tutorialCategory) => (
              <Link
                key={tutorialCategory.name}
                to={'/tutorials/$category'}
                params={{ category: tutorialCategory.name }}
              >
                <div className="flex items-center space-x-2 rounded-lg py-2 sm:space-x-4 sm:p-2">
                  <CategoryIcon src={tutorialCategory.image} />
                  <h3 className="text-lg font-semibold text-white sm:text-xl lg:text-2xl">
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
        <div className="flex flex-col items-center bg-gray-100 pt-10 text-blue-800">
          <div className="-mt-6 hidden max-w-2xl pb-6 text-center sm:block">
            <span className="font-medium">
              {t('tutorials.explorer.didYouKnow')}
            </span>
            <span>{t('tutorials.explorer.description')}</span>
          </div>
          <div className="flex max-w-3xl flex-wrap justify-center gap-6">
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
                >
                  <img
                    className="m-1 size-20 grid-cols-1 rounded-full"
                    src={
                      tutorial.builder
                        ? computeAssetCdnUrl(
                            tutorial.builder.lastCommit,
                            `${tutorial.builder.path}/assets/logo.jpeg`,
                          )
                        : computeAssetCdnUrl(
                            tutorial.lastCommit,
                            `${tutorial.path}/assets/logo.jpeg`,
                          )
                    }
                    alt=""
                  />
                </Link>
              ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
