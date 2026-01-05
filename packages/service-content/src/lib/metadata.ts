import { createGetBlog } from './blogs/services/get-blog.js';
import { createGetCourseChapterMeta } from './courses/services/get-course-chapter-meta.js';
import { createGetCourseMeta } from './courses/services/get-course-meta.js';
import { createGetCertificateImgKeyByExamAttemptId } from './courses/services/get-diploma-img-key.js';
import type { Dependencies } from './dependencies.js';
import { createGetEducatorContent } from './educator-content/services/get-educator-content.js';
import { createGetBook } from './resources/services/get-book.js';
import { createGetConferenceMeta } from './resources/services/get-conference-meta.js';
import { createGetGlossaryWord } from './resources/services/get-glossary-word.js';
import { createGetLectureMeta } from './resources/services/get-lecture-meta.js';
import { createGetMovie } from './resources/services/get-movie.js';
import { createGetNewsletterMeta } from './resources/services/get-newsletter-meta.js';
import { createGetPodcast } from './resources/services/get-podcast.js';
import { createGetProjectMeta } from './resources/services/get-project-meta.js';
import { createGetResearchPaper } from './resources/services/get-research-paper.js';
import { createGetYoutubeChannel } from './resources/services/get-youtube-channel.js';
import { createGetTutorialMeta } from './tutorials/services/get-tutorial-meta.js';

const cdn = (
  contentPath: string,
  assetPath?: string | null,
  // invalidate cache by passing a cacheKey (usually the last commit sha)
  cacheKey?: string,
) => {
  if (!assetPath) {
    return DEFAULT_IMAGE;
  }

  return `/cdn/${contentPath}/assets/${assetPath}${cacheKey ? `?c=${cacheKey}` : ''}`;
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

const DEFAULT_IMAGE = '/share-default.png';

const DEFAULT: Metadata = {
  description: "Let's build together the Bitcoin educational layer",
  image: DEFAULT_IMAGE,
  lang: 'en',
  title: 'Plan ₿ Academy',
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
  description: ellipsis(
    description?.replaceAll(/<[^>]*>?/gm, '') || DEFAULT.description,
  ),
  image: image || DEFAULT_IMAGE,
  lang,
  title: title || DEFAULT.title,
});

export const createGetMetadata = (dependencies: Dependencies) => {
  // courses
  const getCourseMeta = createGetCourseMeta(dependencies);
  const getChapterMeta = createGetCourseChapterMeta(dependencies);

  // Resources
  const getBook = createGetBook(dependencies);
  const getPodcast = createGetPodcast(dependencies);
  const getChannel = createGetYoutubeChannel(dependencies);
  const getLecture = createGetLectureMeta(dependencies);
  const getMovie = createGetMovie(dependencies);
  const getPaper = createGetResearchPaper(dependencies);
  const getProject = createGetProjectMeta(dependencies);
  const getGlossaryWord = createGetGlossaryWord(dependencies);
  const getConferenceMeta = createGetConferenceMeta(dependencies);
  const getNewsletterMeta = createGetNewsletterMeta(dependencies);
  const getBlog = createGetBlog(dependencies);
  const getEducatorContent = createGetEducatorContent(dependencies);

  // Tutorials
  const getTutorialMeta = createGetTutorialMeta(dependencies);

  // Certificates
  const getImageKey = createGetCertificateImgKeyByExamAttemptId(dependencies);

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
      cdn(`courses/${course.index}`, 'thumbnail.webp', course.lastCommit),
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
          podcast.language,
        );
      }
      case 'conferences': {
        const conf = await getConferenceMeta(resourceId);
        return meta(
          conf.name,
          conf.description,
          cdn(conf.path, 'thumbnail.webp'),
          conf.languages[0],
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

      case 'channels': {
        const channel = await getChannel(resourceId);
        return meta(
          channel.name,
          channel.description,
          cdn(channel.path, 'thumbnail.webp'),
          channel.language,
        );
      }

      case 'papers': {
        const paper = await getPaper(resourceId);
        return meta(paper.title, paper.abstract, DEFAULT.image, paper.language);
      }

      case 'lectures': {
        const lecture = await getLecture(resourceId);
        return meta(
          lecture.name,
          lecture.description,
          cdn(lecture.path, 'thumbnail.webp'),
          lecture.languages[0],
        );
      }

      case 'movies': {
        const movie = await getMovie(resourceId);
        return meta(
          movie.title,
          movie.description,
          cdn(movie.path, 'thumbnail.webp'),
          movie.language,
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
    return meta(
      `Tutorial - ${tutorial.title}`,
      tutorial.description,
      cdn(tutorial.path, 'cover.webp'),
      language,
    );
  };

  const getEducatorContentMetadata = async (
    lang: string,
    parts: string[],
  ): Promise<Metadata> => {
    const contentId = extractUUID(parts.shift() || '');

    if (!contentId) {
      return defaultMeta(lang);
    }

    const content = await getEducatorContent(undefined, undefined, contentId);

    if (content.length === 0) {
      return defaultMeta(lang);
    }

    const item = content[0];

    return meta(
      item.title,
      item.description,
      item.cover ? `/api/files/contribute/cover/${item.cover}` : DEFAULT.image,
      item.language,
    );
  };

  const getExamCertificateMetadata = async (
    lang: string,
    parts: string[],
  ): Promise<Metadata> => {
    const [examId] = parts;
    if (!examId) {
      return defaultMeta(lang);
    }

    const imgKey = await getImageKey(examId);

    return meta(
      DEFAULT.title,
      DEFAULT.description,
      `/api/files/${imgKey}`,
      DEFAULT.lang,
    );
  };

  const getTeacherLedCourseCertificateMetadata = (
    lang: string,
    parts: string[],
  ): Metadata => {
    const [certificateId] = parts;
    if (!certificateId) {
      return defaultMeta(lang);
    }

    return meta(
      DEFAULT.title,
      DEFAULT.description,
      `/api/files/certificates/${certificateId}.png`,
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
      case 'educator-content': {
        return getEducatorContentMetadata(lang, rest) //
          .catch(defaultOnError(lang));
      }
      case 'exam-certificates': {
        return getExamCertificateMetadata(lang, rest); //
      }
      case 'course-diplomas': {
        return getTeacherLedCourseCertificateMetadata(lang, rest); //
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
