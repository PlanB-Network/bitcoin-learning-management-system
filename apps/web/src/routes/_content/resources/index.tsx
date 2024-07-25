import { Link, createFileRoute } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import { CategoryIcon } from '#src/components/CategoryIcon/index.js';
import { MainLayout } from '#src/components/MainLayout/index.js';
import { PageHeader } from '#src/components/PageHeader/index.js';

import { RESOURCES_CATEGORIES } from './-other/utils.tsx';

export const Route = createFileRoute('/_content/resources/')({
  component: Resources,
});

function Resources() {
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
          <div className="flex flex-wrap justify-center items-center content-center max-w-xl md:max-w-5xl md:p-[30px] mx-auto gap-4 sm:gap-5 md:gap-12 md:bg-[#1A1A1A40] md:shadow-[0px_5px_30px_0px_rgba(255,255,255,0.49)] md:rounded-3xl md:border border-white">
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
                    'max-md:size-[135px] md:w-[272px] flex max-md:flex-col max-md:justify-center items-center rounded-2xl p-5 md:py-2.5 md:px-5 gap-3 md:gap-6 transition-all max-md:bg-newBlack-2 max-md:border max-md:border-newGray-1',
                    resourceCategory.unreleased
                      ? 'opacity-50'
                      : 'opacity-100 md:group-hover:bg-newBlack-3 max-md:group-hover:border-darkOrange-5',
                  )}
                >
                  <CategoryIcon
                    src={resourceCategory.image}
                    variant="resources"
                    imgClassName={cn(
                      'max-md:filter-white',
                      resourceCategory.unreleased
                        ? ''
                        : 'max-md:group-hover:filter-newOrange1',
                    )}
                  />
                  <h3
                    className={cn(
                      'max-md:desktop-body1 md:text-2xl text-white max-md:text-center',
                      resourceCategory.unreleased
                        ? ''
                        : 'max-md:group-hover:text-darkOrange-5 group-hover:font-medium',
                    )}
                  >
                    {t(`resources.${resourceCategory.name}.title`)}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <p className="max-w-3xl mx-auto leading-snug md:leading-relaxed tracking-015px max-md:text-newGray-3 md:text-xl md:font-medium text-center mt-8 md:mt-16 px-8">
          <Trans i18nKey="resources.github" className="">
            <a
              className="underline underline-offset-2 hover:text-darkOrange-5"
              href="https://github.com/PlanB-Network/bitcoin-educational-content"
            >
              Github Repository
            </a>
          </Trans>
        </p>
      </div>
    </MainLayout>
  );
}
