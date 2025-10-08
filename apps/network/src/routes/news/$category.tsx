import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { PageLayout } from '#src/components/page-layout.tsx';
import { BlogList } from './-components/blog-list.tsx';

export const Route = createFileRoute('/news/$category')({
  component: BlogsCategory,
  params: {
    parse: (params) => ({
      category: z.string().parse(params.category),
    }),
    stringify: ({ category }) => ({
      category: `${category}`,
    }),
  },
});

function BlogsCategory() {
  return (
    <PageLayout>
      <div className="flex flex-row text-center lg:justify-start lg:text-start space-x-5 mt-5">
        <BlogList />
      </div>
    </PageLayout>
  );
}

export default BlogsCategory;
