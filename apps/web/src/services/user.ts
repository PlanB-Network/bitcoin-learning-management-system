import type { UserDetails } from '@sovereign-university/types';

import { httpClient } from '#src/utils/http.js';
import { baseUrl } from '#src/utils/misc.js';

export const getPictureUrl = (user: UserDetails | null) =>
  user?.picture ? `${baseUrl}/file/${user?.picture}` : null;

export const setProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return httpClient.json<UserDetails>('/user/profile-picture', {
    method: 'POST',
    body: formData,
  });
};
