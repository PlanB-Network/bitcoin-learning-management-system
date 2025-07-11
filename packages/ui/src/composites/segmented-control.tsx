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
  value: controlledValue, // Renamed to avoid conflict with internal state
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
  // Use React.useState to manage the internal value.
  const [internalValue, setInternalValue] = React.useState(
    controlledValue ?? defaultValue ?? '',
  );

  // Update internal value if controlledValue changes from parent
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleValueChange = (newValue: string) => {
    if (type === 'single' && !newValue && internalValue) {
      return;
    }

    setInternalValue(newValue);

    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={internalValue} // Use the internally managed value
      onValueChange={handleValueChange} // Use our custom handler
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        'bg-newGray-6 py-1 group/toggle-group flex flex-wrap w-fit items-center rounded-xl data-[variant=outline]:shadow-xs',
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
        'mx-1 max-w-fit overflow-hidden !body-12px md:!body-14px !text-newBlack-5 shadow-none  data-[state=on]:!text-newBlack-3 data-[state=on]:!font-medium data-[state=on]:bg-white data-[state=on]:shadow-sm max-md:text-xs hover:bg-newGray-5 min-w-0 flex-1 shrink-0 focus:z-10 focus-visible:z-10 border-0 rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { SegmentedControl, SegmentedControlItem };
