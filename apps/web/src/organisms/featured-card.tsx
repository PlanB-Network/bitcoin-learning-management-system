import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { useContext } from 'react';

import { formatDateSimple } from '@blms/api/src/utils/date.ts';
import { TextTag } from '@blms/ui';

import type { JoinedBlog, JoinedBlogLight } from '@blms/types';
import { useTranslation } from 'react-i18next';
import { AppContext } from '#src/providers/context.js';
import { assetUrl } from '#src/utils/index.js';

interface FeaturedCardProps {
  category: string;
  background?: 'gray';
  blog?: JoinedBlog | JoinedBlogLight;
}

const cardStyles = cva(
  'mb-[47px] text-start lg:gap-9 shadow-course-navigation flex flex-col mx-auto md:flex-row justify-center px-[8px] py-[10px] lg:p-[20px] w-full max-w-[290px] md:max-w-[1178px] rounded-sm md:rounded-[30px] items-center',
  {
    variants: {
      background: {
        gray: 'bg-newGray-6',
      },
    },
    defaultVariants: {
      background: 'gray',
    },
  },
);

export const FeaturedCard = ({
  category,
  background,
  blog,
}: FeaturedCardProps) => {
  const { blogs } = useContext(AppContext);
  const { t } = useTranslation();

  if (!blogs || blogs.length === 0) {
    return <></>;
  }

  let latestBlog = blog;

  if (!latestBlog) {
    const filteredBlogs =
      category === 'all' ? blogs : blogs.filter((b) => b.category === category);

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
      <div
        key={latestBlog.id}
        className="w-full max-w-[738px] order-2 md:order-1"
      >
        <Link
          to={`/public-communication/blogs-and-news/${latestBlog.category}/${latestBlog.name}`}
        >
          <h2 className="text-darkOrange-5 mb-2 lg:mb-[22px] mobile-h2 lg:display-small-32px">
            {latestBlog.title}
          </h2>
          <div className="flex flex-row gap-2.5 mb-2 lg:mb-[22px] items-center">
            <span className="text-black font-medium text-sm lg:title-large-24px">
              {latestBlog.author}
            </span>
            <span className="text-newBlack-5">•</span>
            <span className="text-black lg:text-2xl font-medium lg:font-normal text-sm">
              {latestBlog.date
                ? formatDateSimple(latestBlog.date)
                : t('home.blogSection.noDateAvailable')}
            </span>
          </div>
          {latestBlog.tags && (
            <div className="flex flex-row flex-wrap gap-2 md:gap-4 mb-2 lg:mb-[22px]">
              {latestBlog.tags.map((tag) => (
                <TextTag
                  key={tag}
                  variant="grey"
                  className="capitalize"
                  mode="light100"
                >
                  {tag}
                </TextTag>
              ))}
            </div>
          )}
          <div>
            <p className="text-black max-md:hidden line-clamp-3 body-16px">
              {latestBlog.description}
            </p>
          </div>
        </Link>
      </div>
      <div className="mb-3 md:mr-5 lg:mr-0 lg:ml-5 lg:mb-0 w-fit mx-auto order-1 md:order-2">
        <Link
          key={latestBlog.id}
          to={`/public-communication/blogs-and-news/${latestBlog.category}/${latestBlog.name}`}
        >
          <img
            className="rounded-sm lg:rounded-[20px] lg:max-w-[404px]"
            src={assetUrl(latestBlog.path, 'thumbnail.webp')}
            alt={latestBlog.title}
          />
        </Link>
      </div>
    </div>
  );
};
