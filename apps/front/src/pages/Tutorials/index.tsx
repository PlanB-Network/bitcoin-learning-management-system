import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import tutoRabbitPng from '../../assets/tutorial-rabbit.png';
import { MainLayout } from '../../components';

import { TUTORIALS_CATEGORIES } from './utils';

export const Tutorials = () => {
  const { t } = useTranslation();

  return (
    <MainLayout footerVariant="light">
      <div className=" flex flex-col justify-center bg-gray-100">
        <div className="bg-primary-900 relative mb-10 flex flex-col items-center px-5 pb-10 pt-8 text-white md:mb-80 md:pb-80 lg:mb-60 lg:px-16 lg:pb-60">
          <div className="flex grid-cols-2 flex-col flex-wrap items-center justify-evenly md:grid md:pl-8 lg:space-x-5 lg:pl-12">
            <div className="px-5 lg:px-0">
              <h1 className="z-10 -ml-6 mb-5 text-[62px] font-thin md:text-7xl lg:text-8xl xl:text-[112px]">
                {t('tutorials.pageTitle')}
              </h1>
              <div className="space-y-6 text-justify text-base md:max-w-xs lg:max-w-sm xl:max-w-md">
                <p>{t('tutorials.headerText')}</p>
                <p>{t('tutorials.headerSignature')}</p>
              </div>
            </div>
            <img
              className="z-0 mb-10 mt-6 max-h-72 md:max-h-60 lg:max-h-80 xl:max-h-96"
              src={tutoRabbitPng}
              alt=""
            />
          </div>
          <div className="bg-primary-700 inset-x-0 bottom-0 left-1/2 z-10 flex w-full max-w-min flex-row flex-wrap justify-evenly rounded-3xl px-12 py-8 shadow md:absolute md:max-w-3xl md:-translate-x-1/2 md:translate-y-1/2 lg:max-w-5xl">
            {TUTORIALS_CATEGORIES.map((tutorialCategory) => (
              <Link key={tutorialCategory.name} to={tutorialCategory.route}>
                <div
                  className="hover:bg-primary-600 relative my-4 box-content flex h-24 w-64 cursor-pointer flex-row rounded-lg p-2 duration-300"
                  key={tutorialCategory.name}
                >
                  <div className="bg-secondary-400 absolute z-0 flex h-24 w-24 rounded-full">
                    <img
                      className="absolute -left-1/4 bottom-0 m-auto h-14"
                      src={tutorialCategory.image}
                      alt=""
                    />
                  </div>
                  <div className="z-10 -ml-8 mt-4 flex flex-row items-center">
                    <div className="ml-32 pl-2 text-white">
                      <h3 className="absolute left-[2.5em] top-[1em] text-2xl">
                        {t(`tutorials.${tutorialCategory.name}.title`)}
                      </h3>
                      <p className="absolute left-[6em] top-[4.5em] text-xs italic">
                        {t(
                          `tutorials.${tutorialCategory.name}.shortDescription`
                        )}
                      </p>
                    </div>
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
