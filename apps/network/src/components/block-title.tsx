import { cn } from '@blms/ui';
import curveLeft from '#src/assets/curve/curve-left.svg';
import curveMiddle from '#src/assets/curve/curve-middle.png';
import curveRight from '#src/assets/curve/curve-right.svg';

type BlockTitleProps = {
  text: string;
  subtext: string;
  direction?: 'left' | 'right';
  className?: string;
};

export default function BlockTitle({
  text,
  subtext,
  direction = 'left',
  className,
}: BlockTitleProps) {
  return (
    <div className="flex flex-col w-full items-center ">
      <div
        className={cn(
          'flex w-full max-lg:transform scale-y-[0.4]',
          direction === 'left' ? '' : 'transform scale-x-[-1]',
          className,
        )}
      >
        <img className="h-[400px] " src={curveLeft} alt="Left curve" />

        <img
          className="h-[400px] w-1 flex-grow"
          src={curveMiddle}
          alt="Middle curve"
        />

        <img className="h-[400px]" src={curveRight} alt="Right curve" />
      </div>
      <div className="-mt-40 text-center z-10 flex flex-col items-center">
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
