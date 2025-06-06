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
        dark2: 'dark',
      },
    },
    defaultVariants: {
      size: 'm',
      mode: 'light',
    },
  },
);

const tabsTriggerVariants = cva(
  'data-[state=active]:font-medium inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-color focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-black',
  {
    variants: {
      size: {
        s: 'label-medium-16px pb-2',
        m: 'label-18px pb-2.5',
        l: 'label-large-20px pb-3',
      },
      mode: {
        dark: 'dark:data-[state=active]:text-white data-[state=inactive]:hover:border-b-2 data-[state=inactive]:hover:border-newGray-4 data-[state=active]:border-b-2 data-[state=active]:border-darkOrange-5',
        dark2:
          'data-[state=active]:text-white border-newGray-2 data-[state=inactive]:hover:border-newGray-5 data-[state=inactive]:hover:font-medium data-[state=active]:bg-darkOrange-5 border-t-[1px] border-x-[1px] rounded-t-2xl px-4 pt-3 bg-black',
      },
    },
    defaultVariants: {
      size: 'm',
      mode: 'dark',
    },
  },
);

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    removeClasses?: boolean;
    size?: 's' | 'm' | 'l';
    mode?: 'dark' | 'dark2' | 'light';
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
    mode?: 'dark' | 'dark2';
  }
>(({ className, removeClasses, size, mode, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      removeClasses ? '' : tabsTriggerVariants({ mode, size }),
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
      'ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
