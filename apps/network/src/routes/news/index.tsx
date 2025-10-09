import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import headerImage from '#src/assets/network-header.png';
import { Hero } from '#src/components/hero.tsx';
import PageBlock from '#src/components/page-block.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { BlogList } from './-components/blog-list.tsx';

export const Route = createFileRoute('/news/')({
  component: BlogsNews,
});

function BlogsNews() {
  return (
    <PageLayout>
      <PageBlock>
        <Hero
          titleElement={
            <Trans i18nKey="news.title">
              <span className="font-semibold">Network</span>
            </Trans>
          }
          subtitle={t('news.subtitle')}
          imageUrl={headerImage}
        />
      </PageBlock>
      <BlogList />
    </PageLayout>
  );
}
