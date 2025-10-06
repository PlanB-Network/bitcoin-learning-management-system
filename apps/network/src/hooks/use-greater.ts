import {
  BreakPointHooks,
  breakpointsTailwind,
  useHasMounted,
} from '@react-hooks-library/core';
import { useEffect, useState } from 'react';

const { useGreater: rhlUseGreater } = BreakPointHooks(breakpointsTailwind);

export const useGreater = (breakpoint: keyof typeof breakpointsTailwind) => {
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
