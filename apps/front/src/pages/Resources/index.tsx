import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import articleSvg from '../../assets/resources/article.svg';
import bookSvg from '../../assets/resources/book.svg';
import couchSvg from '../../assets/resources/couch.svg';
import documentarySvg from '../../assets/resources/documentary.svg';
import microSvg from '../../assets/resources/micro.svg';
import newsletterSvg from '../../assets/resources/newsletter.svg';
import rabbitInLibrary from '../../assets/resources/rabbit-in-library.svg';
import videoSvg from '../../assets/resources/video.svg';
import { MainLayout } from '../../components';
import { Routes } from '../../types';

enum ResourceKinds {
  Book = 'book',
  Article = 'article',
  Documentary = 'documentary',
  Newsletter = 'newsletter',
  Podcast = 'podcast',
  Conference = 'conference',
  Video = 'video',
}

const resourceKinds = [
  {
    kind: ResourceKinds.Book,
    title: 'Book',
    image: bookSvg,
    route: Routes.Library,
  },
  {
    kind: ResourceKinds.Article,
    title: 'Article',
    image: articleSvg,
    route: Routes.Article,
  },
  {
    kind: ResourceKinds.Documentary,
    title: 'Movie Documentary',
    image: documentarySvg,
    route: Routes.Home,
  },
  {
    kind: ResourceKinds.Newsletter,
    title: 'Newsletter',
    image: newsletterSvg,
    route: Routes.Newsletter,
  },
  {
    kind: ResourceKinds.Podcast,
    title: 'Podcast',
    image: microSvg,
    route: Routes.Podcasts,
  },
  {
    kind: ResourceKinds.Conference,
    title: 'Conference',
    image: couchSvg,
    route: Routes.Conferences,
  },
  {
    kind: ResourceKinds.Video,
    title: 'Video',
    image: videoSvg,
    route: Routes.Videos,
  },
];

export const Resources = () => {
  const { t } = useTranslation();

  return (
    <MainLayout footerVariant="light">
      <div className="flex flex-col justify-center bg-gray-100">
        <div className="bg-primary-900 relative mb-10 flex flex-col items-center px-5 pb-10 pt-8 text-white md:mb-80 md:pb-96 lg:px-16 lg:pb-80">
          <div className="flex w-full grid-cols-2 flex-col items-center justify-evenly md:grid md:pl-8 lg:space-x-5 lg:pl-12">
            <div className="px-5 lg:px-0">
              <h1 className="z-10 -ml-6 mb-5 text-[62px] font-thin md:text-7xl lg:text-8xl xl:text-[112px]">
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
          <div className="bg-primary-700 inset-x-0 bottom-0 left-1/2 z-10 flex w-full max-w-min flex-row flex-wrap justify-evenly rounded-3xl px-12 py-8 shadow md:absolute md:max-w-3xl md:-translate-x-1/2 md:translate-y-1/2 lg:max-w-5xl">
            {resourceKinds.map((resourceKind, i) => (
              <Link key={i} to={resourceKind.route}>
                <div
                  className="hover:bg-primary-600 relative my-4 box-content flex h-16 w-44 cursor-pointer flex-row rounded-lg p-2 duration-300 sm:h-24 sm:w-60"
                  key={resourceKind.kind}
                >
                  <div className="bg-secondary-400 absolute z-0 flex h-20 w-20 rounded-full sm:h-24 sm:w-24">
                    <img
                      className="m-auto h-12 sm:h-16"
                      src={resourceKind.image}
                      alt=""
                    />
                  </div>
                  <div className="relative ml-10 flex flex-row items-center sm:ml-14">
                    <h3 className=" relative ml-12 text-sm text-white sm:text-2xl">
                      {resourceKind.title}
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
