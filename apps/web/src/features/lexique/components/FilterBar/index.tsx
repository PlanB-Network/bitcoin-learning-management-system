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
    <div className="lg:w-8/12 lg:max-w-lg w-full bg-white h-32 flex flex-col rounded-3xl space-y-5 place-content-center p-3">
      {label && <span className=" text-xl font-semibold">{label}</span>}
      <span>
        <input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onChange(event.target.value);
          }}
          className="w-full h-7 rounded-full px-2 py-1 pl-4 sm:text-base focus:border-gray-100 focus:outline-none focus:ring focus:ring-gray-300 bg-turquoise-200"
        />
      </span>
    </div>
  );
};
