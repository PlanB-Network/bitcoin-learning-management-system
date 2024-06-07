import { format } from 'date-fns';

interface CustomWeekHeaderProps {
  label: string;
  date: Date;
}

export const CustomWeekHeader = ({ label, date }: CustomWeekHeaderProps) => {
  return (
    <div className="h-20 flex flex-col w-full items-start justify">
      <div className="text-xs uppercase text-gray-500 font-semibold">
        {label.slice(3)}
      </div>
      <div className="text-xl font-normal">{format(date, 'dd')} </div>
    </div>
  );
};
