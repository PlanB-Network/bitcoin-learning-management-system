import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import headerImage from '#src/assets/academy/header.png';
import headerSmallImage from '#src/assets/academy/header.png';
import { Hero } from '#src/components/hero.tsx';
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
        className="mx-10"
        titleClassName="max-w-[65%]"
        subtitleClassName={'max-w-[85%] lg:max-w-[40%]'}
      />
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
