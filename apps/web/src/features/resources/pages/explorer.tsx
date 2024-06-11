import { Link } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import { CategoryIcon } from '../../../components/CategoryIcon/index.tsx';
import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { PageHeader } from '../../../components/PageHeader/index.tsx';
import { RESOURCES_CATEGORIES } from '../utils.tsx';

export const Resources = () => {
  const { t } = useTranslation();

  return (
    <MainLayout footerVariant="dark" fillScreen>
      <div className="flex flex-col">
        <PageHeader
          title={t('resources.pageTitle')}
          subtitle={t('resources.pageSubtitle')}
          description={t('resources.pageDescription')}
        />
        <div className="mt-10 md:mt-20 px-4 md:px-8">
          <div className="flex flex-wrap justify-center items-center content-center max-w-xl md:max-w-5xl p-4 md:p-[30px] mx-auto gap-2 md:gap-12 bg-[#1A1A1A40] shadow-[0px_5px_30px_0px_rgba(255,255,255,0.49)] rounded-3xl border border-white">
            {RESOURCES_CATEGORIES.map((resourceCategory) => (
              <Link
                key={resourceCategory.name}
                to={`/resources/${resourceCategory.name}`}
                onClick={(event) =>
                  resourceCategory.unreleased && event.preventDefault()
                }
                className={cn(
                  'group',
                  resourceCategory.unreleased ? 'cursor-not-allowed' : '',
                )}
              >
                <div
                  className={cn(
                    'w-40 md:w-[272px] flex items-center rounded-2xl py-[5px] px-2.5 md:py-2.5 md:px-5 gap-5 md:gap-6 transition-all',
                    resourceCategory.unreleased
                      ? 'opacity-50'
                      : 'opacity-100 group-hover:bg-newBlack-3 group-focus:bg-newBlack-3',
                  )}
                >
                  <CategoryIcon
                    src={resourceCategory.image}
                    variant="resources"
                  />
                  <h3
                    className={cn(
                      'text-sm md:text-2xl text-white max-md:leading-[1.43] max-md:tracking-[0.17px]',
                      resourceCategory.unreleased
                        ? ''
                        : 'group-hover:font-medium group-focus:font-medium',
                    )}
                  >
                    {t(`resources.${resourceCategory.name}.title`)}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <p className="max-w-3xl mx-auto leading-snug md:leading-relaxed tracking-015px md:text-xl md:font-medium text-center mt-8 md:mt-16 px-8">
          <Trans i18nKey="resources.github" className="">
            <a
              className="underline underline-offset-2 hover:text-darkOrange-5"
              href="https://github.com/DecouvreBitcoin/sovereign-university-data"
            >
              Github Repository
            </a>
          </Trans>
        </p>
      </div>
    </MainLayout>
  );
};
