export enum BetType {
  VisualContent = 'visual content',
  EducationalContent = 'educational content',
}

export enum EventType {
  Conference = 'conference',
  Workshop = 'workshop',
  Course = 'course',
  Lecture = 'lecture',
  Exam = 'exam',
  Meetup = 'meetup',
}

export enum EducatorContentType {
  Art = 'art',
  Booklet = 'booklet',
  Curriculum = 'curriculum',
  Flyer = 'flyer',
  Game = 'game',
  Other = 'other',
  Presentation = 'presentation',
  Sticker = 'sticker',
  Workshop = 'workshop',
}

export enum EducatorContentStatus {
  Draft = 'draft',
  Published = 'published',
  Rejected = 'rejected',
  Unpublished = 'unpublished',
}

export enum EducatorContentLicense {
  CcBySa = 'CC-BY-SA',
  CcBy = 'CC-BY',
  CcByNc = 'CC-BY-NC',
  CcByNcSa = 'CC-BY-NC-SA',
  CcByNd = 'CC-BY-ND',
  CcByNcNd = 'CC-BY-NC-ND',
  Mit = 'MIT',
}

export enum ResourceType {
  Project = 'projects',
  Book = 'books',
  Movie = 'movies',
  Podcast = 'podcasts',
  Channel = 'channels',
  Newsletter = 'newsletters',
  Paper = 'papers',
  Glossary = 'glossary',
  Conference = 'conferences',
}

/** Largest cover image a contributor can submit, before base64 encoding. */
export const MAX_COVER_IMAGE_BYTES = 15 * 1024 * 1024;

/** Size of that image once base64 encoded, which is how it travels in JSON. */
export const MAX_COVER_IMAGE_BASE64_BYTES = (MAX_COVER_IMAGE_BYTES / 3) * 4;

/** Base64 cover plus room for the rest of the submission body. */
export const MAX_RESOURCE_SUBMISSION_BYTES =
  MAX_COVER_IMAGE_BASE64_BYTES + 1024 * 1024;
