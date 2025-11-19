import { useTranslation } from 'react-i18next';

interface QuizzResultMessageProps {
  numberOfCorrectAnswers: number;
}

export default function QuizzResultMessage({
  numberOfCorrectAnswers,
}: QuizzResultMessageProps) {
  const { t } = useTranslation();

  return (
    <>
      {numberOfCorrectAnswers === 5 && t('courses.quizz.resultPerfect')}
      {numberOfCorrectAnswers === 4 && t('courses.quizz.resultCongrats')}
      {numberOfCorrectAnswers === 3 && t('courses.quizz.resultNotBad')}
      {numberOfCorrectAnswers < 3 && t('courses.quizz.resultItsOk')}
    </>
  );
}
