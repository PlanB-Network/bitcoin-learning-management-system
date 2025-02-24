import { UserRole } from '@blms/constants';

interface ObjectWithRole {
  role: UserRole; // Student, Community, Professor, Admin, Superadmin
}

export const canAccess = (requiredRole: UserRole) => {
  return (user: ObjectWithRole) => {
    if (!user || !user.role) {
      return false;
    }

    const { role } = user;

    // Superadmin can access everything
    if (role === UserRole.Superadmin) {
      return true;
    }

    // Admin can access everything except superadmin
    // // TODO Apply fine-grained access control
    if (role === UserRole.Admin) {
      return requiredRole !== UserRole.Superadmin;
    }

    // Other roles can only access their own resources
    return role === requiredRole;
  };
};
