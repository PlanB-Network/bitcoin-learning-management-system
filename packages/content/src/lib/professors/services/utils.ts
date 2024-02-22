import _ from 'lodash';

import type { JoinedProfessor } from '@sovereign-university/types';

import { computeAssetCdnUrl } from '../../utils.js';

export const formatProfessor = (professor: JoinedProfessor) => {
  return {
    ..._.omit(professor, [
      'website_url',
      'twitter_url',
      'github_url',
      'nostr',
      'lightning_address',
      'lnurl_pay',
      'paynym',
      'silent_payment',
      'tips_url',
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
