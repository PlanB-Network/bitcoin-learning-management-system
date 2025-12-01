import type { JoinedGlossaryWord } from '@blms/types';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpcClient } from '#src/utils/trpc.js';

interface GlossaryContextValue {
  glossaryMap: Map<string, JoinedGlossaryWord>;
  isLoading: boolean;
}

const GlossaryContext = createContext<GlossaryContextValue>({
  glossaryMap: new Map(),
  isLoading: true,
});

export const useGlossary = () => useContext(GlossaryContext);

export const GlossaryProvider = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();
  const [glossaryWords, setGlossaryWords] = useState<JoinedGlossaryWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    trpcClient.content.getGlossaryWords
      .query({ language: i18n.language })
      .then((data) => {
        setGlossaryWords(data ?? []);
      })
      .catch((error) => {
        console.error(
          '[GlossaryContext] Failed to fetch glossary words:',
          error,
        );
        setGlossaryWords([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [i18n.language]);

  const glossaryMap = useMemo(() => {
    const map = new Map<string, JoinedGlossaryWord>();
    for (const word of glossaryWords) {
      // Index by term (lowercase for case-insensitive matching)
      map.set(word.term.toLowerCase(), word);
      // Also index by original word if different
      if (word.originalWord.toLowerCase() !== word.term.toLowerCase()) {
        map.set(word.originalWord.toLowerCase(), word);
      }
    }
    return map;
  }, [glossaryWords]);

  const value: GlossaryContextValue = {
    glossaryMap,
    isLoading,
  };

  return (
    <GlossaryContext.Provider value={value}>
      {children}
    </GlossaryContext.Provider>
  );
};
