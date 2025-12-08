import { httpClient } from '#src/utils/http.js';

export const uploadEducatorContentCover = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return httpClient.json<{ id: string }>('/educator-content/cover', {
    body: formData,
    method: 'POST',
  });
};

export const getEducatorContentCoverUrl = (cover: string | null | undefined) =>
  cover ? `/api/files/contribute/cover/${cover}` : null;

export const uploadEducatorContentFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return httpClient.json<{ id: string }>('/educator-content/file', {
    body: formData,
    method: 'POST',
  });
};

export const getEducatorContentFileUrl = (fileId: string) =>
  `/api/files/contribute/educator-content/${fileId}`;
