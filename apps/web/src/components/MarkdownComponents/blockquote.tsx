import type { ReactNode } from 'react';

import QuoteLeft from '../../assets/icons/quote-left.svg';
import QuoteRight from '../../assets/icons/quote-right.svg';

export const Blockquote = ({
  children,
}: {
  children: ReactNode | Iterable<ReactNode>;
}) => {
  const filteredChildren = Array.isArray(children)
    ? children
        .slice(1, -1)
        .map((child) =>
          child && child.props && child.props.node.tagName === 'p'
            ? child.props.children
            : child === '\n'
              ? '\n\n'
              : child,
        )
    : children;

  return (
    <div className="p-2">
      <img src={QuoteLeft} alt="quote left" className="shrink-0 size-10" />
      <div className="lg:px-[73px]">
        <blockquote className="max-md:text-center text-base font-medium md:blockquote-desktop py-2.5 mx-2 md:mx-4 whitespace-pre-line break-words max-w-[650px]">
          {filteredChildren}
        </blockquote>
      </div>
      <img src={QuoteRight} alt="qoute right" className="ml-auto size-10" />
    </div>
  );
};
