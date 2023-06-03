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

import { SectionTitle } from './SectionTitle';

export const Home = () => {
  return (
    <MainLayout footerVariant="dark">
      {/* Hero section */}
      <div className="bg-primary-900 flex flex-col items-center px-24 py-8 md:flex-row md:py-36">
        <div>
          <h1 className="max-w-4xl text-xl text-white sm:text-3xl md:text-5xl  lg:text-6xl xl:text-8xl">
            The Sovereign University
          </h1>
          <p className=" mt-10 text-base font-thin italic tracking-wide text-white sm:text-xl lg:text-2xl">
            Let’s embark into your Bitcoin educational journey
          </p>
        </div>
        <div className="ml-36 mt-12 sm:mt-36">
          <img
            src={rabbitWithBackpackAndBtcSign}
            alt="a rabbit with a backpack and a btc sign"
          />
        </div>
      </div>

      {/* 1rst Section */}
      <div className="bg-primary-800  px-6 pb-12 pt-6 sm:px-12 md:px-20">
        <SectionTitle
          title="E-learning platform about Bitcoin"
          tagLine="To learn the basics as well as the advanced"
          num={1}
        />

        <div className="mt-12 flex flex-col items-center justify-center md:flex-row">
          <div className="max-w-sm lg:max-w-xl">
            <img src={rabbitClassroom} alt="rabbits inside a classroom" />
          </div>
          <ul className="ml-0 mt-6 list-disc space-y-4 text-lg text-white sm:text-xl md:ml-16 md:mt-0 lg:ml-24 lg:text-2xl">
            <li>
              <span className="text-secondary-400 uppercase">Extensive</span>{' '}
              courses
            </li>
            <li>
              All <span className="text-secondary-400 uppercase">free</span>
            </li>
            <li>
              For <span className="text-secondary-400 uppercase">everyone</span>
            </li>
            <li>In many languages</li>
            <li>
              From{' '}
              <span className="text-secondary-400 uppercase">
                beginner to expert
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 2nd section */}
      <div className="bg-primary-900 px-6 pb-24 pt-20 sm:px-12 md:px-20">
        <SectionTitle
          title="All useful tutorials"
          tagLine="To navigate your way among Bitcoin technological solutions"
          num={2}
          position="right"
          variant="secondary"
        />

        <div className="my-12 flex flex-col-reverse items-center justify-center md:flex-row">
          <p className="text-lg leading-[50px] text-white sm:text-2xl">
            Exchange <span className="text-secondary-400">|</span> Merchant
            <br />
            Mining <span className="text-secondary-400">|</span> Node{' '}
            <span className="text-secondary-400">|</span> Nostfr
            <br />
            Privacy tools <span className="text-secondary-400">|</span> Wallet
          </p>

          <div className="my-12 max-w-sm md:my-0 md:ml-24 lg:max-w-xl">
            <img src={rabbitStudying} alt="rabbit studying in a workshop" />
          </div>
        </div>
      </div>

      {/* 3rd section */}
      <div className="bg-primary-800 px-6 pb-16 pt-6 sm:px-12 md:px-20">
        <SectionTitle
          title="All kinds of resources about Bitcoin"
          tagLine="To access all published knowledge in one open-source platform"
          num={3}
        />

        <div>
          <div className="mx-auto mt-12 flex max-w-4xl flex-row flex-wrap justify-center sm:space-x-3 md:mt-24 ">
            <div className="mx-auto mt-4 flex flex-col items-center text-white md:mx-0">
              <img
                className="h-40"
                src={rabbitLibrary}
                alt="a rabbit reading a book"
              />
              <p className="my-2 text-xl sm:my-8">books</p>
            </div>
            <div className="mx-auto mt-4 flex flex-col items-center text-white md:mx-0">
              <img
                className="h-40"
                src={rabbitPodcast}
                alt="a rabbit listenning to a podcast"
              />
              <p className="my-2 text-xl sm:my-8">podcasts</p>
            </div>
            <div className="mx-auto mt-4 flex flex-col items-center text-white md:mx-0">
              <img
                className="h-40"
                src={rabbitVideos}
                alt="a rabbit filming a video"
              />
              <p className="my-2 text-xl sm:my-8">videos</p>
            </div>
          </div>
          <p className="text-secondary-400 mx-auto mt-12 w-max italic md:mt-24">
            & more
          </p>
        </div>
      </div>

      {/* 4rth section */}
      <div className="bg-primary-900 px-6 pb-24 pt-16 sm:px-12 md:px-20">
        <SectionTitle
          title="A link to the builders of the industry"
          tagLine="To connect learners with their dream Bitcoin job"
          num={4}
          position="right"
          variant="secondary"
        />

        <div className="my-12 flex flex-col items-center justify-center md:flex-row">
          <div className="my-12 max-w-sm md:my-0 md:mr-24 lg:max-w-xl ">
            <img src={rabbitMeetup} alt="a rabbit meetup" />
          </div>
          <div>
            <p className="max-w-xs text-lg text-white sm:text-xl sm:leading-10 lg:text-2xl lg:leading-[50px]">
              Get an overview and connect with the different actors of the
              industry
            </p>
          </div>
        </div>
      </div>

      {/* About us */}
      <div className="bg-primary-700 px-6 pb-32 pt-16 text-white sm:px-12 md:px-20 lg:pt-6">
        <h2 className="mb-16 text-center text-4xl italic ">
          A little bit about us
        </h2>

        <div className="mb-16 max-w-3xl space-y-6 px-6 sm:px-0">
          <p>
            The Sovereign University aims at providing a Bitcoin high-quality,
            extensive, free and accessible education for all. We believe that
            education and comprehension is the key to mass adoption.
          </p>
          <p>As Bitcoin grows stronger everyday, so does its community.</p>
          <p>
            Community is our biggest strength, as our educational content is
            based upon volunteering teachers, passionate about transmitting
            their knowledge.
          </p>
          <p>
            The Sovereign University is a project powered by DécouvreBitcoin.
          </p>
        </div>

        <div className=" mx-auto mt-28 flex w-max grid-cols-3 grid-rows-3 flex-col space-y-12 px-12 md:grid md:space-y-0 lg:mt-36">
          <div className="col-start-1 flex max-w-[180px] flex-col items-center space-y-4 lg:max-w-[250px]">
            <img className="h-8" src={github} alt="the icon of github" />
            <h4>OPEN-SOURCE</h4>
            <p className="text-center">
              We aim to promote the free flow of knowledge.
            </p>
          </div>
          <div className="col-start-3 flex max-w-[180px] flex-col items-center space-y-4 lg:max-w-[250px]">
            <img
              className="h-8"
              src={bitcoinCurrency}
              alt="the sign of bitcoin currency"
            />
            <h4>BITCOIN-ONLY</h4>
            <p className="text-center">
              We focus on the Bitcoin revolution as a whole without falling into
              trading or shitcoinery.
            </p>
          </div>
          <div className="relative col-start-2 row-start-2 flex flex-col items-center justify-center">
            <div className="bg-primary-900 absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full" />
            <img
              className="relative top-1 z-10 my-12 h-16 md:my-0 md:h-24"
              src={favorite}
              alt="a heart inside a circle"
            />
          </div>
          <div className="row-start-3 flex max-w-[180px] flex-col items-center space-y-4 lg:max-w-[250px]">
            <img
              className="h-8"
              src={visibilityOff}
              alt="the eyes icon without off sign"
            />
            <h4>PRIVACY FOCUSED</h4>
            <p className="text-center">
              We consider privacy to be one of the most fundamental human rights
              and most necessary for progress.
            </p>
          </div>
          <div className="col-start-3 row-start-3 flex max-w-[180px] flex-col items-center space-y-4 lg:max-w-[250px]">
            <img className="h-8" src={community} alt="3 people" />
            <h4>COMMUNITY DRIVEN</h4>
            <p className="text-center">
              We are first & foremost a community of enthusiastics helping each
              other in their Bitcoin journey.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
