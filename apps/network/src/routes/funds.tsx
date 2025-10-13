import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import headerImage from '#src/assets/funds/header.png';
import headerSmallImage from '#src/assets/funds/header-small.png';
import media2Image from '#src/assets/funds/media-2.png';
import media2MobileImage from '#src/assets/funds/media-2-mobile.png';
import media3Image from '#src/assets/funds/media-3.png';
import media3MobileImage from '#src/assets/funds/media-3-mobile.png';
import { Hero } from '#src/components/hero.tsx';
import MediaCard from '#src/components/media-card.tsx';
import { NetworkButton } from '#src/components/network-button.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';

export const Route = createFileRoute('/funds')({
  component: RouteComponent,
});

function RouteComponent() {
  const isMobile = useSmaller('lg');

  return (
    <>
      <Hero
        titleElement={
          <Trans i18nKey="funds.title">
            <span className="font-semibold">Building</span>
          </Trans>
        }
        subtitle={t('funds.subtitle')}
        imageUrl={isMobile ? headerSmallImage : headerImage}
        className="mx-10"
        subtitleClassName={'max-w-[85%] lg:max-w-[50%]'}
      />
      <MediaCard
        title={t('funds.media1title')}
        subtext={t('funds.media1subtitle')}
        imageUrl={isMobile ? media3MobileImage : media3Image}
        alt="Scenic mountain lake"
        titleClassName={'lg:max-w-[53%]'}
        subtitleClassName={'lg:max-w-[40%]  text-gray-300'}
        subtitleUnderImage={true}
        className="mt-12"
        orientation="left"
        BottomElement={
          <div className="flex flex-col max-lg:items-center">
            <p>Bla</p>
            <p>Bla</p>
            <p>Bla</p>
            <NetworkButton variant={'secondary'} className="!text-black">
              Apply now
            </NetworkButton>
            <NetworkButton variant={'secondary'} className="!text-black">
              See next edition
            </NetworkButton>
          </div>
        }
      />
      <MediaCard
        title={t('funds.media2title')}
        subtext={t('funds.media2subtitle')}
        imageUrl={isMobile ? media2MobileImage : media2Image}
        alt="Scenic mountain lake"
        titleClassName={'lg:max-w-[53%]'}
        subtitleClassName={'lg:max-w-[30%]  text-gray-300'}
        subtitleUnderImage={true}
        className="mt-12"
        orientation="right"
        BottomElement={
          <div className="flex flex-col max-lg:items-center">
            <NetworkButton variant={'secondary'} className="!text-black">
              Fundrise capital
            </NetworkButton>
          </div>
        }
      />
      <MediaCard
        title={t('funds.media3title')}
        subtext={t('funds.media3subtitle')}
        imageUrl={isMobile ? media3MobileImage : media3Image}
        alt="Scenic mountain lake"
        titleClassName={'lg:max-w-[60%]'}
        subtitleClassName={'lg:max-w-[60%] text-gray-300'}
        subtitleUnderImage={true}
        className="mt-12"
        orientation="left"
        BottomElement={
          <div className="flex flex-col max-lg:items-center">
            <NetworkButton variant={'secondary'} className="!text-black">
              Contact us
            </NetworkButton>
          </div>
        }
      />
    </>
  );
}
