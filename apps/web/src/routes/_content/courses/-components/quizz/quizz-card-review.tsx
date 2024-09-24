import { useTranslation } from 'react-i18next';
import { FaPlay } from 'react-icons/fa6';

import { cn } from '@blms/ui';

import { QuizzHeader } from './-components/quizz-header.tsx';
import PieChart from './pie-chart.tsx';
import QuizzResultMessage from './quizz-result-message.tsx';

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

  const isMobile = window.innerWidth < 768;

  function pieClick(i: number) {
    questionChange(i);
  }

  return (
    <>
      <QuizzHeader
        title={t('courses.quizz.quizzReview')}
        name={name}
        chapter={chapter}
        questionIndex={questionIndex}
        answersColors={answersColors}
      />
      <div className="border-newBlack-1 bg-darkOrange-1 flex flex-col items-center self-stretch rounded-b-2xl border-2 p-5 md:px-8 md:py-9">
        <span className="mb-4 md:mb-6 text-newBlack-1 label-medium-16px md:title-large-24px">
          <QuizzResultMessage numberOfCorrectAnswers={numberOfCorrectAnswers} />
        </span>
        <button onClick={nextStep} className="mb-5 md:mb-8">
          <PieChart
            width={isMobile ? 100 : 200}
            height={isMobile ? 100 : 200}
            colors={answersColors}
            handlePieClick={pieClick}
            selectedPieNumber={questionIndex}
          />
        </button>
        <div className="flex flex-col gap-2.5 md:gap-5 bg-newGray-6 rounded-b-2xl py-4 px-2.5 md:p-5">
          <div className="flex items-start gap-2.5 text-newBlack-1">
            <FaPlay
              size={window.innerWidth < 768 ? 10 : 24}
              className="max-md:mt-[5px]"
            />
            <span className="body-14px md:label-large-20px">{question}</span>
          </div>
          <p className="text-newBlack-4 label-small-12px md:body-14px border-l border-newBlack-1 my-2.5 px-1 md:px-2.5">
            {explanation}
          </p>
          <div className="flex flex-col gap-5">
            {answers.map((question, index) => (
              <div
                key={index}
                className="border-newBlack-1 flex w-full items-stretch rounded-lg border overflow-hidden"
              >
                <span
                  className={cn(
                    'subtitle-small-med-14px md:title-large-24px text-newBlack-1 uppercase px-4 flex items-center',
                    index === correctAnswer
                      ? 'bg-brightGreen-4'
                      : index === selectedAnswer
                        ? 'bg-red-4'
                        : 'bg-newGray-5 group-hover:bg-newGray-3',
                  )}
                >
                  {String.fromCodePoint(97 + index)}
                </span>
                <span
                  className={cn(
                    'label-small-12px md:body-16px text-newBlack-1 text-start w-full flex items-center px-4 border-l border-newBlack-1 max-md:py-0.5',
                    index === correctAnswer
                      ? index === selectedAnswer
                        ? 'bg-brightGreen-3 !font-semibold'
                        : 'bg-brightGreen-3'
                      : index === selectedAnswer
                        ? 'bg-red-3 !font-semibold'
                        : 'bg-white group-hover:bg-newGray-5',
                  )}
                >
                  {question}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
