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
 * Fine-grained access control over
 *  resources for admin users.
 */
export enum ResourceAccess {
  Bookings = 'bookings',
  Career = 'career',
  Courses = 'courses',
  Quizzes = 'quizzes',
  Coupons = 'coupons',
  Tutorials = 'tutorials',
}
