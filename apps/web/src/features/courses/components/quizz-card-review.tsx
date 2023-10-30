import { useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import ArrowFilledIcon from '../../../assets/icons/arrow_filled.svg?react';
import RabbitHoldingPen from '../../../assets/rabbit_holding_pen.svg?react';

import PieChart from './pie-chart';
import QuizzResultMessage from './quizz-result-message';

interface QuizzCardReviewProps {
  name: string;
  chapter: string;
  question: string;
  questionIndex: number;
  answers: string[];
  selectedAnswer: number;
  correctAnswer: number;
  numberOfCorrectAnswers: number;
  explanation: string;
  answersColors: string[];
  nextStep: () => void;
  questionChange: (i: number) => void;
}

export default function QuizzCardReview({
  name,
  chapter,
  question,
  questionIndex,
  answers,
  selectedAnswer,
  correctAnswer,
  numberOfCorrectAnswers,
  explanation,
  answersColors,
  nextStep,
  questionChange,
}: QuizzCardReviewProps) {
  const { t } = useTranslation();

  function pieClick(i: number) {
    questionChange(i);
  }

  return (
    <>
      <div className="border-blue-1000 flex h-12 items-center justify-between self-stretch rounded-t-[0.9375rem] border-2 bg-blue-800 py-3 pl-0 pr-2 md:h-16">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-col items-center justify-end pr-0 md:h-16 md:w-16">
            <RabbitHoldingPen className="ml-[7px] md:ml-[-10px]" />
          </div>
          <div className="text-beige-300 text-center text-2xl font-semibold uppercase leading-[120%] md:text-3xl">
            {t('courses.quizz.quizzReview')}
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
      <div className="border-blue-1000 bg-grayblue-300 flex w-fit flex-col items-center self-stretch rounded-b-2xl border-2 px-4 pb-5 pt-3 md:px-8 md:pb-9 md:pt-6">
        <div className="mb-5 flex flex-col items-center gap-2.5 self-stretch">
          <div className="text-blue-1000 text-xl font-medium">
            <QuizzResultMessage
              numberOfCorrectAnswers={numberOfCorrectAnswers}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div onClick={nextStep}>
            <PieChart
              width={160}
              height={160}
              colors={answersColors}
              handlePieClick={pieClick}
              selectedPieNumber={questionIndex}
            />
          </div>
          <div className="bg-beige-300 rounded-[0.9375rem] border-2 border-gray-300 p-3">
            <div className="mb-1 flex flex-row items-center gap-1">
              <ArrowFilledIcon height={20} />
              <p className="mt-1 text-sm font-medium">{question}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-blue-1000 ml-2 mt-2 grow break-words text-sm md:mt-2 md:text-base">
                {explanation}
              </p>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {answers.map((question, index) => (
                <div className="flex items-start" key={index}>
                  <div
                    className={cn(
                      'border-gray-600 flex w-full items-center gap-4 self-stretch rounded-2xl border-2 px-4 py-0',
                      index === selectedAnswer
                        ? index === correctAnswer
                          ? 'bg-green-300 border-green-500'
                          : 'border-red-400 text-red-400'
                        : index === correctAnswer
                        ? 'bg-green-300'
                        : 'bg-beige-300',
                    )}
                  >
                    <div
                      className={cn(
                        'text-blue-1000  text-2xl font-semibold uppercase',
                        index === selectedAnswer
                          ? index === correctAnswer
                            ? 'font-semibold text-blue-1000'
                            : 'font-semibold text-red-500'
                          : index === correctAnswer
                          ? 'font-medium text-blue-1000'
                          : 'font-medium text-blue-1000',
                      )}
                    >
                      {String.fromCharCode(97 + index)}
                    </div>
                    <div
                      className={cn(
                        index === selectedAnswer
                          ? index === correctAnswer
                            ? 'font-semibold text-blue-1000'
                            : 'font-semibold text-red-500'
                          : index === correctAnswer
                          ? 'font-medium text-blue-1000'
                          : 'font-medium text-blue-1000',
                      )}
                    >
                      {question}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
