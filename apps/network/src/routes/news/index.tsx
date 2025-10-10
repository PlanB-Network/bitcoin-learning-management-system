import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import headerImage from '#src/assets/network-header.png';
import headerSmallImage from '#src/assets/network-header-small.png';
import { Hero } from '#src/components/hero.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { BlogList } from './-components/blog-list.tsx';

export const Route = createFileRoute('/news/')({
  component: BlogsNews,
});

function BlogsNews() {
  const isMobile = useSmaller('lg');

  return (
    <PageLayout>
      <Hero
        titleElement={
          <Trans i18nKey="news.title">
            <span className="font-semibold">Network</span>
          </Trans>
        }
        subtitle={t('news.subtitle')}
        imageUrl={isMobile ? headerSmallImage : headerImage}
        className=""
        subtitleClassName={'max-w-[85%] lg:max-w-[50%]'}
      />
      <BlogList />
    </PageLayout>
  );
}
