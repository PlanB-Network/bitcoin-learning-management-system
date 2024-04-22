import { cn } from '@sovereign-university/ui';

export const MenuItem = ({
  text,
  icon,
  active,
  onClick,
}: {
  text: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-md hover:bg-darkOrange-9 hover:text-white hover:font-medium',
        active && 'bg-darkOrange-9 text-white font-medium',
      )}
    >
      <div className="flex w-full cursor-pointer flex-row items-center justify-center gap-3 p-2 md:justify-start">
        <div className="min-w-[20px]">{icon}</div>
        <div className="max-sm:hidden leading-relaxed">{text}</div>
      </div>
    </button>
  );
};
