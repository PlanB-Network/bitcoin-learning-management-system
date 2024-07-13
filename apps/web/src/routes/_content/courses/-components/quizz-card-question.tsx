import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import ArrowFilledIcon from '#src/assets/icons/arrow_filled.svg?react';
import RabbitHoldingPen from '#src/assets/rabbit_holding_pen.svg?react';

import PieChart from './pie-chart.tsx';

interface QuizzCardQuestionProps {
  name: string;
  chapter: string;
  questionIndex: number;
  question: string;
  answers: string[];
  correctAnswer: number;
  answersColors: string[];
  nextQuestion: (selectedAnswer: number) => void;
}

export default function QuizzCardQuestion({
  name,
  chapter,
  questionIndex,
  question,
  answers,
  correctAnswer,
  answersColors,
  nextQuestion,
}: QuizzCardQuestionProps) {
  const { t } = useTranslation();
  const [clickedAnswer, setClickedAnswer] = useState<number | null>(null);

  function answerClick(index: number) {
    if (!clickedAnswer) {
      setClickedAnswer(index);

      setTimeout(() => {
        nextQuestion(index);
        setClickedAnswer(null);
      }, 1000);
    }
  }

  return (
    <>
      <div className="border-blue-1000 flex h-12 items-center justify-between self-stretch rounded-t-[0.9375rem] border-2 bg-blue-800 py-3 pl-0 pr-2 md:h-16">
        <div className="flex items-center gap-3">
          <div className="flex size-12 flex-col items-center justify-end pr-0 md:size-16">
            <RabbitHoldingPen className="ml-[7px] md:ml-[-10px]" />
          </div>
          <div className="text-beige-300 text-center text-2xl font-semibold uppercase leading-[120%] md:text-3xl">
            {t('courses.quizz.quizz')}
          </div>
        </div>
        {/* Big screen */}
        <div className="hidden items-center justify-end gap-2.5 md:flex">
          <div className="text-beige-300 flex items-center text-center text-xl font-light md:text-3xl">
            {name} / {chapter}
          </div>
          <div className="flex size-14 items-center justify-center">
            <PieChart width={60} height={60} colors={answersColors} />
          </div>
        </div>
        {/* Small device */}
        <div className="flex items-center justify-end gap-2.5 md:hidden">
          <div className="text-beige-300 flex items-center text-center text-xl font-light md:text-3xl">
            n° {questionIndex + 1}/5
          </div>
        </div>
      </div>
      <div className="border-blue-1000 flex flex-col items-center self-stretch rounded-b-2xl border-2 bg-orange-500 px-2 py-4 md:px-8 md:pb-9 md:pt-6">
        <div className="mb-5 flex items-start gap-2.5 self-stretch">
          <ArrowFilledIcon />
          <div className=" text-blue-1000 text-xl font-medium italic">
            {question}
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 self-stretch pl-0 md:gap-5 md:pl-6">
          {answers.map((question, index) => (
            <button
              onClick={() => {
                answerClick(index);
              }}
              key={index}
              className="w-full"
            >
              <div className="flex w-full cursor-pointer items-start">
                <div
                  className={cn(
                    'border-blue-1000 flex w-full items-center gap-4 self-stretch rounded-2xl border-2 px-4 py-0',
                    index === clickedAnswer
                      ? index === correctAnswer
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      : 'bg-beige-300 hover:bg-newGray-4',
                  )}
                >
                  <div className="text-blue-1000  text-2xl font-semibold uppercase">
                    {String.fromCodePoint(97 + index)}
                  </div>
                  <div
                    className={cn(
                      ' text-blue-1000 text-start',
                      index === clickedAnswer ? 'font-bold' : 'font-medium',
                    )}
                  >
                    {question}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
