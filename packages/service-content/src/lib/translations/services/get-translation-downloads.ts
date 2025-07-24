import type { Dependencies } from '../../dependencies.js';
import { getTranscriptAvailableLanguagesQuery } from '../queries/get-transcript-available-languages.js';

/**
 * Service: list languages for which a PPTX file exists for a slide.
 */
export const createGetPptxAvailableLanguages = ({ s3 }: Dependencies) => {
  return async (
    courseId: string,
    partId: string,
    chapterId: string,
    slideId: string,
  ): Promise<string[]> => {
    const prefix = `contribute/${courseId}/`;
    const keys: string[] = await (s3 as any).list(prefix);
    const regex = new RegExp(
      `^contribute/${courseId}/([^/]+)/${partId}/${chapterId}/${slideId}/pptx/`,
    );
    const languages = new Set<string>();
    for (const key of keys) {
      const match = key.match(regex);
      if (match) languages.add(match[1]);
    }
    return Array.from(languages);
  };
};

/**
 * Service: list languages for which translated transcript exists for a slide.
 */
export const createGetTranscriptAvailableLanguages = ({
  postgres,
}: Dependencies) => {
  return async (
    courseId: string,
    partId: string,
    chapterId: string,
    slideId: string,
  ): Promise<string[]> => {
    const rows = await postgres.exec(
      getTranscriptAvailableLanguagesQuery(
        courseId,
        partId,
        chapterId,
        slideId,
      ),
    );
    return rows.map((r: any) => r.language);
  };
};
