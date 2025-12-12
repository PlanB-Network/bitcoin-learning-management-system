import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import type * as React from 'react';
import { TbCircle } from 'react-icons/tb';
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
        'aspect-square size-4 shrink-0 rounded-full border border-neutral-200 shadow-xs outline-none',
        'focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 hover:border-orange-400',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-orange-500 data-[state=checked]:border-transparent',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <TbCircle className="fill-primary absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
