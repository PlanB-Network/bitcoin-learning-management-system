import { Link } from '@tanstack/react-router';
import { useContext } from 'react';

import { formatDateSimple } from '@blms/api/src/utils/date.ts';

import { AppContext } from '#src/providers/context.js';
import { computeAssetCdnUrl } from '#src/utils/index.js';

interface FeaturedCardProps {
  category: string;
}

export const FeaturedCard = ({ category }: FeaturedCardProps) => {
  const { blogs } = useContext(AppContext);

  if (!blogs || blogs.length === 0) {
    return <></>;
  }

  const filteredBlogs =
    category === 'all'
      ? blogs
      : blogs.filter((blog) => blog.category === category);

  const sortedBlogs = filteredBlogs.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const latestBlog = sortedBlogs[0];

  if (!latestBlog) {
    return <p>No blogs available.</p>;
  }

  return (
    <div className="mb-[47px] text-start flex flex-col mx-auto md:flex-row justify-center bg-newGray-6 px-[8px] py-[10px] lg:p-[30px] w-full max-w-[290px] md:max-w-[1120px] rounded-sm md:rounded-[30px] items-center">
      <div
        key={latestBlog.id}
        className="flex-1 w-full max-w-[530px] order-2 md:order-1"
      >
        <Link
          to={`/public-communication/blogs-and-news/${latestBlog.category}/${latestBlog.name}`}
        >
          <h2 className="text-darkOrange-5 mb-2 lg:mb-6 mobile-h2 lg:desktop-h3">
            {latestBlog.title}
          </h2>
          <div className="flex flex-row space-x-5 mb-2 lg:mb-6 items-center">
            <span className="text-black font-medium lg:font-semibold text-sm lg:text-2xl">
              {latestBlog.author}
            </span>
            <span className="text-black lg:text-2xl font-medium lg:font-normal text-sm">
              {latestBlog.date
                ? formatDateSimple(latestBlog.date)
                : 'No date available'}
            </span>
          </div>
          {latestBlog.tags && (
            <div className="flex flex-row space-x-4 mb-2 lg:mb-5">
              {latestBlog.tags.map((tag, index) => (
                <span
                  className="text-black bg-newGray-4 py-0.5 px-2 lg:p-3.5 font-medium text-base lg:text-lg rounded-xl"
                  key={index}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div>
            <p className="text-black max-md:hidden line-clamp-3">
              {latestBlog.description}
            </p>
          </div>
        </Link>
      </div>
      <div className="mb-3 md:mr-5 lg:mr-0 lg:ml-5 lg:mb-0 lg:max-w-[510px] w-full flex-1 mx-auto order-1 md:order-2">
        <Link
          key={latestBlog.id}
          to={`/public-communication/blogs-and-news/${latestBlog.category}/${latestBlog.name}`}
        >
          <img
            className="rounded-sm lg:rounded-3xl"
            src={computeAssetCdnUrl(
              latestBlog.lastCommit,
              `${latestBlog.path}/assets/thumbnail.webp`,
            )}
            alt={latestBlog.title}
          />
        </Link>
      </div>
    </div>
  );
};
