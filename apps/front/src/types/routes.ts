// TODO document each route

export enum Routes {
  Home = '/',
  // Course
  Courses = '/courses',
  Course = '/courses/:courseId',
  // Ressources
  Ressources = '/ressources',
  Librairy = '/librairy',
  Book = '/librairy/:bookId',
  Newsletter = '/newletters',
  Articles = '/articles',
  Article = '/articles/:articleId',
  Videos = '/videos',
  Video = '/videos/:videoId',
  Podcasts = '/podcasts',
  Podcast = '/podcasts/:podcastId',
  Tools = '/tools',
  Tool = '/tools/:toolId',
  BIPs = '/bips',
  BIP = '/bips/:bipId',
  Conferences = '/conferences',
  Conference = '/conferences/:conferenceId',
  Companies = '/companies',
  Company = '/companies/:companyId',
  Lexique = '/lexique',
  Calendar = '/calendar',
  // Tutorials
  Tutorials = '/tutorials',
  Wallets = '/tutorials/wallets',
  Exchanges = '/tutorials/exchanges',
  Ordinal = '/tutorials/ordinal',
  Lightning = '/tutorials/lightning',
  Node = '/tutorials/nodes',
  Mining = '/tutorials/mining',
  // Contact
  Contact = '/contact',
}
