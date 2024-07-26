import builderSvg from '#src/assets/resources/builder.svg';
import conferenceSvg from '#src/assets/resources/conference.svg';
import glossarySvg from '#src/assets/resources/glossary.svg';
import librarySvg from '#src/assets/resources/library.svg';
import podcastSvg from '#src/assets/resources/podcast.svg';
import toolkitSvg from '#src/assets/resources/toolkit.svg';

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
] as const;
