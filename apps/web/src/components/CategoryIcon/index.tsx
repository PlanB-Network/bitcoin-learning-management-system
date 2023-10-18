import { cn } from '@sovereign-university/ui';

interface CategoryIconProps {
  src: string;
  className?: string;
}

export const CategoryIcon = ({ src, className }: CategoryIconProps) => {
  return (
    <div
      className={cn(
        'relative flex h-12 w-12 shrink-0 rounded-full bg-orange-500 md:h-20 md:w-20',
        className,
      )}
    >
      <img className="absolute inset-0 m-auto h-8 md:h-14" src={src} alt="" />
    </div>
  );
};
