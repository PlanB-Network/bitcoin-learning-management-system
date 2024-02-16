import { useTranslation } from 'react-i18next';

import { Button } from '../../../atoms/Button';
import { MainLayout } from '../../../components/MainLayout';

export const TermsAndConditions = () => {
  const { t } = useTranslation();

  return (
    <MainLayout footerVariant="dark">
      <div className="flex flex-col items-center px-4">
        <div className="mx-8 mt-24 flex max-w-4xl flex-col items-center">
          <h1 className="text-4xl font-semibold uppercase text-orange-500">
            {t('words.termsAndConditions')}
          </h1>
        </div>

        <a
          href="/src/assets/terms.pdf"
          target="_blank"
          download
          rel="noreferrer"
        >
          <Button variant="tertiary" className="mt-6">
            {t('words.download')}
          </Button>
        </a>
      </div>
    </MainLayout>
  );
};
