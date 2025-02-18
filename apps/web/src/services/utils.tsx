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
import exchangeSvg from '#src/assets/tutorials/exchange.svg';
import merchantSvg from '#src/assets/tutorials/merchant.svg';
import miningSvg from '#src/assets/tutorials/mining.svg';
import nodeSvg from '#src/assets/tutorials/node.svg';
import otherSvg from '#src/assets/tutorials/other.svg';
import privacySvg from '#src/assets/tutorials/privacy.svg';
import walletSvg from '#src/assets/tutorials/wallet.svg';

export const TUTORIALS_CATEGORIES = [
  {
    name: 'wallet',
    image: walletSvg,
    subcategories: ['mobile', 'desktop', 'hardware', 'backup'],
  },
  {
    name: 'node',
    image: nodeSvg,
    subcategories: ['bitcoin', 'lightning-network', 'rgb'],
  },
  {
    name: 'mining',
    image: miningSvg,
    subcategories: ['hardware', 'pools'],
  },
  {
    name: 'merchant',
    image: merchantSvg,
    subcategories: ['merchant'],
  },
  {
    name: 'exchange',
    image: exchangeSvg,
    subcategories: ['centralized', 'peer-to-peer'],
  },
  {
    name: 'privacy',
    image: privacySvg,
    subcategories: ['on-chain', 'analysis'],
  },
  {
    name: 'others',
    image: otherSvg,
    subcategories: ['general', 'contribution', 'other'],
  },
] as const;

export const RESOURCES_CATEGORIES = [
  {
    name: 'books',
    image: librarySvg,
    unreleased: false,
  },
  {
    name: 'podcasts',
    image: podcastSvg,
    unreleased: false,
  },
  {
    name: 'conferences',
    image: conferenceSvg,
    unreleased: false,
  },
  {
    name: 'projects',
    image: projectSvg,
    unreleased: false,
  },
  {
    name: 'bet',
    image: toolkitSvg,
    unreleased: false,
  },
  {
    name: 'glossary',
    image: glossarySvg,
    unreleased: false,
  },
  {
    name: 'newsletters',
    image: webSvg,
    unreleased: false,
  },
  {
    name: 'channels',
    image: youtubeSvg,
    unreleased: false,
  },
  {
    name: 'lectures',
    image: lectureSvg,
    unreleased: false,
  },
  {
    name: 'movies',
    image: movieSvg,
    unreleased: false,
  },
] as const;

export const extractSubCategories = (tutorials: JoinedTutorialLight[]) => {
  const extractedSubCategories = [
    ...new Set(
      tutorials.map((t) => t.subcategory).filter((sub): sub is string => !!sub),
    ),
  ];

  const allSubcategoriesInOrder = TUTORIALS_CATEGORIES.flatMap(
    (category) => category.subcategories,
  );

  extractedSubCategories.sort((a, b) => {
    // Find the index of each subcategory in the predefined order
    const indexA = allSubcategoriesInOrder.indexOf(
      a as (typeof allSubcategoriesInOrder)[number],
    );
    const indexB = allSubcategoriesInOrder.indexOf(
      b as (typeof allSubcategoriesInOrder)[number],
    );
    return (
      // Sort by index in allSubcategoriesInOrder -> Hack with max safe integer so that if it's not found it goes to the end
      (indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA) -
      (indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB)
    );
  });

  return extractedSubCategories;
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
