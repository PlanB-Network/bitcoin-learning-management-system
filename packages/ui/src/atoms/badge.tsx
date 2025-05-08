import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils.js';

const badgeVariants = cva(
  'w-fit flex justify-center items-center text-center ',
  {
    variants: {
      size: {
        small: 'px-2 text-center text-[10px] leading-none h-[18px] rounded-lg',
        verySmall:
          'px-1.5 text-center text-[10px] leading-none h-4 rounded-md ',
      },
      variant: {
        darkOrange: 'bg-darkOrange-8 text-maroon-1',
        lightOrange: 'bg-darkOrange-3 text-white',
        darkMaroon: 'bg-black-4 text-white',
      },
    },
    defaultVariants: {
      size: 'small',
      variant: 'darkOrange',
    },
  },
);
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, size, variant, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp
        className={cn(className, badgeVariants({ size, variant }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
Badge.displayName = 'TextTag';

export { Badge, badgeVariants };
