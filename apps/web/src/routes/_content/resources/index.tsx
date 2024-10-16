import { createFileRoute } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';

import { MainLayout } from '#src/components/main-layout.js';
import { PageHeader } from '#src/components/page-header.js';
import CategoryContainer from '#src/organisms/category-container.tsx';
import { RESOURCES_CATEGORIES } from '#src/services/utils.js';

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
        <CategoryContainer
          categories={[...RESOURCES_CATEGORIES]}
          baseUrl="/resources"
          getTitle={(category) => t(`resources.${category.name}.title`)}
        />
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
