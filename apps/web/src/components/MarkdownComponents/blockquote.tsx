import type { ReactNode } from 'react';
import { isValidElement } from 'react';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa6';

// Flatten children and extract text, avoid issue with blockquote reference not being parsed correctly
const extractTextFromChildren = (children: ReactNode): string => {
  if (Array.isArray(children)) {
    return children.map((child) => extractTextFromChildren(child)).join(' ');
  }
  if (typeof children === 'string' || typeof children === 'number') {
    return children.toString();
  }
  if (isValidElement(children) && children.props.children) {
    return extractTextFromChildren(children.props.children);
  }
  return '';
};

export const Blockquote = ({
  children,
}: {
  children: ReactNode | Iterable<ReactNode>;
}) => {
  const textContent = extractTextFromChildren(children);

  return (
    <div className="flex p-2 rounded-lg bg-newGray-5">
      <FaQuoteLeft className="shrink-0 size-2 md:size-4" />
      <blockquote className="max-md:text-center mobile-body2 md:desktop-body1 mx-2 md:mx-4 italic">
        {textContent}
      </blockquote>
      <FaQuoteRight className="self-end shrink-0 size-2 md:size-4" />
    </div>
  );
};
