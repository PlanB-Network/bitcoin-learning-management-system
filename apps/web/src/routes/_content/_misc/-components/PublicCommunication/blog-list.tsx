import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { VerticalCard } from '#src/molecules/VerticalCard/index.tsx';
import { AppContext } from '#src/providers/context.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';

import { FeaturedCard } from './featured-card.tsx';

interface BlogListProps {
  category: string;
}

export const BlogList = ({ category }: BlogListProps) => {
  const { blogs } = useContext(AppContext);
  const { t } = useTranslation();

  if (!blogs) {
    return <></>;
  }

  const filteredBlogs =
    category === 'all'
      ? blogs
      : blogs.filter((blog) => blog.category === category);

  if (filteredBlogs.length === 0) {
    return (
      <p className="text-black p-14 justify-center text-4xl font-medium mx-auto">
        {t('publicCommunication.blogPageStrings.noArticlesText')}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px]">
      <h3 className="text-black desktop-h7 mb-4">
        {t('publicCommunication.blogPageStrings.featuredArticleTitleText')}
      </h3>
      <FeaturedCard />

      {filteredBlogs.length > 1 && (
        <div>
          <h3 className="text-black desktop-h7 mb-4">
            {t('publicCommunication.blogPageStrings.pastArticleSubtitleText')}
          </h3>
          <div className="text-black grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBlogs.slice(1).map((blog, index) => (
              <VerticalCard
                key={index}
                imageSrc={computeAssetCdnUrl(
                  blog.lastCommit,
                  `${blog.path}/assets/thumbnail.webp`,
                )}
                title={blog.title}
                languages={[]}
                cardColor="lightgrey"
                className="text-start"
                buttonVariant="newPrimary"
                buttonMode="dark"
                buttonText={t(
                  'publicCommunication.blogPageStrings.blogListButtonText',
                )}
                buttonLink={`/public-communication/blogs-and-news/${blog.category}/${blog.name}`}
                tags={blog.tags}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
