import { cn } from '@blms/ui';

type NetworkListItemProps = {
  text: string;
  img: string;
  className?: string;
};

export default function NetworkListItem({
  text,
  img,
  className,
}: NetworkListItemProps) {
  return (
    <div className={cn('flex flex-row gap-2 items-center', className)}>
      <img
        className="rounded-[10px] p-2 bg-darkOrange-11 border-orange-900 border-[1px] max-xl:size-9"
        src={img}
        alt="World icon"
      />
      <span className="title-base xl:title-medium">{text}</span>
    </div>
  );
}
