import builderSvg from '../../assets/resources/builder.svg';
import conferenceSvg from '../../assets/resources/conference.svg';
import glossarySvg from '../../assets/resources/glossary.svg';
import librarySvg from '../../assets/resources/library.svg';
import podcastSvg from '../../assets/resources/podcast.svg';
import toolkitSvg from '../../assets/resources/toolkit.svg';

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
    unreleased: true,
  },
] as const;
