import { Table, TableHead, TableHeader, TableRow } from '@blms/ui';
import type { ReactNode } from 'react';

interface SharedTableHeaderProps {
  children: ReactNode;
}

interface SharedTableHeadProps {
  children: ReactNode;
  className?: string;
  sortable?: boolean;
  onSort?: () => void;
  sortIcon?: ReactNode;
}

export const SharedTableHeader = ({ children }: SharedTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow className="border-b border-gray-200">{children}</TableRow>
    </TableHeader>
  );
};

export const SharedTableHead = ({
  children,
  className = '',
  sortable = false,
  onSort,
  sortIcon,
}: SharedTableHeadProps) => {
  const baseClasses = 'font-semibold text-gray-900 py-3';
  const combinedClasses = `${baseClasses} ${className}`;

  if (sortable && onSort) {
    return (
      <TableHead className={combinedClasses}>
        <button
          type="button"
          onClick={onSort}
          className="flex items-center space-x-1 hover:text-gray-700 text-left w-full"
        >
          <span>{children}</span>
          {sortIcon && <span className="text-gray-400">{sortIcon}</span>}
        </button>
      </TableHead>
    );
  }

  return <TableHead className={combinedClasses}>{children}</TableHead>;
};

export const SharedTable = Table;
