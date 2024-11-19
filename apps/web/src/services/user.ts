import type { UserDetails } from '@blms/types';

import { httpClient } from '#src/utils/http.js';

export const getPictureUrl = (user: UserDetails | null) =>
  user?.picture ? `/api/files/user-files/${user?.picture}` : null;

export const setProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return httpClient.json<UserDetails>('/user-file/profile-picture', {
    method: 'POST',
    body: formData,
  });
};
