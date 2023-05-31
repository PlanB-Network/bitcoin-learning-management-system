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
  return (
    <MainLayout>
      <div className="bg-primary-700">
        <div className="flex relative flex-row flex-wrap justify-evenly px-12 pt-8 text-white bg-primary-900">
          <div>
            <h1 className="-ml-8 text-[128px] font-thin">Resources</h1>
            <div className="space-y-6 max-w-sm text-s text-justify">
              <p>
                Welcome into the infinit rabbit hole of Bitcoin ! In this
                section we will offer you in depth tutoriel on most bitcoin
                project out there. This pages in maintain by benevolel and
                passionate bitcoin who support thie open source project. If you
                fee we made a mistake please reach out. To see our financial
                attachement ot the project mention refer to our transparancie
                repport. Thanks for your trust in this university and enjoy the
                ride.
              </p>
              <p>Rogzy</p>
            </div>
          </div>
          <img className="mt-10 mb-40 h-96" src={rabbitInLibrary} />
        </div>

        <div className="box-content max-w-5xl ml-[50%] -translate-x-1/2 flex flex-row flex-wrap justify-evenly px-12 py-8 w-[950px] max-w-[90vw] rounded-full bg-primary-700">
          {resourceKinds.map((resourceKind) => (
            <Link to={resourceKind.route}>
              <div
                className="box-content flex relative flex-row p-2 my-4 w-60 h-24 rounded-lg duration-300 cursor-pointer hover:bg-primary-600"
                key={resourceKind.kind}
              >
                <div className="flex absolute z-0 w-24 h-24 rounded-full bg-secondary-400">
                  <img className="h-16 m-auto" src={resourceKind.image} />
                </div>
                <div className="flex relative flex-row items-center ml-14">
                  <h3 className="relative ml-12 text-2xl text-white z-1">
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
