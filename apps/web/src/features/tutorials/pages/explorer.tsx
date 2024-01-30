import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CategoryIcon } from '../../../components/CategoryIcon';
import { MainLayout } from '../../../components/MainLayout';
import {
  PageDescription,
  PageHeader,
  PageSubtitle,
  PageTitle,
} from '../../../components/PageHeader';
import { computeAssetCdnUrl, trpc } from '../../../utils';
import { FilterBar } from '../../resources/components/FilterBar';
import { TUTORIALS_CATEGORIES } from '../utils';

export const TutorialExplorer = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: tutorials } = trpc.content.getTutorials.useQuery({
    language: i18n.language,
  });

  return (
    <MainLayout footerVariant="light">
      <div className="flex flex-col justify-center">
        <PageHeader>
          <PageTitle>{t('tutorials.pageTitle')}</PageTitle>
          <PageSubtitle>{t('tutorials.pageSubtitle')}</PageSubtitle>
          <PageDescription>{t('tutorials.pageDescription')}</PageDescription>
        </PageHeader>

        <div className="bg-blue-1000 flex w-full content-center justify-center px-8 pb-10 sm:pb-32 sm:pt-10 ">
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
        <div className="flex w-full flex-col items-center md:-mt-10">
          <FilterBar
            label={t('resources.filterBarLabel')}
            onChange={setSearchTerm}
          />
        </div>
        <div className="flex w-screen flex-col items-center bg-gray-100 pt-10">
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
                    className="m-1 h-20 w-20 grid-cols-1 rounded-full"
                    src={
                      tutorial.builder
                        ? computeAssetCdnUrl(
                            tutorial.builder.last_commit,
                            `${tutorial.builder.path}/assets/logo.jpeg`,
                          )
                        : computeAssetCdnUrl(
                            tutorial.last_commit,
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
