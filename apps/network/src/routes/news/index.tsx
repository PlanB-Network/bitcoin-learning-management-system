import { createFileRoute } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import headerImage from '#src/assets/news/header.png';
import headerSmallImage from '#src/assets/news/header-small.png';
import { Hero } from '#src/components/hero.tsx';
import PageBlock from '#src/components/page-block.tsx';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { BlogList } from './-components/blog-list.tsx';

export const Route = createFileRoute('/news/')({
  component: BlogsNews,
});

function BlogsNews() {
  const { t } = useTranslation();

  const isMobile = useSmaller('lg');

  return (
    <>
      <Hero
        titleElement={
          <Trans i18nKey="news.title">
            <span className="font-semibold">Network</span>
          </Trans>
        }
        subtitle={t('news.subtitle')}
        imageUrl={isMobile ? headerSmallImage : headerImage}
        titleClassName={'lg:max-w-[60%]'}
        subtitleClassName={'max-w-[90%] lg:max-w-[380px]'}
      />

      <PageBlock withYPadding={false}>
        <BlogList />
      </PageBlock>
    </>
  );
}
