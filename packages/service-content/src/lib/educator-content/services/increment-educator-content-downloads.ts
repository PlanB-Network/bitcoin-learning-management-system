import type { Dependencies } from '../../dependencies.js';

export const createIncrementEducatorContentDownloads = ({
  postgres,
}: Dependencies) => {
  return async (id: string) => {
    return postgres`
      UPDATE content.educator_contents
      SET downloads = downloads + 1
      WHERE id = ${id}
    `;
  };
};
