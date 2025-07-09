import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { toggleVariants } from '#src/bases/toggle.tsx';
import { cn } from '../lib/utils.ts';

// Code is originating from shadcn toggle-group
const SegmentedControlContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: 'default',
  variant: 'default',
});

function SegmentedControl({
  className,
  variant,
  size,
  children,
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  ...props
}: Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  'type' | 'value' | 'defaultValue' | 'onValueChange'
> &
  VariantProps<typeof toggleVariants> & {
    type?: 'single';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  }) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        'bg-newGray-6 px-1 py-1 group/toggle-group flex flex-wrap w-fit items-center rounded-xl data-[variant=outline]:shadow-xs',
        className,
      )}
      {...props}
    >
      <SegmentedControlContext.Provider value={{ size, variant }}>
        {children}
      </SegmentedControlContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function SegmentedControlItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(SegmentedControlContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          size: context.size || size,
          variant: context.variant || variant,
        }),
        'data-[state=on]:bg-white hover:bg-newGray-5 min-w-0 flex-1 shrink-0 shadow-none focus:z-10 focus-visible:z-10 border-0 rounded-b-md',
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { SegmentedControl, SegmentedControlItem };
