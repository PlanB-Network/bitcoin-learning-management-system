import { firstRow } from '@blms/database';
import type { GetTutorialResponse } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { formatProfessor } from '../../professors/services/utils.js';
import { omit } from '../../utils.js';
import { getCreditsQuery } from '../queries/get-credits.js';
import { getTutorialQuery } from '../queries/get-tutorial.js';

export const createGetTutorial = ({ postgres }: Dependencies) => {
  return async (options: {
    id: string;
    language: string;
  }): Promise<GetTutorialResponse> => {
    const { id, language } = options;

    const tutorial = await postgres
      .exec(getTutorialQuery(id, language))
      .then(firstRow);

    if (!tutorial) {
      throw new Error(`Tutorial not found`);
    }

    const credits = await postgres
      .exec(getCreditsQuery(tutorial.id))
      .then(firstRow);

    if (!credits) {
      return {
        ...tutorial,
        credits: undefined,
      };
    }

    return {
      ...tutorial,
      credits: {
        ...omit(credits, [
          'tutorialId',
          'contributorId',
          'lightningAddress',
          'lnurlPay',
          'paynym',
          'silentPayment',
          'tipsUrl',
        ]),
        professor: credits.professor
          ? formatProfessor(credits.professor)
          : undefined,
        tips: {
          lightningAddress: credits.lightningAddress,
          lnurlPay: credits.lnurlPay,
          paynym: credits.paynym,
          silentPayment: credits.silentPayment,
          url: credits.tipsUrl,
        },
      },
    };
  };
};
