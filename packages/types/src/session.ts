import type { UserRole } from '@blms/constants';

export interface SessionData {
  uid: string;
  role: UserRole;
}
