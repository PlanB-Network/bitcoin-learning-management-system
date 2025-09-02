import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    total: number;
    completed: number;
    pillImage: string;
  }
>(({ className, total, completed, pillImage, ...props }, ref) => {
  const progressPercentage = (completed / total) * 100;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'h-2 w-full rounded-full overflow-hidden bg-orange-100 mx-auto',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="size-full relative bg-orange-500 transition-all h-2"
        style={{
          transform: `translateX(-${100 - (progressPercentage || 0)}%)`,
        }}
      />
      <img
        src={pillImage}
        className="absolute -bottom-3 md:-bottom-3 z-10 min-w-3 w-[13px] h-8"
        alt="Orange Pill"
        style={{
          left: `${progressPercentage}%`,
        }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
