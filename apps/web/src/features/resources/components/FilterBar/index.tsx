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
    <div className="mx-2 w-fit items-center justify-between rounded-3xl bg-orange-500 px-4 py-2 text-xs sm:mx-8 sm:w-[40rem] sm:rounded-2xl sm:px-6 sm:text-xs">
      <div className="mb-2 mr-3 grow">
        {label && (
          <label className="mb-2 block text-white sm:mb-2">{label}</label>
        )}

        <input
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onChange(event.target.value);
          }}
          className="inline-block h-fit w-full max-w-md rounded-full border-0 bg-gray-100 py-1 pl-4 text-sm placeholder:text-gray-500 placeholder:text-opacity-50 focus:border-gray-100 focus:outline-none focus:ring focus:ring-gray-300 sm:max-w-xl sm:text-base"
        />
      </div>
      {/* <button className="text-right font-light italic underline">
        {t('words.additionalCriteria')}
      </button> */}
    </div>
  );
};
