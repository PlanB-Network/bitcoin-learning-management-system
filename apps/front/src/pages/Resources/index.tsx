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
    <MainLayout footerVariant="dark">
      <div className="bg-primary-700 flex flex-col justify-center">
        <div className="bg-primary-900 flex flex-wrap justify-evenly px-6 pb-12 pt-8 text-white sm:pb-40">
          <div>
            <h1 className="-ml-6 text-[62px] font-thin xl:text-[128px]">
              {t('resources.pageTitle')}
            </h1>
            <div className="text-s max-w-sm space-y-6 text-justify">
              <p>{t('resources.headerText')}</p>
              <p>{t('resources.headerSignature')}</p>
            </div>
          </div>
          <img className="mt-6 max-h-96" src={rabbitInLibrary} />
        </div>

        <div className="bg-primary-700 flex w-[950px] max-w-[90vw] flex-wrap justify-evenly self-center py-8">
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
                  />
                </div>
                <div className="relative ml-10 flex flex-row items-center sm:ml-14">
                  <h3 className="z-1 relative ml-12 text-sm text-white sm:text-2xl">
                    {resourceKind.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
