import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlay } from 'react-icons/fa6';

import { cn } from '@blms/ui';

import { QuizzHeader } from './-components/quizz-header.tsx';

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
      <QuizzHeader
        title={t('courses.quizz.quizz')}
        name={name}
        chapter={chapter}
        questionIndex={questionIndex}
        answersColors={answersColors}
      />
      <div className="border-newBlack-1 flex flex-col items-center self-stretch rounded-b-2xl border md:border-2 bg-darkOrange-1 px-2 py-4 md:px-8 md:pb-9 md:pt-6">
        <div className="mb-6 flex items-start gap-2.5 text-newBlack-1">
          <FaPlay
            size={window.innerWidth < 768 ? 10 : 24}
            className="max-md:mt-[5px]"
          />
          <span className="body-14px md:label-large-20px">{question}</span>
        </div>
        <div className="flex flex-col items-start gap-3 self-stretch pl-0 md:gap-5 md:pl-7">
          {answers.map((question, index) => (
            <button
              onClick={() => {
                answerClick(index);
              }}
              key={index}
              className="group w-full"
            >
              <div className="border-newBlack-1 flex w-full cursor-pointer items-stretch rounded-lg border overflow-hidden">
                <span
                  className={cn(
                    'subtitle-small-med-14px md:title-large-24px text-newBlack-1 uppercase px-4 flex items-center',
                    index === clickedAnswer
                      ? clickedAnswer === correctAnswer
                        ? 'bg-brightGreen-4'
                        : 'bg-red-4'
                      : 'bg-newGray-5 group-hover:bg-newGray-3',
                  )}
                >
                  {String.fromCodePoint(97 + index)}
                </span>
                <span
                  className={cn(
                    'label-small-12px md:body-16px text-newBlack-1 text-start w-full flex items-center px-4 border-l border-newBlack-1 max-md:py-0.5',
                    index === clickedAnswer
                      ? clickedAnswer === correctAnswer
                        ? 'bg-brightGreen-3 !font-semibold'
                        : 'bg-red-3 !font-semibold'
                      : 'bg-white group-hover:bg-newGray-5',
                  )}
                >
                  {question}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
