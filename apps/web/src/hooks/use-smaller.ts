import {
  BreakPointHooks,
  breakpointsTailwind,
  useHasMounted,
} from '@react-hooks-library/core';
import { useEffect, useState } from 'react';

const { useSmaller: rhlUseSmaller } = BreakPointHooks(breakpointsTailwind);

export const useSmaller = (breakpoint: keyof typeof breakpointsTailwind) => {
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
