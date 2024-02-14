import _ from 'lodash';

import { firstRow } from '@sovereign-university/database';

import type { Dependencies } from '../../dependencies.js';
import { formatProfessor } from '../../professors/services/utils.js';
import { getCreditsQuery, getTutorialQuery } from '../queries/index.js';

export const createGetTutorial =
  (dependencies: Dependencies) =>
  async ({
    category,
    name,
    language,
  }: {
    category: string;
    name: string;
    language: string;
  }) => {
    const { postgres } = dependencies;

    const tutorial = await postgres
      .exec(getTutorialQuery(category, name, language))
      .then(firstRow);

    if (!tutorial) return;

    const credits = await postgres
      .exec(getCreditsQuery(tutorial.id))
      .then(firstRow);

    if (!credits)
      return {
        ...tutorial,
        credits: undefined,
      };

    return {
      ...tutorial,
      credits: {
        ..._.omit(credits, [
          'tutorial_id',
          'contributor_id',
          'lightning_address',
          'lnurl_pay',
          'paynym',
          'silent_payment',
          'tips_url',
        ]),
        professor: credits.professor
          ? formatProfessor(credits.professor)
          : undefined,
        tips: {
          lightningAddress: credits.lightning_address,
          lnurlPay: credits.lnurl_pay,
          paynym: credits.paynym,
          silentPayment: credits.silent_payment,
          url: credits.tips_url,
        },
      },
    };
  };
