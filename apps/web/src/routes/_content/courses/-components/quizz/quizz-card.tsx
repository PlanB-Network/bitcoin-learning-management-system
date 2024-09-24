import { useState } from 'react';

import QuizzCardQuestion from './quizz-card-question.tsx';
import QuizzCardResults from './quizz-card-results.tsx';
import QuizzCardReview from './quizz-card-review.tsx';

export interface Question {
  question: string;
  answers: string[];
  explanation: string;
  correctAnswer: number;
}

interface QuizzCardProps extends React.HTMLProps<HTMLDivElement> {
  name: string;
  chapter: string;
  questions: Question[];
}

export default function QuizzCard({
  name,
  chapter,
  questions,
}: QuizzCardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Array<number | null>>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [answersColors, setAnswersColors] = useState<string[]>([
    '#FFF',
    '#FFF',
    '#FFF',
    '#FFF',
    '#FFF',
  ]);
  const [numberOfCorrectAnswers, setNumberOfCorrectAnswers] = useState(0);

  function handleNextQuestion(selectedAnswer: number) {
    const updatedSelectedAnswer = [...selectedAnswers];
    updatedSelectedAnswer[currentQuestionIndex] = selectedAnswer;
    setSelectedAnswers(updatedSelectedAnswer);

    let tempNumberOfCorrectAnswers = 0;

    const answersColorsTemp: string[] = updatedSelectedAnswer.map(
      (selectedAnswer, index) => {
        if (selectedAnswer === null) {
          return '#FFF';
        } else {
          const correctAnswer = questions[index].correctAnswer;
          if (selectedAnswer === correctAnswer) {
            tempNumberOfCorrectAnswers++;
            return '#53D250';
          } else {
            return '#E63333';
          }
        }
      },
    );

    setNumberOfCorrectAnswers(tempNumberOfCorrectAnswers);
    setAnswersColors(answersColorsTemp);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleNextStep();
    }
  }

  function handleNextStep() {
    setCurrentStep(currentStep + 1);
  }

  function handleQuestionChange(i: number) {
    setCurrentQuestionIndex(i);
  }

  return (
    <div className="border-newBlack-1 bg-white flex w-full max-w-[572px] flex-col gap-1.5 rounded-[20px] border md:border-2 p-[5px] md:p-2.5 md:gap-2.5 mx-auto">
      {currentStep === 1 && (
        <QuizzCardQuestion
          name={name}
          chapter={chapter}
          questionIndex={currentQuestionIndex}
          question={questions[currentQuestionIndex].question}
          correctAnswer={questions[currentQuestionIndex].correctAnswer}
          answers={questions[currentQuestionIndex].answers}
          answersColors={answersColors}
          nextQuestion={handleNextQuestion}
        />
      )}
      {currentStep === 2 && (
        <QuizzCardResults
          name={name}
          chapter={chapter}
          answersColors={answersColors}
          numberOfCorrectAnswers={numberOfCorrectAnswers}
          nextStep={handleNextStep}
          questionChange={handleQuestionChange}
        />
      )}
      {currentStep === 3 && (
        <QuizzCardReview
          name={name}
          chapter={chapter}
          question={questions[currentQuestionIndex].question}
          questionIndex={currentQuestionIndex}
          answers={questions[currentQuestionIndex].answers}
          selectedAnswer={selectedAnswers[currentQuestionIndex] as number}
          correctAnswer={questions[currentQuestionIndex].correctAnswer}
          numberOfCorrectAnswers={numberOfCorrectAnswers}
          explanation={questions[currentQuestionIndex].explanation}
          questionChange={handleQuestionChange}
          answersColors={answersColors}
          nextStep={() => {}}
        />
      )}
    </div>
  );
}
