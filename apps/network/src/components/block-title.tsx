import { cn } from '@blms/ui';

type BlockTitleProps = {
  text: string;
  subtext: string;
  direction?: 'left' | 'right';
  className?: string;
  titleClassName?: string;
};

export default function BlockTitle({
  text,
  subtext,
  className,
  titleClassName,
}: BlockTitleProps) {
  return (
    <div className={cn('flex flex-col w-full items-center', className)}>
      <div className={cn('text-center z-10 flex flex-col items-center')}>
        <h2
          className={cn(
            'display-medium lg:text-[80px] font-semibold max-lg:!font-semibold max-w-[1100px]',
            titleClassName,
          )}
        >
          {text}
        </h2>
        <h2 className="px-8 lg:px-4 mt-6 body-large lg:title-medium max-w-[800px] text-neutral-50">
          {subtext}
        </h2>
      </div>
    </div>
  );
}
