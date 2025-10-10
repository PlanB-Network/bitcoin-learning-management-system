import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
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
    <div className="flex flex-row text-center lg:justify-start lg:text-start space-x-5 mt-5">
      <BlogList />
    </div>
  );
}

export default BlogsCategory;
