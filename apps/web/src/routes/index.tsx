import { Link, createFileRoute } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineRight } from 'react-icons/ai';
import { BsTwitter } from 'react-icons/bs';

import type { JoinedEvent } from '@blms/types';
import { Button, Carousel, CarouselContent, CarouselItem, cn } from '@blms/ui';

import HeaderLeft from '#src/assets/home/header_left.svg';
import HeaderRight from '#src/assets/home/header_right.svg';
import TwitterClaire from '#src/assets/home/twitter_claire.jpeg';
import TwitterLecompte from '#src/assets/home/twitter_lecompte.jpeg';
import TwitterLoic from '#src/assets/home/twitter_loic.jpeg';
import TwitterMirBtc from '#src/assets/home/twitter_mir_btc.jpeg';
import TwitterScuba from '#src/assets/home/twitter_scuba.jpeg';
import HeaderPill from '#src/assets/icons/footer_pill.webp';
import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { BCertificatePresentation } from '#src/components/b-certificate-presentation.js';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { useGreater } from '#src/hooks/use-greater.js';
import { VerticalCard } from '#src/molecules/vertical-card.tsx';
import CategoryItemList from '#src/organisms/category-item.tsx';
import { LanguageSelectorHomepage } from '#src/organisms/language-selector-homepage.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { computeAssetCdnUrl } from '#src/utils/index.ts';
import { trpc } from '#src/utils/trpc.ts';

import Map from '../../src/assets/home/map.webp';
import Sponsor from '../../src/assets/home/sponsor-images.webp';
import SponsorMobile from '../../src/assets/home/sponsors-mobile.webp';
import { MainLayout } from '../components/main-layout.tsx';
import { NotFound } from '../components/not-found.tsx';
import { AboutUs } from '../molecules/about-us.tsx';

import { CourseCard } from './_content/courses/index.tsx';
import { CurrentEvents } from './_content/events/-components/current-events.tsx';
import { EventBookModal } from './_content/events/-components/event-book-modal.tsx';
import { EventPaymentModal } from './_content/events/-components/event-payment-modal.tsx';

const titleCss = 'md:text-3xl font-semibold';
const paragraphCss = 'text-sm text-gray-400 sm:text-sm lg:text-base';

export const Route = createFileRoute('/')({
  component: Home,
  notFoundComponent: NotFound,
});

function Home() {
  const { t } = useTranslation();
  const isScreenMd = useGreater('md');
  const buttonSize = isScreenMd ? 'l' : 'm';
  const tutorialButtonSize = isScreenMd ? 'l' : 's';

  const sectionClass =
    'flex flex-col w-full items-center py-8 md:py-16 overflow-hidden font-light md:font-normal px-4 text-center lg:text-start';
  const subSectionClass =
    'px-2 md:px-8 lg:px-24 w-auto md:w-[45rem] lg:w-[69rem] xl:w-[85rem] 2xl:w-[100rem]';

  const Page = () => {
    return (
      <MainLayout footerVariant="dark">
        <div className="bg-black flex flex-col text-white md:px-8 lg:px-12">
          <HeaderSection />
          <NumberSection />
          <CourseSection />
          <EventSection />
          <AboutUsSection />
          <BlogSection />
          <TutorialSection />
          <LanguageSection />
          <WallOfLoveSection />
          <div className="lg:-mx-12 md:-mx-8 bg-[linear-gradient(180deg,_#000_0%,_#853000_50.5%,_#000_99.5%)]">
            <BCertificatePresentation marginClasses="mt-0 !border-0 !shadow-none text-center lg:text-start" />
          </div>
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
            <div className="mt-6 flex flex-row flex-wrap justify-center gap-4 lg:mt-9">
              <a href="/courses" rel="noopener noreferrer">
                <Button
                  variant="primary"
                  rounded={true}
                  className="!text-black"
                  glowing={true}
                >
                  {t('home.header.startLink')}
                </Button>
              </a>
              <a
                href="/node-network"
                rel="noopener noreferrer"
                className="darky"
              >
                <Button
                  variant="secondary"
                  rounded={true}
                  className="!text-black"
                >
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
        <div className="flex flex-col gap-3 md:flex-col md:gap-12 ">
          <div className="flex flex-row justify-center gap-3 md:gap-10">
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>15+</span>
              <span className={cn(element2css)}>{t('words.communities')}</span>
            </div>
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>20+</span>
              <span className={cn(element2css)}>{t('words.courses')}</span>
            </div>
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>80+</span>
              <span className={cn(element2css)}>{t('words.events')}</span>
            </div>
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>880+</span>
              <span className={cn(element2css)}>{t('words.students')}</span>
            </div>
          </div>
          <div className="flex flex-row justify-center gap-3 md:gap-12">
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>50+</span>
              <span className={cn(element2css)}>{t('words.professors')}</span>
            </div>
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>100+</span>
              <span className={cn(element2css)}>{t('words.tutorials')}</span>
            </div>
            <div className="flex flex-col text-center">
              <span className={cn(element1css)}>1220+</span>
              <span className={cn(element2css)}>{t('words.resources')}</span>
            </div>
          </div>
        </div>
        <img
          className="max-md:hidden absolute -right-8 md:-right-16 top-20 h-20 md:top-0 md:h-40 w-auto overflow-hidden lg:hidden"
          src={HeaderPill}
          alt={t('imagesAlt.orangePill')}
          loading="lazy"
        />
      </div>
    );
  };

  const CourseSection = () => {
    const { data: courses, isFetched } = trpc.content.getCourses.useQuery(
      {
        language: 'en',
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    );

    const filteredCourses = isFetched
      ? courses
          ?.filter((course) =>
            ['min302', 'btc402', 'eco102'].includes(course.id),
          )
          .sort((a, b) => {
            const order = ['btc402', 'min302', 'eco102'];
            return order.indexOf(a.id) - order.indexOf(b.id);
          })
      : [];

    if (!filteredCourses || filteredCourses.length === 0) {
      return <div>No courses found</div>;
    }

    return (
      <section className="max-w-[1080px] mx-auto mt-[30px] lg:mt-[111px] px-4">
        <h2 className="text-white subtitle-large-med-20px lg:display-semibold-40px text-center lg:text-start">
          Upcoming & new courses
        </h2>
        <p className="text-darkOrange-5 body-16px-medium lg:title-large-sb-24px text-center lg:text-start  mb-8">
          Find out the latest courses released onto the platform. Learning never
          stops !
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 justify-center">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              to="/courses/$courseId"
              params={{ courseId: course.id }}
              className="flex w-full max-w-[320px] max-md:mx-auto"
            >
              <CourseCard key={course.id} course={course} />
            </Link>
          ))}
        </div>
        <Link to={'/courses'} className="flex justify-center lg:justify-start">
          <Button
            variant="primary"
            rounded={false}
            className="mt-8"
            glowing={false}
            size={buttonSize}
          >
            Check all courses
            <span className="ml-3">
              <AiOutlineRight />
            </span>
          </Button>
        </Link>
      </section>
    );
  };

  const EventSection = () => {
    const { session } = useContext(AppContext);
    const isLoggedIn = !!session;

    const {
      open: openAuthModal,
      isOpen: isAuthModalOpen,
      close: closeAuthModal,
    } = useDisclosure();

    const queryOpts = {
      staleTime: 600_000, // 10 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    };

    const { data: events, isFetched } = trpc.content.getRecentEvents.useQuery(
      undefined,
      queryOpts,
    );

    const { data: eventPayments, refetch: refetchEventPayments } =
      trpc.user.events.getEventPayment.useQuery(undefined, {
        ...queryOpts,
        enabled: isLoggedIn,
      });

    const { data: userEvents, refetch: refetchUserEvents } =
      trpc.user.events.getUserEvents.useQuery(undefined, {
        ...queryOpts,
        enabled: isLoggedIn,
      });

    const authMode = AuthModalState.SignIn;

    const [paymentModalData, setPaymentModalData] = useState<{
      eventId: string | null;
      satsPrice: number | null;
      accessType: 'physical' | 'online' | 'replay' | null;
    }>({ eventId: null, satsPrice: null, accessType: null });

    const payingEvent: JoinedEvent | undefined = events?.find(
      (e) => e.id === paymentModalData.eventId,
    );

    const [conversionRate, setConversionRate] = useState<number | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
      const fetchConversionRate = async () => {
        try {
          const response = await fetch('https://mempool.space/api/v1/prices');
          const data = await response.json();
          setConversionRate(data.USD);
        } catch (error) {
          console.error('Failed to fetch conversion rate:', error);
        }
      };

      fetchConversionRate();
    }, []);

    return (
      <section className="lg:-mx-12 md:-mx-8 mt-[30px] lg:h-[913px] lg:mt-[108px]">
        <div className="bg-home-gradient-mobile lg:bg-home-gradient h-full">
          <div className="flex flex-col lg:relative h-full">
            <h1 className="flex justify-center lg:absolute lg:top-0 lg:left-1/2 lg:-translate-x-1/2 w-full text-white title-small-med-16px lg:display-large-med-48px text-center">
              A Global Bitcoin Network of Educators
            </h1>
            <img
              src={Map}
              alt=""
              className="mx-auto lg:mx-0 object-cover w-full lg:w-[1213px] lg:h-[641px] [overflow-clip-margin:_unset] lg:mt-[120px]"
            />

            {paymentModalData.eventId &&
              paymentModalData.satsPrice &&
              paymentModalData.accessType &&
              paymentModalData.satsPrice > 0 &&
              payingEvent && (
                <EventPaymentModal
                  eventId={paymentModalData.eventId}
                  event={payingEvent}
                  accessType={paymentModalData.accessType}
                  satsPrice={paymentModalData.satsPrice}
                  isOpen={isPaymentModalOpen}
                  onClose={(isPaid) => {
                    // TODO trigger add paid booked seat logic

                    if (isPaid) {
                      refetchEventPayments();
                      setTimeout(() => {
                        refetchEventPayments();
                      }, 5000);
                    }
                    setPaymentModalData({
                      eventId: null,
                      satsPrice: null,
                      accessType: null,
                    });
                    setIsPaymentModalOpen(false);
                  }}
                />
              )}
            {paymentModalData.eventId &&
              paymentModalData.satsPrice === 0 &&
              paymentModalData.accessType &&
              payingEvent && (
                <EventBookModal
                  event={payingEvent}
                  accessType={paymentModalData.accessType}
                  isOpen={isPaymentModalOpen}
                  onClose={() => {
                    setIsPaymentModalOpen(false);
                    refetchEventPayments();
                    refetchUserEvents();
                  }}
                />
              )}
            <div className="flex lg:absolute top-0 right-64 mt-2 lg:mt-[160px] lg:pr-[75px] mx-auto lg:mx-0">
              {isFetched && events && (
                <CurrentEvents
                  events={events}
                  eventPayments={eventPayments}
                  userEvents={userEvents}
                  openAuthModal={openAuthModal}
                  isLoggedIn={isLoggedIn}
                  conversionRate={conversionRate}
                  setIsPaymentModalOpen={setIsPaymentModalOpen}
                  setPaymentModalData={setPaymentModalData}
                  headingColor="text-white "
                  headingText="Hottest bitcoin event"
                  headingClass="!body-14px lg:!display-small-32px"
                  showUpcomingIfNone={true}
                  showDivider={false}
                />
              )}
              {isAuthModalOpen && (
                <AuthModal
                  isOpen={isAuthModalOpen}
                  onClose={closeAuthModal}
                  initialState={authMode}
                />
              )}
            </div>
            <Link
              className="flex justify-center lg:absolute lg:bottom-0 lg:left-1/2 lg:-translate-x-1/2 mt-[30px]"
              to={'/events'}
            >
              <Button
                variant="flags"
                rounded={false}
                className=""
                glowing={false}
                size={buttonSize}
              >
                Check all events
                <span className="ml-3">
                  <AiOutlineRight />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
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
      <div className={cn('mt-5 lg:mt-[60px]', sectionClass)}>
        <div
          className={cn(
            'flex flex-col md:text-center md:items-center',
            subSectionClass,
          )}
        >
          <p className="subtitle-large-med-20px lg:display-semibold-40px md:flex text-darkOrange-5">
            {t('home.tutorialSection.title')}
          </p>
          <p
            className={cn(
              'max-w-[45rem] body-16px-medium lg:display-semibold-40px',
            )}
          >
            {t('home.tutorialSection.subtitle1')}
          </p>
          <p className={cn(paragraphCss, 'mt-4 max-w-[60rem]')}>
            {t('home.tutorialSection.content1')}
          </p>
        </div>
        <CategoryItemList
          baseUrl="/tutorials"
          categoryType="tutorials"
          title={(category) => t(`tutorials.${category.name}.title`)}
        />
        <Link to={'/tutorials'} className="mt-[30px] lg:hidden">
          <Button
            variant="outlineWhite"
            rounded={false}
            glowing={false}
            size={tutorialButtonSize}
          >
            {t('home.tutorialSection.link')}
            <span className="ml-3">
              <AiOutlineRight />
            </span>
          </Button>
        </Link>
        <CategoryItemList
          baseUrl="/resources"
          categoryType="resources"
          title={(category) => t(`resources.${category.name}.title`)}
        />
        <Link to={'/resources'} className="mt-[30px] lg:hidden">
          <Button
            variant="outlineWhite"
            rounded={false}
            glowing={false}
            size={tutorialButtonSize}
          >
            {t('home.tutorialSection.link2')}
            <span className="ml-3">
              <AiOutlineRight />
            </span>
          </Button>
        </Link>

        <div className="flex gap-10 mt-10 max-lg:hidden">
          <Link to={'/tutorials'}>
            <Button
              variant="outlineWhite"
              rounded={false}
              className=""
              glowing={false}
              size="l"
            >
              {t('home.tutorialSection.link')}
              {isScreenMd ? (
                <span className="ml-3">
                  <AiOutlineRight />
                </span>
              ) : null}
            </Button>
          </Link>
          <Link to={'/resources'}>
            <Button
              variant="outlineWhite"
              rounded={false}
              className=""
              glowing={false}
              size="l"
            >
              {t('home.tutorialSection.link2')}
              {isScreenMd ? (
                <span className="ml-3">
                  <AiOutlineRight />
                </span>
              ) : null}
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  const AboutUsSection = () => {
    return (
      <div className={cn('', sectionClass)}>
        <div className={cn('md:text-center', subSectionClass)}>
          <p className={cn('font-medium !text-orange-500')}>
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
      <article className="lg:-mx-12 md:-mx-8 bg-gradient-to-b from-[rgba(33,12,0,0.9)] via-[rgba(102,102,102,0.9)] to-[rgba(33,12,0,0.9)]">
        <div className="!py-0 my-8 md:mt-[98px] md:mb-[130px] max-w-[1164px] mx-auto">
          <div>
            <div className="flex flex-col">
              <p className="text-white subtitle-large-med-20px lg:display-semibold-40px text-center lg:text-start">
                {t('home.languageSection.title')}
              </p>
              <p className="text-darkOrange-5 body-16px-medium  lg:display-semibold-40px text-center lg:text-start">
                {t('home.languageSection.subtitle')}
              </p>
              <p
                className={cn(
                  paragraphCss,
                  'mt-5 !text-newGray-5 max-w-[43rem] body-14px lg:subtitle-med-16px text-center lg:text-start',
                )}
              >
                {t('home.languageSection.content1')}
              </p>

              <span className="mt-[50px] subtitle-small-med-14px lg:title-large-sb-24px text-center lg:text-start">
                {t('home.languageSection.availableLanguagesVariation')}
              </span>

              <LanguageSelectorHomepage />
              <Link
                to="https://github.com/PlanB-Network/bitcoin-educational-content"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-[50px] !rounded-[16px] mx-auto lg:mx-0"
              >
                <Button
                  variant="secondary"
                  rounded={false}
                  size={tutorialButtonSize}
                  className="!text-black !rounded-[16px]"
                >
                  {t('home.languageSection.link')}
                  <span className="ml-3">
                    <AiOutlineRight />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  };

  const PatreonSection = () => {
    return (
      <div
        className={cn(
          'text-left !pb-0 flex flex-col !2xl:w-[1225] mt-5 lg:mt-[100px]',
          sectionClass,
        )}
      >
        <div className="flex flex-col items-start px-2 md:px-8 lg:px-24 w-auto md:w-[45rem] lg:w-[69rem] xl:w-[85rem]">
          <div>
            <p
              className={cn(
                'mb-3 !text-orange-500 title-medium-sb-18px lg:!display-small-32px text-center lg:text-start',
              )}
            >
              {t('home.patreonSection.title')}
            </p>

            <p
              className={cn(
                'mt-3 lg:mt-8 max-w-[48.75rem] body-14px lg:subtitle-large-med-20px text-center lg:text-start',
              )}
            >
              {t('home.patreonSection.content')}
            </p>
          </div>
          <div className="mb-12 flex w-full gap-6 md:mb-6 lg:justify-start">
            <img
              className="mt-9 max-lg:hidden lg:flex object-cover [overflow-clip-margin:_unset]"
              src={Sponsor}
              alt={t('')}
              loading="lazy"
            />
            <img
              className="mt-9 flex lg:hidden object-cover [overflow-clip-margin:_unset] mx-auto"
              src={SponsorMobile}
              alt={t('')}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  };

  const BlogSection = () => {
    const { blogs } = useContext(AppContext);
    const { t } = useTranslation();

    if (!blogs) {
      return <></>;
    }

    const categoriesOrder = ['network', 'content', 'feature'];
    const latestBlogsByCategory = categoriesOrder
      .map((category) => {
        const blogsInCategory = blogs
          .filter((blog) => blog.category === category)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );

        return blogsInCategory[0];
      })
      .filter(Boolean);

    if (latestBlogsByCategory.length === 0) {
      return (
        <p className="text-black p-14 justify-center text-4xl font-medium mx-auto">
          {t('publicCommunication.blogPageStrings.noArticlesText')}
        </p>
      );
    }

    return (
      <div className="lg:-mx-12 md:-mx-8 bg-[linear-gradient(180deg,_#000_0%,_#853000_50.5%,_#000_99.5%)] lg:mt-[107px] px-[15px] lg:px-0">
        <div className="mx-auto max-w-[1079px]">
          <h3 className="text-white subtitle-large-med-20px lg:display-semibold-40px text-center lg:text-end">
            What’s new at Plan ₿ Network
          </h3>
          <p className="text-darkOrange-5 text-center lg:text-end body-16px-medium lg:title-large-sb-24px mb-8">
            We keep on improving the platform, the content, and the network -
            check it out!
          </p>

          <div className="block md:hidden">
            <Carousel className="relative">
              <CarouselContent className="ml-0">
                {latestBlogsByCategory.map((blog) => (
                  <CarouselItem
                    key={blog.id}
                    className="basis 1/2 md:basis-1/3 max-w-[137px] !pl-[10px]"
                  >
                    <VerticalCard
                      imageSrc={computeAssetCdnUrl(
                        blog.lastCommit,
                        `${blog.path}/assets/thumbnail.webp`,
                      )}
                      title={blog.title}
                      languages={[]}
                      cardColor="lightgrey"
                      className="text-start p-0 !lg:p-2.5"
                      buttonVariant="primary"
                      buttonMode="dark"
                      buttonText={t(
                        'publicCommunication.blogPageStrings.blogListButtonText',
                      )}
                      buttonLink={`/public-communication/blogs-and-news/${blog.category}/${blog.name}`}
                      tags={blog.tags}
                      category={blog.category}
                      excerpt={blog.description ?? ''}
                      imgClassName=""
                      bodyClassName="p-2.5 lg:p-0"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestBlogsByCategory.map((blog) => (
              <VerticalCard
                key={blog.id}
                imageSrc={computeAssetCdnUrl(
                  blog.lastCommit,
                  `${blog.path}/assets/thumbnail.webp`,
                )}
                title={blog.title}
                languages={[]}
                cardColor="lightgrey"
                className="text-start"
                buttonVariant="primary"
                buttonMode="dark"
                buttonText={t(
                  'publicCommunication.blogPageStrings.blogListButtonText',
                )}
                buttonLink={`/public-communication/blogs-and-news/${blog.category}/${blog.name}`}
                tags={blog.tags}
                category={blog.category}
                excerpt={blog.description ?? ''}
              />
            ))}
          </div>

          <div className="max-w-[1079px]">
            <Link
              to={'/public-communication/blogs-and-news'}
              className="flex justify-center lg:justify-end"
            >
              <Button
                variant="secondary"
                rounded={false}
                className="mt-8"
                glowing={false}
                size={buttonSize}
              >
                See all
                <span className="ml-3">
                  <AiOutlineRight />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return <Page />;
}
