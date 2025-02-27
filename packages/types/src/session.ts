import type { UserPermission, UserRole } from '@blms/constants';

export interface SessionData {
  uid: string;
  role: UserRole;
  permissions: UserPermission[] | null;
}
