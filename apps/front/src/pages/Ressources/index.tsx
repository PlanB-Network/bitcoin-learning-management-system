import { MainLayout } from '../../components';

import articleSvg from '../../assets/ressources/article.svg';
import bookSvg from '../../assets/ressources/book.svg';
import documentarySvg from '../../assets/ressources/documentary.svg';
import couchSvg from '../../assets/ressources/couch.svg';
import microSvg from '../../assets/ressources/micro.svg';
import newsletterSvg from '../../assets/ressources/newsletter.svg';
import videoSvg from '../../assets/ressources/video.svg';
import rabbitInLibrary from '../../assets/ressources/rabbit-in-library.svg';

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
  },
  {
    kind: RessourceKinds.Article,
    title: 'Article',
    image: articleSvg,
  },
  {
    kind: RessourceKinds.Documentary,
    title: 'Movie Documentary',
    image: documentarySvg,
  },
  {
    kind: RessourceKinds.Newsletter,
    title: 'Newsletter',
    image: newsletterSvg,
  },
  {
    kind: RessourceKinds.Podcast,
    title: 'Podcast',
    image: microSvg,
  },
  {
    kind: RessourceKinds.Conference,
    title: 'Conference',
    image: couchSvg,
  },
  {
    kind: RessourceKinds.Video,
    title: 'Video',
    image: videoSvg,
  },
];

export const Ressources = () => {
  return (
    <MainLayout>
      <div className="min-h-[150vh]">
        <div className="flex relative flex-row flex-wrap justify-evenly px-12 pt-8 text-white bg-primary-900">
          <div>
            <h1 className="-ml-8 text-[128px] font-thin">Ressources</h1>
            <div className="space-y-6 max-w-sm text-xs text-justify">
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
          <img className="mt-10 mb-60 h-96" src={rabbitInLibrary} />

          <div className="box-content ml-[50%] -translate-x-1/2 -bottom-80 flex absolute  flex-row justify-evenly flex-wrap px-12 py-8 w-[950px] max-w-[90vw] rounded-[50px] bg-primary-700">
            {ressourceKinds.map((ressourceKind) => (
              <div
                className="box-content flex relative flex-row p-2 my-4 w-60 h-24 rounded-lg duration-300 cursor-pointer hover:bg-primary-600"
                key={ressourceKind.kind}
              >
                <div className="absolute z-0 w-24 h-24 rounded-full bg-secondary-400"></div>
                <div className="flex relative flex-row items-center ml-14">
                  <img
                    className="absolute -left-4 top-6 h-16 -translate-x-full z-1"
                    src={ressourceKind.image}
                  />

                  <h3 className="relative text-2xl text-white z-1">
                    {ressourceKind.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
