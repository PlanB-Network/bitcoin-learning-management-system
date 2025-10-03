import type { UserDetails } from '@blms/types';

export const getPictureUrl = (user: UserDetails | null | undefined) =>
  user?.picture ? `/api/files/user-files/${user?.picture}` : null;
