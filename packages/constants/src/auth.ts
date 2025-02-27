export enum TokenType {
  ValidateEmail = 'validate_email',
  ResetPassword = 'reset_password',
  Login = 'login',
}

export enum UserRole {
  Student = 'student',
  Professor = 'professor',
  Community = 'community',
  Admin = 'admin',
  Superadmin = 'superadmin',
}

/**
 * Fine-grained access control over resources for admin users.
 */
export enum UserPermission {
  Bookings = 'admin:bookings',
  Career = 'admin:career',
  Courses = 'admin:courses',
  Quizzes = 'admin:quizzes',
  Coupons = 'admin:coupons',
  Tutorials = 'admin:tutorials',
}
