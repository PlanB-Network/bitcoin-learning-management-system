import { cn } from '@blms/ui';

type NetworkListItemProps = {
  text: string;
  img: string;
  orientation?: 'left' | 'right';
  className?: string;
};

export default function NetworkListItem({
  text,
  img,
  orientation = 'left',
  className,
}: NetworkListItemProps) {
  return (
    <div
      className={cn(
        'flex gap-3 items-center',
        orientation === 'left' ? 'flex-row' : 'flex-row lg:flex-row-reverse',
        className,
      )}
    >
      <img className={cn('size-8')} src={img} alt="World icon" />
      <span className="title-base xl:title-medium mx-2">{text}</span>
    </div>
  );
}
