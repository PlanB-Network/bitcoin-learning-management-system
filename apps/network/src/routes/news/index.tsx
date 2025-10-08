import { createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import networkHeaderImage from '#src/assets/network-header.png';
import { Hero } from '#src/components/hero.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';
import { BlogList } from './-components/blog-list.tsx';

export const Route = createFileRoute('/news/')({
  component: BlogsNews,
});

function BlogsNews() {
  return (
    <PageLayout>
      <div className="flex flex-col text-center lg:justify-start lg:text-start space-x-5 mt-5">
        <Hero
          titleElement={
            <Trans i18nKey="news.title">
              <span className="font-semibold">Network</span>
            </Trans>
          }
          subtitle={t('news.subtitle')}
          imageUrl={networkHeaderImage}
        />

        <BlogList />
      </div>
    </PageLayout>
  );
}
