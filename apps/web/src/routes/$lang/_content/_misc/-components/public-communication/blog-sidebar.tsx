import { formatMonthYear } from '@blms/api/src/utils/date.ts';
import { Link } from '@tanstack/react-router';
import type React from 'react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { IoIosArrowForward } from 'react-icons/io';
import MessageIcon from '../../../../../../assets/icons/icon-message.svg';

import { AppContext } from '#src/providers/context.js';

interface BlogSidebarProps {
  currentBlogId: number;
  currentCategory: string;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({
  currentBlogId,
  currentCategory,
}) => {
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
      <div className="flex flex-row items-center py-5 gap-5 border-b border-newGray-4">
        <img className="size-[35px] ml-2.5" src={MessageIcon} alt="" />

        <h3 className="text-black subtitle-large-18px capitalize">
          {t('publicCommunication.blogPageStrings.blogSidebarTitle', {
            category: currentCategory,
          })}
        </h3>
      </div>

      <ul className="text-black list-none">
        {filteredBlogs.map((blog) => (
          <li key={blog.id} className="flex flex-row items-center">
            <Link
              to={`/public-communication/blogs-and-news/${blog.category}/${blog.name}`}
              className="flex items-center justify-between py-3 text-start lg:px-2.5 w-full max-w-[354px]"
            >
              <div className="flex flex-row items-center max-w-[280px] lg:max-w-[380px]">
                <p className="subtitle-medium-16px text-gray-600 min-w-[73px]">
                  {formatMonthYear(new Date(blog.lastUpdated))}
                </p>
                <IoIosArrowForward size={16} className="text-black mx-1" />
                <p className="subtitle-medium-med-16px truncate min-w-[183px] max-w-52">
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
