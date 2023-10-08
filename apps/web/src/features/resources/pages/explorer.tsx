import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import { CategoryIcon } from '../../../components/CategoryIcon';
import {
  PageDescription,
  PageHeader,
  PageSubtitle,
  PageTitle,
} from '../../../components/PageHeader';
import { RESOURCES_CATEGORIES } from '../utils';

export const Resources = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-center bg-gray-100">
      <PageHeader>
        <PageTitle>{t('resources.pageTitle')}</PageTitle>
        <PageSubtitle>{t('resources.pageSubtitle')}</PageSubtitle>
        <PageDescription>{t('resources.pageDescription')}</PageDescription>

        <div className="grid w-full grid-cols-2 bg-blue-900 pb-10 pt-6 sm:pb-32 sm:pt-10 md:grid-cols-3">
          {RESOURCES_CATEGORIES.map((resourceCategory) => (
            <Link
              key={resourceCategory.name}
              to={`/resources/${resourceCategory.name}`}
            >
              <div
                onClick={(event) =>
                  resourceCategory.unreleased && event.preventDefault()
                }
              >
                <div
                  className={cn(
                    'group flex items-center space-x-2 rounded-lg py-2 hover:bg-blue-600 sm:space-x-4 sm:p-2 duration-300',
                    resourceCategory.unreleased ? 'opacity-50' : 'opacity-100',
                  )}
                >
                  <CategoryIcon src={resourceCategory.image} />
                  <h3 className="text-base font-semibold text-white group-hover:text-orange-500 sm:text-xl lg:text-2xl">
                    {t(`resources.${resourceCategory.name}.title`)}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </PageHeader>
    </div>
  );
};
