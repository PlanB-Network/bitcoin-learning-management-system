import { t } from 'i18next';

import PieChart from '../pie-chart.tsx';

interface QuizzHeaderProps {
  title: string;
  name: string;
  chapter: string;
  questionIndex: number;
  answersColors: string[];
}

export const QuizzHeader = ({
  title,
  name,
  chapter,
  questionIndex,
  answersColors,
}: QuizzHeaderProps) => {
  return (
    <div className="border-newBlack-1 flex items-center justify-between border md:border-2 bg-darkOrange-5 py-2 md:py-3 pr-2.5 rounded-t-2xl">
      <span className="px-4 text-white display-small-bold-caps-22px md:display-large-bold-caps-48px">
        {title}
      </span>
      {/* Big screen */}
      <div className="hidden items-center justify-end gap-2.5 md:flex">
        <div className="flex flex-col ">
          <span className="subtitle-medium-caps-18px text-white text-right">
            {name}
          </span>
          <span className="subtitle-medium-caps-18px !lowercase text-white text-right">
            {t('words.chapter')} {chapter}
          </span>
        </div>
        <div className="relative flex justify-center items-center w-14">
          <PieChart
            width={64}
            height={64}
            colors={answersColors}
            className="absolute"
          />
        </div>
      </div>
      {/* Small device */}
      <span className="text-white subtitle-medium-caps-18px md:hidden px-2.5">
        {questionIndex + 1}/5
      </span>
    </div>
  );
};
