import { Link } from 'react-router-dom';
import articleSvg from '../../assets/ressources/article.svg';
import bookSvg from '../../assets/ressources/book.svg';
import couchSvg from '../../assets/ressources/couch.svg';
import documentarySvg from '../../assets/ressources/documentary.svg';
import microSvg from '../../assets/ressources/micro.svg';
import newsletterSvg from '../../assets/ressources/newsletter.svg';
import rabbitInLibrary from '../../assets/ressources/rabbit-in-library.svg';
import videoSvg from '../../assets/ressources/video.svg';
import { MainLayout } from '../../components';
import { Routes } from '../../types';

enum RessourceKinds {
  Book = 'book',
  Article = 'article',
  Documentary = 'documentary',
  Newsletter = 'newsletter',
  Podcast = 'podcast',
  Conference = 'conference',
  Video = 'video',
}

const ressourceKinds = [
  {
    kind: RessourceKinds.Book,
    title: 'Book',
    image: bookSvg,
    route: Routes.Library
  },
  {
    kind: RessourceKinds.Article,
    title: 'Article',
    image: articleSvg,
    route: Routes.Article
  },
  {
    kind: RessourceKinds.Documentary,
    title: 'Movie Documentary',
    image: documentarySvg,
    route: Routes.Home
  },
  {
    kind: RessourceKinds.Newsletter,
    title: 'Newsletter',
    image: newsletterSvg,
    route: Routes.Newsletter
  },
  {
    kind: RessourceKinds.Podcast,
    title: 'Podcast',
    image: microSvg,
    route: Routes.Podcasts
  },
  {
    kind: RessourceKinds.Conference,
    title: 'Conference',
    image: couchSvg,
    route: Routes.Conferences
  },
  {
    kind: RessourceKinds.Video,
    title: 'Video',
    image: videoSvg,
    route: Routes.Videos
  },
];

export const Ressources = () => {
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
          <img className="mt-10 mb-20 h-96" src={rabbitInLibrary} />
        </div>

        <div className="box-content ml-[50%] -translate-x-1/2 flex flex-row flex-wrap justify-evenly px-12 py-8 w-[950px] max-w-[90vw] rounded-[50px] bg-primary-700">
          {ressourceKinds.map((ressourceKind) => (
            <Link to={ressourceKind.route}>
              <div
                className="box-content flex relative flex-row p-2 my-4 w-60 h-24 rounded-lg duration-300 cursor-pointer hover:bg-primary-600"
                key={ressourceKind.kind}
              >
                <div className="flex absolute z-0 w-24 h-24 rounded-full bg-secondary-400">
                  <img
                    className="h-16 m-auto"
                    src={ressourceKind.image}
                  />
                </div>
                <div className="flex relative flex-row items-center ml-14">
                  <h3 className="relative ml-12 text-2xl text-white z-1">
                    {ressourceKind.title}
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
