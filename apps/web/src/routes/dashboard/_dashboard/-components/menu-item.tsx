import { cn } from '@blms/ui';

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
      <div className="flex w-full cursor-pointer flex-col lg:flex-row items-center justify-center gap-1 lg:gap-3 py-1 px-1.5 lg:p-2 lg:justify-start">
        <div className="min-w-5">{icon}</div>
        <div className="max-lg:text-[10px] max-lg:text-white max-lg:leading-normal lg:leading-relaxed">
          {text}
        </div>
      </div>
    </button>
  );
};
