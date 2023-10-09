import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import ArrowFilledIcon from '../../../assets/icons/arrow_filled.svg?react';
import RabbitHoldingPen from '../../../assets/rabbit_holding_pen.svg?react';

import PieChart from './pie-chart';

interface QuizzCardQuestionProps {
  name: string;
  chapter: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  answersColors: string[];
  nextQuestion: (selectedAnswer: number) => void;
}

export default function QuizzCardQuestion({
  name,
  chapter,
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
      <div className="border-blue-1000 flex h-16 items-center justify-between self-stretch rounded-t-[0.9375rem] border-2 bg-blue-800 py-3 pl-0 pr-2">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 flex-col items-center justify-end pr-0">
            <RabbitHoldingPen />
          </div>
          <div className="text-beige-300 text-center text-[1.9375rem]  font-semibold uppercase leading-[120%]">
            {t('courses.quizz.quizz')}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5">
          <div className="text-beige-300 flex items-center text-center  text-3xl font-light">
            {name} / {chapter}
          </div>
          <div className="flex h-14 w-14 items-center justify-center">
            <PieChart width={60} height={60} colors={answersColors} />
          </div>
        </div>
      </div>
      <div className="border-blue-1000 flex flex-col items-center self-stretch rounded-b-2xl border-2 bg-orange-500 px-8 pb-9 pt-6">
        <div className="mb-5 flex items-start gap-2.5 self-stretch">
          <ArrowFilledIcon />
          <div className=" text-blue-1000 text-xl font-medium italic">
            {question}
          </div>
        </div>
        <div className="flex flex-col items-start gap-5 self-stretch pl-6">
          {answers.map((question, index) => (
            <div
              className="flex w-full cursor-pointer items-start"
              key={index}
              onClick={() => {
                answerClick(index);
              }}
            >
              <div
                className={cn(
                  'border-blue-1000 flex w-full items-center gap-4 self-stretch rounded-2xl border-2 px-4 py-0',
                  index === clickedAnswer
                    ? index === correctAnswer
                      ? 'bg-green-500'
                      : 'bg-red-500'
                    : 'bg-beige-300',
                )}
              >
                <div className="text-blue-1000  text-2xl font-semibold uppercase">
                  {String.fromCharCode(97 + index)}
                </div>
                <div
                  className={cn(
                    ' text-blue-1000',
                    index === clickedAnswer ? 'font-bold' : 'font-medium',
                  )}
                >
                  {question}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
