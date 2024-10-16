import { cn } from '@blms/ui';

interface CompletedExamAnswersProps {
  answer: string;
  answerIndex: number;
  answerOrder: number;
  correctAnswer: number | undefined;
  selectedAnswer: number | null;
}

export const CompletedExamAnswer = ({
  answer,
  answerIndex,
  answerOrder,
  correctAnswer,
  selectedAnswer,
}: CompletedExamAnswersProps) => {
  return (
    <div
      key={answerIndex}
      className="border-newBlack-1 flex w-full items-stretch rounded-lg border overflow-hidden"
    >
      <span
        className={cn(
          'label-medium-med-16px md:title-large-24px text-newBlack-1 uppercase px-4 flex items-center bg-newGray-5',
          answerOrder === correctAnswer
            ? 'bg-brightGreen-4'
            : answerOrder === selectedAnswer
              ? 'bg-red-4'
              : 'bg-newGray-5 group-hover:bg-newGray-3',
        )}
      >
        {String.fromCodePoint(97 + answerIndex)}.{' '}
      </span>
      <p
        className={cn(
          'label-small-12px md:body-16px text-newBlack-1 text-start w-full flex items-center px-[5px] md:px-4 border-l border-newBlack-1 max-md:py-0.5 bg-white',
          answerOrder === correctAnswer
            ? answerOrder === selectedAnswer
              ? 'bg-brightGreen-3 !font-semibold'
              : 'bg-brightGreen-3'
            : answerOrder === selectedAnswer
              ? 'bg-red-3 !font-semibold'
              : 'bg-white group-hover:bg-newGray-5',
        )}
      >
        {answer}
      </p>
    </div>
  );
};
