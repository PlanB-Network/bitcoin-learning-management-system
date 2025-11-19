import { cn } from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { useContext } from 'react';
import {
  CourseCard,
  HorizontalCourseCardDesktop,
} from '#src/patterns/course-card.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { TutorialCard } from '#src/routes/$lang/tutorials/-components/tutorial-card.tsx';
import { getCourse, getTutorial } from '../utils/link-preview.tsx';

const linkStyles = cva('text-base tracking-wide', {
  defaultVariants: {
    intent: 'default',
  },
  variants: {
    intent: {
      default: 'underline text-newBlue-1',
      general: 'text-blue-500',
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
}

export const LinkRenderer: React.FC<LinkRendererProps> = (props) => {
  const { children, href, intent } = props;
  const { courses, tutorials } = useContext(AppContext);

  if (href && children === href) {
    const tutorial = getTutorial(href, tutorials ?? []);
    if (tutorial) {
      return (
        <TutorialCard tutorial={tutorial} addMargin addBorder openInNewTab />
      );
    }
    const course = getCourse(href, courses ?? []);
    if (course) {
      return (
        <div className="w-full py-2 md:py-2">
          <CourseCard
            course={course}
            mode="light"
            className="md:hidden"
            openInNewTab
          />
          <HorizontalCourseCardDesktop
            course={course}
            className="max-md:hidden"
            openInNewTab
          />
        </div>
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
