import { createGetBlog } from './blogs/services/get-blog.js';
import { createGetCourseChapterMeta } from './courses/services/get-course-chapter-meta.js';
import { createGetCourseMeta } from './courses/services/get-course-meta.js';
import type { Dependencies } from './dependencies.js';
import { createGetBook } from './resources/services/get-book.js';
import { createGetConferenceMeta } from './resources/services/get-conference-meta.js';
import { createGetGlossaryWord } from './resources/services/get-glossary-word.js';
import { createGetNewsletterMeta } from './resources/services/get-newsletter-meta.js';
import { createGetPodcast } from './resources/services/get-podcast.js';
import { createGetProjectMeta } from './resources/services/get-project-meta.js';
import { createGetTutorialMeta } from './tutorials/services/get-tutorial-meta.js';

const cdn = (contentPath: string, assetPath?: string | null) => {
  if (!assetPath) {
    return DEFAULT_IMAGE;
  }

  return `/cdn/${contentPath}/assets/${assetPath}`;
};

// Extract an uuid from a uuid-terminated URL
const extractUUID = (url: string) => {
  return (
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.exec(
      url,
    )?.[0] ?? url
  );
};

interface Metadata {
  title: string;
  description: string;
  image: string;
  lang: string;
}

const DEFAULT_IMAGE = '/share-default.jpg';

const DEFAULT: Metadata = {
  title: 'Plan ₿ Network',
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
  text.length > length ? `${text.slice(0, length)}...` : text;

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
  const getProject = createGetProjectMeta(dependencies);
  const getGlossaryWord = createGetGlossaryWord(dependencies);
  const getConferenceMeta = createGetConferenceMeta(dependencies);
  const getNewsletterMeta = createGetNewsletterMeta(dependencies);
  const getBlog = createGetBlog(dependencies);

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
      const chapter = await getChapterMeta(extractUUID(chapterId), lang);
      return meta(
        chapter.title,
        chapter.rawContent,
        cdn(`courses/${chapter.courseIndex}`, 'thumbnail.webp'),
        lang,
      );
    }

    const course = await getCourseMeta(extractUUID(courseId), lang);
    return meta(
      course.name,
      course.goal,
      cdn(`courses/${course.index}`, 'thumbnail.webp'),
      course.language,
    );
  };

  const getResourceMetadata = async (
    lang: string,
    parts: string[],
  ): Promise<Metadata> => {
    const resourceType = parts.shift();
    const resourceId = extractUUID(parts.shift() || '');

    if (!resourceType || !resourceId) {
      return defaultMeta(lang);
    }

    switch (resourceType) {
      case 'books': {
        const book = await getBook(resourceId, lang);
        return meta(
          book.title,
          book.description,
          cdn(book.path, book.cover),
          lang,
        );
      }
      case 'podcasts': {
        const podcast = await getPodcast(resourceId);
        return meta(
          podcast.name,
          podcast.description,
          cdn(podcast.path, 'logo.webp'),
          lang,
        );
      }
      case 'conferences': {
        const conf = await getConferenceMeta(resourceId);
        return meta(
          conf.name,
          conf.description,
          cdn(conf.path, 'thumbnail.webp'),
        );
      }
      case 'projects': {
        const project = await getProject(resourceId, lang);
        return meta(
          project.name,
          project.description,
          cdn(project.path, 'logo.webp'),
          project.language,
        );
      }

      case 'glossary': {
        const word = await getGlossaryWord(resourceId, lang);
        return meta(word.term, word.definition, DEFAULT_IMAGE, lang);
      }

      case 'newsletters': {
        const newsletter = await getNewsletterMeta(resourceId);
        return meta(
          newsletter.title,
          newsletter.description?.replaceAll(/\n/g, ' ').trim(),
          cdn(newsletter.path, 'thumbnail.webp'),
          newsletter.language,
        );
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
    const subcategory = parts.shift();
    const id = extractUUID(parts.shift() || '');

    if (!category || !subcategory || !id) {
      return defaultMeta(language);
    }

    const tutorial = await getTutorialMeta({ id, language });
    return meta(tutorial.title, tutorial.description, DEFAULT_IMAGE, language);
  };

  const getExamCertificateMetadata = (
    lang: string,
    parts: string[],
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
  ): Metadata => {
    const examUrl = parts.join('/');
    const apiUrl = `/api/files/${examUrl}.png`;
    if (!examUrl) {
      return defaultMeta(lang);
    }

    return meta(DEFAULT.title, DEFAULT.description, apiUrl, DEFAULT.lang);
  };

  const getBlogMetadata = async (
    language: string,
    parts: string[],
  ): Promise<Metadata> => {
    const blogId = extractUUID(parts.join('/'));
    if (!blogId) {
      return defaultMeta(language);
    }

    const blog = await getBlog({ id: extractUUID(blogId), language });
    return meta(
      blog.title,
      blog.description,
      cdn(blog.path, 'thumbnail.webp'),
      blog.language,
    );
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
      case 'public-communication': {
        return getBlogMetadata(lang, rest); //
      }
      default: {
        return defaultMeta(lang);
      }
    }
  };
};
