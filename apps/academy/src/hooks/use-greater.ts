import { BreakPointHooks, useHasMounted } from '@react-hooks-library/core';
import { useEffect, useState } from 'react';

const customBreakpoints = {
  '2xl': 1536,
  lg: 1024,
  md: 768,
  sm: 640,
  xl: 1280,
  '1440px': 1440,
};

const { useGreater: rhlUseGreater } = BreakPointHooks(customBreakpoints);

export const useGreater = (breakpoint: keyof typeof customBreakpoints) => {
  const [isGreater, setIsGreater] = useState<boolean | null>(null);
  const isRhlGreater = rhlUseGreater(breakpoint);
  const hasMounted = useHasMounted();

  useEffect(() => {
    if (hasMounted) {
      setIsGreater(isRhlGreater);
    }
  }, [hasMounted, isRhlGreater]);

  return isGreater;
};
