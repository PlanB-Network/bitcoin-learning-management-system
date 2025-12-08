import { EducatorContentStatus } from '@blms/constants';
import type { JoinedEducatorContent } from '@blms/types';
import type { Dependencies } from '../../dependencies.js';
import { getEducatorContentQuery } from '../queries/get-educator-content.js';
import {
  deleteEducatorContentQuery,
  updateEducatorContentQuery,
} from '../queries/mutate-educator-content.js';

export const createUpdateEducatorContent = ({ postgres }: Dependencies) => {
  return async (
    input: Partial<JoinedEducatorContent> & { id: string; uid?: string },
  ) => {
    const [content] = await postgres.exec(
      updateEducatorContentQuery(input as any),
    );

    if (content && input.status === EducatorContentStatus.Draft) {
      if (content.originalId) {
        const existingDrafts = await postgres.exec(
          getEducatorContentQuery(
            undefined,
            EducatorContentStatus.Draft,
            undefined,
            content.uid,
            content.originalId,
          ),
        );

        const conflictingDrafts = existingDrafts.filter(
          (d) => d.id !== content.id,
        );

        if (conflictingDrafts.length > 0) {
          for (const draft of conflictingDrafts) {
            await postgres.exec(deleteEducatorContentQuery(draft.id));
          }
        }
      }
    }

    return content;
  };
};
