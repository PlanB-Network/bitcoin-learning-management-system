import { createFileRoute, Link } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import headerImage from '#src/assets/funds/header.webp';
import headerSmallImage from '#src/assets/funds/header-small.webp';
import media1Image from '#src/assets/funds/media-1.webp';
import media1MobileImage from '#src/assets/funds/media-1-mobile.webp';
import media2Image from '#src/assets/funds/media-2.webp';
import media2MobileImage from '#src/assets/funds/media-2-mobile.webp';
import media3Image from '#src/assets/funds/media-3.webp';
import media3MobileImage from '#src/assets/funds/media-3-mobile.webp';
import dollarIcon from '#src/assets/icons/dollar.svg';
import personIcon from '#src/assets/icons/person.svg';
import worldIcon from '#src/assets/icons/world.svg';
import { Hero } from '#src/components/hero.tsx';
import MediaCard from '#src/components/media-card.tsx';
import { NetworkButton } from '#src/components/network-button.tsx';
import NetworkListItem from '#src/components/network-list-item.tsx';
import PageBlock from '#src/components/page-block.tsx';
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

      <PageBlock withYPadding={false}>
        <MediaCard
          title={t('funds.media1title')}
          subtext={t('funds.media1subtitle')}
          imageUrl={isMobile ? media1MobileImage : media1Image}
          alt=""
          titleClassName={'lg:max-w-[500px]'}
          subtitleClassName={
            'lg:max-w-[450px] xl:max-w-[550px] max-xl:!text-lg'
          }
          imageClassName="max-lg:mt-16"
          subtitleUnderImage={true}
          className="mt-12"
          orientation="left"
          BackgroundColor="border-dark"
          BottomElement={
            <div className="flex flex-col gap-4 lg:gap-4 max-lg:pl-4">
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
      </PageBlock>

      <PageBlock withYPadding={false}>
        <MediaCard
          title={t('funds.media2title')}
          subtext={t('funds.media2subtitle')}
          imageUrl={isMobile ? media2MobileImage : media2Image}
          alt=""
          titleClassName={'lg:max-w-[550px]'}
          subtitleClassName={'lg:max-w-[350px]'}
          subtitleUnderImage={true}
          className="mt-12"
          orientation="right"
          BackgroundColor="border-dark"
          BottomElement={
            <div className="flex flex-col max-lg:items-center">
              <Link
                to="https://planbvc.fund/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <NetworkButton variant={'secondary'}>
                  Fundrise capital
                </NetworkButton>
              </Link>
            </div>
          }
        />
      </PageBlock>

      <PageBlock withYPadding={false}>
        <MediaCard
          title={t('funds.media3title')}
          subtext={t('funds.media3subtitle')}
          imageUrl={isMobile ? media3MobileImage : media3Image}
          alt=""
          titleClassName={'lg:max-w-[60%]'}
          subtitleClassName={'lg:max-w-[60%] max-xl:!text-lg !text-left'}
          subtitleUnderImage={true}
          className="mt-12"
          orientation="left"
          BackgroundColor="border-dark"
          BottomElement={
            <div className="flex flex-col max-lg:items-center">
              <a href="mailto:contact@planb.network">
                <NetworkButton variant={'secondary'}>Contact us</NetworkButton>
              </a>
            </div>
          }
        />
      </PageBlock>
    </>
  );
}
