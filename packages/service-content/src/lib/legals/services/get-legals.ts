/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { JoinedLegalLight } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getLegalsQuery } from '../queries/get-legals.js';

export const createGetLegals = ({ postgres }: Dependencies) => {
  return (language?: string): Promise<JoinedLegalLight[]> => {
    return postgres.exec(getLegalsQuery(language));
  };
};
