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
    <MainLayout>
      <div className="bg-primary-700 flex flex-col justify-center">
        <div className="flex flex-wrap justify-evenly px-6 pt-8 pb-12 sm:pb-40 text-white bg-primary-900">
          <div>
            <h1 className="-ml-6 text-[62px] xl:text-[128px] font-thin">
              {t('resources.pageTitle')}
            </h1>
            <div className="space-y-6 max-w-sm text-s text-justify">
              <p>{t('resources.headerText')}</p>
              <p>{t('resources.headerSignature')}</p>
            </div>
          </div>
          <img className="max-h-96 mt-6" src={rabbitInLibrary} />
        </div>

        <div className="flex flex-wrap justify-evenly self-center max-w-[90vw] w-[950px] py-8 bg-primary-700">
          {resourceKinds.map((resourceKind, i) => (
            <Link key={i} to={resourceKind.route}>
              <div
                className="box-content flex relative flex-row p-2 my-4 w-44 sm:w-60 h-16 sm:h-24 rounded-lg duration-300 cursor-pointer hover:bg-primary-600"
                key={resourceKind.kind}
              >
                <div className="flex absolute z-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary-400">
                  <img
                    className="h-12 sm:h-16 m-auto"
                    src={resourceKind.image}
                  />
                </div>
                <div className="flex relative flex-row items-center ml-10 sm:ml-14">
                  <h3 className="relative ml-12 text-sm sm:text-2xl text-white z-1">
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
