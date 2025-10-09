import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import headerImage from '#src/assets/about-header.png';
import media1Image from '#src/assets/about-media-1.png';
import valuesBitcoinFirstImage from '#src/assets/icons/bitcoin.png';
import valuesBottomUpImage from '#src/assets/icons/bottom-up.png';
import valuesFreedomImage from '#src/assets/icons/freedom.png';
import valuesOpenSourceImage from '#src/assets/icons/github.png';
import valuesBitcoinFirst2Image from '#src/assets/icons/groups.png';
import valuesPrivacyImage from '#src/assets/icons/visibility_off.png';
import { Hero } from '#src/components/hero.tsx';
import MediaCard from '#src/components/media-card.tsx';
import PageBlock from '#src/components/page-block.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';

export const Route = createFileRoute('/about')({
  component: RouteComponent,
});

function RouteComponent() {
  const valuesCards = [
    {
      title: t('about.ourValues.1textt'),
      subtext: t('about.ourValues.1subtext'),
      imageUrl: valuesBitcoinFirstImage,
    },
    {
      title: t('about.ourValues.2text'),
      subtext: t('about.ourValues.2subtext'),
      imageUrl: valuesOpenSourceImage,
    },
    {
      title: t('about.ourValues.3text'),
      subtext: t('about.ourValues.3subtext'),
      imageUrl: valuesPrivacyImage,
    },
    {
      title: t('about.ourValues.4text'),
      subtext: t('about.ourValues.4subtext'),
      imageUrl: valuesFreedomImage,
    },
    {
      title: t('about.ourValues.5text'),
      subtext: t('about.ourValues.5subtext'),
      imageUrl: valuesBottomUpImage,
    },
    {
      title: t('about.ourValues.6text'),
      subtext: t('about.ourValues.6subtext'),
      imageUrl: valuesBitcoinFirst2Image,
    },
  ];

  return (
    <PageLayout>
      <div>
        <Hero
          titleElement={
            <Trans i18nKey="about.title">
              <span className="font-semibold">Network</span>
            </Trans>
          }
          subtitle={t('about.subtitle')}
          imageUrl={headerImage}
          className="mx-10"
          titleClassName={''}
          subtitleClassName={'max-w-[85%] lg:max-w-[50%]'}
        />
        <MediaCard
          title={t('about.media1title')}
          subtext={t('about.media1subtitle')}
          imageUrl={media1Image}
          alt="Scenic mountain lake"
          titleClassName={'lg:max-w-[53%]'}
          subtitleClassName={'lg:max-w-[50%]'}
          subtitleUnderImage={true}
        />

        <PageBlock>
          <h2 className="display-medium mb-16 mt-20">
            {t('about.ourValues.title')}
          </h2>
          <div className="flex flex-row flex-wrap gap-8 justify-center-safe">
            {valuesCards.map((card) => (
              <div
                className="flex flex-col gap-2 lg:gap-4 w-52 lg:w-80 border-[1px] border-orange-600 rounded-3xl p-8 text-left"
                key={card.title}
              >
                <img className="w-12" src={card.imageUrl} alt="" />
                <p className="uppercase body-small-bold lg:display-small">
                  {card.title}
                </p>
                <p className="body-extra-small lg:text-xl text-gray-300">
                  {card.subtext}
                </p>
              </div>
            ))}
          </div>
        </PageBlock>

        <div className="shadow-top-bottom-box py-24">
          <PageBlock>
            <p>OOOO</p>
            <p>OOOO</p>
            <p>OOOO</p>
            <p>OOOO</p>
          </PageBlock>
        </div>
      </div>
    </PageLayout>
  );
}
