import { cn } from '@blms/ui';
import OrangePill from '#src/assets/icons/orange_pill_color.svg';

export interface ProgressBarProps {
  courseCompletedChapters: number;
  courseTotalChapters: number;
}

export const ProgressBar = ({
  courseCompletedChapters,
  courseTotalChapters,
}: ProgressBarProps) => {
  const filledRectangles = courseCompletedChapters;

  return (
    <>
      <div className="flex gap-0.5 max-md:hidden w-full max-w-[590px]">
        {Array.from({ length: courseTotalChapters }).map((_, index) => {
          const isFilled = index < filledRectangles;
          const isFirstRectangle = index === 0;
          const isLastRectangle = index === courseTotalChapters - 1;

          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className={cn(
                'relative h-2 flex justify-end items-center',
                isFilled ? 'bg-darkOrange-5' : 'bg-darkOrange-1',
                isFirstRectangle && 'rounded-l',
                isLastRectangle && 'rounded-r',
              )}
              style={{ width: `${100 / courseTotalChapters}%` }}
            >
              {index === filledRectangles - 1 && (
                <img
                  src={OrangePill}
                  className={cn('absolute min-w-3 w-3 -right-1 z-10')}
                  alt="Orange Pill"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="w-full md:hidden relative h-2 bg-darkOrange-1 rounded flex items-center mb-7">
        <div
          className="bg-darkOrange-5 h-full rounded"
          style={{
            width: `${(courseCompletedChapters / courseTotalChapters) * 100}%`,
          }}
        />
        <img
          src={OrangePill}
          className={cn(
            'absolute z-10 aspect-auto min-w-3 w-3',
            courseCompletedChapters / courseTotalChapters > 1 && 'hidden',
          )}
          style={{
            left: `${(courseCompletedChapters / courseTotalChapters) * 100 - 2}%`,
          }}
          alt="Orange Pill"
        />
      </div>
    </>
  );
};
