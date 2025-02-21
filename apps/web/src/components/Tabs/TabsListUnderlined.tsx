import type React from 'react';

import { TabsList, TabsTrigger } from '@blms/ui';

interface TabsListUnderlinedProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Array<{
    value: string;
    key: string;
    text: string;
    active: boolean;
    disabled?: boolean;
  }>;
  slice?: number;
  variant?: 'dark' | 'light';
  size?: 's' | 'm' | 'l';
}

export const TabsListUnderlined: React.FC<TabsListUnderlinedProps> = ({
  tabs,
  slice,
  children,
  variant = 'light',
  size = 'm',
  ...props
}) => {
  return (
    <TabsList mode={variant} size={size} {...props}>
      {tabs.map((tab) => (
        <TabsTrigger
          value={tab.value}
          key={tab.key}
          size={size}
          disabled={tab.disabled}
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
