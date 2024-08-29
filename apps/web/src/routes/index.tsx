import { Link, createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AiOutlineRight } from 'react-icons/ai';
import { BsTwitter } from 'react-icons/bs';

import { Button, cn } from '@blms/ui';

import HeaderPill from '#src/assets/footer_pill.webp';
import EducationMain from '#src/assets/home/education-main.webp';
import Flags from '#src/assets/home/flags.webp';
import FlagsSmall from '#src/assets/home/flags_small.png';
import HeaderLeft from '#src/assets/home/header_left.svg';
import HeaderRight from '#src/assets/home/header_right.svg';
import Lugano from '#src/assets/home/lugano.webp';
import NetworkMain from '#src/assets/home/network_main.webp';
import Sponsors from '#src/assets/home/sponsors.webp';
import TwitterClaire from '#src/assets/home/twitter_claire.jpeg';
import TwitterLecompte from '#src/assets/home/twitter_lecompte.jpeg';
import TwitterLoic from '#src/assets/home/twitter_loic.jpeg';
import TwitterMirBtc from '#src/assets/home/twitter_mir_btc.jpeg';
import TwitterScuba from '#src/assets/home/twitter_scuba.jpeg';
import { BCertificatePresentation } from '#src/components/b-certificate-presentation.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { TUTORIALS_CATEGORIES } from '#src/utils/tutorials.js';

import { CategoryIcon } from '../components/CategoryIcon/index.tsx';
import { MainLayout } from '../components/MainLayout/index.tsx';
import { NotFound } from '../components/not-found.tsx';
import { AboutUs } from '../molecules/AboutUs/index.tsx';

const titleCss = 'md:text-3xl font-semibold';
const paragraphCss = 'text-sm text-gray-400 sm:text-sm lg:text-base';

export const Route = createFileRoute('/')({
  component: Home,
  notFoundComponent: NotFound,
});

function Home() {
  const { t } = useTranslation();
  const isScreenMd = useGreater('md');

  const sectionClass =
    'flex flex-col w-[100%] items-center py-8 md:py-16 overflow-hidden font-light md:font-normal px-4';
  const subSectionClass =
    'px-2 md:px-8 lg:px-24 w-auto md:w-[45rem] lg:w-[69rem] xl:w-[85rem] 2xl:w-[100rem]';

  const Page = () => {
    return (
      <MainLayout footerVariant="dark">
        <div className="bg-black flex flex-col text-white md:px-8 lg:px-12">
          <HeaderSection />
          <NumberSection />
          <EducationSection />
          <TutorialSection />
          <div className="max-md:mx-2.5">
            <BCertificatePresentation marginClasses="mt-0" />
          </div>
          <AboutUsSection />
          <LanguageSection />
          <WallOfLoveSection />
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
          <div className="col-span-11 w-full content-center self-center px-6 text-center lg:col-span-5">
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
                <Button
                  variant="primary"
                  className="rounded-3xl !text-black"
                  glowing={true}
                >
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
              className="z-10 -ml-16 xl:-ml-20 2xl:-ml-24 md:mt-8 h-fit aspect-auto"
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
          className="absolute -right-8 md:-right-16 top-20 h-20 md:top-0 md:h-40 w-auto overflow-hidden lg:hidden"
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

            <Link to={'/courses'}>
              <img
                src={EducationMain}
                className="mt-6"
                alt={t('')}
                loading="lazy"
              />
            </Link>
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
            <Link to={'/node-network'}>
              <img
                src={NetworkMain}
                className="mt-12"
                alt={t('')}
                loading="lazy"
              />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const WallOfLoveSection = () => {
    return (
      <div className={cn(sectionClass)}>
        <div className={cn(subSectionClass)}>
          <div className="flex flex-col gap-3 px-4 md:text-center">
            <p className={cn(paragraphCss, 'font-medium !text-orange-500')}>
              {t('home.wallOfLoveSection.title')}
            </p>
            <p className="font-semibold md:text-4xl">
              {t('home.wallOfLoveSection.subtitle')}
            </p>
            <div className="mt-4 flex flex-row justify-center gap-8 px-6 md:mt-12 xl:px-20">
              <div className="flex flex-col gap-8 lg:max-w-sm">
                <TwitterCard
                  text="Bullish on Plan B Network: they centralize #bitcoin education, so we can decentralize it"
                  name="Mire"
                  handle="@mir_btc"
                  image={TwitterMirBtc}
                />
                <TwitterCard
                  text="Trainer Rogzy is a true Bitcoin enthusiast, and it shows in his courses: he has understood the global stakes of this technology and has managed to structure this beginner's course in such a way that everyone can get the basics. Thank you!"
                  name="Le Comte"
                  handle="@Mr_Monte_Crypto"
                  image={TwitterLecompte}
                />
              </div>
              <div className="hidden max-w-sm flex-col gap-8 lg:flex">
                <TwitterCard
                  text="This training is a combination of advanced technical aspects and pedagogy! A big BRAVO to Loïc for all his educational work on the pure technique of HD wallets. The course is very well presented, starting with the algorithms used, to then delve deeper into all aspects of HD wallets. It's a very technical training, so hang on, it's worth it 😉"
                  name="Scuba"
                  handle="@Scuba_Wizard"
                  image={TwitterScuba}
                />
              </div>
              <div className="hidden flex-col gap-8 lg:flex">
                <TwitterCard
                  text="Thank you!! For this simplicity that finally allows us to understand such complicated paradigms!"
                  name="Claire Desombre"
                  handle="@CDesombre"
                  image={TwitterClaire}
                />
                <TwitterCard
                  text="Excellent training, Fanis. I learned a lot about the Lightning Network and I understand some concepts better now. Very good training."
                  name="Loïc Morel"
                  handle="@Loic_Pandul"
                  image={TwitterLoic}
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
        <p className="text-gray-400">{text}</p>
        <div className="mt-4 flex flex-row items-center">
          <img
            src={image}
            alt={t('')}
            loading="lazy"
            height={50}
            width={50}
            className="rounded-full"
          />
          <div className="ml-4 flex-auto min-w-[90px]">
            <p className="font-bold leading-4 text-orange-500 truncate">
              {name}
            </p>
            <p className="font-medium text-gray-400 truncate">{handle}</p>
          </div>
          <div className="ml-auto mr-4 mt-2">
            <a
              href={'https://x.com/' + handle}
              target="_blank"
              rel="noopener noreferrer"
            >
              <BsTwitter size={24} className="cursor-pointer text-gray-400" />
            </a>
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
              variant="primary"
              className="rounded-3xl !text-black md:mt-4"
              iconRight={isScreenMd ? <AiOutlineRight /> : undefined}
              glowing={true}
            >
              {t('home.tutorialSection.link')}
            </Button>
          </Link>

          <div className="mt-6 grid w-full grid-cols-2 gap-4 md:gap-x-6 md:mt-12 lg:grid-cols-3 lg:gap-x-9 lg:gap-y-6">
            {TUTORIALS_CATEGORIES.map((tutorialCategory) => (
              <Link
                key={tutorialCategory.name}
                className="flex w-full flex-row items-center rounded-3xl bg-[#ffffff0d] py-3 pl-4 lg:py-5 lg:pl-12"
                to={'/tutorials/$category'}
                params={{ category: tutorialCategory.name }}
              >
                <CategoryIcon className="w-6" src={tutorialCategory.image} />
                <p className="ml-2 md:ml-4 text-sm md:text-lg font-medium xl:ml-12 max-w-full truncate">
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

          <AboutUs />
        </div>
      </div>
    );
  };

  const LanguageSection = () => {
    return (
      <div className="mx-4 md:mx-auto md:w-fit md:max-w-full">
        <div
          className={cn(
            '!py-0 my-8 md:my-16 bg-orange-500 rounded-2xl relative',
            sectionClass,
          )}
        >
          <div
            className={cn('grid grid-cols-1 md:grid-cols-4', subSectionClass)}
          >
            <div className="z-10 col-span-3 flex flex-col py-8 pr-6 md:py-12">
              <p className={cn(paragraphCss, '!text-black font-medium')}>
                {t('home.languageSection.subtitle2')}
              </p>
              <p className={cn(titleCss, 'font-semibold mt-2')}>
                {t('home.languageSection.title')}
              </p>
              <p className={cn(titleCss, 'font-semibold text-black')}>
                {t('home.languageSection.subtitle')}
              </p>
              <p className={cn(paragraphCss, 'mt-5 !text-white max-w-[43rem]')}>
                {t('home.languageSection.content1')}
              </p>
              <p className={cn(paragraphCss, 'mt-5 !text-white')}>
                {t('home.languageSection.content2')}
              </p>
              <a
                href="https://github.com/PlanB-Network/bitcoin-educational-content"
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
            <div className="z-0 col-span-1 hidden h-full w-[23rem] md:flex">
              <img
                src={Flags}
                className="size-auto object-cover"
                alt={t('')}
                loading="lazy"
              />
            </div>

            <div className="absolute -right-[210px] z-0 flex md:-right-52 md:hidden">
              <img
                src={FlagsSmall}
                className="h-full w-auto object-cover"
                alt={t('')}
                loading="lazy"
              />
            </div>
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
            <p className={cn(paragraphCss, 'mt-3 lg:mt-9 max-w-[30rem]')}>
              {t('home.patreonSection.content')}
            </p>
          </div>
          <div className="mb-12 flex h-[26rem] w-full justify-center gap-6 md:mb-6 md:ml-9 md:h-[22rem] lg:ml-16 lg:h-[34rem] lg:justify-start">
            <img
              className="mt-9 h-full w-auto xl:ml-20 2xl:ml-40"
              src={Sponsors}
              alt={t('')}
              loading="lazy"
            />
          </div>
        </div>
        <img
          className="h-full w-auto"
          src={Lugano}
          alt={t('')}
          loading="lazy"
        />
      </div>
    );
  };

  return <Page />;
}
