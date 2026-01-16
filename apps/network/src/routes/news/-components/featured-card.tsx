import { formatNameForURL } from '@blms/shared';
import type { JoinedBlog, JoinedBlogLight } from '@blms/types';
import { cn, Image } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { formatDate, resourceImgUrl } from '#src/utils/misc.tsx';
import { trpc } from '#src/utils/trpc.ts';

interface FeaturedCardProps {
  variant?: 'main' | 'secondary';
  blog?: JoinedBlog | JoinedBlogLight;
}

const cardStyles = cva(
  cn(
    'mb-12 text-start lg:gap-9 shadow-course-navigation flex flex-col mx-auto lg:flex-row',
    'justify-center px-2 py-2 lg:p-5 w-full rounded-xs md:rounded-[30px] items-start max-lg:max-w-[500px]',
  ),
  {
    defaultVariants: {
      background: 'main',
    },
    variants: {
      background: {
        main: 'border-orange-500 lg:border-[1px] lg:hover:shadow-orange-600 shadow-md',
        secondary: '',
      },
    },
  },
);

export const FeaturedCard = ({
  variant: background,
  blog,
}: FeaturedCardProps) => {
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

  if (!blogs || blogs.length === 0) {
    return <div />;
  }

  let latestBlog = blog;

  if (!latestBlog) {
    const filteredBlogs = blogs;

    const sortedBlogs = filteredBlogs.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    latestBlog = sortedBlogs[0];
  }

  if (!latestBlog) {
    return <p>{t('home.blogSection.noBlogsAvailable')}</p>;
  }

  return (
    <div className={cardStyles({ background })}>
      <div key={latestBlog.id} className="w-full order-2 lg:order-1">
        <Link
          className="self-start justify-self-start"
          to={`/news/article/${formatNameForURL(latestBlog.title)}-${latestBlog.id}`}
          viewTransition
        >
          <h2 className="mb-2 lg:mb-5 mobile-h2 lg:display-small-32px">
            {latestBlog.title}
          </h2>
          <div className="flex flex-row gap-2.5 mb-2 lg:mb-5 items-center">
            <span className="!font-semibold text-sm lg:title-large-24px">
              {latestBlog.author}
            </span>
            <span className="text-neutral-100">•</span>
            <span className="text-neutral-100 lg:text-2xl font-medium lg:font-normal text-sm">
              {latestBlog.date
                ? formatDate(latestBlog.date)
                : t('home.blogSection.noDateAvailable')}
            </span>
          </div>
          <div>
            <p className="text-neutral-300 max-md:hidden body-16px">
              {latestBlog.description}
            </p>
          </div>
        </Link>
      </div>
      <div className="mb-3 md:mr-5 lg:mr-0 lg:ml-5 lg:mb-0 w-fit mx-auto order-1 lg:order-2">
        <Link
          key={latestBlog.id}
          to={`/news/article/${formatNameForURL(latestBlog.title)}-${latestBlog.id}`}
          viewTransition
        >
          <Image
            className="rounded-xs lg:rounded-[20px] lg:max-w-[500px]"
            src={resourceImgUrl(latestBlog)}
            alt={latestBlog.title}
            loading="lazy"
            breakpoints={{ default: 1000 }}
          />
        </Link>
      </div>
    </div>
  );
};
