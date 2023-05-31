import { Button } from '../../atoms/Button';
import { TextInput } from '../../atoms/TextInput';

interface Props {
  label?: string;
  value?: string;
  onChange: (v: string) => void;
}

export const FilterBar = ({ label, value = '', onChange }: Props) => {
  return (
    <div className="flex flex-row justify-between items-center px-6 py-2 mx-8 text-xs bg-white rounded-full">
      <div className="grow">
        {label && <p className="mb-1 text-primary-700">{label}</p>}

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="inline-block py-1 w-2/3 text-sm placeholder-gray-500 placeholder-opacity-50 bg-gray-100 rounded-full border-0 h-fit focus:outline-none focus:ring focus:ring-gray-300 focus:border-gray-100 dark:bg-gray-700 focus:black dark:black dark:border-gray-600 dark:focus:ring-gray-900 dark:focus:border-gray-500"
        />
      </div>
      <button className="italic font-thin text-justify underline">
        Additional criteria
      </button>
    </div>
  );
};
