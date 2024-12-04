import { createGetCourseChapterMeta } from './courses/services/get-course-chapter-meta.js';
import { createGetCourseMeta } from './courses/services/get-course-meta.js';
import type { Dependencies } from './dependencies.js';
import { createGetBook } from './resources/services/get-book.js';
import { createGetBuilderMeta } from './resources/services/get-builder-meta.js';
import { createGetConferenceMeta } from './resources/services/get-conference-meta.js';
import { createGetGlossaryWord } from './resources/services/get-glossary-word.js';
import { createGetPodcast } from './resources/services/get-podcast.js';
import { createGetTutorialMeta } from './tutorials/services/get-tutorial-meta.js';

const cdn = (
  commit: string,
  contentPath: string,
  assetPath?: string | null,
) => {
  if (!assetPath) {
    return DEFAULT_IMAGE;
  }

  return `/cdn/${commit}/${contentPath}/assets/${assetPath}`;
};

interface Metadata {
  title: string;
  description: string;
  image: string;
  lang: string;
}

const DEFAULT_IMAGE = '/share-default.jpg';

const DEFAULT: Metadata = {
  title: 'Plan B Network',
  description: "Let's build together the Bitcoin educational layer",
  image: DEFAULT_IMAGE,
  lang: 'en',
};

const defaultMeta = (lang: string): Metadata => ({ ...DEFAULT, lang });
const defaultOnError = (lang: string) => (err: Error) => {
  console.error('Error resolving metadata:', err?.message);
  return defaultMeta(lang);
};

const ellipsis = (text: string, length = 200) =>
  text.length > length ? text.slice(0, length) + '...' : text;

const meta = (
  title?: string | null,
  description?: string | null,
  image?: string | null,
  lang = 'en',
) => ({
  title: title || DEFAULT.title,
  description: ellipsis(
    description?.replaceAll(/<[^>]*>?/gm, '') || DEFAULT.description,
  ),
  image: image || DEFAULT_IMAGE,
  lang,
});

export const createGetMetadata = (dependencies: Dependencies) => {
  // courses
  const getCourseMeta = createGetCourseMeta(dependencies);
  const getChapterMeta = createGetCourseChapterMeta(dependencies);

  // Resources
  const getBook = createGetBook(dependencies);
  const getPodcast = createGetPodcast(dependencies);
  const getBuilder = createGetBuilderMeta(dependencies);
  const getGlossaryWord = createGetGlossaryWord(dependencies);
  const getConferenceMeta = createGetConferenceMeta(dependencies);

  // Tutorials
  const getTutorialMeta = createGetTutorialMeta(dependencies);

  const getCourseMetadata = async (
    lang: string,
    parts: string[],
  ): Promise<Metadata> => {
    const [courseId, chapterId] = parts;

    if (!courseId) {
      return defaultMeta(lang);
    }

    if (chapterId) {
      const chapter = await getChapterMeta(chapterId, lang);
      return meta(
        chapter.title,
        chapter.rawContent,
        cdn(
          chapter.lastCommit,
          `courses/${chapter.courseId}`,
          'thumbnail.webp',
        ),
        lang,
      );
    }

    const course = await getCourseMeta(courseId, lang);
    return meta(
      course.name,
      course.goal,
      cdn(course.lastCommit, `courses/${course.id}`, 'thumbnail.webp'),
      course.language,
    );
  };

  const getResourceMetadata = async (
    lang: string,
    parts: string[],
  ): Promise<Metadata> => {
    const resourceType = parts.shift();
    const resourceId = parts.shift();

    if (!resourceType || !resourceId) {
      return defaultMeta(lang);
    }

    switch (resourceType) {
      case 'books': {
        const book = await getBook(+resourceId, lang);
        return meta(
          book.title,
          book.description,
          cdn(book.lastCommit, book.path, book.cover),
          lang,
        );
      }
      case 'podcasts': {
        const podcast = await getPodcast(+resourceId);
        return meta(
          podcast.name,
          podcast.description,
          cdn(podcast.lastCommit, podcast.path, 'logo.webp'),
          lang,
        );
      }
      case 'conferences': {
        const conf = await getConferenceMeta(+resourceId);
        return meta(
          conf.name,
          conf.description,
          cdn(conf.lastCommit, conf.path, 'thumbnail.webp'),
        );
      }
      case 'builders': {
        const builder = await getBuilder(+resourceId, lang);
        return meta(
          builder.name,
          builder.description,
          cdn(builder.lastCommit, builder.path, 'logo.webp'),
          builder.language,
        );
      }
      case 'glossary': {
        const word = await getGlossaryWord(resourceId, lang);
        return meta(word.term, word.definition, DEFAULT_IMAGE, lang);
      }
      default: {
        return defaultMeta(lang);
      }
    }
  };

  const getTutorialMetadata = async (
    language: string,
    parts: string[],
  ): Promise<Metadata> => {
    const category = parts.shift();
    const name = parts.shift();

    if (!category || !name) {
      return defaultMeta(language);
    }

    const tutorial = await getTutorialMeta({ category, name, language });
    return meta(tutorial.title, tutorial.description, DEFAULT_IMAGE, language);
  };

  const getExamCertificateMetadata = (
    lang: string,
    parts: string[],
    // eslint-disable-next-line unicorn/consistent-function-scoping
  ): Metadata => {
    const [examId] = parts;

    if (!examId) {
      return defaultMeta(lang);
    }

    return meta(
      DEFAULT.title,
      DEFAULT.description,
      `/api/files/certificates/${examId}.png`,
      DEFAULT.lang,
    );
  };

  const getBcertCertificateMetadata = (
    lang: string,
    parts: string[],
    // eslint-disable-next-line unicorn/consistent-function-scoping
  ): Metadata => {
    const examUrl = parts.join('/');
    const apiUrl = `/api/files/${examUrl}.png`;

    if (!examUrl) {
      return defaultMeta(lang);
    }

    return meta(DEFAULT.title, DEFAULT.description, apiUrl, DEFAULT.lang);
  };

  return async (parts: string[]): Promise<Metadata> => {
    const lang = (parts[0]?.length === 2 && parts.shift()) || 'en';

    const [category, ...rest] = parts;

    switch (category) {
      case 'courses': {
        return getCourseMetadata(lang, rest) //
          .catch(defaultOnError(lang));
      }
      case 'resources': {
        return getResourceMetadata(lang, rest) //
          .catch(defaultOnError(lang));
      }
      case 'tutorials': {
        return getTutorialMetadata(lang, rest) //
          .catch(defaultOnError(lang));
      }
      case 'exam-certificates': {
        return getExamCertificateMetadata(lang, rest); //
      }
      case 'bcert-certificates': {
        return getBcertCertificateMetadata(lang, rest); //
      }
      default: {
        return defaultMeta(lang);
      }
    }
  };
};
