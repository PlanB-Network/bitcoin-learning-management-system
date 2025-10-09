import type { ReactNode } from 'react';

type PageBlockProps = {
  children?: ReactNode;
};

export default function PageBlock({ children }: PageBlockProps) {
  return (
    <div className="px-3 md:px-12 max-w-[1440px] mx-auto">
      {children && <div>{children}</div>}
    </div>
  );
}
