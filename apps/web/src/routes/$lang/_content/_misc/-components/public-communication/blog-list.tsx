import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { VerticalCard } from '#src/molecules/vertical-card.js';
import { FeaturedCard } from '#src/organisms/featured-card.tsx';
import { AppContext } from '#src/providers/context.js';
import { assetUrl } from '#src/utils/index.js';

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

  const sortedBlogs = filteredBlogs.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  if (sortedBlogs.length === 0) {
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
      <FeaturedCard category={category} background="gray" />

      {sortedBlogs.length > 1 && (
        <div>
          <h3 className="text-black desktop-h7 mb-4">
            {t('publicCommunication.blogPageStrings.pastArticleSubtitleText')}
          </h3>
          <div className="text-black grid grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedBlogs.slice(1).map((blog, index) => (
              <VerticalCard
                key={blog.id}
                imageSrc={assetUrl(blog.path, 'thumbnail.webp')}
                imgClassName="w-full !rounded-b-0 rounded-t-[10px] lg:rounded-[10px] mb-1"
                title={blog.title}
                languages={[]}
                cardColor="lightgrey"
                className="text-start shadow-course-navigation"
                buttonVariant="primary"
                buttonMode="dark"
                buttonText={t(
                  'publicCommunication.blogPageStrings.blogListButtonText',
                )}
                buttonLink={`/public-communication/blogs-and-news/${blog.category}/${blog.name}`}
                tags={blog.tags}
                category={blog.category}
                excerpt={blog.description ?? ''}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
