import type { FC } from 'react';

interface ValidationCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: React.ReactNode;
  requiredStar?: boolean;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const ValidationCheckbox: FC<ValidationCheckboxProps> = ({
  checked,
  onToggle,
  label,
  requiredStar = true,
  className = '',
  loading = false,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      className={`flex items-center gap-3 bg-transparent border-0 p-0 ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      } ${className}`}
    >
      <div
        className={`w-6 h-6 border-2 rounded-[4px] flex items-center justify-center ${
          loading
            ? 'bg-orange-200 border-orange-300'
            : checked
              ? 'bg-orange-500 border-orange-500'
              : 'bg-transparent border-gray-400'
        }`}
      >
        {loading ? (
          <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          checked && <span className="text-white text-sm">✓</span>
        )}
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
