import { useTranslation } from 'react-i18next';

import community from '../../../assets/home/community.svg';
import bitcoinCurrency from '../../../assets/home/currency_bitcoin.svg';
import favorite from '../../../assets/home/favorite.svg';
import github from '../../../assets/home/github.svg';
import rabbitClassroom from '../../../assets/home/rabbit-classroom.svg';
import rabbitLibrary from '../../../assets/home/rabbit-library.svg';
import rabbitMeetup from '../../../assets/home/rabbit-meetup.svg';
import rabbitPodcast from '../../../assets/home/rabbit-podcast.svg';
import rabbitStudying from '../../../assets/home/rabbit-studying.svg';
import rabbitVideos from '../../../assets/home/rabbit-videos.svg';
import rabbitWithBackpackAndBtcSign from '../../../assets/home/rabbit-with-backpack-and-btc-sign.svg';
import visibilityOff from '../../../assets/home/visibility_off.svg';
import { Emphasize } from '../components/Emphasize';
import { SectionTitle } from '../components/SectionTitle';

export const Home = () => {
  const { t } = useTranslation();

  return (
    // <MainLayout footerVariant="dark">
    <>
      <div className="flex w-full justify-center bg-blue-900 px-5 md:px-10 lg:px-32 xl:px-0">
        <div className="flex flex-col space-y-5 p-10 sm:flex-row lg:max-w-6xl">
          <div>
            <h1 className="text-4xl text-white md:max-w-xl md:text-5xl lg:max-w-4xl lg:text-7xl xl:text-8xl">
              The Sovereign University
            </h1>
            <p className="mt-10 text-base font-light italic tracking-wide text-white sm:text-xl lg:text-2xl">
              {t('home.hero.tagLine')}
            </p>
          </div>
          <div className="max-w-[30%] place-self-end lg:pt-24">
            <img
              src={rabbitWithBackpackAndBtcSign}
              alt={t('imagesAlt.rabbitWithBackpackAndBtcSign')}
            />
          </div>
        </div>
      </div>

      {/* 1rst Section */}
      <div className="flex w-full justify-center bg-blue-800 px-5 md:px-10 lg:px-32 xl:px-0">
        <div className="w-full max-w-6xl py-10">
          <SectionTitle
            title={t('home.first.title')}
            tagLine={t('home.first.tagLine')}
            num={1}
          />

          <div className="mt-12 flex flex-col items-center justify-around px-5 md:flex-row">
            <div className="max-w-sm lg:max-w-xl">
              <img src={rabbitClassroom} alt={t('imagesAlt.rabbitClassroom')} />
            </div>
            <ul className="ml-0 mt-6 list-disc space-y-4 text-lg text-white sm:text-xl md:ml-16 md:mt-0 lg:ml-24 lg:text-2xl">
              <li>
                <Emphasize words={[t('home.first.extensiveEmphasized')]}>
                  {t('home.first.extensive')}
                </Emphasize>
              </li>
              <li>
                <Emphasize words={[t('home.first.freeEmphasized')]}>
                  {t('home.first.free')}
                </Emphasize>
              </li>
              <li>
                <Emphasize words={[t('home.first.forEveryoneEmphasized')]}>
                  {t('home.first.forEveryone')}
                </Emphasize>
              </li>
              <li>{t('home.first.languages')}</li>
              <li>
                <Emphasize words={[t('home.first.levelsEmphasized')]}>
                  {t('home.first.levels')}
                </Emphasize>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2nd section */}
      <div className="flex w-full justify-center bg-blue-900 px-5 md:px-10 lg:px-32 xl:px-0">
        <div className="w-full max-w-6xl py-10">
          <SectionTitle
            title={t('home.second.title')}
            tagLine={t('home.second.tagLine')}
            num={2}
            position="right"
            variant="secondary"
          />

          <div className="my-12 flex flex-col-reverse items-center justify-around px-5 md:flex-row">
            <div className="flex flex-col text-lg leading-[50px] text-white sm:text-2xl lg:space-y-4">
              <div className="flex space-x-3">
                <span>{t('home.second.merchant')}</span>
                <Emphasize>|</Emphasize>
                <span>{t('home.second.exchange')}</span>
              </div>
              <div className="flex space-x-3">
                <span>{t('home.second.mining')}</span>
                <Emphasize>|</Emphasize>
                <span>{t('home.second.node')}</span>
                <Emphasize>|</Emphasize>
                <span>{t('home.second.nostr')}</span>
              </div>
              <div className="flex space-x-3">
                <span>{t('home.second.privacy')}</span>
                <Emphasize>|</Emphasize>
                <span>{t('home.second.wallet')}</span>
              </div>
            </div>

            <div className="my-12 max-w-sm md:my-0 md:ml-24 lg:max-w-xl">
              <img src={rabbitStudying} alt={t('imagesAlt.rabbitStudying')} />
            </div>
          </div>
        </div>
      </div>

      {/* 3rd section */}
      <div className="flex w-full justify-center bg-blue-800 px-5 md:px-10 lg:px-32 xl:px-0">
        <div className="w-full max-w-6xl py-10">
          <SectionTitle
            title={t('home.third.title')}
            tagLine={t('home.third.tagLine')}
            num={3}
          />

          <div className="mt-6 flex flex-row flex-wrap items-center justify-center md:mt-20">
            <div className="flex flex-col items-center p-5 text-white md:mx-0">
              <img
                className="h-48"
                src={rabbitLibrary}
                alt={t('imagesAlt.rabbitLibrary')}
              />
              <p className="my-2 text-xl sm:my-8">{t('home.third.books')}</p>
            </div>
            <div className="flex flex-col items-center p-5 text-white md:mx-0">
              <img
                className="h-48"
                src={rabbitPodcast}
                alt={t('imagesAlt.rabbitPodcast')}
              />
              <p className="my-2 text-xl sm:my-8">{t('home.third.podcasts')}</p>
            </div>
            <div className="flex flex-col items-center p-5 text-white md:mx-0">
              <img
                className="h-48"
                src={rabbitVideos}
                alt={t('imagesAlt.rabbitVideos')}
              />
              <p className="my-2 text-xl sm:my-8">{t('home.third.videos')}</p>
            </div>
          </div>
          <p className="my-8 w-full text-center italic text-orange-400">
            {t('home.third.more')}
          </p>
        </div>
      </div>

      {/* 4rth section */}
      <div className="flex w-full justify-center bg-blue-900 px-5 md:px-10 lg:px-32 xl:px-0">
        <div className="w-full max-w-6xl py-10">
          <SectionTitle
            title={t('home.fourth.title')}
            tagLine={t('home.fourth.tagLine')}
            num={4}
            position="right"
            variant="secondary"
          />

          <div className="my-12 flex flex-col items-center justify-around md:flex-row">
            <div className="my-12 max-w-sm md:my-0 md:mr-24 lg:max-w-xl ">
              <img src={rabbitMeetup} alt={t('imagesAlt.rabbitMeetup')} />
            </div>
            <div>
              <p className="max-w-xs text-lg text-white sm:text-xl sm:leading-10 lg:text-2xl lg:leading-[50px]">
                {t('home.fourth.text')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About us */}
      <div className="flex w-full justify-center bg-blue-700 px-5 md:px-10 lg:px-32 xl:px-0">
        <div className="w-full max-w-6xl pb-32 pt-12 text-white">
          <h2 className="mb-16 text-center text-4xl italic ">
            {t('home.about.title')}
          </h2>

          <div className="mx-auto mb-16 max-w-3xl space-y-6 px-6 text-justify sm:px-0">
            <p>{t('home.about.p1')}</p>
            <p>{t('home.about.p2')}</p>
            <p>{t('home.about.p3')}</p>
          </div>

          <div className=" mx-auto mt-28 flex w-max grid-cols-3 grid-rows-3 flex-col space-y-12 px-12 md:grid md:space-y-0 lg:mt-36">
            <div className="col-start-1 flex max-w-[180px] flex-col items-center space-y-4 lg:max-w-[250px]">
              <img className="h-8" src={github} alt={t('imagesAlt.github')} />
              <h4>{t('home.about.values.openSource.title')}</h4>
              <p className="text-center">
                {t('home.about.values.openSource.text')}
              </p>
            </div>
            <div className="col-start-3 flex max-w-[180px] flex-col items-center space-y-4 lg:max-w-[250px]">
              <img
                className="h-8"
                src={bitcoinCurrency}
                alt={t('imagesAlt.bitcoinCurrency')}
              />
              <h4>{t('home.about.values.bitcoinOnly.title')}</h4>
              <p className="text-center">
                {t('home.about.values.bitcoinOnly.text')}
              </p>
            </div>
            <div className="relative col-start-2 row-start-2 flex flex-col items-center justify-center">
              <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-900 lg:h-48 lg:w-48" />
              <img
                className="relative top-1 z-10 my-12 h-16 md:my-0 md:h-24"
                src={favorite}
                alt={t('imagesAlt.favorite')}
              />
            </div>
            <div className="row-start-3 flex max-w-[180px] flex-col items-center space-y-4 lg:max-w-[250px]">
              <img
                className="h-8"
                src={visibilityOff}
                alt={t('imagesAlt.visibilityOff')}
              />
              <h4>{t('home.about.values.privacyFocused.title')}</h4>
              <p className="text-center">
                {t('home.about.values.privacyFocused.text')}
              </p>
            </div>
            <div className="col-start-3 row-start-3 flex max-w-[180px] flex-col items-center space-y-4 lg:max-w-[250px]">
              <img
                className="h-8"
                src={community}
                alt={t('imagesAlt.community')}
              />
              <h4>{t('home.about.values.communityDriven.title')}</h4>
              <p className="text-center">
                {t('home.about.values.communityDriven.text')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
    // </MainLayout>
  );
};
