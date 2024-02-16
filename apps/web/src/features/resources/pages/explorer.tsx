import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import { CategoryIcon } from '../../../components/CategoryIcon/index.tsx';
import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { PageHeader } from '../../../components/PageHeader/index.tsx';
import { RESOURCES_CATEGORIES } from '../utils.tsx';

export const Resources = () => {
  const { t } = useTranslation();

  return (
    <MainLayout footerVariant="course">
      <div className="flex flex-col">
        <PageHeader
          title={t('resources.pageTitle')}
          subtitle={t('resources.pageSubtitle')}
          description={t('resources.pageDescription')}
        />

        <div className="mt-6 self-center">
          <div className="grid max-w-[64rem] grid-cols-2 px-4 md:grid-cols-3 md:px-0">
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
                      resourceCategory.unreleased
                        ? 'opacity-50'
                        : 'opacity-100',
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
        </div>
      </div>
    </MainLayout>
  );
};
