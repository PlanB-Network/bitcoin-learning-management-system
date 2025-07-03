import type { JoinedBlogLight } from '@blms/types';
import { cn } from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { useContext } from 'react';
import { CourseCard } from '#src/patterns/course-card.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { TutorialCard } from '#src/routes/$lang/_content/tutorials/-components/tutorial-card.tsx';
import { resourceImgUrl } from '#src/utils/index.ts';
import { getBlog, getCourse, getTutorial } from '../utils/link-preview.tsx';

const linkStyles = cva('text-base tracking-wide', {
  defaultVariants: {
    intent: 'default',
  },
  variants: {
    intent: {
      default: 'underline text-newBlue-1 font-[450]',
      general: 'text-blue-500 font-[450]',
      glossary: 'underline text-darkOrange-5 hover:font-medium',
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
  const { courses, tutorials } = useContext(AppContext);

  if (href && children === href) {
    const tutorial = getTutorial(href, tutorials ?? []);
    if (tutorial) {
      return <TutorialCard tutorial={tutorial} href={href} addMargin />;
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
          className="flex max-md:flex-col items-center w-full bg-newGray-6 shadow-course-navigation border border-newGray-5 rounded-[20px] p-4 gap-6 max-md:max-w-96"
        >
          <img
            src={resourceImgUrl(blog)}
            alt={blog.category}
            className="size-20 rounded-full"
          />
          <div className="flex flex-col max-md:text-center">
            <p className="text-newBlack-3 text-xs font-light mb-2">
              {blog.description}
            </p>
            <div className="flex gap-4 max-md:justify-center">
              {blog.tags?.map((tag) => (
                <span
                  key={tag}
                  className="bg-[rgba(204,204,204,0.5)] px-2 py-1 rounded-md desktop-typo1 text-newBlack-3"
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
