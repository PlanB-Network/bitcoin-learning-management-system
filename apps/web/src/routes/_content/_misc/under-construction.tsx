import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import underConstructionImage from '#src/assets/under-construction.png';
import { MainLayout } from '#src/components/MainLayout/index.js';

export const Route = createFileRoute('/_content/_misc/under-construction')({
  component: UnderConstruction,
});

function UnderConstruction() {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="font-primary flex w-full flex-col items-center space-y-16 bg-white p-10 text-blue-700">
        <section className="max-w-4xl ">
          <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
            {t('underConstruction.pageTitle')}
          </h1>
          <p className="text-base font-bold lg:text-lg">
            {t('underConstruction.p1')}
            <a
              className="mx-1 underline"
              href="https://github.com/PlanB-Network/sbitcoin-learning-management-system"
            >
              {t('underConstruction.github')}
            </a>
            {t('underConstruction.p2')}
          </p>
        </section>
        <div>
          <img
            src={underConstructionImage}
            alt={t('imagesAlt.underConstructionImage')}
            className="w-[70vw] max-w-3xl lg:w-[50vw]"
          />
        </div>
      </div>
    </MainLayout>
  );
}
