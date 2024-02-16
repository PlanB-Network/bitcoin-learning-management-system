import { cn } from '@sovereign-university/ui';

interface CategoryIconProps {
  src: string;
  className?: string;
}

export const CategoryIcon = ({ src, className }: CategoryIconProps) => {
  return (
    <div className={cn('relative flex size-12 shrink-0 md:size-20', className)}>
      <img className="absolute inset-0 m-auto h-8 md:h-14" src={src} alt="" />
    </div>
  );
};
