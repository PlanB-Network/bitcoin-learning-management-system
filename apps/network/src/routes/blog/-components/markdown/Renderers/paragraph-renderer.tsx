import { cn } from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const paragraphStyles = cva('text-base tracking-wide', {
  defaultVariants: {
    intent: 'default',
  },
  variants: {
    intent: {
      blog: 'text-black mb-4 text-base tracking-wide md:text-justify text-start',
      conference: 'desktop-subtitle1 text-newGray-1',
      default: 'text-blue-950 body-16px',
      general: 'text-blue-950 text-base tracking-wide',
      glossary: 'mobile-body2 md:desktop-body1 text-black my-3 last:mb-0',
    },
  },
});

interface ParagraphRendererProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof paragraphStyles> {
  children?: React.ReactNode;
  className?: string;
  intent?: 'default' | 'blog' | 'conference' | 'general' | 'glossary';
}
export const ParagraphRenderer: React.FC<ParagraphRendererProps> = (props) => {
  const { children, intent } = props;

  const renderChild = async (child: React.ReactNode) => {
    return child;
  };

  if (Array.isArray(children)) {
    return (
      <div className={cn(paragraphStyles({ intent }))}>
        {children.map((child, index) => (
          <React.Fragment
            key={typeof child === 'string' ? child : `child-${index}`}
          >
            {renderChild(child)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(paragraphStyles({ intent }))}>
      {renderChild(children)}
    </div>
  );
};
