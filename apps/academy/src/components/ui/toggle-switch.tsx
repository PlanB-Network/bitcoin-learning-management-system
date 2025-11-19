interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  leftLabel: string;
  rightLabel: string;
  className?: string;
}

export const ToggleSwitch = ({
  checked,
  onChange,
  leftLabel,
  rightLabel,
  className = '',
}: ToggleSwitchProps) => {
  return (
    <div className={`relative flex items-center max-w-sm ${className}`}>
      <div className="mr-3 whitespace-nowrap font-medium text-gray-900">
        {leftLabel}
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-500 peer-checked:after:translate-x-full peer-focus:outline-none" />
      </label>
      <div className="ml-3 whitespace-nowrap font-medium text-gray-900">
        {rightLabel}
      </div>
    </div>
  );
};
