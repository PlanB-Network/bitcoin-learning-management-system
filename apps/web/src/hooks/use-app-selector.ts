import type { TypedUseSelectorHook } from 'react-redux';
import { useSelector } from 'react-redux';

import type { RootState } from '../store/index.ts';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
