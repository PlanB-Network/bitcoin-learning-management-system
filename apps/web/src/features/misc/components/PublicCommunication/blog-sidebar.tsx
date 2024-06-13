import { Link } from '@tanstack/react-router';
import type React from 'react';
import { IoIosArrowForward } from 'react-icons/io';

import Book from '#src/assets/icons/book.svg';
import { useGreater } from '#src/hooks/use-greater.ts';

import type { BlogBlock } from './data.ts';

interface BlogSidebarProps {
  blogList: BlogBlock[];
  currentBlogId: string;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({
  blogList,
  currentBlogId,
}) => {
  const isScreenMd = useGreater('md');

  return (
    <div className="hidden md:block mx-auto bg-newGray-6 p-[10px] rounded-[16px]">
      <div className="flex flex-row items-center py-5">
        <img
          src={Book}
          alt="Book Icon"
          width={35}
          height={35}
          className="ml-[10px] mr-5"
        />
        <h3 className="text-black mobile-h3 text-3xl font-bold uppercase">
          Previous Posts
        </h3>
      </div>

      <ul className="text-black list-none p-0">
        {blogList.map((blog, index) => {
          if (blog.id === currentBlogId) {
            return null;
          }

          return (
            <li key={index} className="flex flex-row items-center">
              <Link
                to={`/blogs/${blog.id}`}
                className="flex items-center justify-between border-t-2 py-[12px] border-t-gray-600 text-start"
              >
                <div className="flex flex-row">
                  <p className="text-sm text-gray-600">
                    {blog.createdAt.toLocaleDateString()}
                  </p>
                  <IoIosArrowForward
                    size={isScreenMd ? 24 : 16}
                    className="text-black mx-[6px]"
                  />
                  <p className="text-sm font-medium">{blog.title}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BlogSidebar;
