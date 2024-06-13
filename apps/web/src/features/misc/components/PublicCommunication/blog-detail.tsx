import { useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@sovereign-university/ui';

import { PageLayout } from '#src/components/PageLayout/index.tsx';

import BlogSidebar from './blog-sidebar.tsx';
import { blogList } from './data.ts';

const goBack = () => {
  window.history.back();
};

export const BlogDetail = () => {
  const { blogId } = useParams({
    from: '/blogs/$blogId',
  });
  const { t } = useTranslation();
  const blog = blogList.content.find((blog) => blog.id === blogId);

  if (!blog) {
    return <div>Blog not found.</div>;
  }

  return (
    <PageLayout
      variant="light"
      footerVariant="light"
      title={t('publicCommunication.title')}
      description={t('publicCommunication.description')}
    >
      <div className="container mx-auto gap-[60px] flex flex-row mt-20">
        <div className="flex flex-col flex-1">
          <h4 className="text-black mobile-h3 lg:desktop-h4 mb-[16px]">
            {blog.title}
          </h4>
          <div className="mb-4">
            <p className="text-black font-medium">By Author: {blog.author}</p>
            <p className="text-black font-medium">
              {blog.createdAt.toLocaleDateString()}
            </p>
          </div>

          <p className="text-black mb-10">{blog.content}</p>
          <div className="w-max-[135px]">
            <Button
              className="w-auto justify-start"
              variant="newPrimary"
              mode="dark"
              onClick={goBack}
            >
              Go back
            </Button>
          </div>
        </div>
        <div className="max-w-[420px] flex-1">
          <BlogSidebar blogList={blogList.content} currentBlogId={blog.id} />
        </div>
      </div>
    </PageLayout>
  );
};
