import { cn } from '../lib/utils.js';

interface TagProps {
  children: string;
  className?: string;
}

export const Tag = ({ children, className }: TagProps) => {
  return (
    <span
      className={cn(
        'text-newGray-4 text-xs sm:text-base font-medium leading-normal px-2.5 py-1.5 border border-newGray-1 bg-newBlack-3 rounded-md text-nowrap w-fit',
        className,
      )}
    >
      {children}
    </span>
  );
};
