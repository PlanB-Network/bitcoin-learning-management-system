import { type VariantProps, cva } from 'class-variance-authority';
import type React from 'react';

import { TabsList, TabsTrigger } from '@blms/ui';

const tabsTriggerVariant = cva(
  'max-lg:label-medium-med-16px text-xl hover:font-medium data-[state=active]:font-medium inline-flex items-center justify-center whitespace-nowrap pb-2.5 lg:pb-4 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-2',
  {
    variants: {
      variant: {
        light:
          'text-newBlack-3 data-[state=active]:border-darkOrange-5 data-[state=active]:text-black data-[state=inactive]:hover:text-black',
        dark: '',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  },
);

interface TabsListUnderlinedProps
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
  variant?: 'dark' | 'light';
}

export const TabsListUnderlined: React.FC<TabsListUnderlinedProps> = ({
  tabs,
  slice,
  children,
  variant = 'light',
  ...props
}) => {
  return (
    <TabsList
      className="flex overflow-x-scroll no-scrollbar max-w-full gap-4 lg:gap-8"
      removeClasses={true}
      {...props}
    >
      {tabs.map((tab) => (
        <TabsTrigger
          value={tab.value}
          key={tab.key}
          className={tabsTriggerVariant({ variant })}
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
