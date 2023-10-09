import { useTranslation } from 'react-i18next';

import RabbitHoldingPen from '../../../assets/rabbit_holding_pen.svg?react';

import PieChart from './pie-chart';
import QuizzResultMessage from './quizz-result-message';

interface QuizzCardResultsProps {
  name: string;
  chapter: string;
  answers: boolean[];
  answersColors: string[];
  numberOfCorrectAnswers: number;
  nextStep: () => void;
}

export default function QuizzCardResults({
  name,
  chapter,
  answers,
  answersColors,
  nextStep,
  numberOfCorrectAnswers,
}: QuizzCardResultsProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="border-blue-1000 flex h-16 items-center justify-between self-stretch rounded-t-[0.9375rem] border-2 bg-blue-800 py-3 pl-0 pr-2">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 flex-col items-center justify-end pr-0">
            <RabbitHoldingPen />
          </div>
          <div className="text-beige-300 text-center text-[1.9375rem] font-semibold uppercase leading-[120%]">
            {t('courses.quizz.quizzResults')}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5">
          <div className="text-beige-300 flex items-center text-center text-3xl font-light">
            {name} / {chapter}
          </div>
        </div>
      </div>
      <div className="border-blue-1000 bg-beige-400 flex flex-col items-center self-stretch rounded-b-2xl border-2 px-8 pb-9 pt-6">
        <div className="mb-5 flex flex-col items-center gap-2.5 self-stretch">
          <div className="text-blue-1000 text-xl font-semibold">
            <QuizzResultMessage
              numberOfCorrectAnswers={numberOfCorrectAnswers}
            />
          </div>
        </div>
        <div>
          <div onClick={nextStep}>
            <div>
              <PieChart colors={answersColors} globalCursorPointer={true} />
            </div>
          </div>
        </div>
        <div>
          <p className="text-[13px]">{t('courses.quizz.clickOnPie')}</p>
        </div>
      </div>
    </>
  );
}
