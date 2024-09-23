import type { JoinedTutorialLight } from '@blms/types';

import builderSvg from '#src/assets/resources/builder.svg';
import conferenceSvg from '#src/assets/resources/conference.svg';
import glossarySvg from '#src/assets/resources/glossary.svg';
import librarySvg from '#src/assets/resources/library.svg';
import podcastSvg from '#src/assets/resources/podcast.svg';
import toolkitSvg from '#src/assets/resources/toolkit.svg';
import exchangeSvg from '#src/assets/tutorials/exchange.svg';
import merchantSvg from '#src/assets/tutorials/merchant.svg';
import miningSvg from '#src/assets/tutorials/mining.svg';
import nodeSvg from '#src/assets/tutorials/node.svg';
import otherSvg from '#src/assets/tutorials/other.svg';
import privacySvg from '#src/assets/tutorials/privacy.svg';
import walletSvg from '#src/assets/tutorials/wallet.svg';

// import webSvg from '../assets/icons/world-pixelated.svg';

export const TUTORIALS_CATEGORIES = [
  {
    name: 'wallet',
    image: walletSvg,
  },
  {
    name: 'node',
    image: nodeSvg,
  },
  {
    name: 'mining',
    image: miningSvg,
  },
  {
    name: 'merchant',
    image: merchantSvg,
  },
  {
    name: 'exchange',
    image: exchangeSvg,
  },
  {
    name: 'privacy',
    image: privacySvg,
  },
  {
    name: 'others',
    image: otherSvg,
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
    name: 'builders',
    image: builderSvg,
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
  // {
  //   name: 'newsletter',
  //   image: webSvg,
  //   unreleased: false,
  // },
] as const;

export const extractSubCategories = (tutorials: JoinedTutorialLight[]) => {
  return [
    ...new Set(
      tutorials
        .filter(Boolean)
        .map((t) => t.subcategory)
        .filter((sub): sub is string => sub !== null && sub !== undefined),
    ),
  ] as string[];
};
