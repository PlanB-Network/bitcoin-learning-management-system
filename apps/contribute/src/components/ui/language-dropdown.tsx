import type { FC } from 'react';
import DroplistArrowIcon from '#src/assets/icons/droplist_arrow_balck.svg';

export interface LanguageOption {
  code: string;
  name: string;
  available: boolean;
}

interface LanguageDropdownProps {
  options: LanguageOption[];
  loading?: boolean;
  value: string;
  onChange: (code: string) => void;
  selectClassName?: string;
}

export const LanguageDropdown: FC<LanguageDropdownProps> = ({
  options,
  loading = false,
  value,
  onChange,
  selectClassName = '',
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className={`appearance-none bg-white border border-[#CCCCCC] rounded-[10px] text-sm text-orange-500 w-full h-[34px] pl-8 pr-3 py-1 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        } ${selectClassName}`}
      >
        {loading ? (
          <option value="">Loading languages...</option>
        ) : options.length === 0 ? (
          <option value="">No languages available</option>
        ) : (
          options.map((lang) => (
            <option
              key={lang.code}
              value={lang.code}
              disabled={!lang.available}
              className={
                lang.available
                  ? 'text-gray-900'
                  : 'text-gray-400 cursor-not-allowed'
              }
              style={{
                color: lang.available ? undefined : '#9CA3AF',
                cursor: lang.available ? undefined : 'not-allowed',
              }}
            >
              {lang.name}
              {!lang.available && ' (Not available)'}
            </option>
          ))
        )}
      </select>
      {loading ? (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500" />
        </div>
      ) : (
        <img
          src={DroplistArrowIcon}
          alt="Dropdown arrow"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[11px] h-[7px]"
        />
      )}
    </div>
  );
};
