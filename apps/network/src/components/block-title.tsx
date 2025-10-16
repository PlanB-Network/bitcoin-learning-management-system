import { cn } from '@blms/ui';

type BlockTitleProps = {
  text: string;
  subtext: string;
  direction?: 'left' | 'right';
  className?: string;
};

export default function BlockTitle({
  text,
  subtext,
  className,
}: BlockTitleProps) {
  return (
    <div className={cn('flex flex-col w-full items-center', className)}>
      <div className={cn('mt-12 text-center z-10 flex flex-col items-center')}>
        <h2 className="text-4xl lg:text-6xl font-light max-lg:!font-semibold uppercase text-orange-500 max-w-[1100px]">
          {text}
        </h2>
        <h2 className="max-lg:px-8 body-small lg:title-small mt-6 mb-12 max-w-[650px] text-gray-100 px-4 ">
          {subtext}
        </h2>
      </div>
    </div>
  );
}
