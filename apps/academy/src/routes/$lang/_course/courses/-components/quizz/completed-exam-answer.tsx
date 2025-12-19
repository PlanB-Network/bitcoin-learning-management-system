import { cn } from '@blms/ui';
import { formatTextCodeblock } from './quizz-card-question.tsx';

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
      className="border-neutral-1000 flex w-full items-stretch rounded-lg border overflow-hidden"
    >
      <span
        className={cn(
          'label-medium-med-16px md:title-large-24px text-neutral-1000 uppercase px-4 flex items-center bg-neutral-100',
          answerOrder === correctAnswer
            ? 'bg-green-300'
            : answerOrder === selectedAnswer
              ? 'bg-red-300'
              : 'bg-neutral-100 group-hover:bg-neutral-300',
        )}
      >
        {String.fromCodePoint(97 + answerIndex)}.{' '}
      </span>
      <p
        className={cn(
          'label-small-12px md:body-16px text-neutral-1000 text-start w-full px-1 md:px-4 border-l border-neutral-1000 py-1 min-h-12 md:py-3 bg-white',
          answerOrder === correctAnswer
            ? answerOrder === selectedAnswer
              ? 'bg-green-200 !font-semibold'
              : 'bg-green-200'
            : answerOrder === selectedAnswer
              ? 'bg-red-200 !font-semibold'
              : 'bg-white group-hover:bg-neutral-100',
        )}
      >
        {formatTextCodeblock(answer)}
      </p>
    </div>
  );
};
