import type { JoinedTutorialLight } from '@blms/types';

import webSvg from '#src/assets/icons/world-pixelated.svg';
import conferenceSvg from '#src/assets/resources/conference.svg';
import glossarySvg from '#src/assets/resources/glossary.svg';
import lectureSvg from '#src/assets/resources/lecture.svg';
import librarySvg from '#src/assets/resources/library.svg';
import movieSvg from '#src/assets/resources/movie.svg';
import podcastSvg from '#src/assets/resources/podcast.svg';
import projectSvg from '#src/assets/resources/project.svg';
import toolkitSvg from '#src/assets/resources/toolkit.svg';
import youtubeSvg from '#src/assets/resources/youtube.svg';
import businessSvg from '#src/assets/tutorials/business.svg';
import computerSecuritySvg from '#src/assets/tutorials/computer-security.svg';
import contributionSvg from '#src/assets/tutorials/contribution.svg';
import exchangeSvg from '#src/assets/tutorials/exchange.svg';
import miningSvg from '#src/assets/tutorials/mining.svg';
import nodeSvg from '#src/assets/tutorials/node.svg';
import privacySvg from '#src/assets/tutorials/privacy.svg';
import walletSvg from '#src/assets/tutorials/wallet.svg';

export const TUTORIALS_CATEGORIES = [
  {
    image: walletSvg,
    name: 'wallet',
    route: '/tutorials/wallet',
    subcategories: ['mobile', 'desktop', 'hardware', 'backup'],
  },
  {
    image: nodeSvg,
    name: 'node',
    route: '/tutorials/node',
    subcategories: ['bitcoin', 'lightning-network', 'others'],
  },
  {
    image: miningSvg,
    name: 'mining',
    route: '/tutorials/mining',
    subcategories: ['hardware', 'pool'],
  },
  {
    image: exchangeSvg,
    name: 'exchange',
    route: '/tutorials/exchange',
    subcategories: ['centralized', 'peer-to-peer'],
  },
  {
    image: businessSvg,
    name: 'business',
    route: '/tutorials/business',
    subcategories: ['point-of-sale', 'others'],
  },
  {
    image: privacySvg,
    name: 'privacy',
    route: '/tutorials/privacy',
    subcategories: ['on-chain', 'analysis'],
  },
  {
    image: computerSecuritySvg,
    name: 'computer-security',
    route: '/tutorials/computer-security',
    subcategories: [
      'authentication',
      'communication',
      'data',
      'operating system',
    ],
  },
  {
    image: contributionSvg,
    name: 'contribution',
    route: '/tutorials/contribution',
    subcategories: ['content', 'resource', 'others'],
  },
] as const;

export const RESOURCES_CATEGORIES = [
  {
    image: librarySvg,
    name: 'books',
    unreleased: false,
  },
  {
    image: podcastSvg,
    name: 'podcasts',
    unreleased: false,
  },
  {
    image: conferenceSvg,
    name: 'conferences',
    unreleased: false,
  },
  {
    image: projectSvg,
    name: 'projects',
    unreleased: false,
  },
  {
    image: toolkitSvg,
    name: 'bet',
    unreleased: false,
  },
  {
    image: glossarySvg,
    name: 'glossary',
    unreleased: false,
  },
  {
    image: webSvg,
    name: 'newsletters',
    unreleased: false,
  },
  {
    image: youtubeSvg,
    name: 'channels',
    unreleased: false,
  },
  {
    image: lectureSvg,
    name: 'lectures',
    unreleased: false,
  },
  {
    image: movieSvg,
    name: 'movies',
    unreleased: false,
  },
] as const;

export const extractSubCategories = (
  tutorials: JoinedTutorialLight[],
  currentCategory: string,
) => {
  const extractedSubCategories = [
    ...new Set(
      tutorials.map((t) => t.subcategory).filter((sub): sub is string => !!sub),
    ),
  ];
  const subcategoriesInOrder = TUTORIALS_CATEGORIES.find(
    (c) => c.name === currentCategory,
  )?.subcategories as readonly string[];

  const filteredSubcategoriesInOrder = subcategoriesInOrder.filter(
    (subcategory) => extractedSubCategories.includes(subcategory),
  );

  return filteredSubcategoriesInOrder;
};

export function getNameAndIdFromUrl(param: string) {
  const objectId = param.slice(-36);
  const objectName = param.slice(0, -37);

  return {
    id: objectId,
    name: objectName,
  };
}

export function getNameAndIdFromUrlForNumbers(param: string) {
  const objectId = param.split('-').pop();
  const objectName = param.slice(0, Math.max(0, param.lastIndexOf('-')));

  return {
    id: objectId,
    name: objectName,
  };
}

export interface PaymentModalDataModel {
  eventId: string | null;
  satsPrice: number | null;
  dollarPrice: number | null;
  accessType: 'physical' | 'online' | 'replay' | null;
}

export const getFormattedUnit = (
  amount: number,
  unit: string,
  floating = 2,
) => {
  let prefix = '';
  if (amount > 0 && amount < 0.01) {
    // biome-ignore lint/style/noParameterAssign: explanation
    amount = 0.01;
    prefix = '< ';
  }

  if (unit === 'sats') {
    return `${prefix}${amount} sats`;
  }

  return `${prefix}${Intl.NumberFormat(undefined, {
    currency: unit,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: floating,
    minimumFractionDigits: floating,
    style: 'currency',
  }).format(amount)}`;
};

export const DEFAULT_CURRENCY = 'USD';
