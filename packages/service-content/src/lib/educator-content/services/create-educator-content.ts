import { EducatorContentStatus } from '@blms/constants';
import type { JoinedEducatorContent } from '@blms/types';
import type { Dependencies } from '../../dependencies.js';
import { getEducatorContentQuery } from '../queries/get-educator-content.js';
import {
  createEducatorContentQuery,
  updateEducatorContentQuery,
} from '../queries/mutate-educator-content.js';

export const createCreateEducatorContent = ({ postgres }: Dependencies) => {
  return async (
    input: Omit<JoinedEducatorContent, 'id' | 'links' | 'files'> & {
      links?: { url: string; label: string }[];
      files?: { path: string; name: string; mime_type: string; size: number }[];
    },
  ) => {
    if (input.originalId) {
      const existingDrafts = await postgres.exec(
        getEducatorContentQuery(
          undefined,
          EducatorContentStatus.Draft,
          undefined,
          input.uid,
          input.originalId,
        ),
      );

      if (existingDrafts.length > 0) {
        const draft = existingDrafts[0];
        const [content] = await postgres.exec(
          updateEducatorContentQuery({
            ...input,
            id: draft.id,
          } as any),
        );
        return content;
      }
    }

    const [content] = await postgres.exec(createEducatorContentQuery(input));
    return content;
  };
};
