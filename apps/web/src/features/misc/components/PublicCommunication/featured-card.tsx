import { Link } from '@tanstack/react-router';

import type { BlogBlock } from './data.ts';

export const FeaturedCard = ({ blog }: { blog: BlogBlock }) => {
  return (
    <div className="mb-[47px] text-start flex flex-col mx-auto lg:mx-0 md:flex-row justify-center bg-newGray-6 px-[8px] py-[10px] lg:p-[30px] w-full max-w-[290px] md:max-w-[1120px] rounded-sm lg:rounded-[30px] items-center">
      <div className="flex-1 w-full max-w-[530px] order-2 lg:order-1">
        <Link to={`/blogs/${blog.id}`}>
          <h2 className="text-darkOrange-5 mb-[8px] lg:mb-[22px]  mobile-h3 lg:desktop-h3">
            {blog.title}
          </h2>
          <div className="flex flex-row space-x-[20px] mb-[8px] lg:mb-[22px] ">
            <span className="text-black font-medium lg:font-semibold text-[16px] leading-[24px] lg:text-[24px] lg:leading-[32px]">
              {blog.author}
            </span>
            <span className="text-black lg:text-[24px] lg:leading-[32px] font-medium lg:font-normal text-[16px] leading-[24px]">
              {blog.createdAt.toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-row space-x-[15px] mb-[8px] lg:mb-[22px] ">
            {blog.tags.map((item, index) => (
              <span
                className="text-black bg-newGray-4 py-[2px] px-[8px] lg:p-[14px] font-medium text-[16px] lg:text-[18px] leading-[16px] rounded-[10px]"
                key={index}
              >
                {item}
              </span>
            ))}
          </div>
          <div>
            <p className="text-black hidden md:flex">{blog.excerpt}</p>
          </div>
        </Link>
      </div>
      <div className="mb-3 md:mr-[20px] lg:mr-0 lg:ml-[20px] lg:mb-0 lg:max-w-[510px w-full flex-1 mx-auto order-1 lg:order-2">
        <Link to={`/blogs/${blog.id}`}>
          <img
            className="rounded-sm lg:rounded-[20px]"
            src={blog.featuredImage}
            alt={blog.title}
          />
        </Link>
      </div>
    </div>
  );
};
