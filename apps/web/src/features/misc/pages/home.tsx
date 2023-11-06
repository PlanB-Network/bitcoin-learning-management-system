import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AiOutlineRight } from 'react-icons/ai';

import { cn } from '@sovereign-university/ui';

import CoursesInCircle from '../../../assets/home/courses_in_circle.svg?react';
import FlagsInCircle from '../../../assets/home/flags_in_circle.svg';
import PlanBTitle from '../../../assets/home/plan_b_title.svg?react';
import Spiral from '../../../assets/home/spiral.svg?react';
import SponsorBSun from '../../../assets/home/sponsor_b_sun.jpeg';
import SponsorBase58 from '../../../assets/home/sponsor_base58.jpeg';
import SponsorBlockstream from '../../../assets/home/sponsor_blockstream.jpeg';
import SponsorBtcPay from '../../../assets/home/sponsor_btcpay.png';
import SponsorCuboPlus from '../../../assets/home/sponsor_cuboplus.jpeg';
import SponsorDB from '../../../assets/home/sponsor_db.png';
import SponsorKeet from '../../../assets/home/sponsor_keet.png';
import SponsorLnMarkets from '../../../assets/home/sponsor_lnmarkets.jpeg';
import SponsorLuganoPlanB from '../../../assets/home/sponsor_lugano_planb.svg?react';
import SponsorSynonym from '../../../assets/home/sponsor_synonym.jpeg';
import SponsorTether from '../../../assets/home/sponsor_tether.png';
import SponsorV from '../../../assets/home/sponsor_v.png';
import SponsorWizardSardine from '../../../assets/home/sponsor_wizardsardine.jpeg';
import WorldMap from '../../../assets/home/world_map.svg';
import BitcoinCircle from '../../../assets/icons/bitcoin_circle.svg?react';
import Groups from '../../../assets/icons/groups.svg?react';
import OpenSource from '../../../assets/icons/open_source.svg?react';
import VisibilityOff from '../../../assets/icons/visibility_off.svg?react';
import { Button } from '../../../atoms/Button';
import { CategoryIcon } from '../../../components/CategoryIcon';
import { MainLayout } from '../../../components/MainLayout';
import { TUTORIALS_CATEGORIES } from '../../tutorials/utils';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const Home = () => {
  const { t } = useTranslation();
  const isScreenXl = useGreater('xl');
  const isScreenLg = useGreater('lg');
  const isScreenMd = useGreater('md');

  const topics = [
    'Bitcoin',
    t('words.economy'),
    'Lightning network',
    t('courses.categories.fin'),
    t('courses.categories.min'),
    t('courses.categories.crypto'),
    t('courses.categories.secu'),
  ];
  const resources = [
    { name: t('words.books'), link: 'books' },
    { name: t('words.podcasts'), link: 'podcasts' },
    { name: t('words.builders'), link: 'builders' },
    { name: t('words.toolkits'), link: 'bet' },
  ];
  const sectionClass =
    'flex flex-col w-[100%] items-center py-12 overflow-hidden font-light md:font-normal';
  const subSectionClass =
    'px-6 md:px-12 lg:px-32 w-auto md:w-[50rem] lg:w-[70rem] xl:w-[90rem]';

  const Page = () => {
    return (
      <MainLayout footerVariant="dark">
        <div className="flex flex-col">
          <HeaderSection />
          <Section1 />
          <Section2 />
          <Section3 />
          <Section4 />
        </div>
      </MainLayout>
    );
  };

  const HeaderSection = () => {
    return (
      <div className={cn('bg-blue-1000 text-white', sectionClass)}>
        <div
          className={cn(
            'grid w-[80rem] grid-cols-1 md:grid-cols-2',
            subSectionClass,
          )}
        >
          <div className="col-span-1">
            <div className="flex flex-row text-[49px] font-semibold">
              <PlanBTitle height={'100%'} width={isScreenMd ? '100%' : 470} />
            </div>
            <p className="mb-3 pt-6 text-3xl font-semibold text-orange-500">
              {t('home.header.globalNetwork')}
            </p>
            <p className="text-3xl font-semibold">
              {t('home.header.forEducators')}
            </p>
            <p className="mt-9 text-xl">{t('home.header.content1')}</p>
            <p className="mt-9 text-xl">{t('home.header.content2')}</p>
            <a href="/node-network" rel="noopener noreferrer">
              <Button
                variant="tertiary"
                className="mt-9 hidden rounded-3xl md:flex"
                iconRight={<AiOutlineRight />}
              >
                {t('home.header.link')}
              </Button>
            </a>
          </div>
          <div className="col-span-1 flex items-center">
            <img
              className="mt-4 h-[100%] w-[100]"
              src={WorldMap}
              alt={t('imagesAlt.worldMap')}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  };

  const Section1 = () => {
    let coursesInCircleMarginLeft = '';
    if (isScreenXl) {
      coursesInCircleMarginLeft = 'calc(-240px)';
    } else if (isScreenLg) {
      coursesInCircleMarginLeft = 'calc(-50vw + 240px)';
    } else if (isScreenMd) {
      coursesInCircleMarginLeft = 'calc(-50vw + 160px)';
    }

    return (
      <>
        <div
          className={cn(sectionClass, 'bg-blue-1000 text-white py-0 md:py-6')}
        >
          <div className={cn('flex w-[80rem] flex-col', subSectionClass)}>
            <p className="mb-3 text-3xl font-semibold text-orange-500">
              {t('home.section1.interested')}
            </p>
            <p className="text-3xl font-semibold">
              {t('home.section1.allLevels')}
            </p>
          </div>
        </div>

        <div
          className={cn(
            'bg-blue-1000 text-white relative py-0 md:pb-12',
            sectionClass,
          )}
        >
          <div
            className={cn(
              'grid grid-cols-1 md:grid-cols-2 pb-6',
              subSectionClass,
            )}
          >
            <div className="col-span-1 hidden items-center md:flex">
              <p className="w-fit">
                <CoursesInCircle
                  height={isScreenLg ? 600 : 450}
                  style={{
                    // position: 'absolute',
                    // left: '0px',
                    // top: '0px',
                    marginLeft: coursesInCircleMarginLeft,
                    // width: '100%',
                    filter: 'grayscale(1) contrast(1) opacity(0.5) ',
                    // background:
                    //   'linear-gradient(51deg, #1B253E, rgba(27, 37, 62, 0.00) 95.34%)',
                  }}
                />
              </p>
            </div>
            <div className="col-span-1 flex flex-col">
              <p className="text-xl">{t('home.section1.content1')}</p>
              <p className="mt-9 text-xl">{t('home.section1.content2')}</p>
              <p className="mt-9 text-xl">{t('home.section1.content3')}</p>
              <p className="mt-9 text-xl">{t('home.section1.content4')}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xl">
                {topics.join(', ')}.
              </div>
              <Link
                to={'/courses'}
                className="mt-9 self-center rounded-3xl md:self-start"
              >
                <Button
                  variant="tertiary"
                  className=" rounded-3xl"
                  iconRight={<AiOutlineRight />}
                >
                  {t('home.section1.link')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  };

  const Section2 = () => {
    return (
      <div className={cn('bg-beige-300 text-blue-1000 md:py-16', sectionClass)}>
        <div className={cn('grid grid-cols-1 md:grid-cols-2', subSectionClass)}>
          <div className="col-span-1 flex flex-col md:items-center md:text-center">
            <p className="mb-3 text-3xl font-semibold text-orange-500">
              {t('home.section2.noBarrier')}
            </p>
            <p className="text-3xl font-medium">
              {t('home.section2.everythingTranslated')}
            </p>
            <p className="mt-9 text-xl">{t('home.section2.content1')}</p>
            <p className="mt-9 text-xl">{t('home.section2.content2')}</p>
            <p className="mt-9 text-xl">{t('home.section2.content3')}</p>
            <a
              href="https://github.com/DecouvreBitcoin/sovereign-university-data"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="tertiary"
                className="mt-9 w-fit self-center rounded-3xl"
                iconRight={<AiOutlineRight />}
              >
                {t('home.section2.link')}
              </Button>
            </a>
          </div>
          <div className="col-span-1 hidden flex-col items-center justify-center md:flex">
            <img
              src={FlagsInCircle}
              alt={t('imagesAlt.flagsInCircle')}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  };

  const Section3 = () => {
    return (
      <div className={cn('bg-blue-1000 text-white md:py-16', sectionClass)}>
        <div className={cn('flex flex-col', subSectionClass)}>
          <p className="mb-3 text-3xl font-semibold text-orange-500">
            {t('home.section3.helpingCommunities')}
          </p>
          <p className="text-3xl font-medium">
            {t('home.section3.letsHelpYou')}
          </p>
          <p className="mt-9 text-xl">{t('home.section3.content1')}</p>
          <p className="mt-9 text-xl">{t('home.section3.content2')}</p>

          <p className="mt-9 font-medium uppercase italic md:mb-2 md:ml-0 md:text-3xl md:not-italic">
            {t('words.tutorials')}
          </p>
          <div className="relative mt-3 flex w-full justify-center rounded-3xl border-[3px] bg-blue-900 px-8 py-6 md:py-6">
            <div className="flex flex-wrap justify-evenly gap-x-6 gap-y-4 md:grid md:grid-cols-3 md:gap-x-20 md:gap-y-0 lg:gap-x-32">
              {TUTORIALS_CATEGORIES.map((tutorialCategory) => (
                <Link
                  key={tutorialCategory.name}
                  to={'/tutorials/$category'}
                  params={{ category: tutorialCategory.name }}
                >
                  {/* Big screen */}
                  <div className="hidden items-center space-x-2 rounded-lg py-2 sm:space-x-4 md:flex">
                    <CategoryIcon src={tutorialCategory.image} />
                    <h3 className="text-base font-semibold text-white md:text-xl lg:text-2xl">
                      {t(`tutorials.${tutorialCategory.name}.title`)}
                    </h3>
                  </div>
                  {/* Small screen */}
                  <div className="flex flex-wrap gap-x-6 gap-y-4 md:hidden">
                    <Button variant="tertiary" className="rounded-3xl">
                      {t(`tutorials.${tutorialCategory.name}.title`)}
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              to={'/tutorials'}
              className="absolute bottom-[-20px] md:right-6"
            >
              <Button
                variant="text"
                className="rounded-3xl bg-white text-center text-xs text-blue-800 md:text-base md:text-orange-500"
                iconRight={isScreenMd ? <AiOutlineRight /> : undefined}
              >
                {isScreenMd
                  ? t('home.section3.seeTutorials')
                  : t('home.section3.seeTutorialsMobile')}
              </Button>
            </Link>
          </div>

          <p className="mt-9 font-medium uppercase italic md:mb-2 md:ml-0 md:text-3xl md:not-italic">
            {t('words.resources')}
          </p>
          <div className="relative mt-3 flex w-full justify-center rounded-3xl border-[3px] bg-blue-900 p-6 md:py-8">
            <div className="flex flex-wrap justify-evenly gap-x-6 gap-y-4 md:gap-x-12 lg:gap-x-20">
              {resources.map((resource) => (
                <a key={resource.link} href={'/resources/' + resource.link}>
                  <Button variant="tertiary" className="rounded-3xl">
                    {resource.name}
                  </Button>
                </a>
              ))}
            </div>
            <Link
              to={'/resources'}
              className="absolute bottom-[-20px] md:right-6"
            >
              <Button
                variant="text"
                className=" rounded-3xl bg-white text-center text-xs text-blue-800 md:text-base  md:text-orange-500"
                iconRight={isScreenMd ? <AiOutlineRight /> : undefined}
              >
                {isScreenMd
                  ? t('home.section3.seeResources')
                  : t('home.section3.seeResourcesMobile')}
              </Button>
            </Link>
          </div>

          <p className="mt-12 text-center text-3xl font-medium md:text-left">
            {t('home.section3.aboutUs')}
          </p>
          <p className="mt-9 text-center text-xl md:text-left">
            {t('home.section3.content3')}
          </p>

          {/* Big screen */}
          <div className="mt-6 hidden flex-row  items-center  justify-evenly md:flex xl:px-20">
            <div className="relative flex h-[32rem] flex-col text-center md:h-[37rem] lg:h-[36rem] xl:h-[34rem]">
              <div className="flex flex-col items-center">
                <OpenSource />
                <div className="mt-2 text-[25px] font-semibold">
                  {t('home.section3.openSourceTitle').toUpperCase()}
                </div>
                <div className="mt-2 text-xl font-light">
                  {t('home.section3.openSourceContent')}
                </div>
              </div>
              <div className="absolute top-40 flex flex-col items-center">
                <BitcoinCircle className="mt-32" />
                <div className="mt-2 text-[25px] font-semibold">
                  {t('home.section3.bitcoinFocusTitle').toUpperCase()}
                </div>
                <div className="mt-2 text-xl font-light">
                  {t('home.section3.bitcoinFocusContent')}
                </div>
              </div>
            </div>
            <div>
              <Spiral className="lg:mx-16" />
            </div>
            <div className="relative flex h-[32rem] flex-col text-center md:h-[37rem] lg:h-[36rem] xl:h-[34rem]">
              <div className="flex h-[30rem] flex-col items-center">
                <Groups />
                <div className="mt-2 text-[25px] font-semibold">
                  {t('home.section3.communityTitle').toUpperCase()}
                </div>
                <div className="mt-2 text-xl font-light">
                  {t('home.section3.communityContent')}
                </div>
              </div>
              <div className="absolute top-40 flex flex-col items-center">
                <VisibilityOff className="mt-32" />
                <div className="mt-2 text-[25px] font-semibold">
                  {t('home.section3.privacyTitle').toUpperCase()}
                </div>
                <div className="mt-2 text-xl font-light">
                  {t('home.section3.privacyContent')}
                </div>
              </div>
            </div>
          </div>

          {/* Small screen*/}
          <div className="bg-beige-300 mx-8 my-6 flex flex-col rounded-2xl p-2 md:hidden">
            <div className="border-blue-1000 flex flex-col gap-4 rounded-2xl border-2 p-5 text-right text-lg text-blue-800">
              <div className="flex w-full flex-row items-center justify-between">
                <OpenSource />
                <span className="font-medium uppercase">
                  {t('home.section3.openSourceTitle')}
                </span>
              </div>

              <div className="flex w-full flex-row items-center justify-between">
                <Groups />
                <span className="font-medium uppercase">
                  {t('home.section3.communityTitleMobile')}
                </span>
              </div>

              <div className="flex w-full flex-row items-center justify-between">
                <BitcoinCircle />
                <span className="font-medium uppercase">
                  {t('home.section3.bitcoinFocusTitleMobile')}
                </span>
              </div>

              <div className="flex w-full flex-row items-center justify-between">
                <VisibilityOff />
                <span className="font-medium uppercase">
                  {t('home.section3.privacyTitleMobile')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const Section4 = () => {
    const sponsorSrcs = [
      SponsorBtcPay,
      SponsorBase58,
      SponsorSynonym,
      SponsorKeet,
      SponsorTether,
      SponsorV,
      SponsorLnMarkets,
      SponsorBSun,
      SponsorWizardSardine,
      SponsorBlockstream,
      SponsorCuboPlus,
      SponsorDB,
    ];
    return (
      <div
        className={cn(
          'bg-beige-300 text-blue-1000 md:text-left text-center !pb-0 md:py-16',
          sectionClass,
        )}
      >
        <div className={cn('flex flex-col', subSectionClass)}>
          <p className="mb-3 text-3xl font-semibold text-orange-500">
            {t('home.section4.together')}
          </p>
          <p className="text-3xl font-medium">{t('home.section4.planB')}</p>
          <p className="mt-9 text-xl">{t('home.section4.content1')}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-6 md:mb-6 md:gap-8">
            {sponsorSrcs.map((sponsorSrc) => {
              return (
                <img
                  className={cn(
                    'rounded-full',
                    isScreenMd ? 'h-20 w-20' : 'h-16 w-16',
                  )}
                  src={sponsorSrc}
                  alt="sponsor"
                  key={sponsorSrc}
                />
              );
            })}
          </div>
          <p className="flex flex-col items-center">
            <SponsorLuganoPlanB width={isScreenMd ? 200 : 150} />
          </p>
        </div>
      </div>
    );
  };

  return <Page />;
};
