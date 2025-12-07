import type { JoinedEducatorContent } from '@blms/types';
import type { Dependencies } from '../../dependencies.js';
import { updateEducatorContentQuery } from '../queries/mutate-educator-content.js';

export const createUpdateEducatorContent = ({ postgres }: Dependencies) => {
  return async (input: Partial<JoinedEducatorContent> & { id: string }) => {
    const [content] = await postgres.exec(
      updateEducatorContentQuery(input as any),
    );
    return content;
  };
};
