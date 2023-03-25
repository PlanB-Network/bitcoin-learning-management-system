export interface User {
  isLoggedIn: boolean;
  username: string;
  email?: string;
}

export interface Session {
  user?: User;
}
