import {
  type PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from 'react';

interface ConversionRateContext {
  conversionRate: number | null;
  setConversionRate: (rate: number | null) => void;
}

export const ConversionRateContext = createContext<ConversionRateContext>({
  conversionRate: null,
  setConversionRate: () => {},
});

export const ConversionRateProvider = ({ children }: PropsWithChildren) => {
  const [conversionRate, setConversionRate] = useState<number | null>(null);

  const fetchConversionRate = async (): Promise<void> => {
    try {
      const response = await fetch('https://mempool.space/api/v1/prices');
      const data: MempoolPrice = await response.json();

      if (data?.USD) {
        setConversionRate(data.USD);
      } else {
        throw new Error(
          'Failed to retrieve conversion rate from mempool.space.',
        );
      }
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
    }
  };

  useEffect(() => {
    fetchConversionRate();

    const interval = setInterval(fetchConversionRate, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const conversionRateContext: ConversionRateContext = {
    conversionRate,
    setConversionRate,
  };

  return (
    <ConversionRateContext.Provider value={conversionRateContext}>
      {children}
    </ConversionRateContext.Provider>
  );
};

interface MempoolPrice {
  USD: number;
  EUR: number;
}
