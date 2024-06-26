import { useTranslation } from 'react-i18next';

import { AlphabetGlossary } from '../components/AlphabetGlossary/index.tsx';
import { FilterBar } from '../components/NewFilterBar/index.tsx';
import { ResourceLayout } from '../layout.tsx';

export const GlossaryWord = () => {
  const { t } = useTranslation();
  const handleLetterSelection = (letter: string) => {
    setSelectedLetter(letter);
  };

  return (
    <ResourceLayout
      title={t('glossary.pageTitle')}
      tagLine={t('glossary.pageSubtitle')}
    >
      <div className="flex flex-col items-center justify-center w-full h-screen">
        <div className="flex  items-center justify-center w-1/2 flex-col gap-4 sm:gap-8">
          <div className="grid max-w-5xl    gap-6 ">
            <div className="self-center">
              <div>
                <h2 className="mt-0 text-3xl font-semibold uppercase text-orange-500">
                  {t('Testnet')}
                </h2>
                <p className="mt-2 text-gray-200">
                  {t(
                    "Version alternative de Bitcoin utilisée exclusivement à des fins de test et de développement. Il s'agit d'un réseau séparé du réseau principal (mainnet), avec ses propres blocs et transactions, permettant aux développeurs de tester de nouvelles fonctionnalités, applications et mises à jour sans risque pour le réseau principal. Le testnet permet également d'éviter de payer des frais de transaction lors de tests. Les bitcoins utilisés sur le testnet n'ont aucune valeur réelle.",
                  )}
                </p>
              </div>
            </div>
          </div>
          <FilterBar onChange={() => {}} />
          <AlphabetGlossary onLetterSelect={handleLetterSelection} />
        </div>
      </div>
    </ResourceLayout>
  );
};
