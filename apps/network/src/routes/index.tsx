import { cn } from '@blms/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  TbBuildingCastle,
  TbBuildingSkyscraper,
  TbDatabaseSearch,
  TbFileCertificate,
  TbPigMoney,
  TbPizza,
  TbSchool,
  TbSpeakerphone,
  TbTie,
  TbUsers,
  TbWashMachine,
} from 'react-icons/tb';
import mapVideo from '#src/assets/home/map-animation.webm';
import media1Img from '#src/assets/home/media1.png';
import media1MobileImg from '#src/assets/home/media1-mobile.png';
import media2Img from '#src/assets/home/media2.png';
import media2MobileImg from '#src/assets/home/media2-mobile.png';
import media3Img from '#src/assets/home/media3.png';
import media3MobileImg from '#src/assets/home/media3-mobile.png';
import bitcoinIcon from '#src/assets/icons/bitcoin.png';
import MediaCard3 from '#src/components/media-card3.tsx';
import NetworkCard from '#src/components/network-card.tsx';
import PageBlock from '#src/components/page-block.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  const { t } = useTranslation();
  const isMobile = useSmaller('lg');

  const cardsDivClassName =
    'flex flex-wrap gap-4 lg:gap-10 max-w-[1300px] max-lg:justify-center';
  return (
    <div className="text-center">
      <PageBlock withYPadding={false} className="mt-8">
        <h1 className="text-6xl font-medium mb-2">{t('home.title')}</h1>
        <p className="text-3xl font-bold text-orange-500">
          {t('home.subtitle')}
        </p>
      </PageBlock>
      <PageBlock withYPadding={false}>
        <video
          className="relative w-full max-h-full"
          src={mapVideo}
          autoPlay
          muted
          preload="auto"
          aria-label="Bitcoin network animation"
        />
      </PageBlock>

      <PageBlock className="lg:!py-25" withXMargin={false} withXPadding={false}>
        <MediaCard3
          title={t('home.media1.title')}
          subtitle={t('home.media1.subtitle')}
          buttonText={t('home.media1.button')}
          buttonLink="/academy"
          imageUrl={isMobile ? media1MobileImg : media1Img}
          bottomElement={
            <div className={cn(cardsDivClassName)}>
              <NetworkCard
                icon={bitcoinIcon}
                text={t('home.media1.card1Title')}
                subtext={t('home.media1.card1Subtitle')}
              />
              <NetworkCard
                icon={TbSchool}
                text={t('home.media1.card2Title')}
                subtext={t('home.media1.card2Subtitle')}
                className="stroke-1"
              />
              <NetworkCard
                icon={TbDatabaseSearch}
                text={t('home.media1.card3Title')}
                subtext={t('home.media1.card3Subtitle')}
              />
              <NetworkCard
                icon={TbFileCertificate}
                text={t('home.media1.card4Title')}
                subtext={t('home.media1.card4Subtitle')}
              />
              <NetworkCard
                icon={TbBuildingSkyscraper}
                text={t('home.media1.card5Title')}
                subtext={t('home.media1.card5Subtitle')}
              />
              <NetworkCard
                icon={TbUsers}
                text={t('home.media1.card6Title')}
                subtext={t('home.media1.card6Subtitle')}
              />
            </div>
          }
        />
      </PageBlock>
      <PageBlock className="lg:!py-25" withXMargin={false} withXPadding={false}>
        <MediaCard3
          title={t('home.media2.title')}
          subtitle={t('home.media2.subtitle')}
          buttonText={t('home.media2.button')}
          buttonLink="/hubs"
          imageUrl={isMobile ? media2MobileImg : media2Img}
          orientation="left"
          bottomElement={
            <div className={cn(cardsDivClassName)}>
              <NetworkCard
                icon={TbTie}
                text={t('home.media2.card1Title')}
                subtext={t('home.media2.card1Subtitle')}
              />
              <NetworkCard
                icon={TbBuildingCastle}
                text={t('home.media2.card2Title')}
                subtext={t('home.media2.card2Subtitle')}
              />
              <NetworkCard
                icon={TbPizza}
                text={t('home.media2.card3Title')}
                subtext={t('home.media2.card3Subtitle')}
              />
            </div>
          }
        />
      </PageBlock>

      <PageBlock className="lg:!py-25" withXMargin={false} withXPadding={false}>
        <MediaCard3
          title={t('home.media3.title')}
          subtitle={t('home.media3.subtitle')}
          buttonText={t('home.media3.button')}
          buttonLink="/funds"
          imageUrl={isMobile ? media3MobileImg : media3Img}
          bottomElement={
            <div className={cn(cardsDivClassName)}>
              <NetworkCard
                icon={TbSpeakerphone}
                text={t('home.media3.card1Title')}
                subtext={t('home.media3.card1Subtitle')}
              />
              <NetworkCard
                icon={TbPigMoney}
                text={t('home.media3.card2Title')}
                subtext={t('home.media3.card2Subtitle')}
              />
              <NetworkCard
                icon={TbWashMachine}
                text={t('home.media3.card3Title')}
                subtext={t('home.media3.card3Subtitle')}
              />
            </div>
          }
        />
      </PageBlock>
    </div>
  );
}
