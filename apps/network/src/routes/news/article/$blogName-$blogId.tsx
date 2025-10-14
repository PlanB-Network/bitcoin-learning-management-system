import { formatNameForURL } from '@blms/shared';
import { Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import React, { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { NetworkButton } from '#src/components/network-button.tsx';
import PageBlock from '#src/components/page-block.tsx';
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
  const { t } = useTranslation();

  const params = Route.useParams();
  const blogId = params.blogId;

  const { data: blog, isFetched } = useQuery(
    trpc.content.getBlog.queryOptions({
      id: blogId,
      language: 'en',
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
    <>
      {!isFetched && <Loader size={'s'} />}
      {blog && (
        <PageBlock>
          <Breadcrumbs blogTitle={blog.title} />

          <div className="text-start flex flex-col mx-auto lg:mx-0 md:flex-row w-full justify-between align-top border-b-2 lg:border-b-0">
            <FeaturedCard blog={blog} variant="secondary" />
          </div>

          <div className="mx-auto lg:mx-0 gap-8 flex flex-col lg:flex-row">
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
              <NetworkButton variant="primary" className="group">
                {t('news.backToAll')}
              </NetworkButton>
            </Link>
          </div>
        </PageBlock>
      )}
    </>
  );
}
