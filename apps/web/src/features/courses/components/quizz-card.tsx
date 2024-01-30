import { useState } from 'react';

import QuizzCardQuestion from './quizz-card-question';
import QuizzCardResults from './quizz-card-results';
import QuizzCardReview from './quizz-card-review';

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
  ...props
}: QuizzCardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [answersColors, setAnswersColors] = useState<string[]>([
    '#FAF7E7',
    '#FAF7E7',
    '#FAF7E7',
    '#FAF7E7',
    '#FAF7E7',
  ]);
  const [numberOfCorrectAnswers, setNumberOfCorrectAnswers] = useState(0);

  function handleNextQuestion(selectedAnswer: number) {
    const updatedSelectedAnswer = [...selectedAnswers];
    updatedSelectedAnswer[currentQuestionIndex] = selectedAnswer;
    setSelectedAnswers(updatedSelectedAnswer);

    let tempNumberOfCorrectAnswers = 0;

    const answersColorsTemp: string[] = updatedSelectedAnswer.map(
      (selectedAnswer, index) => {
        if (selectedAnswer == null) {
          return '#FAF7E7';
        } else {
          const correctAnswer = questions[index].correctAnswer;
          if (selectedAnswer === correctAnswer) {
            tempNumberOfCorrectAnswers++;
            return '#5EBA8B';
          } else {
            return '#DF3944';
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
    handleQuestionChange(0);
    setCurrentStep(currentStep + 1);
  }

  function handleEndOfQuiz() {
    console.log('End of quiz');
  }

  function handleQuestionChange(i: number) {
    setCurrentQuestionIndex(i);
  }

  return (
    <div className="border-blue-1000 bg-beige-400 flex w-full flex-col items-start gap-1.5 rounded-[1.25rem] border-2 p-2 md:gap-2.5 md:px-5">
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
          questionIndex={currentQuestionIndex}
          answers={[true, true, false, false]}
          answersColors={answersColors}
          numberOfCorrectAnswers={numberOfCorrectAnswers}
          nextStep={handleNextStep}
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
          explanation={questions[currentQuestionIndex].explanation as string}
          questionChange={handleQuestionChange}
          answersColors={answersColors}
          nextStep={handleEndOfQuiz}
        />
      )}
    </div>
  );
}
