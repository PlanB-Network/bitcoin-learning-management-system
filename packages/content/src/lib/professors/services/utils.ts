import type { JoinedProfessor } from '@blms/types';

import { computeAssetCdnUrl, omitWithTypes } from '../../utils.js';

// TODO: Add return type
export const formatProfessor = (professor: JoinedProfessor) => {
  return {
    ...omitWithTypes(professor, [
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
    links: {
      website: professor.websiteUrl,
      twitter: professor.twitterUrl,
      github: professor.githubUrl,
    },
    tips: {
      lightningAddress: professor.lightningAddress,
      lnurlPay: professor.lnurlPay,
      paynym: professor.paynym,
      silentPayment: professor.silentPayment,
      url: professor.tipsUrl,
    },
    picture: computeAssetCdnUrl(
      professor.lastCommit,
      professor.path,
      'profile.webp',
    ),
  };
};
