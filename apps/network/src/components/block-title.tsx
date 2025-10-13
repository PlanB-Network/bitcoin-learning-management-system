import { cn } from '@blms/ui';
import curveLeft from '#src/assets/curve/curve-left.svg';
import curveMiddle from '#src/assets/curve/curve-middle.png';
import curveRight from '#src/assets/curve/curve-right.svg';

type BlockTitleProps = {
  text: string;
  className?: string;
};

export default function BlockTitle({ text, className }: BlockTitleProps) {
  return (
    <div className="flex flex-col w-full items-center ">
      <div className={cn('flex w-full', className)}>
        <img className="h-[400px]" src={curveLeft} alt="Left curve" />

        <img
          className="h-[400px] w-1 flex-grow"
          src={curveMiddle}
          alt="Middle curve"
        />

        <img className="h-[400px]" src={curveRight} alt="Right curve" />
      </div>
      <h2 className="-mt-20 mb-12 title-extra-large uppercase">{text}</h2>
    </div>
  );
}
