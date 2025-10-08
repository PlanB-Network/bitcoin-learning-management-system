import { formatNameForURL } from '@blms/shared';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { IoIosArrowForward } from 'react-icons/io';
import { formatMonthAndYear } from '#src/utils/misc.tsx';
import { trpc } from '#src/utils/trpc.ts';

// import MessageIcon from '../../../../../../assets/icons/icon-message.svg';

interface BlogSidebarProps {
  currentBlogId: string;
  currentCategory: string;
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({
  currentBlogId,
  currentCategory,
}) => {
  const { t } = useTranslation();
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

  if (!blogs) {
    return null;
  }

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.id !== currentBlogId &&
      (currentCategory === 'all' || blog.category === currentCategory),
  );

  return (
    <div className="mx-auto p-2.5 rounded-2xl">
      <div className="flex flex-row items-center py-5 gap-5 border-b border-newGray-4">
        <h3 className="text-black subtitle-large-18px capitalize">
          {t('news.previousNews')}
        </h3>
      </div>

      <ul className="list-none">
        {filteredBlogs.map((blog) => (
          <li key={blog.id} className="flex flex-row items-center">
            <Link
              to={`/news/article/${formatNameForURL(blog.title)}-${blog.id}`}
              className="flex items-center justify-between py-3 text-start lg:px-2.5 w-full max-w-[354px]"
            >
              <div className="flex flex-row items-center max-w-[280px] lg:max-w-[380px]">
                <p className="subtitle-medium-16px text-gray-600 min-w-[77px]">
                  {formatMonthAndYear(new Date(blog.date))}
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
