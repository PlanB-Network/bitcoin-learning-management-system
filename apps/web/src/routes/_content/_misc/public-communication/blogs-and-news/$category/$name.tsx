import { Link, createFileRoute } from '@tanstack/react-router';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { z } from 'zod';

import { formatDateSimple } from '@blms/api/src/utils/date.ts';
import { Button, Loader, TextTag, cn } from '@blms/ui';

import { PageLayout } from '#src/components/page-layout.js';
import { assetUrl, cdnUrl } from '#src/utils/index.js';
import { trpc } from '#src/utils/trpc.js';

import BlogSidebar from '../../../-components/public-communication/blog-sidebar.tsx';
import Breadcrumbs from '../../../-components/public-communication/breadcrumbs.tsx';

// eslint-disable-next-line import/no-named-as-default-member
const BlogMarkdownBody = React.lazy(
  () => import('../../../-components/public-communication/blog-markdown.tsx'),
);

export const Route = createFileRoute(
  '/_content/_misc/public-communication/blogs-and-news/$category/$name',
)({
  params: {
    parse: (params) => ({
      category: z.string().parse(params.category),
      name: z.string().parse(params.name),
    }),
    stringify: ({ category, name }) => ({
      category: `${category}`,
      name: `${name}`,
    }),
  },
  component: SingleBlogDetail,
});

function SingleBlogDetail() {
  const { t, i18n } = useTranslation();

  const params = Route.useParams();
  const name = params.name;
  const category = params.category;

  const { data: blog, isFetched } = trpc.content.getBlog.useQuery({
    name,
    category,
    language: i18n.language,
  });

  if (isFetched && !blog) {
    return (
      <div>{t('publicCommunication.blogPageStrings.errorMessageNotFound')}</div>
    );
  }

  return (
    <PageLayout variant="light" footerVariant="light">
      {!isFetched && <Loader size={'s'} />}
      {blog && (
        <>
          <Breadcrumbs blogTitle={blog.title} />
          <div className="text-start flex flex-col mx-auto lg:mx-0 md:flex-row w-full justify-between md:max-w-[1120px] align-top border-b-2 lg:border-b-0">
            <div className="flex-1 w-full max-w-[530px] order-2 md:order-1">
              <div className="pt-2.5 pb-4 lg:py-8">
                <h2 className="text-black md:text-darkOrange-5 font-semibold md:font-normal mb-2 lg:mb-6 text-2xl md:text-5xl">
                  {blog.title}
                </h2>
                <div className="flex flex-row md:flex-col mb-2.5 md:mb-6">
                  <span className="text-black font-medium lg:font-normal text-base lg:text-3xl md:mb-5">
                    {blog.author}
                  </span>
                  <span className="text-black lg:text-2xl font-medium lg:font-normal text-base max-md:ml-2">
                    {blog.date
                      ? formatDateSimple(blog.date)
                      : 'Date not available!'}
                  </span>
                </div>
                {blog.tags && (
                  <div className="flex flex-row gap-[15px]">
                    {blog.tags.map((tag, index) => (
                      <TextTag
                        key={index}
                        variant="grey"
                        className="capitalize"
                      >
                        {tag}
                      </TextTag>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-3 md:mr-5 lg:mr-0 lg:ml-5 lg:mb-0 lg:max-w-[510px] w-full flex-1 mx-auto order-1 md:order-2">
              <div>
                <img
                  src={assetUrl(blog.path, 'thumbnail.webp')}
                  alt={blog.title}
                  className="rounded-3xl lg:p-8"
                />
              </div>
            </div>
          </div>

          <div className="mx-auto lg:mx-0 gap-8 flex flex-col lg:flex-row md:max-w-[1120px]">
            <div className="flex flex-col flex-1 border-b-2 md:border-b-0 lg:mb-12 py-4 lg:py-0">
              <Suspense fallback={<Loader variant="black" size={'s'} />}>
                <BlogMarkdownBody
                  content={blog.rawContent}
                  assetPrefix={cdnUrl(blog.path)}
                  blogs={[]}
                />
              </Suspense>

              <div className="w-max-[135px] hidden md:flex lg:mt-32">
                <Link to="/public-communication">
                  <Button variant="primary">
                    <FaArrowLeftLong
                      className={cn(
                        'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                        'group-hover:mr-3',
                      )}
                    />
                    {t('publicCommunication.goBackButtons.simpleGoBack')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="max-w-[300px] mx-auto lg:max-w-[400px] flex-1">
              <BlogSidebar
                currentBlogId={blog.id}
                currentCategory={blog.category}
              />{' '}
            </div>
            <div className="flex md:hidden w-max-[135px] justify-center">
              <Link to="/public-communication">
                <Button variant="primary">
                  <FaArrowLeftLong
                    className={cn(
                      'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                      'group-hover:mr-3',
                    )}
                  />
                  {t('publicCommunication.goBackButtons.simpleGoBack')}
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}
