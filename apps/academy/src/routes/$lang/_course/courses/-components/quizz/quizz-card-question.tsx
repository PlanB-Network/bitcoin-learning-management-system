import { cn } from '@blms/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlay } from 'react-icons/fa6';
import { CodeRenderer } from '#src/components/Markdown/Renderers/code-renderer.tsx';
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
        <div className="mb-6 flex items-start gap-2.5 text-newBlack-1 w-full">
          <FaPlay
            size={window.innerWidth < 768 ? 10 : 24}
            className="max-md:mt-1 shrink-0"
          />
          <span className="body-14px md:label-large-20px">
            {formatTextCodeblock(question)}
          </span>
        </div>
        <div className="flex flex-col items-start gap-3 self-stretch pl-0 md:gap-5 md:pl-7">
          {answers.map((question, index) => (
            <button
              type="button"
              onClick={() => {
                answerClick(index);
              }}
              key={question}
              className="group w-full"
            >
              <div className="border-newBlack-1 flex w-full cursor-pointer items-stretch rounded-lg border overflow-hidden">
                <span
                  className={cn(
                    'label-medium-med-16px md:title-large-24px text-newBlack-1 uppercase px-4 flex items-center',
                    index === clickedAnswer
                      ? clickedAnswer === correctAnswer
                        ? 'bg-green-300'
                        : 'bg-red-4'
                      : 'bg-newGray-5 md:group-hover:bg-newGray-3',
                  )}
                >
                  {String.fromCodePoint(97 + index)}
                </span>
                <span
                  className={cn(
                    'label-small-12px md:body-16px text-newBlack-1 text-start w-full px-1 md:px-4 border-l border-newBlack-1 py-1 min-h-12 md:py-3',
                    index === clickedAnswer
                      ? clickedAnswer === correctAnswer
                        ? 'bg-green-200 !font-semibold'
                        : 'bg-red-3 !font-semibold'
                      : 'bg-white md:group-hover:bg-newGray-5',
                  )}
                >
                  {formatTextCodeblock(question)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export const formatTextCodeblock = (text: string) => {
  if (!text) return null;
  return text.split(/`([^`]+)`/g).map((part, index) => {
    if (index % 2 === 1) {
      return (
        // biome-ignore lint/suspicious/noArrayIndexKey: <N/A>
        <CodeRenderer key={index} highContrast>
          {part}
        </CodeRenderer>
      );
    }
    return part;
  });
};
