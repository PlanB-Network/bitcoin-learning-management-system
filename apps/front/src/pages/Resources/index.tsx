import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import articleSvg from '../../assets/resources/article.svg';
import bookSvg from '../../assets/resources/book.svg';
import couchSvg from '../../assets/resources/couch.svg';
import microSvg from '../../assets/resources/micro.svg';
import newsletterSvg from '../../assets/resources/newsletter.svg';
import rabbitInLibrary from '../../assets/resources/rabbit-in-library.svg';
import { MainLayout } from '../../components';
import { Routes } from '../../types';
import { compose } from '../../utils';

enum ResourceKinds {
  Books,
  Podcasts,
  Builders,
  Articles,
  Newsletters,
  Conferences,
  /* Videos, */
}

export const Resources = () => {
  const { t } = useTranslation();

  const resourceKinds = [
    {
      kind: ResourceKinds.Books,
      title: t('words.books'),
      image: bookSvg,
      route: Routes.Books,
      unreleased: false,
    },
    {
      kind: ResourceKinds.Builders,
      title: t('words.builders'),
      image: couchSvg,
      route: Routes.Builders,
      unreleased: false,
    },
    {
      kind: ResourceKinds.Podcasts,
      title: t('words.podcasts'),
      image: microSvg,
      route: Routes.Podcasts,
      unreleased: false,
    },
    {
      kind: ResourceKinds.Articles,
      title: t('words.articles'),
      image: articleSvg,
      route: Routes.Article,
      unreleased: true,
    },
    {
      kind: ResourceKinds.Newsletters,
      title: t('words.newsletters'),
      image: newsletterSvg,
      route: Routes.Newsletter,
      unreleased: true,
    },
    {
      kind: ResourceKinds.Conferences,
      title: t('words.conferences'),
      image: couchSvg,
      route: Routes.Conferences,
      unreleased: true,
    },
    /* {
      kind: ResourceKinds.Videos,
      title: t('words.videos'),
      image: videoSvg,
      route: Routes.Videos,
    }, */
  ];

  return (
    <MainLayout footerVariant="light">
      <div className="flex flex-col justify-center bg-gray-100">
        <div className="bg-primary-900 relative mb-10 flex flex-col items-center px-5 pb-10 pt-8 text-white md:mb-40 md:pb-80 lg:px-16 lg:pb-60">
          <div className="flex grid-cols-2 flex-col items-center justify-evenly md:grid md:pl-8 lg:space-x-5 lg:pl-12">
            <div className="px-5 lg:px-0">
              <h1 className="z-10 -ml-6 mb-5 text-[62px] font-light md:text-7xl lg:text-8xl xl:text-[112px]">
                {t('resources.pageTitle')}
              </h1>
              <div className="space-y-6 text-justify text-base md:max-w-xs lg:max-w-sm xl:max-w-md">
                <p>{t('resources.headerText')}</p>
                <p>{t('resources.headerSignature')}</p>
              </div>
            </div>
            <img
              className="z-0 mb-10 mt-6 max-h-72 md:max-h-60 lg:max-h-80 xl:max-h-96"
              src={rabbitInLibrary}
              alt=""
            />
          </div>
          <div className="bg-primary-700 inset-x-0 bottom-0 left-1/2 z-10 grid w-full grid-cols-1 gap-x-2 rounded-3xl px-12 py-8 shadow sm:place-items-center md:absolute md:max-w-3xl md:-translate-x-1/2 md:translate-y-1/2 md:grid-cols-2 md:justify-evenly lg:max-w-5xl lg:grid-cols-3">
            {resourceKinds.map((resourceKind, i) => (
              <Link key={i} to={resourceKind.route}>
                <div
                  className={compose(
                    'hover:bg-primary-600 ld:my-4 relative my-2 box-content flex h-16 w-fit cursor-pointer flex-row flex-wrap items-center rounded-lg p-2 pr-20 duration-300 sm:h-24 sm:w-60',
                    resourceKind.unreleased ? 'opacity-50' : 'opacity-100'
                  )}
                  onClick={(e) => resourceKind.unreleased && e.preventDefault()}
                  key={resourceKind.kind}
                >
                  <div className="bg-secondary-400 relative z-0 flex h-20 w-20 rounded-full sm:h-24 sm:w-24">
                    <img
                      className="absolute bottom-0 left-[-0.75em] m-auto h-12 sm:h-16"
                      src={resourceKind.image}
                      alt=""
                    />
                  </div>
                  <h3 className="absolute left-[3em] top-[1em] z-10 text-xl text-white sm:text-2xl">
                    {resourceKind.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
