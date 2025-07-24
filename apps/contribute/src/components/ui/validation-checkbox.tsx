import type { FC } from 'react';

interface ValidationCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: React.ReactNode;
  requiredStar?: boolean;
  className?: string;
}

export const ValidationCheckbox: FC<ValidationCheckboxProps> = ({
  checked,
  onToggle,
  label,
  requiredStar = true,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0 ${className}`}
    >
      <div
        className={`w-6 h-6 border-2 rounded-[4px] flex items-center justify-center ${
          checked
            ? 'bg-orange-500 border-orange-500'
            : 'bg-transparent border-gray-400'
        }`}
      >
        {checked && <span className="text-white text-sm">✓</span>}
      </div>
      <span className="text-gray-900 font-medium text-sm sm:text-base md:text-lg">
        {label}
        {requiredStar && (
          <span className="ml-1 font-medium" style={{ color: '#ef4444' }}>
            *
          </span>
        )}
      </span>
    </button>
  );
};
