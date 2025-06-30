import { cn } from '#src/lib/utils.ts';

interface EmptyStateProps {
  message: string;
  className?: string;
}

export const EmptyState = ({ message, className = '' }: EmptyStateProps) => {
  return (
    <p
      className={cn(
        'mt-8 subtitle-small-caps-14px text-newGray-1 max-md:px-4 py-2',
        className,
      )}
    >
      {message}
    </p>
  );
};
