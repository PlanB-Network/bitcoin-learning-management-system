import type { FormattedProfessor, JoinedProfessor } from '@blms/types';

import { omit } from '../../utils.js';

export const formatProfessor = (
  professor: JoinedProfessor,
): FormattedProfessor => {
  return {
    ...omit(professor, [
      'linkedinUrl',
      'websiteUrl',
      'twitterUrl',
      'githubUrl',
      'nostr',
      'lightningAddress',
      'lnurlPay',
      'paynym',
      'silentPayment',
      'tipsUrl',
    ]),
    lastSync: new Date(professor.lastSync),
    lastUpdated: new Date(professor.lastUpdated),
    links: {
      github: professor.githubUrl,
      nostr: professor.nostr,
      linkedin: professor.linkedinUrl,
      twitter: professor.twitterUrl,
      website: professor.websiteUrl,
    },
    tips: {
      lightningAddress: professor.lightningAddress,
      lnurlPay: professor.lnurlPay,
      paynym: professor.paynym,
      silentPayment: professor.silentPayment,
      url: professor.tipsUrl,
    },
  };
};
