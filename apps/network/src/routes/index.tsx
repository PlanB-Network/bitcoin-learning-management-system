import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import mapVideo from '#src/assets/home/map-animation.mp4';
import PageBlock from '#src/components/page-block.tsx';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <PageBlock>
        <h1 className="text-4xl font-bold mb-8">{t('home.title')}</h1>
      </PageBlock>

      <video
        className="relative w-full max-h-full"
        src={mapVideo}
        autoPlay
        muted
        preload="auto"
      />
    </div>
  );
}
