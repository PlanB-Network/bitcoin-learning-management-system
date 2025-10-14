import { createFileRoute } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import headerImage from '#src/assets/hubs/header.png';
import headerSmallImage from '#src/assets/hubs/header.png';
import { Hero } from '#src/components/hero.tsx';
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
      <div />
    </>
  );
}
