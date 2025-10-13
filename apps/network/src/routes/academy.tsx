import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import headerImage from '#src/assets/academy/header.png';
import headerSmallImage from '#src/assets/academy/header.png';
import media1Image from '#src/assets/academy/media-1.png';
import BlockTitle from '#src/components/block-title.tsx';
import { Hero } from '#src/components/hero.tsx';
import { NetworkButton } from '#src/components/network-button.tsx';
import PageBlock from '#src/components/page-block.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';

export const Route = createFileRoute('/academy')({
  component: RouteComponent,
});

function RouteComponent() {
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
        subtitleClassName={'max-w-[85%] lg:max-w-[40%]'}
      />
      <BlockTitle text="Todo bla bla" />

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
          Start learning
        </NetworkButton>
      </PageBlock>
      <div className="shadow-top-bottom-box py-24 mt-24">
        <PageBlock>
          <p>1</p>
          <p>2</p>
          <p>3</p>
          <p>4</p>
        </PageBlock>
      </div>
      <PageBlock>
        <h1 className="h-60">
          <p>1</p>
          <p>2</p>
          <p>3</p>
          <p>4</p>
        </h1>
      </PageBlock>
      <div className="py-24 bg-gradient-network-bt ">
        <PageBlock>
          <p>1</p>
          <p>2</p>
          <p>3</p>
          <p>4</p>
        </PageBlock>
      </div>
    </>
  );
}
