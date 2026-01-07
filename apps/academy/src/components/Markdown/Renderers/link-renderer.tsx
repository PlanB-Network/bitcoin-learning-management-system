import {
  cn,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CourseCard,
  HorizontalCourseCardDesktop,
} from '#src/patterns/course-card.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { useGlossary } from '#src/providers/glossaryContext.tsx';
import { TutorialCard } from '#src/routes/$lang/tutorials/-components/tutorial-card.tsx';
import { isTestnetOrDevelopmentEnvironment } from '#src/utils/misc.ts';
import { getCourse, getTutorial } from '../utils/link-preview.tsx';

const linkStyles = cva('text-base tracking-wide', {
  defaultVariants: {
    intent: 'default',
  },
  variants: {
    intent: {
      default: 'underline text-blue-500',
      general: 'text-blue-500',
      glossary:
        'text-yellow-600 border-b border-dotted border-yellow-600 cursor-help',
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

  // Detect glossary links (both relative and absolute URLs)
  const relativePath = href?.replace('https://planb.academy', '');
  const isGlossaryLink = relativePath?.startsWith('/resources/glossary/');

  if (isGlossaryLink && relativePath) {
    if (isTestnetOrDevelopmentEnvironment()) {
      return <GlossaryLink href={relativePath}>{children}</GlossaryLink>;
    }
    return <span>{children}</span>;
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

const GlossaryLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  const { t } = useTranslation();
  const { glossaryMap } = useGlossary();
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  // Extract term from URL
  const termSlug = href.split('/resources/glossary/')[1];

  // Convert slug to possible term formats (private-key -> private key)
  const termFromSlug = termSlug?.replaceAll('-', ' ').toLowerCase();
  const glossaryWord = glossaryMap.get(termFromSlug ?? '');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileModalOpen(true);
  };

  if (!glossaryWord) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={linkStyles({ intent: 'glossary' })}
      >
        {children}
      </a>
    );
  }

  // Helper to truncate at last complete word
  const truncateAtWord = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0
      ? `${truncated.slice(0, lastSpace)}...`
      : `${truncated}...`;
  };

  // Helper to remove markdown formatting
  const cleanMarkdown = (text: string) => {
    return text
      .replaceAll(/\*\*([^*]+)\*\*/g, '$1')
      .replaceAll(/\*([^*]+)\*/g, '$1')
      .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replaceAll(/#{1,6}\s/g, '')
      .replaceAll(/`([^`]+)`/g, '$1');
  };

  // Truncate definition for tooltip display (desktop)
  const truncatedDefinition = truncateAtWord(glossaryWord.definition, 400);
  const cleanDefinition = cleanMarkdown(truncatedDefinition);

  // Truncate for mobile (longer limit)
  const truncatedDefinitionMobile = truncateAtWord(
    glossaryWord.definition,
    600,
  );
  const cleanDefinitionMobile = cleanMarkdown(truncatedDefinitionMobile);

  // Check if definition was actually truncated
  const isTruncated = glossaryWord.definition.length > 600;

  return (
    <>
      {/* Desktop: Tooltip */}
      <div className="hidden md:inline">
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={linkStyles({ intent: 'glossary' })}
              >
                {children}
              </a>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={12}
              className="group max-w-md bg-yellow-50 p-3 z-100 relative overflow-visible! border-0! [box-shadow:0_4px_12px_0_rgba(99,65,13,0.3)]"
            >
              <div className="space-y-1 relative z-10">
                <p className="font-semibold text-yellow-900">
                  {glossaryWord.term}
                </p>
                <p className="text-sm text-yellow-900 leading-relaxed">
                  {cleanDefinition}
                </p>
              </div>
              {/* Arrow pointing down (when tooltip is on top) */}
              <svg
                width="17"
                height="13"
                viewBox="0 0 17 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-0 filter-[drop-shadow(0_7px_4px_rgba(99,65,13,0.3))] group-data-[side=bottom]:hidden group-data-[side=left]:hidden group-data-[side=right]:hidden"
              >
                <path
                  d="M6.42833 11.0968C7.14004 12.3253 8.91392 12.3253 9.62563 11.0968L16.054 -4.88758e-06H0L6.42833 11.0968Z"
                  fill="#FEF1DA"
                />
              </svg>
              {/* Arrow pointing up (when tooltip is on bottom) */}
              <svg
                width="17"
                height="13"
                viewBox="0 0 17 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="absolute -top-3 left-1/2 -translate-x-1/2 z-0 rotate-180 group-data-[side=top]:hidden group-data-[side=left]:hidden group-data-[side=right]:hidden"
              >
                <path
                  d="M6.42833 11.0968C7.14004 12.3253 8.91392 12.3253 9.62563 11.0968L16.054 -4.88758e-06H0L6.42833 11.0968Z"
                  fill="#FEF1DA"
                />
              </svg>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Mobile: Click to open modal */}
      <button
        type="button"
        onClick={handleClick}
        className={cn(linkStyles({ intent: 'glossary' }), 'md:hidden')}
        aria-label={`${t('words.view')} ${glossaryWord.term}`}
      >
        {children}
      </button>

      {/* Mobile modal */}
      {mobileModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-190 md:hidden"
            onClick={() => setMobileModalOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setMobileModalOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="glossary-term-title"
            className="fixed bottom-0 left-0 right-0 z-200 md:hidden bg-yellow-50 p-4 pb-8 rounded-t-2xl [box-shadow:0_4px_12px_0_rgba(99,65,13,0.3)] max-h-[80vh] flex flex-col"
            onKeyDown={(e) => e.key === 'Escape' && setMobileModalOpen(false)}
          >
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <p
                id="glossary-term-title"
                className="font-semibold text-yellow-900 text-lg"
              >
                {glossaryWord.term}
              </p>
              <button
                type="button"
                onClick={() => setMobileModalOpen(false)}
                className="text-yellow-700 bg-yellow-100 p-1.5 rounded-md flex-shrink-0"
                aria-label={t('words.close')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <p className="text-sm text-yellow-900 leading-relaxed">
                {cleanDefinitionMobile}
              </p>
              {isTruncated && (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-yellow-700 font-medium text-sm mt-2 inline-block underline"
                  onClick={() => setMobileModalOpen(false)}
                >
                  {t('words.viewMore')}
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
