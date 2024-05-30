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
        'lg:w-full rounded-lg lg:rounded-md hover:bg-white/20 lg:hover:bg-darkOrange-9 hover:text-white hover:font-medium',
        active && 'bg-white/20 lg:bg-darkOrange-9 text-white font-medium',
      )}
    >
      <div className="flex w-full cursor-pointer flex-row items-center justify-center gap-3 p-2 lg:justify-start">
        <div className="min-w-5">{icon}</div>
        <div className="max-lg:hidden leading-relaxed">{text}</div>
      </div>
    </button>
  );
};
