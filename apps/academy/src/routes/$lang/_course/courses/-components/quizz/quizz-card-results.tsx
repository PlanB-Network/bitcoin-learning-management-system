import { useTranslation } from 'react-i18next';

import { QuizzHeader } from './-components/quizz-header.tsx';
import PieChart from './pie-chart.tsx';
import QuizzResultMessage from './quizz-result-message.tsx';

interface QuizzCardResultsProps {
  name: string;
  chapter: string;
  answersColors: string[];
  numberOfCorrectAnswers: number;
  nextStep: () => void;
  questionChange: (i: number) => void;
}

export default function QuizzCardResults({
  name,
  chapter,
  answersColors,
  nextStep,
  numberOfCorrectAnswers,
  questionChange,
}: QuizzCardResultsProps) {
  const { t } = useTranslation();

  const isMobile = window.innerWidth < 768;

  function pieClick(i: number) {
    questionChange(i);
  }

  return (
    <>
      <QuizzHeader
        title={t('courses.quizz.quizzResults')}
        name={name}
        chapter={chapter}
        answersColors={answersColors}
      />
      <div className="border-newBlack-1 bg-darkOrange-1 flex flex-col items-center self-stretch rounded-b-2xl border-2 p-5 md:px-8 md:py-9">
        <span className="mb-4 md:mb-6 text-newBlack-1 label-medium-16px md:title-large-24px">
          <QuizzResultMessage numberOfCorrectAnswers={numberOfCorrectAnswers} />
        </span>
        <button type="button" onClick={nextStep} className="mb-2 md:mb-4">
          <PieChart
            colors={answersColors}
            globalCursorPointer={true}
            width={isMobile ? 100 : 200}
            height={isMobile ? 100 : 200}
            handlePieClick={pieClick}
            onClickNextStep={nextStep}
          />
        </button>
        <span className="body-14px md:body-16px">
          {t('courses.quizz.clickOnPie')}
        </span>
      </div>
    </>
  );
}
