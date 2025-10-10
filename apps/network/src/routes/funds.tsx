import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import headerImage from '#src/assets/funds-header.png';
import headerSmallImage from '#src/assets/funds-header-small.png';
import { Hero } from '#src/components/hero.tsx';
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
      <div />
    </>
  );
}
