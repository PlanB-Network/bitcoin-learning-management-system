import { formatNameForURL } from '@blms/shared';
import { VerticalCard } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import PageBlock from '#src/components/page-block.tsx';
import { useGreater } from '#src/hooks/use-greater.ts';
import { resourceImgUrl } from '#src/utils/misc.tsx';
import { trpc } from '#src/utils/trpc.ts';
import { FeaturedCard } from './featured-card.js';

export const BlogList = () => {
  const isScreenMd = useGreater('md');

  const { data: blogs } = useQuery(
    trpc.content.getBlogs.queryOptions(
      {
        language: 'en',
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  const { t } = useTranslation();

  if (!blogs) {
    return <div />;
  }

  const filteredBlogs = blogs;

  const sortedBlogs = filteredBlogs.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  if (sortedBlogs.length === 0) {
    return (
      <p className=" p-14 justify-center text-4xl font-medium mx-auto">
        {t('news.noNews')}
      </p>
    );
  }

  return (
    <div className="mx-auto mt-20">
      <PageBlock className="px-5">
        <FeaturedCard variant="main" />
      </PageBlock>
      <PageBlock>
        {sortedBlogs.length > 1 && (
          <div className=" grid grid-cols-2 lg:grid-cols-3 gap-4 px-2 lg:px-12">
            {sortedBlogs.slice(1).map((blog) => (
              <Link
                to={`/news/article/${formatNameForURL(blog.title)}-${blog.id}`}
                key={blog.id}
              >
                <VerticalCard
                  imageSrc={resourceImgUrl(blog)}
                  imgClassName="w-full !rounded-b-0 rounded-t-[10px] lg:rounded-[10px] mb-1"
                  title={blog.title}
                  cardColor="black"
                  className="text-start shadow-course-navigation h-full border-[1px] border-transparent hover:border-orange-500"
                  category={blog.category}
                  excerpt={blog.description ?? ''}
                  isScreenMd={isScreenMd}
                  buttonText={t('words.read')}
                  buttonVariant={'primary'}
                />
              </Link>
            ))}
          </div>
        )}
      </PageBlock>
    </div>
  );
};
