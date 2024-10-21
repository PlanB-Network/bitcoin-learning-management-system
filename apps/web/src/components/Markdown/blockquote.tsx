import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { ImQuotesLeft, ImQuotesRight } from 'react-icons/im';

import { cn } from '@blms/ui';

const blockQuoteVariants = cva(
  'max-md:text-center text-base font-medium md:blockquote-desktop py-2.5 mx-2 md:mx-4 whitespace-pre-line break-words max-w-[650px]',
  {
    variants: {
      mode: {
        dark: '!text-white',
        light: '!text-black',
      },
    },
  },
);

const quoteVariants = cva('', {
  variants: {
    mode: {
      dark: '!text-white',
      light: '!text-black',
    },
  },
});

export const Blockquote = ({
  children,
  mode,
}: {
  children: ReactNode | Iterable<ReactNode>;
  mode: 'light' | 'dark';
}) => {
  const filteredChildren = Array.isArray(children)
    ? children.slice(1, -1).map((child) => {
        if (
          child &&
          child.props &&
          child.props.node &&
          child.props.node.tagName === 'p'
        ) {
          return child.props.children;
        }
        return child === '\n' ? '\n\n' : child;
      })
    : children;

  return (
    <div className="p-2">
      <ImQuotesLeft size={40} className={quoteVariants({ mode })} />
      <div className="lg:px-[73px]">
        <blockquote className={blockQuoteVariants({ mode })}>
          {filteredChildren}
        </blockquote>
      </div>
      <ImQuotesRight
        size={40}
        className={cn('ml-auto', quoteVariants({ mode }))}
      />
    </div>
  );
};
