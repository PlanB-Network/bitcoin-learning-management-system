import { cn } from '@blms/ui';
import { useState } from 'react';
import { BsChevronExpand } from 'react-icons/bs';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

type SortDirection = 'asc' | 'desc';

interface Item {
  key: string;
  label: string;
  sortable?: boolean;
}

interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

interface Props {
  items: Array<Item>;
  onSort?: (sortConfig: SortConfig) => void;
}

const SortableTableHeader = ({ items, onSort }: Props) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'desc',
  });

  const handleSort = (key: string) => {
    let direction: SortDirection = 'desc';

    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }

    setSortConfig({ key, direction });
    onSort?.({ key, direction });
  };

  return (
    <tr className="border-b">
      {items.map((item) => {
        const commonClass = 'py-2 text-left text-sm font-medium select-none';

        return item.sortable ? (
          <th
            key={item.key}
            className={cn(commonClass, 'group cursor-pointer hover:bg-gray-50')}
            onClick={() => handleSort(item.key)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSort(item.key);
              }
            }}
          >
            <div className="flex items-center space-x-4">
              <span className={cn(sortConfig.key === item.key && 'underline')}>
                {item.label}
              </span>

              {item.sortable && (
                <span className="ml-1 h-4 w-4 group-hover:text-red-200">
                  {sortConfig.key !== item.key ? (
                    <BsChevronExpand />
                  ) : sortConfig.direction === 'asc' ? (
                    <BsChevronUp />
                  ) : (
                    <BsChevronDown />
                  )}
                </span>
              )}
            </div>
          </th>
        ) : (
          <th key={item.key} className={commonClass}>
            {item.label}
          </th>
        );
      })}
    </tr>
  );
};

export default SortableTableHeader;
