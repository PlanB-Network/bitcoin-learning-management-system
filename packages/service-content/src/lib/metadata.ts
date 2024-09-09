import { firstRow, rejectOnEmpty } from '@blms/database';

import { getCourseChapterQuery } from './courses/queries/get-course-chapter.js';
import { getCourseQuery } from './courses/queries/get-course.js';
import type { Dependencies } from './dependencies.js';

interface Metadata {
  title: string;
  description: string;
  image: string;
  lang: string;
}

const DEFAULT_IMAGE = 'https://planb.network/assets/lugano-CtUShZFl.webp';

const DEFAULT: Metadata = {
  title: 'PlanB Network',
  description:
    'PlanB Network is a community-driven platform for learning and sharing knowledge.',
  image: DEFAULT_IMAGE,
  lang: 'en',
};

const defaultMeta = (lang: string): Metadata => ({ ...DEFAULT, lang });

export const createGetMetadata = (dependencies: Dependencies) => {
  const getCourseMetadata = async (
    lang: string,
    parts: string[],
  ): Promise<Metadata> => {
    const [courseId, chapterId] = parts;

    console.log(`getCourseMetadata`, { courseId, chapterId });

    if (!courseId) {
      return defaultMeta(lang);
    }

    if (chapterId) {
      const chapter = await dependencies.postgres
        .exec(getCourseChapterQuery(chapterId, lang))
        .then(firstRow)
        .then(rejectOnEmpty);

      return {
        title: chapter.title,
        description: chapter.rawContent
          .replaceAll(/<[^>]*>?/gm, '')
          .slice(0, 200),
        image: DEFAULT_IMAGE,
        lang,
      };
    }

    const course = await dependencies.postgres
      .exec(getCourseQuery(courseId, lang))
      .then(firstRow)
      .then(rejectOnEmpty);

    return {
      title: course.name,
      description: course.goal,
      image: DEFAULT_IMAGE,
      lang: lang,
    };
  };

  return async (parts: string[]): Promise<Metadata> => {
    const lang =
      (parts.length > 0 && parts[0].length === 2 ? parts.shift() : 'en') ??
      'en';

    console.log(`Metadata query`, { lang, pathParts: parts });

    const [category, name] = parts;

    console.log(`Metadata query`, { category, name });

    switch (category) {
      // - /courses/:name[/:chapter]
      case 'courses': {
        return getCourseMetadata(lang, parts.slice(1)).catch((error) => {
          console.error('Error resolving metadata', error);
          return defaultMeta(lang);
        });
      }
      case 'events': {
        return defaultMeta(lang);
        break;
      }
      case 'resources': {
        return defaultMeta(lang);
        break;
      }
      default: {
        return {
          title: 'PlanB Network',
          description:
            'PlanB Network is a community-driven platform for learning and sharing knowledge.',
          image: DEFAULT_IMAGE,
          lang,
        };
      }
    }
  };
};
