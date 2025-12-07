import type { JoinedEducatorContent } from '@blms/types';
import type { Dependencies } from '../../dependencies.js';
import { createEducatorContentQuery } from '../queries/mutate-educator-content.js';

export const createCreateEducatorContent = ({ postgres }: Dependencies) => {
  return async (
    input: Omit<JoinedEducatorContent, 'id' | 'links' | 'files'> & {
      links?: { url: string; label: string }[];
      files?: { path: string; name: string; mime_type: string; size: number }[];
    },
  ) => {
    const [content] = await postgres.exec(createEducatorContentQuery(input));
    return content;
  };
};
