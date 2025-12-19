import type { JoinedBlogLight } from '@blms/types';
import { cn, Image } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { CourseCard } from '#src/components/blog/course-card.js';
import { TutorialCard } from '#src/components/blog/tutorial-card.js';
import { getBlog, getCourse, getTutorial } from '#src/utils/link-preview.tsx';
import { resourceImgUrl } from '#src/utils/misc.tsx';
import { trpc } from '#src/utils/trpc.ts';

const linkStyles = cva('text-base tracking-wide', {
  defaultVariants: {
    intent: 'default',
  },
  variants: {
    intent: {
      default: 'underline text-blue-500',
      general: 'text-blue-500',
      glossary: 'underline text-orange-500 hover:font-medium',
    },
  },
});

interface LinkRendererProps
  extends React.HTMLAttributes<HTMLLinkElement>,
    VariantProps<typeof linkStyles> {
  children?: React.ReactNode;
  href?: string;
  intent?: 'default' | 'general' | 'glossary';
  blogs?: JoinedBlogLight[];
}

export const LinkRenderer: React.FC<LinkRendererProps> = (props) => {
  const { children, href, intent, blogs } = props;

  const { data: courses } = useQuery(
    trpc.content.getCourses.queryOptions(
      {
        language: 'en',
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  const { data: tutorials } = useQuery(
    trpc.content.getTutorials.queryOptions(
      {
        language: 'en',
      },
      {
        staleTime: 300_000, // 5 minutes
      },
    ),
  );

  if (href && children === href) {
    const tutorial = getTutorial(href, tutorials ?? []);
    if (tutorial) {
      return <TutorialCard tutorial={tutorial} addMargin />;
    }
    const course = getCourse(href, courses ?? []);
    if (course) {
      return (
        <div className="w-full max-w-[500px] md:max-w-[340px] max-md:mx-auto py-2 md:py-1 md:mx-2 md:inline-block md:overflow-hidden">
          <CourseCard course={course} mode="light" />
        </div>
      );
    }

    const blog = getBlog(href, blogs);
    if (blog) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex max-md:flex-col items-center w-full bg-neutral-50 shadow-course-navigation border border-neutral-100 rounded-[20px] p-4 gap-6 max-md:max-w-96"
        >
          <Image
            src={resourceImgUrl(blog)}
            alt={blog.category}
            className="size-20 rounded-full"
            loading="lazy"
            breakpoints={{ default: 200 }}
          />
          <div className="flex flex-col max-md:text-center">
            <p className="text-neutral-800 text-xs font-light mb-2">
              {blog.description}
            </p>
            <div className="flex gap-4 max-md:justify-center">
              {blog.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-[rgba(204,204,204,0.5)] px-2 py-1 rounded-md desktop-typo1 text-neutral-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </a>
      );
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      className={cn(linkStyles({ intent }))}
      rel="noreferrer"
    >
      {children}
    </a>
  );
};
