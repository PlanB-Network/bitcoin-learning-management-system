import type { ReactNode } from 'react';

export const MetricCard = ({
  title,
  value,
  icon,
  className = '',
}: MetricCardProps) => (
  <div
    className={`flex items-center gap-4 rounded-xl border border-orange-500 bg-[#FEF1EB] px-5 py-4 min-w-[180px] max-w-[240px] w-full shadow-sm ${className}`}
  >
    {/* Icon box */}
    <div className="flex items-center justify-center bg-orange-100 rounded-lg p-2">
      {icon}
    </div>
    {/* Texts */}
    <div className="flex flex-col gap-1">
      <span className="text-base font-medium text-gray-400 whitespace-nowrap">
        {title}
      </span>
      <span className="text-3xl font-bold text-gray-900 leading-none mt-1">
        {value}
      </span>
    </div>
  </div>
);

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}
