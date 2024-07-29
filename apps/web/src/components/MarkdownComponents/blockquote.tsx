import type { ReactNode } from 'react';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa6';

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

  console.log(filteredChildren);

  return (
    <div className="flex p-2 rounded-lg bg-newGray-5">
      <FaQuoteLeft className="shrink-0 size-2 md:size-4" />
      <blockquote className="max-md:text-center mobile-body2 md:desktop-body1 mx-2 md:mx-4 italic whitespace-pre-line">
        {filteredChildren}
      </blockquote>
      <FaQuoteRight className="self-end shrink-0 size-2 md:size-4" />
    </div>
  );
};
