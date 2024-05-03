import { cn } from '@sovereign-university/ui';

import { compose } from '../../utils/index.ts';
import type { BaseAtomProps } from '../types.tsx';

interface TagProps extends BaseAtomProps {
  children: string;
  color?: string;
  size?: 's' | 'm';
}

interface NewTagProps {
  children: string;
  className?: string;
}

const classesBySize = {
  s: 'px-2 py-1 mr-2 mb-1 text-xs',
  m: 'px-3 py-1 mr-2 mb-2 text-sm',
};

export const Tag = ({ children, size, className }: TagProps) => {
  return (
    <span
      className={compose(
        'inline-block font-semibold text-gray-500 bg-gray-200 rounded-full',
        classesBySize[size ?? 'm'],
        className ?? '',
      )}
    >
      {children}
    </span>
  );
};

export const NewTag = ({ children, className }: NewTagProps) => {
  return (
    <span
      className={cn(
        'text-newGray-4 text-xs sm:text-base font-medium leading-normal px-2.5 py-1.5 border border-newGray-1 bg-newBlack-3 rounded-md w-fit',
        className,
      )}
    >
      {children}
    </span>
  );
};
