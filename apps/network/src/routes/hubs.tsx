import { cn, Image } from '@blms/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import arkLogo from '#src/assets/hubs/ark-logo.webp';
import coworking1Image from '#src/assets/hubs/coworking-1.webp';
import coworking2Image from '#src/assets/hubs/coworking-2.webp';
import coworking3Image from '#src/assets/hubs/coworking-3.webp';
import forumLogo from '#src/assets/hubs/forum-logo.webp';
import headerImage from '#src/assets/hubs/header.webp';
import headerSmallImage from '#src/assets/hubs/header-mobile.webp';
import luganoBgImage from '#src/assets/hubs/lugano-bg.webp';
import luganoLogo from '#src/assets/hubs/lugano-planb-logo.png';
import spritzLogoImage from '#src/assets/hubs/spritz-logo.webp';
import locationImage from '#src/assets/icons/location.svg';
import BlockTitle from '#src/components/block-title.tsx';
import { ContactUs } from '#src/components/contact-us.tsx';
import { Hero } from '#src/components/hero.tsx';
import MediaCard2 from '#src/components/media-card2.tsx';
import PageBlock from '#src/components/page-block.tsx';
import ToolsForCommunities from '#src/components/tools-for-communities.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';

export const Route = createFileRoute('/hubs')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  const isMobile = useSmaller('lg');

  return (
    <>
      <Hero
        titleElement={
          <Trans i18nKey="hubs.title">
            <span className="font-semibold">Building</span>
          </Trans>
        }
        subtitle={t('hubs.subtitle')}
        imageUrl={isMobile ? headerSmallImage : headerImage}
        titleClassName={'max-w-[700px]'}
        subtitleClassName={'max-w-[85%] lg:max-w-[450px]'}
      />
      <PageBlock className="bg-gradient-network-lr-dark mt-8 p-10 rounded-[60px]">
        <h1 className="title-large lg:text-6xl">
          {t('hubs.co-working.title')}
        </h1>
        <p className="mt-8 max-w-[530px] text-gray-200">
          {t('hubs.co-working.subtitle')}
        </p>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mt-16">
          <Link
            to="https://tokyobitcoin.space/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <CoworkingCard
              img={coworking1Image}
              name={t('hubs.co-working.hub1Name')}
              location={t('hubs.co-working.hub1Location')}
            />
          </Link>
          <Link
            to="https://pow.space/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <CoworkingCard
              img={coworking2Image}
              name={t('hubs.co-working.hub2Name')}
              location={t('hubs.co-working.hub2Location')}
            />
          </Link>
          <Link
            to="https://x.com/TempoHouseHQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            <CoworkingCard
              img={coworking3Image}
              name={t('hubs.co-working.hub3Name')}
              location={t('hubs.co-working.hub3Location')}
            />
          </Link>
        </div>
      </PageBlock>

      <div
        className={cn(
          'relative py-12 lg:py-20 bg-lugano-section mt-20 lg:mt-40',
          'rounded-tl-[68px] rounded-br-[68px]',
          'lg:rounded-tl-[200px] lg:rounded-br-[200px]',
        )}
      >
        <Image
          src={luganoBgImage}
          alt=""
          className={cn(
            'border-4 border-blue-500 absolute inset-0',
            'h-full w-full opacity-23 object-cover z-0',
            'rounded-tl-[68px] rounded-br-[68px]',
            'lg:rounded-tl-[200px] lg:rounded-br-[200px]',
          )}
          loading="lazy"
          breakpoints={{ default: 700, lg: 1500 }}
        />
        <BlockTitle
          text={t('hubs.blockTitle1Text')}
          subtext={t('hubs.blockTitle1Subtext')}
        />
        <MediaCard2
          title={t('hubs.lugano.title')}
          subtext={t('hubs.lugano.subtitle')}
          buttontext={t('hubs.lugano.button')}
          buttonLink="https://planb.lugano.ch/"
          tagText={t('hubs.lugano.tag')}
          imageUrl={luganoLogo}
          alt=""
          className="mt-10 lg:mt-20 z-10 relative"
          subtitleClassName="!text-gray-100"
          orientation="left"
        />
        <MediaCard2
          title={t('hubs.spritz.title')}
          subtext={t('hubs.spritz.subtitle')}
          buttontext={t('hubs.spritz.button')}
          buttonLink="https://satoshispritzlugano.planb.network"
          tagText={t('hubs.spritz.tag')}
          imageUrl={spritzLogoImage}
          alt=""
          className="mt-12 lg:mt-24"
          orientation="right"
        />
        <MediaCard2
          title={t('hubs.forum.title')}
          subtext={t('hubs.forum.subtitle')}
          buttontext={t('hubs.forum.button')}
          buttonLink="https://planb.lugano.ch/planb-forum/"
          tagText={t('hubs.forum.tag')}
          imageUrl={forumLogo}
          alt=""
          className="mt-12 lg:mt-24"
          orientation="left"
        />
        <MediaCard2
          title={t('hubs.ark.title')}
          subtext={t('hubs.ark.subtitle')}
          tagText={t('hubs.ark.tag')}
          imageUrl={arkLogo}
          alt=""
          className="mt-12 lg:mt-24 pb-12"
          orientation="right"
        />

        <ContactUs
          className="relative z-30"
          text={t('hubs.contactText')}
          email="mir@planb.network"
        />
      </div>

      <PageBlock
        className="pt-10 lg:pt-30"
        withXMargin={false}
        withXPadding={false}
        withYPadding={false}
      >
        <ToolsForCommunities />
      </PageBlock>
    </>
  );
}

function CoworkingCard({
  img,
  name,
  location,
}: {
  img: string;
  name: string;
  location: string;
}) {
  return (
    <div className="flex flex-col items-center gap-10 max-w-[400px] bg-black pb-6 rounded-4xl hover:bg-gray-900">
      <Image
        src={img}
        alt="coworking 1"
        loading="lazy"
        breakpoints={{ default: 700, lg: 1500 }}
      />
      <span className="display-base">{name}</span>
      <div className="flex flex-col items-center gap-2">
        <Image
          src={locationImage}
          alt="location"
          className="w-8"
          loading="lazy"
          breakpoints={{ default: 100 }}
        />
        <span className="title-small text-orange-500">{location}</span>
      </div>
    </div>
  );
}
