import { Link } from '@tanstack/react-router';
import type React from 'react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBookBookmark } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';

import { formatMonthYear } from '@blms/api/src/utils/date.ts';

import { useGreater } from '#src/hooks/use-greater.ts';
import { AppContext } from '#src/providers/context.js';

interface BlogSidebarProps {
  currentBlogId: number;
  currentCategory: string;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({
  currentBlogId,
  currentCategory,
}) => {
  const isScreenMd = useGreater('md');
  const { t } = useTranslation();
  const { blogs } = useContext(AppContext);

  if (!blogs) {
    return null;
  }

  const filteredBlogs = blogs.filter(
    (blog) => blog.id !== currentBlogId && blog.category === currentCategory,
  );

  return (
    <div className="mx-auto bg-newGray-6 p-2.5 rounded-2xl">
      <div className="flex flex-row items-center py-5">
        <FaBookBookmark size={24} className="text-black me-2.5 p-0.5" />

        <h3 className="text-black text-lg font-bold">
          {t('publicCommunication.blogPageStrings.blogSidebarTitle')}
        </h3>
      </div>

      <ul className="text-black list-none">
        {filteredBlogs.map((blog) => (
          <li key={blog.id} className="flex flex-row items-center">
            <Link
              to={`/public-communication/blogs-and-news/${blog.category}/${blog.name}`}
              className="flex items-center justify-between border-t-2 py-3 border-t-gray-600 text-start lg:px-2.5 w-full max-w-[354px]"
            >
              <div className="flex flex-row items-center max-w-[280px] lg:max-w-[380px]">
                <p className="text-sm text-gray-600 min-w-[73px]">
                  {formatMonthYear(new Date(blog.lastUpdated))}
                </p>
                <IoIosArrowForward
                  size={isScreenMd ? 24 : 16}
                  className="text-black mx-1.5"
                />
                <p className="text-sm font-medium truncate min-w-[183px] max-w-56">
                  {blog.title}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogSidebar;
