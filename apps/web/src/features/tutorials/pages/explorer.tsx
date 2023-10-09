import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CategoryIcon } from '../../../components/CategoryIcon';
import { MainLayout } from '../../../components/MainLayout';
import {
  PageDescription,
  PageHeader,
  PageSubtitle,
  PageTitle,
} from '../../../components/PageHeader';
import { TUTORIALS_CATEGORIES } from '../utils';

export const TutorialExplorer = () => {
  const { t } = useTranslation();

  return (
    <MainLayout footerVariant="light">
      <div className="flex flex-col justify-center bg-gray-100">
        <PageHeader>
          <PageTitle>{t('tutorials.pageTitle')}</PageTitle>
          <PageSubtitle>{t('tutorials.pageSubtitle')}</PageSubtitle>
          <PageDescription>{t('tutorials.pageDescription')}</PageDescription>

          <div className="grid w-full grid-cols-2 pb-10 pt-6 sm:pb-32 sm:pt-10 md:grid-cols-3">
            {TUTORIALS_CATEGORIES.map((tutorialCategory) => (
              <Link
                key={tutorialCategory.name}
                to={'/tutorials/$category'}
                params={{ category: tutorialCategory.name }}
              >
                <div className="group flex items-center space-x-2 rounded-lg py-2 hover:bg-blue-600 sm:space-x-4 sm:p-2">
                  <CategoryIcon src={tutorialCategory.image} />
                  <h3 className="text-lg font-semibold text-white group-hover:text-orange-500 sm:text-xl lg:text-2xl">
                    {t(`tutorials.${tutorialCategory.name}.title`)}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </PageHeader>
      </div>
    </MainLayout>
  );
};
