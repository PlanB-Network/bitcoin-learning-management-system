import { cn } from '@blms/ui';
import type React from 'react';

interface TabItem {
  id: string;
  label: string;
}

interface SubTabsSwitchProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const SubTabsSwitch: React.FC<SubTabsSwitchProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={cn('flex w-fit bg-gray-100 p-1 rounded-lg gap-1', className)}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
            activeTab === tab.id
              ? 'bg-white text-gray-900'
              : 'text-gray-700 hover:bg-gray-200',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
