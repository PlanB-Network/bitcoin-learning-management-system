import { cn } from '@sovereign-university/ui';

interface CategoryIconProps {
  src: string;
  className?: string;
}

export const CategoryIcon = ({ src, className }: CategoryIconProps) => {
  return (
    <div
      className={cn(
        'relative flex h-12 w-12 shrink-0 rounded-full bg-orange-500 sm:h-20 sm:w-20',
        className,
      )}
    >
      <img className="absolute inset-0 m-auto h-8 sm:h-14" src={src} alt="" />
    </div>
  );
};
