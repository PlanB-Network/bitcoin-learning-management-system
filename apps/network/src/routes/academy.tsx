import { LANGUAGES_MAP } from '@blms/shared';
import { cn } from '@blms/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import headerImage from '#src/assets/academy/header.png';
import headerSmallImage from '#src/assets/academy/header.png';
import media1Image from '#src/assets/academy/media-1.png';
import media2Image from '#src/assets/academy/media-2.png';
import media2MobileImage from '#src/assets/academy/media-2-mobile.png';
import media3Image from '#src/assets/academy/media-3.png';
import media3MobileImage from '#src/assets/academy/media-3-mobile.png';
import media4Image from '#src/assets/academy/media-4.png';
import media4MobileImage from '#src/assets/academy/media-4-mobile.png';
import media5Image from '#src/assets/academy/media-5.png';
import media5MobileImage from '#src/assets/academy/media-5-mobile.png';
import media6Image from '#src/assets/academy/media-6.png';
import media7Image from '#src/assets/academy/media-7.png';
import media8Image from '#src/assets/academy/media-8.png';
import polytecnicoLogo from '#src/assets/academy/polytecnico-logo.svg';
import salvadorImage from '#src/assets/academy/salvador.png';
import taipeiLogo from '#src/assets/academy/taipei-logo.svg';
import barChartIcon from '#src/assets/icons/bar-chart.png';
import barChartDarkIcon from '#src/assets/icons/bar-chart-dark.svg';
import bookOpenIcon from '#src/assets/icons/book-open.png';
import bookOpenDarkIcon from '#src/assets/icons/book-open-dark.svg';
import bookOpen2Icon from '#src/assets/icons/book-open2.png';
import calendarIcon from '#src/assets/icons/calendar.svg';
import calendarDarkIcon from '#src/assets/icons/calendar-dark.svg';
import certificationIcon from '#src/assets/icons/certification.png';
import locationIcon from '#src/assets/icons/location.svg';
import luggageIcon from '#src/assets/icons/luggage.png';
import personIcon from '#src/assets/icons/person.png';
import personDarkIcon from '#src/assets/icons/person-dark.svg';
import replayIcon from '#src/assets/icons/replay.png';
import ticketIcon from '#src/assets/icons/ticket.png';
import tvIcon from '#src/assets/icons/tv.svg';
import BlockTitle from '#src/components/block-title.tsx';
import { ContactUs } from '#src/components/contact-us.tsx';
import { Hero } from '#src/components/hero.tsx';
import MediaCard from '#src/components/media-card.tsx';
import { NetworkButton } from '#src/components/network-button.tsx';
import NetworkCard from '#src/components/network-card.tsx';
import NetworkListItem from '#src/components/network-list-item.tsx';
import PageBlock from '#src/components/page-block.tsx';
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
        titleClassName="max-w-[62%]"
        subtitleClassName={'max-w-[85%] lg:max-w-[400px]'}
      />

      <PageBlock>
        <h2 className="display-medium text-center">
          {t('academy.safestPlace')}
        </h2>
        <div className="mt-6 flex flex-row justify-between max-w-[300px] self-center mx-auto text-gray-200 z-10 relative">
          <span>{t('academy.safest1')}</span>
          <span>{t('academy.safest2')}</span>
          <span>{t('academy.safest3')}</span>
        </div>
        <img
          className="lg:-mt-12"
          src={media1Image}
          alt="Laptop showing the academy website"
        />
        <NetworkButton className="justify-self-center z-10 relative md:-mt-6 lg:-mt-12">
          {t('academy.startLearning')}
        </NetworkButton>
      </PageBlock>

      <BlockTitle
        text={t('academy.blockTitle1Text')}
        subtext={t('academy.blockTitle1Subtext')}
      />

      <MediaCard
        title={t('academy.learnOnline.title')}
        subtext={t('academy.learnOnline.subtitle')}
        imageUrl={isMobile ? media2MobileImage : media2Image}
        alt="Scenic mountain lake"
        titleClassName={'lg:max-w-[53%]'}
        subtitleClassName={
          'lg:max-w-[60%] xl:max-w-[52%] max-xl:!text-lg text-gray-300'
        }
        imageClassName=""
        subtitleUnderImage={true}
        className="mt-12"
        orientation="left"
        BottomElement={
          <>
            <div className="max-lg:self-center  flex flex-col gap-1 xl:gap-2">
              <NetworkListItem
                img={bookOpenIcon}
                text={t('academy.learnOnline.list1')}
              />
              <NetworkListItem
                img={personIcon}
                text={t('academy.learnOnline.list2')}
              />
              <NetworkListItem
                img={barChartIcon}
                text={t('academy.learnOnline.list3')}
              />
              <NetworkListItem
                img={bookOpen2Icon}
                text={t('academy.learnOnline.list4')}
              />
              <NetworkListItem
                img={ticketIcon}
                text={t('academy.learnOnline.list5')}
              />
            </div>
            <div className="mt-8 lg:mt-4 lg:mb-0 flex flex-row xl:flex-col max-lg:self-center gap-4">
              <NetworkButton variant={'secondary'}>
                {t('academy.learnOnline.button')}
              </NetworkButton>
            </div>
          </>
        }
      />

      <MediaCard
        title={t('academy.learnLive.title')}
        subtext={t('academy.learnLive.subtitle')}
        imageUrl={isMobile ? media3MobileImage : media3Image}
        alt="Scenic mountain lake"
        subtitleClassName={'lg:max-w-[380px] max-xl:!text-lg text-gray-300'}
        imageClassName=""
        subtitleUnderImage={true}
        className="mt-12"
        orientation="right"
        BottomElement={
          <>
            <div className="max-lg:self-center flex flex-col gap-1 xl:gap-2">
              <NetworkListItem
                img={bookOpenIcon}
                text={t('academy.learnLive.list1')}
                orientation="right"
              />
              <NetworkListItem
                img={personIcon}
                text={t('academy.learnLive.list2')}
                orientation="right"
              />
              <NetworkListItem
                img={barChartIcon}
                text={t('academy.learnLive.list3')}
                orientation="right"
              />
              <NetworkListItem
                img={bookOpen2Icon}
                text={t('academy.learnLive.list4')}
                orientation="right"
              />
            </div>
            <div className="mt-8 lg:mt-4 lg:mb-0 flex flex-row xl:flex-col max-lg:self-center gap-4">
              <NetworkButton variant={'secondary'}>
                {t('academy.learnLive.button2')}
              </NetworkButton>
            </div>
          </>
        }
      />

      <PageBlock className="mt-14">
        <div className="flex flex-col lg:flex-row max-lg:gap-12">
          <div className="lg:w-[45%] flex flex-col gap-14 max-lg:text-center">
            <p className="lg:max-w-[350px] title-extra-large">
              {t('academy.database.title')}
            </p>
            <p className="title-base">{t('academy.database.subtitle')}</p>
            <NetworkButton variant={'tertiary'} className="max-lg:self-center">
              {t('academy.database.button')}
            </NetworkButton>
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

      <BlockTitle
        text={t('academy.blockTitle2Text')}
        subtext={t('academy.blockTitle2Subtext')}
        direction="right"
      />

      <MediaCard
        title={t('academy.career.title')}
        subtext={t('academy.career.subtitle')}
        imageUrl={isMobile ? media4MobileImage : media4Image}
        alt="Scenic mountain lake"
        titleClassName={'lg:max-w-[53%]'}
        subtitleClassName={'lg:max-w-[52%] max-xl:!text-lg text-gray-300'}
        imageClassName="max-md:-mt-38 max-lg:-mt-28"
        subtitleUnderImage={true}
        className="mt-12"
        orientation="left"
        BottomElement={
          <div className="max-lg:self-center flex flex-col gap-1 xl:gap-2">
            <NetworkListItem
              img={bookOpenIcon}
              text={t('academy.career.list1')}
            />
            <NetworkListItem
              img={personIcon}
              text={t('academy.career.list2')}
            />
            <NetworkListItem
              img={barChartIcon}
              text={t('academy.career.list3')}
            />
            <NetworkListItem
              img={bookOpen2Icon}
              text={t('academy.career.list4')}
            />
          </div>
        }
      />

      <PageBlock className="bg-network-cards-dark-bottom rounded-[68px] pb-5 lg:pb-10">
        <p className="max-lg:mt-10 title-extra-large uppercase ">
          {t('academy.career.title2')}
        </p>
        <div className="flex flex-row flex-wrap justify-center gap-4 mt-8">
          <NetworkCard
            img={replayIcon}
            text={t('academy.career.item1Title')}
            subtext={t('academy.career.item1Subtitle')}
          />
          <NetworkCard
            img={luggageIcon}
            text={t('academy.career.item2Title')}
            subtext={t('academy.career.item2Subtitle')}
          />
          <NetworkCard
            img={certificationIcon}
            text={t('academy.career.item3Title')}
            subtext={t('academy.career.item3Subtitle')}
          />
        </div>
        <p className="title-medium lg:title-extra-large my-10 lg:my-5 uppercase">
          {t('academy.career.title3')}
        </p>
        <div className="flex flex-col lg:flex-row max-lg:items-center justify-center gap-4">
          <NetworkButton variant={'secondary'}>
            {t('academy.career.buttonBusiness')}
          </NetworkButton>
          <NetworkButton variant={'secondary'}>
            {t('academy.career.buttonDeveloper')}
          </NetworkButton>
        </div>
      </PageBlock>

      <MediaCard
        title={t('academy.companies.title')}
        subtext={t('academy.companies.subtitle')}
        imageUrl={isMobile ? media5MobileImage : media5Image}
        alt="Scenic mountain lake"
        titleClassName={'max-w-[500px]'}
        subtitleClassName={'lg:max-w-[420px] max-xl:!text-lg text-gray-300'}
        imageClassName="max-md:-mt-38 max-lg:-mt-28"
        subtitleUnderImage={true}
        className="mt-12"
        orientation="right"
        BottomElement={
          <div className="flex flex-col gap-1 xl:gap-2">
            <NetworkButton className="max-lg:self-center">
              {t('academy.companies.button')}
            </NetworkButton>
          </div>
        }
      />

      <PageBlock className="bg-network-cards-dark-bottom rounded-[68px]">
        <div className="flex flex-row flex-wrap justify-center gap-4 mt-8">
          <NetworkCard
            img={replayIcon}
            text={t('academy.companies.item1Title')}
            subtext={t('academy.companies.item1Subtitle')}
          />
          <NetworkCard
            img={luggageIcon}
            text={t('academy.companies.item2Title')}
            subtext={t('academy.companies.item2Subtitle')}
          />
          <NetworkCard
            img={certificationIcon}
            text={t('academy.companies.item3Title')}
            subtext={t('academy.companies.item3Subtitle')}
          />
        </div>
      </PageBlock>

      <BlockTitle
        text={t('academy.blockTitle3Text')}
        subtext={t('academy.blockTitle3Subtext')}
      />

      <MediaCard
        subtext={t('academy.salvador.text')}
        imageUrl={isMobile ? media6Image : media6Image}
        alt="Scenic mountain lake"
        subtitleClassName={
          'max-w-[540px] xl:max-w-[600px] max-xl:!text-lg text-gray-300'
        }
        imageClassName="lg:max-w-[40%]"
        NoBackground={true}
        className="mt-12 pb-12 bg-gradient-network-bt"
        orientation="left"
        TopElement={
          <InstitutionTitleElement
            title={t('academy.salvador.title')}
            subtitle={t('academy.salvador.subtitle')}
            img={salvadorImage}
            orientation="left"
          />
        }
        BottomElement={
          <div className="flex flex-col gap-1 xl:gap-2">
            <NetworkListItem
              img={locationIcon}
              text={t('academy.salvador.list1')}
            />
            <NetworkListItem
              img={personIcon}
              text={t('academy.salvador.list2')}
            />
            <NetworkListItem
              img={luggageIcon}
              text={t('academy.salvador.list3')}
            />
            <NetworkListItem
              img={calendarIcon}
              text={t('academy.salvador.list4')}
            />
          </div>
        }
      />

      <MediaCard
        subtext={t('academy.taipei.text')}
        imageUrl={isMobile ? media7Image : media7Image}
        alt="Scenic mountain lake"
        subtitleClassName={
          'max-w-[540px] xl:max-w-[600px] max-xl:!text-lg text-gray-300'
        }
        imageClassName="lg:max-w-[40%]"
        className="mt-12 pb-12 bg-gradient-network-bt-dark"
        orientation="right"
        NoBackground={true}
        TopElement={
          <InstitutionTitleElement
            title={t('academy.taipei.title')}
            subtitle={t('academy.taipei.subtitle')}
            img={taipeiLogo}
            orientation="right"
          />
        }
        BottomElement={
          <div className="flex flex-col gap-1 xl:gap-2">
            <NetworkListItem
              img={barChartDarkIcon}
              text={t('academy.taipei.list1')}
              dark={true}
              orientation="right"
            />
            <NetworkListItem
              img={personDarkIcon}
              text={t('academy.taipei.list2')}
              dark={true}
              orientation="right"
            />
            <NetworkListItem
              img={bookOpenDarkIcon}
              text={t('academy.taipei.list3')}
              dark={true}
              orientation="right"
            />
            <NetworkListItem
              img={calendarDarkIcon}
              text={t('academy.taipei.list4')}
              dark={true}
              orientation="right"
            />
          </div>
        }
      />

      <MediaCard
        subtext={t('academy.polytecnico.text')}
        imageUrl={isMobile ? media8Image : media8Image}
        alt="Scenic mountain lake"
        subtitleClassName={
          'max-w-[540px] xl:max-w-[600px] max-xl:!text-lg text-gray-300'
        }
        imageClassName="lg:max-w-[40%]"
        NoBackground={true}
        className="mt-12 pb-12 bg-gradient-network-bt"
        orientation="left"
        TopElement={
          <InstitutionTitleElement
            title={t('academy.polytecnico.title')}
            subtitle={t('academy.polytecnico.subtitle')}
            img={polytecnicoLogo}
            orientation="left"
          />
        }
        BottomElement={
          <div className="flex flex-col gap-1 xl:gap-2">
            <NetworkListItem
              img={personIcon}
              text={t('academy.polytecnico.list1')}
            />
            <NetworkListItem
              img={tvIcon}
              text={t('academy.polytecnico.list2')}
            />
            <NetworkListItem
              img={calendarIcon}
              text={t('academy.polytecnico.list3')}
            />
          </div>
        }
      />

      <PageBlock className="mt-8 lg:mt-16">
        <ContactUs text={t('about.contactText')} email="toto@toto.com" />
      </PageBlock>

      <BlockTitle
        text={t('academy.blockTitle4Text')}
        subtext={t('academy.blockTitle4Subtext')}
        direction="right"
      />
      {/* <div className="shadow-top-bottom-box py-24 mt-24"></div>
      <div className="py-24 bg-gradient-network-bt " /> */}
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
        'flex flex-col justify-between pl-4 mb-4',
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
        <img
          src={img}
          className="h-12 max-lg:mt-2 lg:h-28 object-cover"
          alt=""
        />
      </div>
    </div>
  );
}
