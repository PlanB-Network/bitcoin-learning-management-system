import { useState } from 'react';

interface Props {
  label?: string;
  value?: string;
  onChange: (v: string) => void;
}

export const FilterBar = ({
  label,
  value: initialValue = '',
  onChange,
}: Props) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="flex flex-row justify-between items-center px-4 py-2 mx-2 bg-white rounded-3xl sm:rounded-full sm:px-6 text-xxs sm:text-xs sm:mx-8">
      <div className="mr-3 grow">
        {label && (
          <label className="block mb-1 sm:mb-2 text-primary-700">{label}</label>
        )}

        <input
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onChange(event.target.value);
          }}
          className="inline-block py-1 w-full max-w-xl text-sm placeholder-gray-500 placeholder-opacity-50 bg-gray-100 rounded-full border-0 sm:text-base h-fit focus:outline-none focus:ring focus:ring-gray-300 focus:border-gray-100 dark:bg-gray-700 focus:black dark:black dark:border-gray-600 dark:focus:ring-gray-900 dark:focus:border-gray-500"
        />
      </div>
      <button className="italic font-thin text-right underline">
        Additional criteria
      </button>
    </div>
  );
};
