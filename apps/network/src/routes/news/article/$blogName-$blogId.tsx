import { formatNameForURL } from '@blms/shared';
import { Button, cn, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import React, { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.js';
import { cdnUrl, getNameAndIdFromUrl } from '#src/utils/misc.tsx';
import { trpc } from '#src/utils/trpc.js';
import BlogSidebar from '../-components/blog-sidebar.tsx';
import Breadcrumbs from '../-components/breadcrumbs.tsx';
import { FeaturedCard } from '../-components/featured-card.tsx';

const BlogMarkdownBody = React.lazy(
  () => import('#src/routes/news/-components/markdown/blog-markdown-body.tsx'),
);

export const Route = createFileRoute('/news/article/$blogName-$blogId')({
  component: SingleBlogDetail,
  params: {
    parse: (params) => {
      const paramNameId = params['blogName-$blogId'];
      const { id, name } = getNameAndIdFromUrl(paramNameId);

      return {
        blogId: z.string().parse(id),
        blogName: z.string().parse(name),
        'blogName-$blogId': `${name}-${id}`,
      };
    },
    stringify: ({ blogName, blogId }) => ({
      'blogName-$blogId': `${blogName}-${blogId}`,
    }),
  },
});

function SingleBlogDetail() {
  const { t, i18n } = useTranslation();

  const params = Route.useParams();
  const blogId = params.blogId;

  const { data: blog, isFetched } = useQuery(
    trpc.content.getBlog.queryOptions({
      id: blogId,
      language: i18n.language,
    }),
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (blog && params.blogName !== formatNameForURL(blog.title)) {
      navigate({
        replace: true,
        to: `/news/article/${formatNameForURL(blog.title)}-${blog.id}`,
      });
    }
  }, [blog, navigate, params.blogName]);

  return (
    <PageLayout>
      {!isFetched && <Loader size={'s'} />}
      {blog && (
        <>
          <Breadcrumbs blogTitle={blog.title} />

          <div className="text-start flex flex-col mx-auto lg:mx-0 md:flex-row w-full justify-between md:max-w-[1120px] align-top border-b-2 lg:border-b-0">
            <FeaturedCard category={blog.category} blog={blog} />
          </div>

          <div className="mx-auto lg:mx-0 gap-8 flex flex-col lg:flex-row md:max-w-[1120px]">
            <div className="flex flex-col flex-1 border-b-2 md:border-b-0 py-4 lg:py-0">
              <Suspense fallback={<Loader variant="black" size={'s'} />}>
                <BlogMarkdownBody
                  content={blog.rawContent}
                  assetPrefix={cdnUrl(blog.path)}
                  blogs={[]}
                />
              </Suspense>
            </div>
            <div className="max-w-[300px] mx-auto lg:max-w-[336px] flex-1">
              <BlogSidebar
                currentBlogId={blog.id}
                currentCategory={blog.category}
              />
            </div>
          </div>
          <div className="flex w-max-[135px] mt-6 max-md:justify-center">
            <Link to="/news">
              <Button variant="primary" className="group">
                <FaArrowLeftLong
                  className={cn(
                    'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width,opacity] overflow-hidden ease-in-out duration-150',
                    'group-hover:max-w-96 group-hover:opacity-100 group-hover:mr-3',
                  )}
                />
                {t('publicCommunication.goBackButtons.simpleGoBack')}
              </Button>
            </Link>
          </div>
        </>
      )}
    </PageLayout>
  );
}
