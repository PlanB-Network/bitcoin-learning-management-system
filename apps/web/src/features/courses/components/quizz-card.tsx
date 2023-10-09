import { useState } from 'react';

import QuizzCardQuestion from './quizz-card-question';
import QuizzCardResults from './quizz-card-results';
import QuizzCardReview from './quizz-card-review';

interface QuizzCardProps extends React.HTMLProps<HTMLDivElement> {
  name: string;
  chapter: string;
}

export default function QuizzCard({ name, chapter, ...props }: QuizzCardProps) {
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

  const questions = [
    {
      name: 'What is the purpose of creating an inheritance plan for your bitcoins?',
      answers: [
        'To ensure that your bitcoins will be properly managed after your death',
        'To avoid taxes on your bitcoins',
        'To increase the value of your bitcoins',
        'To prevent your bitcoins from being stolen',
      ],
      explanation:
        'An inheritance plan ensures that your bitcoins will be properly managed after your death. It can include a handwritten letter detailing your assets, their access methods, and the contact information of trusted individuals to be contacted.',
      correctAnswer: 0,
    },
    { name: 'Q2', answers: ['2A', '2B', '2C', '2D'], correctAnswer: 1 },
    { name: 'Q3', answers: ['3A', '3B', '3C', '3D'], correctAnswer: 3 },
    { name: 'Q4', answers: ['4A', '4B', '4C', '4D'], correctAnswer: 0 },
    { name: 'Q5', answers: ['5A', '5B', '5C', '5D'], correctAnswer: 2 },
  ];

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
    console.log('SELECTED answers:', selectedAnswers);
    setCurrentQuestionIndex(i);
  }

  return (
    <div className="border-blue-1000 bg-beige-400 flex w-full flex-col items-start gap-2.5 rounded-[1.25rem] border-2 p-2 px-5 md:max-w-[45rem]">
      {currentStep === 1 && (
        <QuizzCardQuestion
          name={name}
          chapter={chapter}
          question={questions[currentQuestionIndex].name}
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
          question={questions[currentQuestionIndex].name}
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
