import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AiOutlineRight } from 'react-icons/ai';
import { BsTwitter } from 'react-icons/bs';

import { cn } from '@sovereign-university/ui';

import EducationMain from '../../../assets/home/education-main.png';
import Flags from '../../../assets/home/flags.svg';
import FlagsSmall from '../../../assets/home/flags_small.png';
import HeaderLeft from '../../../assets/home/header_left.svg';
import HeaderPill from '../../../assets/home/header_pill.png';
import HeaderRight from '../../../assets/home/header_right.svg';
import NetworkMain from '../../../assets/home/network-main.svg';
import ProfessorsTile from '../../../assets/home/professors.svg';
import Sponsors from '../../../assets/home/sponsors.png';
import WolProfile1 from '../../../assets/home/wol-profil-1.png';
import BitcoinCircle from '../../../assets/icons/bitcoin_circle.svg?react';
import Groups from '../../../assets/icons/groups.svg?react';
import OpenSource from '../../../assets/icons/open_source.svg?react';
import VisibilityOff from '../../../assets/icons/visibility_off.svg?react';
import { Button } from '../../../atoms/Button';
import { CategoryIcon } from '../../../components/CategoryIcon';
import { MainLayout } from '../../../components/MainLayout';
import { TUTORIALS_CATEGORIES } from '../../tutorials/utils';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

const titleCss = 'md:text-3xl font-semibold';
const paragraphCss = 'text-xs text-gray-400 sm:text-sm lg:text-base';

export const Home = () => {
  const { t } = useTranslation();
  const isScreenMd = useGreater('md');

  const sectionClass =
    'flex flex-col w-[100%] items-center py-8 md:py-16 overflow-hidden font-light md:font-normal';
  const subSectionClass =
    'px-2 md:px-8 lg:px-24 w-auto md:w-[45rem] lg:w-[69rem] xl:w-[85rem] 2xl:w-[100rem]';

  const Page = () => {
    return (
      <MainLayout footerVariant="dark">
        <div className="bg-gradient-blue flex flex-col px-4 text-white md:px-8 lg:px-12">
          <HeaderSection />
          <NumberSection />
          <EducationSection />
          <WallOfLoveSection />
          <TutorialSection />
          <AboutUsSection />
          <LanguageSection />
          <PatreonSection />
        </div>
      </MainLayout>
    );
  };

  const HeaderSection = () => {
    return (
      <div className={cn(sectionClass)}>
        <div
          className={cn('grid grid-cols-11 gap-8 lg:!px-8', subSectionClass)}
        >
          <div className="col-span-3 hidden items-start lg:flex">
            <img
              className="mt-9 h-[100] w-auto"
              src={HeaderLeft}
              alt={t('imagesAlt.printedCircuits')}
              loading="lazy"
            />
          </div>
          <div className="2xl: col-span-11 w-full content-center self-center px-6 text-center lg:col-span-5">
            <p
              className={cn(
                paragraphCss,
                'mt-0 font-medium uppercase text-white',
              )}
            >
              {t('home.header.welcome')}
            </p>
            <p className="mt-6 text-xl font-semibold text-orange-500 md:text-4xl 2xl:text-5xl">
              {t('home.header.globalNetwork')}
            </p>
            <p className="text-xl font-semibold md:mt-2 md:text-4xl 2xl:text-5xl">
              {t('home.header.forEducators')}
            </p>
            <p className={cn(paragraphCss, 'mt-2 lg:mt-9')}>
              {t('home.header.content')}
            </p>
            <div className="mt-6 flex flex-row justify-center gap-4 lg:mt-9">
              <a href="/courses" rel="noopener noreferrer">
                <Button variant="tertiary" className="rounded-3xl !text-black">
                  {t('home.header.startLink')}
                </Button>
              </a>
              <a href="/node-network" rel="noopener noreferrer">
                <Button variant="secondary" className="rounded-3xl !text-black">
                  {t('home.header.link')}
                </Button>
              </a>
            </div>
          </div>
          <div className="relative col-span-3 hidden items-start lg:flex">
            <img
              className="z-10 -ml-16 mt-8 h-[18rem] w-auto xl:h-[24rem]"
              src={HeaderPill}
              alt={t('imagesAlt.orangePill')}
              loading="lazy"
            />
            <img
              className="absolute left-0 mt-9 h-[100] w-auto"
              src={HeaderRight}
              alt={t('imagesAlt.printedCircuits')}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  };

  const NumberSection = () => {
    const element1css =
      'text-3xl font-semibold md:text-4xl lg:text-6xl font-mono';
    const element2css =
      'text-xs font-semibold md:text-base lg:text-xl font-mono';

    return (
      <div className={cn(sectionClass, 'relative')}>
        <div className="flex flex-col gap-3 md:flex-row md:gap-12 ">
          <div className="flex flex-row justify-center gap-3 md:gap-12">
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>13+</span>
              <span className={cn(element2css)}>
                {t('words.networkMember')}
              </span>
            </div>
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>18+</span>
              <span className={cn(element2css)}>{t('words.professors')}</span>
            </div>
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>12+</span>
              <span className={cn(element2css)}>{t('words.courses')}</span>
            </div>
          </div>
          <div className="flex flex-row justify-center gap-3 md:gap-12">
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>60+</span>
              <span className={cn(element2css)}>{t('words.tutorials')}</span>
            </div>
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>694+</span>
              <span className={cn(element2css)}>{t('words.members')}</span>
            </div>
          </div>
        </div>
        <img
          className="absolute -right-16 h-40 w-auto overflow-hidden lg:hidden"
          src={HeaderPill}
          alt={t('imagesAlt.orangePill')}
          loading="lazy"
        />
      </div>
    );
  };

  const EducationSection = () => {
    return (
      <div className={cn(sectionClass)}>
        <div
          className={cn(
            'md:text-center grid grid-cols-2 items-start gap-12 md:gap-2',
            subSectionClass,
          )}
        >
          <div className="col-span-2 flex flex-col items-start md:col-span-1 md:items-center md:px-4">
            <p className="rounded-lg bg-[#ffffff1a] px-4 py-2 text-xl font-semibold uppercase text-orange-500">
              {t('words.education')}
            </p>
            <p className={cn(titleCss, 'mt-6')}>
              {t('home.sectionEducation.title')}
            </p>
            <p className={cn(titleCss, 'text-orange-500')}>
              {t('home.sectionEducation.subtitle')}
            </p>
            <p className={cn(paragraphCss, 'mt-6 z-10')}>
              {t('home.sectionEducation.content1')}
            </p>
            <Link
              to={'/courses'}
              className="z-10 mt-6 self-start rounded-3xl md:self-center"
            >
              <Button
                variant="secondary"
                className=" rounded-3xl !text-black"
                iconRight={<AiOutlineRight />}
              >
                {t('home.sectionEducation.link')}
              </Button>
            </Link>

            <img
              src={EducationMain}
              className="mt-6"
              alt={t('imagesAlt.educationCircle')}
              loading="lazy"
            />
          </div>

          <div className="col-span-2 flex flex-col items-start md:col-span-1 md:items-center md:px-4">
            <p className="rounded-lg bg-[#ffffff1a] px-4 py-2 text-xl font-semibold uppercase text-orange-500">
              {t('words.network')}
            </p>
            <p className={cn(titleCss, 'mt-6')}>
              {t('home.sectionNetwork.title')}
            </p>
            <p className={cn(titleCss, 'text-orange-500')}>
              {t('home.sectionNetwork.subtitle')}
            </p>
            <p className={cn(paragraphCss, 'mt-6 z-10')}>
              {t('home.sectionNetwork.content1')}
            </p>
            <Link
              to={'/node-network'}
              className="mt-6 self-start rounded-3xl md:self-center"
            >
              <Button
                variant="secondary"
                className=" rounded-3xl !text-black"
                iconRight={<AiOutlineRight />}
              >
                {t('home.sectionNetwork.link')}
              </Button>
            </Link>
            <img
              src={NetworkMain}
              className="mt-12"
              alt={t('imagesAlt.networkMap')}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  };

  const WallOfLoveSection = () => {
    return (
      <div className={cn(sectionClass)}>
        <div className={cn(subSectionClass)}>
          <div className="flex flex-col gap-3  px-4 md:text-center">
            <p className={cn(paragraphCss, 'font-medium !text-orange-500')}>
              Wall of love
            </p>
            <p className="font-semibold md:text-4xl">
              What Bitcoiners say about us
            </p>
            <div className="mt-4 flex flex-row justify-center gap-8 px-6 md:mt-12 xl:px-20">
              <div className="flex flex-col gap-8">
                <TwitterCard
                  text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus quam, sit amet scelerisque lectus venenatis vel."
                  name="name"
                  handle="handle"
                  image={WolProfile1}
                />
                <TwitterCard
                  text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus quam, sit amet scelerisque lectus venenatis vel."
                  name="name"
                  handle="handle"
                  image={WolProfile1}
                />
              </div>
              <div className="hidden flex-col gap-8 lg:flex">
                <TwitterCard
                  text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus quam, sit amet scelerisque lectus venenatis vel."
                  name="name"
                  handle="handle"
                  image={WolProfile1}
                />
                <TwitterCard
                  text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus quam, sit amet scelerisque lectus venenatis vel."
                  name="name"
                  handle="handle"
                  image={WolProfile1}
                />
              </div>
              <div className="hidden flex-col gap-8 lg:flex">
                <TwitterCard
                  text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus quam, sit amet scelerisque lectus venenatis vel."
                  name="name"
                  handle="handle"
                  image={WolProfile1}
                />
                <TwitterCard
                  text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus quam, sit amet scelerisque lectus venenatis vel."
                  name="name"
                  handle="handle"
                  image={WolProfile1}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TwitterCard = ({
    text,
    name,
    handle,
    image,
  }: {
    text: string;
    name: string;
    handle: string;
    image: string;
  }) => {
    return (
      <div className="rounded-[32px] bg-[#ffffff0d] p-8 text-start">
        <p className="font-semibold text-gray-400">{text}</p>
        <div className="mt-4 flex flex-row items-center">
          <img src={image} alt={t('')} loading="lazy" />
          <div className="ml-4">
            <p className="font-bold leading-4 text-orange-500">{name}</p>
            <p className="font-medium text-gray-400">{handle}</p>
          </div>
          <div className="ml-auto mr-4 mt-2">
            <BsTwitter size={24} className="cursor-pointer text-gray-400" />
          </div>
        </div>
      </div>
    );
  };

  const TutorialSection = () => {
    return (
      <div className={cn('', sectionClass)}>
        <div
          className={cn(
            'flex flex-col md:text-center md:items-center',
            subSectionClass,
          )}
        >
          <p className="hidden text-4xl font-semibold md:flex">
            {t('home.tutorialSection.title')}
          </p>
          <p className={cn(titleCss, 'max-w-[45rem] md:text-orange-500')}>
            {t('home.tutorialSection.subtitle1')}
          </p>
          <p className={cn(paragraphCss, 'mt-4 max-w-[60rem]')}>
            {t('home.tutorialSection.content1')}
          </p>

          <Link to={'/tutorials'} className="mt-6">
            <Button
              variant="tertiary"
              className="rounded-3xl !text-black md:mt-4"
              iconRight={isScreenMd ? <AiOutlineRight /> : undefined}
            >
              {t('home.tutorialSection.link')}
            </Button>
          </Link>

          <div className="mt-6 grid w-full grid-cols-2 gap-x-6 gap-y-4 md:mt-12 lg:grid-cols-3 lg:gap-x-9 lg:gap-y-6">
            {TUTORIALS_CATEGORIES.map((tutorialCategory) => (
              <Link
                key={tutorialCategory.name}
                className="flex w-full flex-row items-center rounded-3xl bg-[#ffffff0d] py-3 pl-4 lg:py-5 lg:pl-12"
                to={'/tutorials/$category'}
                params={{ category: tutorialCategory.name }}
              >
                <CategoryIcon src={tutorialCategory.image} />
                <p className="ml-4 text-lg font-medium md:ml-12">
                  {t(`tutorials.${tutorialCategory.name}.title`)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AboutUsSection = () => {
    return (
      <div className={cn('', sectionClass)}>
        <div className={cn('md:text-center', subSectionClass)}>
          <p className={cn(paragraphCss, 'font-medium !text-orange-500')}>
            {t('home.aboutUsSection.title')}
          </p>
          <p className={cn(titleCss, 'mt-2 font-medium')}>
            {t('home.aboutUsSection.subtitle')}
          </p>
          <p className={cn(paragraphCss, 'mt-3 2xl:px-60 xl:px-32')}>
            {t('home.aboutUsSection.content')}
          </p>

          <img
            src={ProfessorsTile}
            className="mt-4 w-full 2xl:px-28"
            alt={t('')}
            loading="lazy"
          />

          <div className="-mt-9 flex flex-col items-center gap-6 text-center md:flex-row">
            <div className="flex max-w-sm flex-col items-center">
              <BitcoinCircle />
              <div className="mt-2 text-sm font-semibold md:text-2xl">
                {t('home.aboutUsSection.bitcoinFocusTitle').toUpperCase()}
              </div>
              <div className={cn(paragraphCss, 'mt-2 font-light')}>
                {t('home.aboutUsSection.bitcoinFocusContent')}
              </div>
            </div>
            <div className="flex max-w-sm flex-col items-center">
              <OpenSource />
              <div className="mt-2 text-sm font-semibold md:text-2xl">
                {t('home.aboutUsSection.openSourceTitle').toUpperCase()}
              </div>
              <div className={cn(paragraphCss, 'mt-2 font-light')}>
                {t('home.aboutUsSection.openSourceContent')}
              </div>
            </div>
            <div className="flex max-w-sm flex-col items-center">
              <Groups />
              <div className="mt-2 text-sm font-semibold md:text-2xl">
                {t('home.aboutUsSection.communityTitle').toUpperCase()}
              </div>
              <div className={cn(paragraphCss, 'mt-2 font-light')}>
                {t('home.aboutUsSection.communityContent')}
              </div>
            </div>
            <div className="flex max-w-sm flex-col items-center">
              <VisibilityOff />
              <div className="mt-2 text-sm font-semibold md:text-2xl">
                {t('home.aboutUsSection.privacyTitle').toUpperCase()}
              </div>
              <div className={cn(paragraphCss, 'mt-2 font-light')}>
                {t('home.aboutUsSection.privacyContent')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LanguageSection = () => {
    return (
      <div
        className={cn(
          '!py-0 my-8 md:my-16 bg-orange-500 rounded-2xl relative',
          sectionClass,
        )}
      >
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-4',
            'md:!w-[38rem] lg:!w-[62rem] xl:!w-[78rem] 2xl:!w-[93rem]',
            subSectionClass,
          )}
        >
          <div className="z-10 col-span-3 flex flex-col py-12 pr-6">
            <p className={cn(paragraphCss, 'mt-5 !text-black font-medium')}>
              {t('home.languageSection.subtitle2')}
            </p>
            <p className={cn(titleCss, 'font-semibold mt-2')}>
              {t('home.languageSection.title')}
            </p>
            <p className={cn(titleCss, 'font-semibold text-black')}>
              {t('home.languageSection.subtitle')}
            </p>
            <p className={cn(paragraphCss, 'mt-5 !text-white')}>
              {t('home.languageSection.content1')}
            </p>
            <p className={cn(paragraphCss, 'mt-5 !text-white')}>
              {t('home.languageSection.content2')}
            </p>
            <a
              href="https://github.com/DecouvreBitcoin/sovereign-university-data"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6"
            >
              <Button
                variant="secondary"
                className="rounded-3xl !text-black"
                iconRight={<AiOutlineRight />}
              >
                {t('home.languageSection.link')}
              </Button>
            </a>
          </div>
          <div className="absolute -right-[410px] z-0 hidden md:-right-52 xl:static xl:col-span-1 xl:flex xl:justify-self-center">
            <img
              src={Flags}
              className="h-full w-auto object-cover"
              alt={t('')}
              loading="lazy"
            />
          </div>

          <div className="absolute -right-[210px] z-0 flex md:-right-52 xl:hidden">
            <img
              src={FlagsSmall}
              className="h-full w-auto object-cover"
              alt={t('')}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  };

  const PatreonSection = () => {
    return (
      <div className={cn('text-left !pb-0', sectionClass)}>
        <div
          className={cn(
            'flex flex-col md:flex-row items-center',
            subSectionClass,
          )}
        >
          <div>
            <p
              className={cn(
                paragraphCss,
                'mb-3 font-semibold !text-orange-500',
              )}
            >
              {t('home.patreonSection.title')}
            </p>
            <p className={cn(titleCss, 'font-medium')}>
              {t('home.patreonSection.subtitle')}
            </p>
            <p className={cn(paragraphCss, 'mt-3 lg:mt-9')}>
              {t('home.patreonSection.content')}
            </p>
          </div>
          <div className="mb-12 flex h-[26rem] w-full justify-center gap-6 md:mb-6 md:ml-9 md:h-[22rem] lg:ml-16 lg:h-[30rem] lg:justify-start">
            <img
              className="mt-9 h-full w-auto"
              src={Sponsors}
              alt={t('')}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  };

  return <Page />;
};
