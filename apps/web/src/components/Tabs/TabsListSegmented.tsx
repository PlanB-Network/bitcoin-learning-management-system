import { type VariantProps, cva } from 'class-variance-authority';
import type React from 'react';

import { TabsList, TabsTrigger, cn } from '@blms/ui';

const tabsTriggerVariant = cva(
  'max-md:basis-1/2 w-52 max-w-52 grow px-5 py-1.5 capitalize md:border-l md:first:border-l-0 !outline-none data-[state=active]:font-medium hover:font-medium data-[state=active]:border-none',
  {
    variants: {
      variant: {
        light:
          'data-[state=active]:bg-darkOrange-1 data-[state=active]:text-darkOrange-5 data-[state=inactive]:text-newBlack-3 data-[state=inactive]:hover:text-darkOrange-5',
        dark: '',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  },
);

interface TabsListSegmentedProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsTriggerVariant> {
  tabs: Array<{
    value: string;
    key: string;
    text: string;
    active: boolean;
    disabled?: boolean;
  }>;
  slice?: number;
}

export const TabsListSegmented = ({
  tabs,
  slice,
  children,
  variant = 'light',
  className,
  ...props
}: TabsListSegmentedProps) => {
  return (
    <TabsList
      className={cn(
        'flex flex-wrap bg-newGray-5 shadow-course-card relative z-[2] p-0 gap-0 rounded-t-[20px] overflow-hidden w-full',
        className,
      )}
      removeClasses={true}
      {...props}
    >
      {tabs.map((tab, index) => (
        <TabsTrigger
          value={tab.value}
          key={tab.key}
          className={cn(
            tabsTriggerVariant({ variant }),
            (index + 1) % 2 === 0 && 'max-md:border-l',
            tab.value.length > 2 && index - 1 <= 0 && 'max-md:border-b',
          )}
          disabled={tab.disabled}
          removeClasses={true}
        >
          <span className="line-clamp-2">
            {slice && tab.active ? tab.text : tab.text.slice(0, slice)}
          </span>
        </TabsTrigger>
      ))}
      {children}
    </TabsList>
  );
};
