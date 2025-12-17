import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import type * as React from 'react';
import { cn } from '#src/lib/utils.ts';

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'aspect-square size-4 shrink-0 rounded-full border-2 border-neutral-500 bg-white outline-none',
        'focus-visible:ring-4 focus-visible:ring-neutral-200',
        'hover:border-orange-400',
        'disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100',
        'data-[state=checked]:border-orange-500 data-[state=checked]:border-5',
        'data-[state=checked]:focus-visible:ring-orange-200',
        'data-[state=checked]:disabled:border-neutral-300',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      />
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
