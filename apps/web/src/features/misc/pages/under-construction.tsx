import { useTranslation } from 'react-i18next';

import underConstructionImage from '../../../assets/under-construction.png';
import { MainLayout } from '../../../components/MainLayout/index.tsx';

export const UnderConstruction = () => {
  const { t } = useTranslation();
  return (
    <MainLayout>
      <div className="font-primary flex w-full flex-col items-center space-y-16 bg-gray-100 p-10 text-blue-700">
        <section className="max-w-4xl ">
          <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
            {t('underConstruction.pageTitle')}
          </h1>
          <p className="text-base font-bold lg:text-lg">
            {t('underConstruction.p1')}
            <a
              className="mx-1 underline"
              href="https://github.com/DecouvreBitcoin/sovereign-university"
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
};
