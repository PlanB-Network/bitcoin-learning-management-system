import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);

  return (
    <div className="text-xxs mx-2 flex flex-row items-center justify-between rounded-3xl bg-white px-4 py-2 sm:mx-8 sm:rounded-full sm:px-6 sm:text-xs">
      <div className="mr-3 grow">
        {label && (
          <label className="text-primary-700 mb-1 block sm:mb-2">{label}</label>
        )}

        <input
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onChange(event.target.value);
          }}
          className="focus:black dark:black inline-block h-fit w-full max-w-xl rounded-full border-0 bg-gray-100 py-1 text-sm placeholder:text-gray-500 placeholder:text-opacity-50 focus:border-gray-100 focus:outline-none focus:ring focus:ring-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:focus:border-gray-500 dark:focus:ring-gray-900 sm:text-base"
        />
      </div>
      <button className="text-right font-thin italic underline">
        {t('words.additionalCriteria')}
      </button>
    </div>
  );
};
