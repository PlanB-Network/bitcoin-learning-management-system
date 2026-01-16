import { formatNameForURL } from '@blms/shared';
import { DividerSimple, Image, Loader } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { Suspense, useEffect } from 'react';
import { z } from 'zod';
import PageBlock from '#src/components/page-block.tsx';
import {
  cdnUrl,
  formatDate,
  getNameAndIdFromUrl,
  resourceImgUrl,
} from '#src/utils/misc.tsx';
import { trpc } from '#src/utils/trpc.js';
import BlogSidebar from '../-components/blog-sidebar.tsx';
import Breadcrumbs from '../-components/breadcrumbs.tsx';

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
  staticData: {
    layoutVariant: 'light',
  },
});

function SingleBlogDetail() {
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
        <PageBlock variant="blog" withXPadding={false} withYPadding={false}>
          <Breadcrumbs />

          <Image
            className="rounded-2xl mx-auto max-h-[244px] md:max-h-[382px] w-full object-cover"
            src={resourceImgUrl(blog)}
            alt={blog.title}
            loading="lazy"
            breakpoints={{ default: 1400 }}
          />

          <div className="flex flex-col gap-5.5 max-md:mb-8">
            <h1 className="display-small md:title-extra-large mt-6">
              {blog.title}
            </h1>
            {blog.author && (
              <div className="flex items-center gap-2.5">
                <span className="body-base-bold md:title-medium text-neutral-800">
                  {blog.author}
                </span>
                {blog.date && (
                  <>
                    <span className="text-neutral-500 body-base md:title-base">
                      •
                    </span>
                    <span className="text-neutral-500 body-base md:title-base">
                      {formatDate(blog.date)}
                    </span>
                  </>
                )}
              </div>
            )}
            <p className="body-base">{blog.description}</p>
          </div>

          <DividerSimple className="my-6 max-md:hidden" />

          <div className="flex flex-col max-md:mb-15">
            <Suspense fallback={<Loader variant="black" size={'s'} />}>
              <BlogMarkdownBody
                content={blog.rawContent}
                assetPrefix={cdnUrl(blog.path)}
                blogs={[]}
              />
            </Suspense>
          </div>

          <DividerSimple className="my-15 max-md:hidden" />

          <BlogSidebar
            currentBlogId={blog.id}
            currentCategory={blog.category}
          />
        </PageBlock>
      )}
    </>
  );
}
