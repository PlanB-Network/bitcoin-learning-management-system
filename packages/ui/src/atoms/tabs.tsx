import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cva } from 'class-variance-authority';
import { cn } from '#src/lib/utils.ts';

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  'items-center bg-transparent text-newBlack-3 dark:text-newGray-4 overflow-x-scroll no-scrollbar flex max-w-full',
  {
    variants: {
      size: {
        s: 'gap-[18px]',
        m: 'gap-6',
        l: 'gap-8',
      },
      mode: {
        light: '',
        dark: 'dark',
      },
    },
    defaultVariants: {
      size: 'm',
      mode: 'light',
    },
  },
);

const tabsTriggerVariants = cva(
  'data-[state=active]:font-medium inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-color focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=inactive]:hover:border-b-2 data-[state=inactive]:hover:border-newGray-4 data-[state=active]:border-b-2 data-[state=active]:border-darkOrange-5 data-[state=active]:text-black dark:data-[state=active]:text-white',
  {
    variants: {
      size: {
        s: 'label-medium-16px pb-2',
        m: 'label-18px pb-2.5',
        l: 'label-large-20px pb-3',
      },
    },
    defaultVariants: {
      size: 'm',
    },
  },
);

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    removeClasses?: boolean;
    size?: 's' | 'm' | 'l';
    mode?: 'dark' | 'light';
  }
>(({ className, removeClasses, size, mode, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(removeClasses ? '' : tabsListVariants({ mode }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    removeClasses?: boolean;
    size?: 's' | 'm' | 'l';
  }
>(({ className, removeClasses, size, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      removeClasses ? '' : tabsTriggerVariants({ size }),
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
