import _ from 'lodash';

import { JoinedProfessor } from '@sovereign-university/types';

import { computeAssetCdnUrl } from '../../utils';

export const formatProfessor = (professor?: JoinedProfessor) => {
  if (!professor) return;

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
      website: professor.website_url,
      twitter: professor.twitter_url,
      github: professor.github_url,
    },
    tips: {
      lightningAddress: professor.lightning_address,
      lnurlPay: professor.lnurl_pay,
      paynym: professor.paynym,
      silentPayment: professor.silent_payment,
      url: professor.tips_url,
    },
    picture: computeAssetCdnUrl(
      process.env['CDN_URL'] || 'http://localhost:8080',
      professor.last_commit,
      professor.path,
      'profile.jpg',
    ),
  };
};
