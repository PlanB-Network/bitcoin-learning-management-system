import { BreakPointHooks, useHasMounted } from '@react-hooks-library/core';
import { useEffect, useState } from 'react';

const customBreakpoints = {
  sm: 639,
  md: 767,
  lg: 1023,
  xl: 1279,
  '2xl': 1535,
};

// Using custom breakpoints instead of Tailwind's one to prevent discrepancies
const { useSmaller: rhlUseSmaller } = BreakPointHooks(customBreakpoints);

export const useSmaller = (breakpoint: keyof typeof customBreakpoints) => {
  const [isSmaller, setIsSmaller] = useState<boolean | null>(null);
  const isRhlSmaller = rhlUseSmaller(breakpoint);
  const hasMounted = useHasMounted();

  useEffect(() => {
    if (hasMounted) {
      setIsSmaller(isRhlSmaller);
    }
  }, [hasMounted, isRhlSmaller]);

  return isSmaller;
};
