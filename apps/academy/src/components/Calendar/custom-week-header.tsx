import { useTranslation } from 'react-i18next';

interface CustomWeekHeaderProps {
  date: Date;
}

export const CustomWeekHeader = ({ date }: CustomWeekHeaderProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language || 'en-US';

  const dayName = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    .format(date)
    .toUpperCase();

  return (
    <div className="h-20 flex flex-col w-full items-start justify">
      <div className="text-xs uppercase text-gray-500 font-semibold">
        {dayName}
      </div>
      <div className="text-lg font-normal">
        {new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(date)}
      </div>
    </div>
  );
};
