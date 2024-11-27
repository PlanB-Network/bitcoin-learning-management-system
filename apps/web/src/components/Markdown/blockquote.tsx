import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { ImQuotesLeft, ImQuotesRight } from 'react-icons/im';

import { cn } from '@blms/ui';

const blockQuoteVariants = cva(
  'text-center subtitle-small-med-14px md:subtitle-medium-med-16px py-2.5 mx-4 md:mx-8 whitespace-pre-line break-words max-w-[736px]',
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
    <section>
      <ImQuotesLeft size={35} className={quoteVariants({ mode })} />
      <div>
        <blockquote className={blockQuoteVariants({ mode })}>
          {filteredChildren}
        </blockquote>
      </div>
      <ImQuotesRight
        size={35}
        className={cn('ml-auto', quoteVariants({ mode }))}
      />
    </section>
  );
};
