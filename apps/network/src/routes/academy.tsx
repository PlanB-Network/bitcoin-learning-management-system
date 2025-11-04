import { LANGUAGES_MAP } from '@blms/shared';
import { cn, Image } from '@blms/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import headerImage from '#src/assets/academy/header.webp';
import headerSmallImage from '#src/assets/academy/header-small.webp';
import media1Image from '#src/assets/academy/media-1.webp';
import media2Image from '#src/assets/academy/media-2.webp';
import media2MobileImage from '#src/assets/academy/media-2-mobile.webp';
import media3Image from '#src/assets/academy/media-3.webp';
import media3MobileImage from '#src/assets/academy/media-3-mobile.webp';
import media4Image from '#src/assets/academy/media-4.webp';
import media4MobileImage from '#src/assets/academy/media-4-mobile.webp';
import media5Image from '#src/assets/academy/media-5.webp';
import media5MobileImage from '#src/assets/academy/media-5-mobile.webp';
import media6Image from '#src/assets/academy/media-6.webp';
import media7Image from '#src/assets/academy/media-7.webp';
import media8Image from '#src/assets/academy/media-8.webp';
import polytecnicoLogo from '#src/assets/academy/polytecnico-logo.webp';
import salvadorImage from '#src/assets/academy/salvador.png';
import taipeiLogo from '#src/assets/academy/taipei-logo.svg';
import thanksImage from '#src/assets/academy/thanks.webp';
import barChartIcon from '#src/assets/icons/bar-chart.svg';
import bookOpenIcon from '#src/assets/icons/book-open.svg';
import bookOpen2Icon from '#src/assets/icons/book-open-2.svg';
import bookOpenOrangeIcon from '#src/assets/icons/book-open-orange.svg';
import calendarIcon from '#src/assets/icons/calendar.svg';
import certificationIcon from '#src/assets/icons/certification.png';
import locationIconBrown from '#src/assets/icons/location-brown.svg';
import luggageIcon from '#src/assets/icons/luggage.svg';
import luggageOrangeIcon from '#src/assets/icons/luggage-orange.svg';
import personIcon from '#src/assets/icons/person.svg';
import replayIcon from '#src/assets/icons/replay.png';
import ticketIcon from '#src/assets/icons/ticket.svg';
import toolsIcon from '#src/assets/icons/tools.svg';
import tvIcon from '#src/assets/icons/tv.svg';
import worldIcon from '#src/assets/icons/world.svg';
import BlockTitle from '#src/components/block-title.tsx';
import { ContactUs } from '#src/components/contact-us.tsx';
import { Hero } from '#src/components/hero.tsx';
import MediaCard from '#src/components/media-card.tsx';
import { NetworkButton } from '#src/components/network-button.tsx';
import NetworkCard from '#src/components/network-card.tsx';
import NetworkListItem from '#src/components/network-list-item.tsx';
import PageBlock from '#src/components/page-block.tsx';
import ToolsForCommunities from '#src/components/tools-for-communities.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { titleCss } from '#src/utils/css.tsx';
import { RESOURCES_TYPES, TUTORIALS_CATEGORIES } from '#src/utils/misc.tsx';

export const Route = createFileRoute('/academy')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const isMobile = useSmaller('lg');

  const languageMatch = {
    nbno: 'nb-NO',
    srlatn: 'sr-Latn',
    zhhans: 'zh-Hans',
    zhhant: 'zh-Hant',
  } as const;

  return (
    <>
      <Hero
        titleElement={
          <Trans i18nKey="academy.title">
            <span className="font-semibold">Bitcoin Education</span>
          </Trans>
        }
        subtitle={t('academy.subtitle')}
        imageUrl={isMobile ? headerSmallImage : headerImage}
        titleClassName="max-w-[700px]"
        subtitleClassName={'max-w-[400px]'}
      />
      <PageBlock className="flex max-lg:justify-center">
        <h2 className="display-base lg:display-large lg:text-6xl text-center">
          {t('academy.safestPlace')}
        </h2>
        <div className="flex flex-row justify-between max-lg:px-2 max-w-[800px] lg:text-4xl font-medium lg:font-semibold mt-6   self-center mx-auto text-gray-200 z-10 relative">
          <span>{t('academy.safest1')}</span>
          <span>{t('academy.safest2')}</span>
          <span>{t('academy.safest3')}</span>
        </div>
        <Image
          className="max-lg:mt-3 lg:px-30 max-lg:mx-auto"
          src={media1Image}
          alt="Laptop showing the academy website"
          loading="lazy"
          breakpoints={{ default: 400, lg: 1500 }}
        />
        <Link
          to="https://planb.academy"
          target="_blank"
          rel="noopener noreferrer"
        >
          <NetworkButton className="relative flex mx-auto z-10 mt-6 lg:mt-12">
            {t('academy.startLearning')}
          </NetworkButton>
        </Link>
      </PageBlock>
      <PageBlock
        withXMargin={false}
        className="rounded-tl-[68px] rounded-br-[68px] lg:rounded-tl-[200px] lg:rounded-br-[200px] bg-academy-section1"
      >
        <BlockTitle
          text={t('academy.blockTitle1Text')}
          subtext={t('academy.blockTitle1Subtext')}
        />
        <MediaCard
          title={t('academy.learnOnline.title')}
          subtext={t('academy.learnOnline.subtitle')}
          imageUrl={isMobile ? media2MobileImage : media2Image}
          alt=""
          className="mt-10 lg:mt-20"
          titleClassName={'lg:max-w-[53%]'}
          subtitleClassName={
            'lg:max-w-[60%] xl:max-w-[52%] max-xl:!text-lg text-gray-300'
          }
          subtitleUnderImage={true}
          BackgroundColor="border-dark"
          orientation="left"
          BottomElement={
            <>
              <div className="max-lg:self-center  flex flex-col gap-1 xl:gap-2">
                <NetworkListItem
                  icon={bookOpenIcon}
                  text={t('academy.learnOnline.list1')}
                />
                <NetworkListItem
                  icon={personIcon}
                  text={t('academy.learnOnline.list2')}
                />
                <NetworkListItem
                  icon={barChartIcon}
                  text={t('academy.learnOnline.list3')}
                />
                <NetworkListItem
                  icon={ticketIcon}
                  text={t('academy.learnOnline.list5')}
                />
              </div>
              <div className="mt-8 lg:mt-4 lg:mb-0 flex flex-row xl:flex-col max-lg:self-center gap-4">
                <Link
                  to="https://planb.academy/en/learn-anytime"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <NetworkButton variant={'secondary'}>
                    {t('academy.learnOnline.button')}
                  </NetworkButton>
                </Link>
              </div>
            </>
          }
        />
        <MediaCard
          title={t('academy.learnLive.title')}
          subtext={t('academy.learnLive.subtitle')}
          imageUrl={isMobile ? media3MobileImage : media3Image}
          alt=""
          subtitleClassName={'lg:max-w-[380px] max-xl:!text-lg text-gray-300'}
          subtitleUnderImage={true}
          BackgroundColor="border-dark"
          className="mt-12"
          orientation="right"
          BottomElement={
            <>
              <div className="max-lg:self-center flex flex-col gap-1 xl:gap-2">
                <NetworkListItem
                  icon={bookOpenIcon}
                  text={t('academy.learnLive.list1')}
                  orientation="right"
                />
                <NetworkListItem
                  icon={personIcon}
                  text={t('academy.learnLive.list2')}
                  orientation="right"
                />
                <NetworkListItem
                  icon={barChartIcon}
                  text={t('academy.learnLive.list3')}
                  orientation="right"
                />
                <NetworkListItem
                  icon={bookOpen2Icon}
                  text={t('academy.learnLive.list4')}
                  orientation="right"
                />
              </div>
              <div className="mt-8 lg:mt-4 lg:mb-0 flex flex-row xl:flex-col max-lg:self-center gap-4">
                <Link
                  to="https://planb.academy/en/live-classes"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <NetworkButton variant={'secondary'}>
                    {t('academy.learnLive.button2')}
                  </NetworkButton>
                </Link>
              </div>
            </>
          }
        />
        <PageBlock className="mt-20 lg:mt-40" withYPadding={false}>
          <div className="flex flex-col lg:flex-row max-lg:gap-12">
            <div className="lg:w-[45%] flex flex-col gap-14 max-lg:text-center">
              <p className="lg:max-w-[350px] title-large lg:title-extra-large">
                {t('academy.database.title')}
              </p>
              <p className="body-base lg:title-base text-gray-200">
                {t('academy.database.subtitle')}
              </p>
              <Link
                to="https://t.me/PlanBNetwork_ContentBuilder"
                target="_blank"
                rel="noopener noreferrer"
                className="max-lg:self-center"
              >
                <NetworkButton variant={'tertiary'}>
                  {t('academy.database.button')}
                </NetworkButton>
              </Link>
            </div>
            <div className="lg:w-[55%] lg:pl-12 flex flex-col gap-8">
              <div>
                <p className="w-full pb-2 border-b-[1px]  border-white uppercase">
                  {t('academy.database.tutorials')}
                </p>
                <div className="flex flex-row flex-wrap gap-4 mt-4">
                  {TUTORIALS_CATEGORIES.map((category) => (
                    <Link
                      key={category}
                      to={`https://planb.academy/tutorials/${category}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <NetworkButton
                        variant={'secondary'}
                        className="capitalize"
                        size={'s'}
                      >
                        {t(`tutorialsCategories.${category}`)}
                      </NetworkButton>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="w-full pb-2 border-b-[1px]  border-white uppercase">
                  {t('academy.database.resources')}
                </p>
                <div className="flex flex-row flex-wrap gap-4 mt-4">
                  {RESOURCES_TYPES.map((resource) => (
                    <Link
                      key={resource}
                      to={`https://planb.academy/resources/${resource}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <NetworkButton
                        variant={'secondary'}
                        className="capitalize"
                        size={'s'}
                      >
                        {t(`resourcesTypes.${resource}`)}
                      </NetworkButton>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="w-full pb-2 border-b-[1px]  border-white uppercase">
                  {t('academy.database.languages')}
                </p>
                <div className="flex flex-row flex-wrap gap-4 mt-4">
                  {Object.entries(LANGUAGES_MAP).map((lang) => (
                    <Link
                      key={lang}
                      to={`https://planb.academy/${(languageMatch as Record<string, string>)[lang[0]] || lang[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <NetworkButton
                        variant={'secondary'}
                        className="capitalize"
                        size={'s'}
                      >
                        {t(`${lang[1]}`)}
                      </NetworkButton>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageBlock>
      </PageBlock>
      <PageBlock
        withXMargin={false}
        className="rounded-tl-[68px] rounded-br-[68px] lg:rounded-tl-[200px] lg:rounded-br-[200px]"
      >
        <BlockTitle
          text={t('academy.blockTitle2Text')}
          subtext={t('academy.blockTitle2Subtext')}
          titleClassName="text-orange-500"
        />
        <div className="max-w-[1320px] mx-auto mt-10 lg:mt-20 border-[1px] border-gray-600 rounded-2xl lg:rounded-[68px]">
          <MediaCard
            title={t('academy.career.title')}
            subtext={t('academy.career.subtitle')}
            imageUrl={isMobile ? media4MobileImage : media4Image}
            alt=""
            className="!px-0"
            titleClassName={'lg:max-w-[53%]'}
            subtitleClassName={'lg:max-w-[52%] max-xl:!text-lg text-gray-300'}
            subtitleUnderImage={true}
            orientation="left"
            gradientBackground={true}
            BottomElement={
              <div className="max-lg:self-center flex flex-col gap-1 xl:gap-4">
                <NetworkListItem
                  icon={bookOpenIcon}
                  text={t('academy.career.list1')}
                />
                <NetworkListItem
                  icon={personIcon}
                  text={t('academy.career.list2')}
                />
                <NetworkListItem
                  icon={barChartIcon}
                  text={t('academy.career.list3')}
                />
                <NetworkListItem
                  icon={ticketIcon}
                  text={t('academy.career.list4')}
                />
              </div>
            }
          />
          <PageBlock
            className="rounded-[68px] pb-5 lg:pb-10"
            withYPadding={false}
          >
            <p className="mt-10 title-medium lg:title-large">
              {t('academy.career.title2')}
            </p>
            <div className="flex flex-row flex-wrap justify-center gap-4 mt-8">
              <NetworkCard
                icon={replayIcon}
                text={t('academy.career.item1Title')}
                subtext={t('academy.career.item1Subtitle')}
              />
              <NetworkCard
                icon={luggageOrangeIcon}
                text={t('academy.career.item2Title')}
                subtext={t('academy.career.item2Subtitle')}
              />
              <NetworkCard
                icon={certificationIcon}
                text={t('academy.career.item3Title')}
                subtext={t('academy.career.item3Subtitle')}
              />
            </div>
            <p className="title-medium lg:title-large my-10 lg:my-5">
              {t('academy.career.title3')}
            </p>
            <div className="flex flex-col lg:flex-row max-lg:items-center justify-center gap-4">
              <Link
                to="https://planb.academy/en/courses/plan-business-program-2026-a54c48c0-9b90-11f0-bee7-dbbaea825cda"
                target="_blank"
                rel="noopener noreferrer"
              >
                <NetworkButton variant={'secondary'}>
                  {t('academy.career.buttonBusiness')}
                </NetworkButton>
              </Link>
              <Link
                to="https://planb.academy/en/courses/plan-developer-program-0be6cfae-9d32-11f0-9601-0f79f5ccc576"
                target="_blank"
                rel="noopener noreferrer"
              >
                <NetworkButton variant={'secondary'}>
                  {t('academy.career.buttonDeveloper')}
                </NetworkButton>
              </Link>
            </div>
          </PageBlock>
        </div>
        <div className="mt-8 lg:mt-30 pb-10 max-w-[1320px] mx-auto border-[1px] border-gray-600 rounded-2xl lg:rounded-[68px]">
          <PageBlock withXPadding={false} withYPadding={false}>
            <MediaCard
              title={t('academy.companies.title')}
              subtext={t('academy.companies.subtitle')}
              imageUrl={isMobile ? media5MobileImage : media5Image}
              alt=""
              className="!px-0"
              titleClassName={'max-w-[500px]'}
              subtitleClassName={
                'lg:max-w-[420px] max-xl:!text-lg text-gray-300'
              }
              subtitleUnderImage={true}
              orientation="right"
              gradientBackground={true}
              BottomElement={
                <div className="flex flex-col gap-1 xl:gap-2">
                  <Link
                    to="mailto:rogzy@planb.network"
                    className="max-lg:self-center"
                  >
                    <NetworkButton>
                      {t('academy.companies.button')}
                    </NetworkButton>
                  </Link>
                </div>
              }
            />
          </PageBlock>
          <div className="flex flex-row flex-wrap justify-center gap-4 mt-8 px-4">
            <NetworkCard
              icon={replayIcon}
              text={t('academy.companies.item1Title')}
              subtext={t('academy.companies.item1Subtitle')}
            />
            <NetworkCard
              icon={bookOpenOrangeIcon}
              text={t('academy.companies.item2Title')}
              subtext={t('academy.companies.item2Subtitle')}
            />
            <NetworkCard
              icon={toolsIcon}
              text={t('academy.companies.item3Title')}
              subtext={t('academy.companies.item3Subtitle')}
            />
          </div>
        </div>
      </PageBlock>
      <PageBlock
        withXMargin={false}
        className=" bg-academy-section2 rounded-tl-[68px] rounded-br-[68px] lg:rounded-tl-[200px] lg:rounded-br-[200px]"
      >
        <BlockTitle
          text={t('academy.blockTitle3Text')}
          subtext={t('academy.blockTitle3Subtext')}
        />
        <MediaCard
          subtext={t('academy.salvador.text')}
          imageUrl={isMobile ? media6Image : media6Image}
          alt=""
          subtitleClassName={
            'max-w-[540px] xl:max-w-[600px] max-xl:!text-lg text-gray-300 max-lg:text-left'
          }
          imageClassName="max-lg:px-2 lg:max-w-[40%] max-lg:relative"
          className="mt-10 lg:mt-20 pb-12 lg:pt-10 lg:pr-4"
          orientation="left"
          BackgroundColor="transparent"
          TopElement={
            <InstitutionTitleElement
              title={t('academy.salvador.title')}
              subtitle={t('academy.salvador.subtitle')}
              img={salvadorImage}
              orientation="left"
            />
          }
          BottomElement={
            <div className="flex flex-col gap-1 xl:gap-4 max-lg:ml-4">
              <NetworkListItem
                icon={locationIconBrown}
                text={t('academy.salvador.list1')}
              />
              <NetworkListItem
                icon={personIcon}
                text={t('academy.salvador.list2')}
              />
              <NetworkListItem
                icon={luggageIcon}
                text={t('academy.salvador.list3')}
              />
              <NetworkListItem
                icon={calendarIcon}
                text={t('academy.salvador.list4')}
              />
            </div>
          }
        />
        <MediaCard
          subtext={t('academy.taipei.text')}
          imageUrl={isMobile ? media7Image : media7Image}
          alt=""
          subtitleClassName={
            'max-w-[540px] xl:max-w-[600px] max-xl:!text-lg text-gray-300 max-lg:text-left'
          }
          imageClassName="max-lg:px-2 lg:max-w-[40%] max-lg:relative"
          className="mt-12 pb-12 lg:pt-10 lg:px-4"
          orientation="right"
          BackgroundColor="transparent"
          TopElement={
            <InstitutionTitleElement
              title={t('academy.taipei.title')}
              subtitle={t('academy.taipei.subtitle')}
              img={taipeiLogo}
              orientation="right"
            />
          }
          BottomElement={
            <div className="flex flex-col gap-1 xl:gap-4 max-lg:ml-4">
              <NetworkListItem
                icon={barChartIcon}
                text={t('academy.taipei.list1')}
                orientation="right"
              />
              <NetworkListItem
                icon={personIcon}
                text={t('academy.taipei.list2')}
                orientation="right"
              />
              <NetworkListItem
                icon={bookOpenIcon}
                text={t('academy.taipei.list3')}
                orientation="right"
              />
              <NetworkListItem
                icon={calendarIcon}
                text={t('academy.taipei.list4')}
                orientation="right"
              />
            </div>
          }
        />
        <MediaCard
          subtext={t('academy.polytecnico.text')}
          imageUrl={isMobile ? media8Image : media8Image}
          alt=""
          subtitleClassName={
            'max-w-[540px] xl:max-w-[600px] max-xl:!text-lg text-gray-300 max-lg:text-left'
          }
          imageClassName="max-lg:px-2 lg:max-w-[40%] max-lg:relative"
          className="mt-12 pb-12 lg:pt-10 lg:pr-4"
          orientation="left"
          BackgroundColor="transparent"
          TopElement={
            <InstitutionTitleElement
              title={t('academy.polytecnico.title')}
              subtitle={t('academy.polytecnico.subtitle')}
              img={polytecnicoLogo}
              orientation="left"
            />
          }
          BottomElement={
            <div className="flex flex-col gap-1 xl:gap-4 max-lg:ml-4">
              <NetworkListItem
                icon={personIcon}
                text={t('academy.polytecnico.list1')}
              />
              <NetworkListItem
                icon={tvIcon}
                text={t('academy.polytecnico.list2')}
              />
              <NetworkListItem
                icon={calendarIcon}
                text={t('academy.polytecnico.list3')}
              />
              <Link
                to={
                  'https://www.polito.it/en/education/specializing-master-s-programmes-and-lifelong-learning/executive-courses/executive-courses-catalogue/bitcoin-lightning-network-and-distributed-systems'
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <NetworkListItem
                  icon={worldIcon}
                  text={t('academy.polytecnico.list4')}
                />
              </Link>
            </div>
          }
        />

        <ContactUs
          text={t('academy.contactText')}
          email="rogzy@planb.network"
        />
      </PageBlock>
      <PageBlock
        withXMargin={false}
        withXPadding={false}
        className="rounded-tl-[68px] rounded-br-[68px] lg:rounded-tl-[200px] lg:rounded-br-[200px]"
      >
        <ToolsForCommunities />
      </PageBlock>
      <PageBlock withYPadding={false}>
        <p className="display-medium lg:display-large text-center mb-10 lg:mb-30">
          {t('academy.thanksTitle')}
        </p>
      </PageBlock>
      <Image
        src={thanksImage}
        alt="Pictures of people from the academy"
        className="w-full mb-20 lg:mb-30"
        loading="lazy"
        breakpoints={{ default: 700, lg: 2500 }}
      />
    </>
  );
}

function InstitutionTitleElement({
  title,
  subtitle,
  img,
  orientation,
}: {
  title: string;
  subtitle: string;
  img: string;
  orientation: 'left' | 'right';
}) {
  return (
    <div
      className={cn(
        'flex flex-col justify-between pl-4',
        orientation === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse',
      )}
    >
      <div>
        <p
          className={cn(
            '!text-start max-w-[800px]',
            'max-lg:!mb-0',
            titleCss,
            orientation === 'left' ? 'lg:!text-start' : 'lg:!text-end',
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            'title-large text-brown-400 mt-2 !text-start',
            orientation === 'left' ? 'lg:!text-start' : 'lg:!text-end',
          )}
        >
          {subtitle}
        </p>
      </div>
      <div className="flex flex-row gap-4">
        <Image
          src={img}
          className="h-12 max-lg:mt-2 lg:h-28 object-cover"
          alt=""
          loading="lazy"
          breakpoints={{ default: 200 }}
        />
      </div>
    </div>
  );
}
