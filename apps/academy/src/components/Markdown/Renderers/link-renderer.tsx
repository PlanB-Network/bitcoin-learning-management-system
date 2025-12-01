import {
  cn,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CourseCard,
  HorizontalCourseCardDesktop,
} from '#src/patterns/course-card.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { useGlossary } from '#src/providers/glossaryContext.tsx';
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
      glossary:
        'text-darkOrange-5 border-b border-dotted border-darkOrange-5 cursor-help',
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

  // Auto-detect glossary links
  if (href?.startsWith('/resources/glossary/')) {
    return <GlossaryLink href={href}>{children}</GlossaryLink>;
  }

  return (
    <a
      href={href}
      target="_blank"
      className={cn(linkStyles({ intent: intent ?? 'default' }))}
      rel="noreferrer"
    >
      {children}
    </a>
  );
};

/**
 * Glossary link with tooltip showing definition
 */
const GlossaryLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  const { t } = useTranslation();
  const { glossaryMap } = useGlossary();

  // Extract term from URL: /resources/glossary/private-key -> private-key
  const termSlug = href.split('/resources/glossary/')[1];

  // Try to find the term in glossary map
  // Convert slug to possible term formats (private-key -> private key)
  const termFromSlug = termSlug?.replaceAll('-', ' ').toLowerCase();
  const glossaryWord = glossaryMap.get(termFromSlug ?? '');

  const link = (
    <a href={href} className={linkStyles({ intent: 'glossary' })}>
      {children}
    </a>
  );

  // If no glossary word found, just render the link
  if (!glossaryWord) {
    return link;
  }

  // Truncate definition for tooltip display
  const truncatedDefinition =
    glossaryWord.definition.length > 200
      ? `${glossaryWord.definition.slice(0, 200)}...`
      : glossaryWord.definition;

  // Remove markdown formatting for tooltip
  const cleanDefinition = truncatedDefinition
    .replaceAll(/\*\*([^*]+)\*\*/g, '$1')
    .replaceAll(/\*([^*]+)\*/g, '$1')
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replaceAll(/#{1,6}\s/g, '')
    .replaceAll(/`([^`]+)`/g, '$1');

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs bg-white border border-newGray-3 shadow-lg p-3 z-[100]"
        >
          <div className="space-y-2">
            <p className="font-semibold text-darkOrange-5">
              {glossaryWord.term}
            </p>
            <p className="text-sm text-newBlack-3 leading-relaxed">
              {cleanDefinition}
            </p>
            <p className="text-xs text-darkOrange-5">
              {t('glossary.learnMore')} →
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
