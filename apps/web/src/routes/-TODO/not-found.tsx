import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import lostRabbit from '#src/assets/404.svg';

import { MainLayout } from '../../components/MainLayout/index.tsx';

export const NotFound = () => {
  const { t } = useTranslation();

  return (
    <MainLayout footerVariant="dark">
      <div className="font-primary bg-black flex size-full flex-col items-center space-y-16 p-10 text-blue-700">
        <section className="max-w-4xl text-white">
          <h1 className="mb-10 text-4xl font-bold lg:text-5xl">
            {t('notFound.pageTitle')}
          </h1>
          <p className="text-base font-bold lg:text-lg">
            {t('notFound.pageSubtitle')}
            <Link className="ml-2 underline" to="/">
              {t('notFound.here')}
            </Link>
            .
          </p>
        </section>
        {/* <LostRabbit className="w-[70vw] max-w-3xl lg:w-[50vw]" /> */}
        <img
          src={lostRabbit}
          className="w-[70vw] max-w-3xl lg:w-[50vw]"
          alt={t('imagesAlt.rabbit404')}
        />
      </div>
    </MainLayout>
  );
};
