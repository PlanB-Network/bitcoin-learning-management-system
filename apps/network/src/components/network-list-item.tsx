import { cn } from '@blms/ui';

type NetworkListItemProps = {
  text: string;
  img: string;
  orientation?: 'left' | 'right';
  dark?: boolean;
  className?: string;
};

export default function NetworkListItem({
  text,
  img,
  orientation = 'left',
  dark = false,
  className,
}: NetworkListItemProps) {
  return (
    <div
      className={cn(
        'flex gap-2 items-center',
        orientation === 'left' ? 'flex-row' : 'flex-row lg:flex-row-reverse',
        className,
      )}
    >
      <img
        className={cn(
          'rounded-[10px] p-2 border-[1px] size-9',
          dark
            ? 'bg-brown-900 border-brown-800'
            : 'bg-orange-950 border-orange-900',
        )}
        src={img}
        alt="World icon"
      />
      <span className="title-base xl:title-medium mx-2">{text}</span>
    </div>
  );
}
