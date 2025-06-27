import { getStatusBadgeClass } from '@blms/shared';
import type React from 'react';

interface CourseStatusBadgeProps {
  status: string;
  statusText: string;
  className?: string;
}

export const CourseStatusBadge: React.FC<CourseStatusBadgeProps> = ({
  status,
  statusText,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getStatusBadgeClass(
        status,
      )} ${className}`}
    >
      {statusText}
    </span>
  );
};
