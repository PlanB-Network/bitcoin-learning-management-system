import articleSvg from '../../assets/resources/article.svg';
import bookSvg from '../../assets/resources/book.svg';
import couchSvg from '../../assets/resources/couch.svg';
import microSvg from '../../assets/resources/micro.svg';
import newsletterSvg from '../../assets/resources/newsletter.svg';

export const RESOURCES_CATEGORIES = [
  {
    name: 'books',
    image: bookSvg,
    unreleased: false,
  },
  {
    name: 'builders',
    image: couchSvg,
    unreleased: false,
  },
  {
    name: 'podcasts',
    image: microSvg,
    unreleased: false,
  },
  {
    name: 'articles',
    image: articleSvg,
    unreleased: true,
  },
  {
    name: 'newsletters',
    image: newsletterSvg,
    unreleased: true,
  },
  {
    name: 'conferences',
    image: couchSvg,
    unreleased: true,
  },
] as const;
