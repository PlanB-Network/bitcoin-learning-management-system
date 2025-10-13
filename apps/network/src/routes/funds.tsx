import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import headerImage from '#src/assets/funds/header.png';
import headerSmallImage from '#src/assets/funds/header-small.png';
import media1Image from '#src/assets/funds/media-1.png';
import media1MobileImage from '#src/assets/funds/media-1-mobile.png';
import media2Image from '#src/assets/funds/media-2.png';
import media2MobileImage from '#src/assets/funds/media-2-mobile.png';
import media3Image from '#src/assets/funds/media-3.png';
import media3MobileImage from '#src/assets/funds/media-3-mobile.png';
import dollarIcon from '#src/assets/icons/dollar.png';
import personIcon from '#src/assets/icons/person.png';
import worldIcon from '#src/assets/icons/world.png';
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
        titleClassName={'max-w-[700px]'}
        subtitleClassName={'max-w-[85%] lg:max-w-[450px]'}
      />
      <MediaCard
        title={t('funds.media1title')}
        subtext={t('funds.media1subtitle')}
        imageUrl={isMobile ? media1MobileImage : media1Image}
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
              <div className="flex flex-row gap-2 items-center">
                <img
                  className="rounded-[10px] p-2 bg-darkOrange-11 max-xl:size-9"
                  src={personIcon}
                  alt="Person icon"
                />
                <span className="title-base xl:title-medium">
                  {t('funds.cyphertankPitch1')}
                </span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <img
                  className="rounded-[10px] p-2 bg-darkOrange-11 max-xl:size-9"
                  src={dollarIcon}
                  alt="Dollar icon"
                />
                <span className="title-base xl:title-medium">
                  {t('funds.cyphertankPitch2')}
                </span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <img
                  className="rounded-[10px] p-2 bg-darkOrange-11 max-xl:size-9"
                  src={worldIcon}
                  alt="World icon"
                />
                <span className="title-base xl:title-medium">
                  {t('funds.cyphertankPitch3')}
                </span>
              </div>
            </div>
            <div className="mt-4 flex flex-row xl:flex-col max-lg:self-center gap-4">
              <NetworkButton variant={'secondary'}>Apply now</NetworkButton>
              <NetworkButton variant={'tertiary'}>
                See next edition
              </NetworkButton>
            </div>
          </>
        }
      />
      <MediaCard
        title={t('funds.media2title')}
        subtext={t('funds.media2subtitle')}
        imageUrl={isMobile ? media2MobileImage : media2Image}
        alt="Scenic mountain lake"
        titleClassName={'lg:max-w-[550px]'}
        subtitleClassName={'lg:max-w-[350px] text-gray-300'}
        subtitleUnderImage={true}
        className="mt-12"
        orientation="right"
        BottomElement={
          <div className="flex flex-col max-lg:items-center">
            <NetworkButton variant={'secondary'}>
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
        subtitleClassName={
          'lg:max-w-[60%] text-gray-300 max-xl:!text-lg !text-left'
        }
        subtitleUnderImage={true}
        className="mt-12"
        orientation="left"
        BottomElement={
          <div className="flex flex-col max-lg:items-center">
            <NetworkButton variant={'secondary'}>Contact us</NetworkButton>
          </div>
        }
      />
    </>
  );
}
