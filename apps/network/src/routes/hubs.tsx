import { createFileRoute } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import coworking1Image from '#src/assets/hubs/coworking-1.png';
import coworking2Image from '#src/assets/hubs/coworking-2.png';
import coworking3Image from '#src/assets/hubs/coworking-3.png';
import headerImage from '#src/assets/hubs/header.png';
import headerSmallImage from '#src/assets/hubs/header.png';
import luganoBgImage from '#src/assets/hubs/lugano-bg.png';
import luganoLogo from '#src/assets/hubs/lugano-planb-logo.png';
import locationImage from '#src/assets/icons/location.svg';
import BlockTitle from '#src/components/block-title.tsx';
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
        titleClassName="max-w-[65%]"
        subtitleClassName={'max-w-[85%] lg:max-w-[450px]'}
      />
      <PageBlock className="bg-gradient-network-lr-dark mt-8 p-10">
        <h1 className="title-extra-large">{t('hubs.co-working.title')}</h1>
        <p className="mt-8 max-w-[466px]">{t('hubs.co-working.subtitle')}</p>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mt-16">
          <CoworkingCard
            img={coworking1Image}
            name={t('hubs.co-working.hub1Name')}
            location={t('hubs.co-working.hub1Location')}
          />
          <CoworkingCard
            img={coworking2Image}
            name={t('hubs.co-working.hub2Name')}
            location={t('hubs.co-working.hub2Location')}
          />
          <CoworkingCard
            img={coworking3Image}
            name={t('hubs.co-working.hub3Name')}
            location={t('hubs.co-working.hub3Location')}
          />
        </div>
      </PageBlock>

      <BlockTitle
        text={t('hubs.blockTitle1Text')}
        subtext={t('hubs.blockTitle1Subtext')}
      />

      <PageBlock className="relative !max-w-[1400px]">
        <img
          className="z-0 absolute -ml-12 -mt-10 w-full"
          src={luganoBgImage}
          alt="Lugano's lake"
        />
        <h2 className="relative z-10 mt-12 title-extra-large text-6xl max-w-[800px]">
          {t('hubs.lugano.superTitle')}
        </h2>
        <p className="relative z-1 title-medium max-w-[600px] mt-8">
          {t('hubs.lugano.superSubtitle')}
        </p>
      </PageBlock>

      <MediaCard2
        title={t('hubs.lugano.title')}
        subtext={t('hubs.lugano.subtitle')}
        imageUrl={luganoLogo}
        alt=""
        className="mt-24 z-10 relative"
        subtitleClassName="!text-gray-100"
        orientation="left"
      />

      <MediaCard2
        title={t('hubs.lugano.title')}
        subtext={t('hubs.lugano.subtitle')}
        imageUrl={luganoLogo}
        alt=""
        className="mt-24"
        orientation="right"
      />

      <ToolsForCommunities />
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
    <div className="flex flex-col items-center gap-10 max-w-[400px] bg-black pb-6 rounded-4xl">
      <img src={img} alt="coworking 1" />
      <span className="display-base">{name}</span>
      <div className="flex flex-col items-center gap-2">
        <img src={locationImage} alt="location" className="w-8" />
        <span className="title-small text-orange-500">{location}</span>
      </div>
    </div>
  );
}
