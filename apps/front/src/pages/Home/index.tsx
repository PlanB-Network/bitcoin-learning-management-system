import { useTranslation } from 'react-i18next';

import community from '../../assets/home/community.svg';
import bitcoinCurrency from '../../assets/home/currency_bitcoin.svg';
import favorite from '../../assets/home/favorite.svg';
import github from '../../assets/home/github.svg';
import rabbitClassroom from '../../assets/home/rabbit-classroom.svg';
import rabbitLibrary from '../../assets/home/rabbit-library.svg';
import rabbitMeetup from '../../assets/home/rabbit-meetup.svg';
import rabbitPodcast from '../../assets/home/rabbit-podcast.svg';
import rabbitStudying from '../../assets/home/rabbit-studying.svg';
import rabbitVideos from '../../assets/home/rabbit-videos.svg';
import rabbitWithBackpackAndBtcSign from '../../assets/home/rabbit-with-backpack-and-btc-sign.svg';
import visibilityOff from '../../assets/home/visibility_off.svg';
import { MainLayout } from '../../components';

import { Emphasize } from './Emphasize';
import { SectionTitle } from './SectionTitle';

export const Home = () => {
  const { t } = useTranslation();

  return (
    <MainLayout footerVariant="dark">
      {/* Hero section */}
      <div className="bg-primary-900 flex flex-col items-center px-10 py-8 md:flex-row md:px-24 md:py-36">
        <div>
          <h1 className="max-w-4xl text-4xl text-white md:text-5xl lg:text-6xl xl:text-8xl">
            {t('words.theSovereignUniversity')}
          </h1>
          <p className="mt-10 text-base font-thin italic tracking-wide text-white sm:text-xl lg:text-2xl">
            {t('home.hero.tagLine')}
          </p>
        </div>
        <div className="ml-36 mt-12 sm:mt-36">
          <img
            src={rabbitWithBackpackAndBtcSign}
            alt={t('imagesAlt.rabbitWithBackpackAndBtcSign')}
          />
        </div>
      </div>

      {/* 1rst Section */}
      <div className="bg-primary-800  px-6 pb-12 pt-6 sm:px-12 md:px-20">
        <SectionTitle
          title={t('home.first.title')}
          tagLine={t('home.first.tagLine')}
          num={1}
        />

        <div className="mt-12 flex flex-col items-center justify-center md:flex-row">
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

      {/* 2nd section */}
      <div className="bg-primary-900 px-6 pb-24 pt-20 sm:px-12 md:px-20">
        <SectionTitle
          title={t('home.second.title')}
          tagLine={t('home.second.tagLine')}
          num={2}
          position="right"
          variant="secondary"
        />

        <div className="my-12 flex flex-col-reverse items-center justify-center md:flex-row">
          <p className="text-lg leading-[50px] text-white sm:text-2xl">
            {[
              t('home.second.exchange'),
              t('home.second.merchant'),
              t('home.second.mining'),
              t('home.second.node'),
              t('home.second.privacy'),
              t('home.second.wallet'),
            ].map((w, index) => (
              <>
                <span>{w}</span> <Emphasize>|</Emphasize>{' '}
                {index % 2 !== 0 && <br />}
              </>
            ))}
          </p>

          <div className="my-12 max-w-sm md:my-0 md:ml-24 lg:max-w-xl">
            <img src={rabbitStudying} alt={t('imagesAlt.rabbitStudying')} />
          </div>
        </div>
      </div>

      {/* 3rd section */}
      <div className="bg-primary-800 px-6 pb-16 pt-6 sm:px-12 md:px-20">
        <SectionTitle
          title={t('home.third.title')}
          tagLine={t('home.third.tagLine')}
          num={3}
        />

        <div>
          <div className="mx-auto mt-12 flex max-w-4xl flex-row flex-wrap justify-center sm:space-x-3 md:mt-24 ">
            <div className="mx-auto mt-4 flex flex-col items-center text-white md:mx-0">
              <img
                className="h-40"
                src={rabbitLibrary}
                alt={t('imagesAlt.rabbitLibrary')}
              />
              <p className="my-2 text-xl sm:my-8">{t('home.third.books')}</p>
            </div>
            <div className="mx-auto mt-4 flex flex-col items-center text-white md:mx-0">
              <img
                className="h-40"
                src={rabbitPodcast}
                alt={t('imagesAlt.rabbitPodcast')}
              />
              <p className="my-2 text-xl sm:my-8">{t('home.third.podcasts')}</p>
            </div>
            <div className="mx-auto mt-4 flex flex-col items-center text-white md:mx-0">
              <img
                className="h-40"
                src={rabbitVideos}
                alt={t('imagesAlt.rabbitVideos')}
              />
              <p className="my-2 text-xl sm:my-8">{t('home.third.videos')}</p>
            </div>
          </div>
          <p className="text-secondary-400 mx-auto mt-12 w-max italic md:mt-24">
            {t('home.third.more')}
          </p>
        </div>
      </div>

      {/* 4rth section */}
      <div className="bg-primary-900 px-6 pb-24 pt-16 sm:px-12 md:px-20">
        <SectionTitle
          title={t('home.fourth.title')}
          tagLine={t('home.fourth.tagLine')}
          num={4}
          position="right"
          variant="secondary"
        />

        <div className="my-12 flex flex-col items-center justify-center md:flex-row">
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

      {/* About us */}
      <div className="bg-primary-700 px-6 pb-32 pt-16 text-white sm:px-12 md:px-20">
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
            <div className="bg-primary-900 absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full lg:h-48 lg:w-48" />
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
    </MainLayout>
  );
};
