import type { JoinedProfessor } from '@sovereign-university/types';

import { computeAssetCdnUrl, omitWithTypes } from '#src/lib/utils.js';

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
      process.env['CDN_URL'] || 'http://localhost:8080',
      professor.lastCommit,
      professor.path,
      'profile.jpg',
    ),
  };
};
