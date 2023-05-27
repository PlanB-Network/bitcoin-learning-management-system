// TODO document each route

export enum Routes {
  /**
   * Available in MVP
   */
  Home = '/',
  AboutUs = '/about-us',
  UnderConstruction = '/under-construction',

  // Courses
  Courses = '/courses',
  Course = '/course/:courseId',
  // Resources
  Resources = '/resources',
  // Resource per type
  Library = '/library',
  Book = '/library/:bookId/:language',
  Podcasts = '/podcasts',
  Podcast = '/podcasts/:podcastId',
  Builders = '/builders',
  Builder = '/builder/:builderId/:language',

  // Tutorials
  Tutorials = '/tutorials',
  Tutorial = '/tutorial/:tutorialType',

  Wallets = '/tutorials/wallets',
  Exchanges = '/tutorials/exchanges',
  Merchants = '/tutorials/merchants',
  Mining = '/tutorials/mining',
  Lightning = '/tutorials/lightning',
  Node = '/tutorials/nodes',

  Profile = '/profile',

  /**
   * For later use
   */
  Newsletter = '/newletters',
  Articles = '/articles',
  Article = '/articles/:articleId',
  Interviews = '/interview',
  Interview = '/interview/:interviewId',
  Videos = '/videos',
  Video = '/videos/:videoId',
  Tools = '/tools',
  Tool = '/tools/:toolId',
  BIPs = '/bips',
  BIP = '/bips/:bipId',
  Conferences = '/conferences',
  Conference = '/conferences/:conferenceId',
  Lexique = '/lexique',
  Calendar = '/calendar',
  // Contact
  Contact = '/contact',
}
