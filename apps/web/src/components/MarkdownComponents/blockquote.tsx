import type { ReactNode } from 'react';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa6';

export const Blockquote = ({
  children,
}: {
  children: ReactNode | Iterable<ReactNode>;
}) => {
  const textChildren = Array.isArray(children)
    ? children.map((child) => {
        if (typeof child === 'object' && child.props) {
          return child.props.children;
        }

        return child;
      })
    : [children];

  return (
    <div className="flex p-2 rounded-lg bg-newGray-5">
      <FaQuoteLeft className="shrink-0 size-2 md:size-4" />
      <blockquote className="mobile-body2 md:desktop-body1 mx-2 md:mx-4 italic">
        {textChildren.join(' ')}
      </blockquote>
      <FaQuoteRight className="self-end shrink-0 size-2 md:size-4" />
    </div>
  );
};
