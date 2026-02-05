import { useTranslation } from 'react-i18next';

export const TaxesSpan = () => {
  const { t } = useTranslation();

  return (
    <span className="text-neutral-400 font-normal">(+{t('words.taxes')})</span>
  );
};
