import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { z } from 'zod';

import { Button, Loader, cn } from '@blms/ui';

import { PageLayout } from '#src/components/page-layout.js';
import { cdnUrl } from '#src/utils/index.js';
import { trpc } from '#src/utils/trpc.js';

import { FeaturedCard } from '#src/organisms/featured-card.js';
import { formatNameForURL } from '#src/utils/string.ts';
import BlogSidebar from '../../../-components/public-communication/blog-sidebar.tsx';
import Breadcrumbs from '../../../-components/public-communication/breadcrumbs.tsx';

const BlogMarkdownBody = React.lazy(
  () => import('../../../-components/public-communication/blog-markdown.tsx'),
);

export const Route = createFileRoute(
  '/$lang/_content/_misc/public-communication/blogs-and-news/article/$blogName-$blogId',
)({
  params: {
    parse: (params) => {
      const blogNameId = params['blogName-$blogId'];

      const blogId = blogNameId.slice(-36);
      const blogName = blogNameId.slice(0, -37);

      return {
        lang: z.string().parse(params.lang),
        'blogName-$blogId': `${blogName}-${blogId}`,
        blogName: z.string().parse(blogName),
        blogId: z.string().parse(blogId),
      };
    },
    stringify: ({ lang, blogName, blogId }) => ({
      lang: lang,
      'blogName-$blogId': `${blogName}-${blogId}`,
    }),
  },
  component: SingleBlogDetail,
});

function SingleBlogDetail() {
  const { t, i18n } = useTranslation();

  const params = Route.useParams();
  const blogId = params.blogId;

  const { data: blog, isFetched } = trpc.content.getBlog.useQuery({
    id: blogId,
    language: i18n.language,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (blog && params.blogName !== formatNameForURL(blog.title)) {
      navigate({
        to: `/public-communication/blogs-and-news/article/${formatNameForURL(blog.title)}-${blog.id}`,
      });
    }
  }, [blog, isFetched, navigate, params.bookName]);

  return (
    <PageLayout variant="light" footerVariant="light">
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
            <Link to="/public-communication">
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
