import { createFileRoute } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import headerImage from '#src/assets/funds/header.png';
import headerSmallImage from '#src/assets/funds/header-small.png';
import media1Image from '#src/assets/funds/media-1.png';
import media1MobileImage from '#src/assets/funds/media-1-mobile.png';
import media2Image from '#src/assets/funds/media-2.png';
import media2MobileImage from '#src/assets/funds/media-2-mobile.png';
import media3Image from '#src/assets/funds/media-3.png';
import media3MobileImage from '#src/assets/funds/media-3-mobile.png';
import dollarIcon from '#src/assets/icons/dollar.svg';
import personIcon from '#src/assets/icons/person.svg';
import worldIcon from '#src/assets/icons/world.svg';
import { Hero } from '#src/components/hero.tsx';
import MediaCard from '#src/components/media-card.tsx';
import { NetworkButton } from '#src/components/network-button.tsx';
import NetworkListItem from '#src/components/network-list-item.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';

export const Route = createFileRoute('/funds')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

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
        titleClassName={'lg:max-w-[500px]'}
        subtitleClassName={
          'lg:max-w-[450px] xl:max-w-[550px] max-xl:!text-lg text-gray-300'
        }
        subtitleUnderImage={true}
        className="mt-12"
        orientation="left"
        BackgroundColor="border-dark"
        BottomElement={
          <div className="flex flex-col gap-1 lg:gap-4">
            <NetworkListItem
              icon={personIcon}
              text={t('funds.cyphertankPitch1')}
            />
            <NetworkListItem
              icon={dollarIcon}
              text={t('funds.cyphertankPitch2')}
            />
            <NetworkListItem
              icon={worldIcon}
              text={t('funds.cyphertankPitch3')}
            />
          </div>
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
        BackgroundColor="border-dark"
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
        BackgroundColor="border-dark"
        BottomElement={
          <div className="flex flex-col max-lg:items-center">
            <NetworkButton variant={'secondary'}>Contact us</NetworkButton>
          </div>
        }
      />
    </>
  );
}
