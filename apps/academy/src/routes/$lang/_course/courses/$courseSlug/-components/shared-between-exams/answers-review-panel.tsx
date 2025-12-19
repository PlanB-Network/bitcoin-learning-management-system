import type { CourseExamResults } from '@blms/types';
import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import { useState } from 'react';
import { CompletedExamAnswer } from '../../../-components/quizz/completed-exam-answer.tsx';
import { formatTextCodeblock } from '../../../-components/quizz/quizz-card-question.tsx';
export const AnswersReviewPanel = ({
  examResults,
  hasBackground,
  className,
}: {
  examResults: CourseExamResults;
  hasBackground?: boolean;
  className?: string;
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  return (
    <section
      className={cn(
        'flex flex-col gap-6 md:gap-5 w-full',
        hasBackground && 'bg-neutral-50 rounded-[20px]',
        className,
      )}
    >
      {/* Question selection */}
      <section className="flex flex-wrap gap-2 md:gap-2 md:py-4 w-full max-md:justify-center">
        {examResults.questions.map((q, index) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: explanation
            key={index}
            type="button"
            onClick={() => setSelectedQuestion(index)}
            className={cn(
              'size-8 md:size-10 flex justify-center items-center border border-neutral-500 rounded-lg label-medium-med-16px md:title-large-24px text-neutral-1000',
              q.userAnswer === q.answers.find((ans) => ans.correctAnswer)?.order
                ? selectedQuestion === index
                  ? 'bg-green-300'
                  : 'bg-green-100 hover:bg-green-300'
                : selectedQuestion === index
                  ? 'bg-red-300'
                  : 'bg-red-100 hover:bg-red-300',
            )}
          >
            {index + 1}
          </button>
        ))}
      </section>

      {/* Question details */}
      <article className="flex flex-col md:border-t border-neutral-600 md:px-5 gap-4 w-full md:pt-5">
        <h3 className="body-medium-16px md:subtitle-medium-med-16px text-neutral-1000">
          {selectedQuestion + 1} .{' '}
          {formatTextCodeblock(examResults.questions[selectedQuestion].text)}
        </h3>

        <section className="flex flex-col gap-2.5 md:gap-4 w-full md:p-2.5">
          {examResults.questions[selectedQuestion].answers.map(
            (answer, answerIndex) => (
              <CompletedExamAnswer
                // biome-ignore lint/suspicious/noArrayIndexKey: explanation
                key={answerIndex}
                answer={answer.text}
                answerIndex={answerIndex}
                answerOrder={answer.order}
                correctAnswer={
                  examResults.questions[selectedQuestion].answers.find(
                    (ans) => ans.correctAnswer,
                  )?.order
                }
                selectedAnswer={
                  examResults.questions[selectedQuestion].userAnswer
                }
              />
            ),
          )}
        </section>

        {/* Explanations */}
        <section className="flex flex-col gap-2.5">
          <h5 className="body-medium-16px md:subtitle-large-med-20px text-neutral-1000">
            {t('courses.exam.explanations')}
          </h5>
          <p className="text-neutral-1000 body-12px md:body-16px text-justify">
            {formatTextCodeblock(
              examResults.questions[selectedQuestion].explanation,
            )}
          </p>
        </section>

        {/* Link to chapter */}
        <section className="flex max-md:flex-col md:items-center gap-2.5">
          <h5 className="body-medium-12px md:body-medium-16px text-neutral-1000">
            {t('courses.exam.findInformationChapter')}
          </h5>
          <Link
            to={examResults.questions[selectedQuestion].chapterLink}
            target="_blank"
            className="text-blue-500 body-12px md:body-16px underline text-justify"
          >
            {examResults.questions[selectedQuestion].chapterPart}.
            {examResults.questions[selectedQuestion].chapterIndex}.{' '}
            {examResults.questions[selectedQuestion].chapterName}
          </Link>
        </section>
      </article>
    </section>
  );
};
