import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useTranslation } from 'react-i18next';

import RabbitHoldingPen from '../../../assets/rabbit_holding_pen.svg?react';

import PieChart from './pie-chart.tsx';
import QuizzResultMessage from './quizz-result-message.tsx';

interface QuizzCardResultsProps {
  name: string;
  chapter: string;
  answersColors: string[];
  numberOfCorrectAnswers: number;
  nextStep: () => void;
}

const { useSmaller } = BreakPointHooks(breakpointsTailwind);

export default function QuizzCardResults({
  name,
  chapter,
  answersColors,
  nextStep,
  numberOfCorrectAnswers,
}: QuizzCardResultsProps) {
  const { t } = useTranslation();
  const isMobile = useSmaller('md');

  return (
    <>
      <div className="border-blue-1000 flex h-12 items-center justify-between self-stretch rounded-t-[0.9375rem] border-2 bg-blue-800 py-3 pl-0 pr-2 md:h-16">
        <div className="flex items-center gap-3">
          <div className="flex size-12 flex-col items-center justify-end pr-0 md:size-16">
            <RabbitHoldingPen className="ml-[7px] md:ml-[-10px]" />
          </div>
          <div className="text-beige-300 text-center text-2xl font-semibold uppercase leading-[120%] md:text-3xl">
            {t('courses.quizz.quizzResults')}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5">
          <div className="text-beige-300 flex items-center text-center text-xl font-light md:text-3xl">
            <span className="hidden md:block">{name}</span>
            <span className="mx-1 hidden md:block">{`/`}</span>
            <span>{chapter}</span>
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
          <button onClick={nextStep}>
            <div>
              <PieChart
                colors={answersColors}
                globalCursorPointer={true}
                width={isMobile ? 300 : 350}
                height={isMobile ? 300 : 400}
              />
            </div>
          </button>
        </div>
        <div>
          <p className="text-[13px]">{t('courses.quizz.clickOnPie')}</p>
        </div>
      </div>
    </>
  );
}
