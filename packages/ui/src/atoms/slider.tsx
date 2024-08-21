/* eslint-disable react/prop-types */
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const average = (props.max && props.min && (props.max + props.min) / 2) || 0;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-newGray-4">
        <SliderPrimitive.Range
          className={cn('absolute h-full bg-transparent')}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          'block size-5 rounded-full bg-darkOrange-5 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        )}
      />
      {/* Hack - course review slider */}
      <div
        className={cn(
          'absolute bg-darkOrange-5 h-full rounded-full left-1/2',
          props.value && props.value[0] < average ? '-translate-x-full' : '',
        )}
        style={{
          width:
            props.value &&
            props.max &&
            `${(Math.abs(average - props.value[0]) / (props.max - average) / 2) * 100}%`,
        }}
      ></div>
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
