import { cn, Image } from '@blms/ui';
import type { IconType } from 'react-icons';

type NetworkListItemProps = {
  text: string;
  icon: string | IconType;
  orientation?: 'left' | 'right';
  className?: string;
};

export default function NetworkListItem({
  text,
  icon,
  orientation = 'left',
  className,
}: NetworkListItemProps) {
  const Icon = icon;

  return (
    <div
      className={cn(
        'flex gap-3 items-center',
        orientation === 'left' ? 'flex-row' : 'flex-row lg:flex-row-reverse',
        className,
      )}
    >
      {typeof icon === 'string' ? (
        <div>
          <Image
            className="w-6 lg:w-8 text-blue-300 fill-blue-100"
            src={icon}
            alt=""
            loading="lazy"
            breakpoints={{ default: 100 }}
          />
        </div>
      ) : (
        <Icon className="size-6 lg:size-8" />
      )}
      <span className="title-base xl:title-medium mx-2">{text}</span>
    </div>
  );
}
