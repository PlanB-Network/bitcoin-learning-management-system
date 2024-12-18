import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    value: number;
    totalChapters: number;
    completedChapters: number;
    pillImage: string;
  }
>(
  (
    { className, value, totalChapters, completedChapters, pillImage, ...props },
    ref,
  ) => {
    const progressPercentage = (completedChapters / totalChapters) * 100;

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'h-2 w-full rounded-full overflow-hidden bg-darkOrange-1 md:bg-newGray-3 mx-auto',
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="size-full relative bg-primary transition-all h-2"
          style={{
            transform: `translateX(-${100 - (value || 0)}%)`,
          }}
        />
        <img
          src={pillImage}
          className="absolute -bottom-3 md:-bottom-3 z-10 min-w-3 w-[13px] h-[32px]"
          alt="Orange Pill"
          style={{
            left: `${progressPercentage}%`,
          }}
        />
      </ProgressPrimitive.Root>
    );
  },
);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
