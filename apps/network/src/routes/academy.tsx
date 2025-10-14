import { createFileRoute } from '@tanstack/react-router';
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
import polytecnicoLogo from '#src/assets/academy/polytecnico-logo.svg';
import salvador1Image from '#src/assets/academy/salvador-1.png';
import salvador2Image from '#src/assets/academy/salvador-2.jpg';
import taipeiLogo from '#src/assets/academy/taipei-logo.svg';
import barChartIcon from '#src/assets/icons/bar-chart.png';
import bookOpenIcon from '#src/assets/icons/book-open.png';
import bookOpen2Icon from '#src/assets/icons/book-open2.png';
import certificationIcon from '#src/assets/icons/certification.png';
import luggageIcon from '#src/assets/icons/luggage.png';
import personIcon from '#src/assets/icons/person.png';
import replayIcon from '#src/assets/icons/replay.png';
import ticketIcon from '#src/assets/icons/ticket.png';
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

export const Route = createFileRoute('/academy')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const isMobile = useSmaller('lg');

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
        subtitleClassName={'lg:max-w-[52%] max-xl:!text-lg text-gray-300'}
        imageClassName=""
        subtitleUnderImage={true}
        className="mt-12"
        orientation="left"
        BottomElement={
          <>
            <div className="flex flex-col gap-1 xl:gap-2">
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
            <div className="mt-4 flex flex-row xl:flex-col max-lg:self-center gap-4">
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
        titleClassName={'lg:max-w-[53%]'}
        subtitleClassName={'lg:max-w-[52%] max-xl:!text-lg text-gray-300'}
        imageClassName=""
        subtitleUnderImage={true}
        className="mt-12"
        orientation="right"
        BottomElement={
          <>
            <div className="flex flex-col gap-1 xl:gap-2">
              <NetworkListItem
                img={bookOpenIcon}
                text={t('academy.learnLive.list1')}
              />
              <NetworkListItem
                img={personIcon}
                text={t('academy.learnLive.list2')}
              />
              <NetworkListItem
                img={barChartIcon}
                text={t('academy.learnLive.list3')}
              />
              <NetworkListItem
                img={bookOpen2Icon}
                text={t('academy.learnLive.list4')}
              />
            </div>
            <div className="mt-4 flex flex-row max-lg:self-center gap-4">
              <NetworkButton variant={'tertiary'}>
                {t('academy.learnLive.button1')}
              </NetworkButton>
              <NetworkButton variant={'secondary'}>
                {t('academy.learnLive.button2')}
              </NetworkButton>
            </div>
          </>
        }
      />

      <PageBlock className="mt-14">
        <div className="flex flex-col lg:flex-row max-lg:gap-12">
          <div className="lg:w-[45%] flex flex-col gap-14">
            <p className="max-w-[350px] title-extra-large">
              {t('academy.database.title')}
            </p>
            <p className="title-base">{t('academy.database.subtitle')}</p>
            <NetworkButton variant={'tertiary'}>
              {t('academy.database.button')}
            </NetworkButton>
          </div>
          <div className="lg:w-[55%] lg:pl-12">
            <div className="w-full">
              <p className="w-full pb-2 border-b-[1px]  border-white uppercase">
                {t('academy.database.tutorials')}
              </p>
              <div className="flex flex-row flex-wrap gap-4 mt-4">
                <NetworkButton variant={'secondary'}>1111111</NetworkButton>
                <NetworkButton variant={'secondary'}>222222222</NetworkButton>
                <NetworkButton variant={'secondary'}>3333333333</NetworkButton>
                <NetworkButton variant={'secondary'}>44444444</NetworkButton>
                <NetworkButton variant={'secondary'}>55555555555</NetworkButton>
                <NetworkButton variant={'secondary'}>666</NetworkButton>
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
        imageClassName=""
        subtitleUnderImage={true}
        className="mt-12"
        orientation="left"
        BottomElement={
          <div className="flex flex-col gap-1 xl:gap-2">
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

      <PageBlock className="bg-network-cards-dark-bottom rounded-[68px]">
        <p className="title-extra-large uppercase ">
          {t('academy.career.title2')}
        </p>
        <div className="flex flex-row gap-4 mt-8">
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
        <p className="title-extra-large mt-4 uppercase">
          {t('academy.career.title3')}
        </p>
        <div className="flex flex-row justify-center gap-4">
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
        subtitleClassName={'max-w-[420px] max-xl:!text-lg text-gray-300'}
        imageClassName=""
        subtitleUnderImage={true}
        className="mt-12"
        orientation="right"
        BottomElement={
          <div className="flex flex-col gap-1 xl:gap-2">
            <NetworkButton>{t('academy.companies.button')}</NetworkButton>
          </div>
        }
      />

      <PageBlock className="bg-network-cards-dark-bottom rounded-[68px]">
        <div className="flex flex-row gap-4 mt-8">
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
        imageUrl={isMobile ? media5MobileImage : media6Image}
        alt="Scenic mountain lake"
        subtitleClassName={'max-w-[600px] max-xl:!text-lg text-gray-300'}
        imageClassName="max-w-[40%]"
        subtitleUnderImage={true}
        className="mt-12 pb-12 bg-gradient-network-bt"
        orientation="left"
        TopElement={
          <div className="flex flex-row justify-between pl-4 mb-4">
            <div>
              <p className={titleCss}>{t('academy.salvador.title')}</p>
              <p className="title-large text-brown-400 mt-2">
                {t('academy.salvador.subtitle')}
              </p>
            </div>
            <div className="flex flex-row gap-4">
              <img
                src={salvador1Image}
                className="h-28 object-cover"
                alt="Government of El Salvador"
              />
              <img
                src={salvador2Image}
                className="h-20 object-cover rounded-full"
                alt="Node network"
              />
            </div>
          </div>
        }
        BottomElement={
          <div className="flex flex-col gap-1 xl:gap-2">
            <NetworkListItem
              img={bookOpenIcon}
              text={t('academy.salvador.list1')}
            />
            <NetworkListItem
              img={personIcon}
              text={t('academy.salvador.list2')}
            />
            <NetworkListItem
              img={barChartIcon}
              text={t('academy.salvador.list3')}
            />
            <NetworkListItem
              img={bookOpen2Icon}
              text={t('academy.salvador.list4')}
            />
          </div>
        }
      />

      <MediaCard
        subtext={t('academy.taipei.text')}
        imageUrl={isMobile ? media5MobileImage : media6Image}
        alt="Scenic mountain lake"
        subtitleClassName={'max-w-[600px] max-xl:!text-lg text-gray-300'}
        imageClassName="max-w-[40%]"
        subtitleUnderImage={true}
        className="mt-12 pb-12 bg-gradient-network-bt"
        orientation="right"
        TopElement={
          <div className="flex flex-row justify-between pl-4 mb-4">
            <div className="flex flex-row gap-4">
              <img
                src={taipeiLogo}
                className="h-28 object-cover"
                alt="Logo of polytecnico di Torino"
              />
            </div>
            <div>
              <p className={titleCss}>{t('academy.taipei.title')}</p>
              <p className="title-large text-brown-400 mt-2">
                {t('academy.taipei.subtitle')}
              </p>
            </div>
          </div>
        }
        BottomElement={
          <div className="flex flex-col gap-1 xl:gap-2">
            <NetworkListItem
              img={bookOpenIcon}
              text={t('academy.taipei.list1')}
            />
            <NetworkListItem
              img={personIcon}
              text={t('academy.taipei.list2')}
            />
            <NetworkListItem
              img={barChartIcon}
              text={t('academy.taipei.list3')}
            />
            <NetworkListItem
              img={bookOpen2Icon}
              text={t('academy.taipei.list4')}
            />
          </div>
        }
      />

      <MediaCard
        subtext={t('academy.polytecnico.text')}
        imageUrl={isMobile ? media5MobileImage : media6Image}
        alt="Scenic mountain lake"
        subtitleClassName={'max-w-[600px] max-xl:!text-lg text-gray-300'}
        imageClassName="max-w-[40%]"
        subtitleUnderImage={true}
        className="mt-12 pb-12 bg-gradient-network-bt"
        orientation="left"
        TopElement={
          <div className="flex flex-row justify-between pl-4 mb-4">
            <div>
              <p className={titleCss}>{t('academy.polytecnico.title')}</p>
              <p className="title-large text-brown-400 mt-2">
                {t('academy.polytecnico.subtitle')}
              </p>
            </div>
            <div className="flex flex-row gap-4">
              <img
                src={polytecnicoLogo}
                className="h-28 object-cover"
                alt="Logo of polytecnico di Torino"
              />
            </div>
          </div>
        }
        BottomElement={
          <div className="flex flex-col gap-1 xl:gap-2">
            <NetworkListItem
              img={bookOpenIcon}
              text={t('academy.polytecnico.list1')}
            />
            <NetworkListItem
              img={personIcon}
              text={t('academy.polytecnico.list2')}
            />
            <NetworkListItem
              img={barChartIcon}
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
