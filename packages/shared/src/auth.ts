import { type UserPermission, UserRole } from '@blms/constants';

interface ObjectWithRole {
  role: UserRole; // Student, Community, Professor, Admin, Superadmin
  permissions?: UserPermission[] | null;
}

export const canAccess = (
  requiredRole: UserRole,
  requiredPermissions?: UserPermission | UserPermission[] | null,
) => {
  return (user?: ObjectWithRole | null) => {
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
      // Admin can't access superadmin resources
      if (requiredRole === UserRole.Superadmin) {
        return false;
      }

      // If no specific permissions are required, then admin can access everything except superadmin
      if (
        !requiredPermissions ||
        (typeof requiredPermissions === 'string'
          ? !requiredPermissions
          : !requiredPermissions.length)
      ) {
        return true;
      }

      // Reject if user has no permissions
      if (!user.permissions?.length) {
        return false;
      }

      // Check if user has required permission (string)
      if (typeof requiredPermissions === 'string') {
        return user.permissions.includes(requiredPermissions);
      }

      // Check if user has required permissions (array)
      return requiredPermissions.every((permission) =>
        user.permissions!.includes(permission),
      );
    }

    // Other roles can only access their own resources or student resources
    return role === requiredRole || requiredRole === UserRole.Student;
  };
};
