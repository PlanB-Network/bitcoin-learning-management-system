import { formatNameForURL } from '@blms/shared';
import { Image } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { TbChevronRight } from 'react-icons/tb';
import PaperIcon from '#src/assets/icons/paper-sheet.svg';
import { formatMonthAndYear } from '#src/utils/misc.tsx';
import { trpc } from '#src/utils/trpc.ts';

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

  const filteredBlogs = blogs
    .filter(
      (blog) =>
        blog.id !== currentBlogId &&
        (currentCategory === 'all' || blog.category === currentCategory),
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      return dateB - dateA;
    })
    .slice(0, 10);

  return (
    <div className="w-full mx-auto md:p-2 rounded-2xl border border-neutral-50 overflow-hidden">
      <div className="flex flex-row items-center p-4 gap-4">
        <Image
          className="h-8"
          src={PaperIcon}
          alt=""
          loading="lazy"
          breakpoints={{ default: 120 }}
        />
        <span className="title-small md:title-medium text-orange-500">
          {t('news.continueReading')}
        </span>
      </div>

      <ul className="list-none flex flex-col w-full">
        {filteredBlogs.map((blog) => (
          <li
            key={blog.id}
            className="w-full border-b border-neutral-50 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl overflow-hidden"
          >
            <Link
              to={`/news/article/${formatNameForURL(blog.title)}-${blog.id}`}
              className="flex items-center w-full py-3 px-4 hover:bg-neutral-50 text-neutral-900 hover:text-orange-500"
            >
              <div className="flex flex-row items-center justify-between w-full gap-4">
                <p className="body-base-bold md:title-base truncate">
                  {blog.title}
                </p>
                <span className="flex items-center gap-2 shrink-0">
                  <p className="body-small text-neutral-300 max-md:hidden">
                    {formatMonthAndYear(new Date(blog.date))}
                  </p>
                  <TbChevronRight className="text-neutral-100 size-4 md:size-6" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogSidebar;
