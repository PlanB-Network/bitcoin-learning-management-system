import { trpcClient } from './trpc.ts';

export function logout() {
  return trpcClient.auth.logout
    .mutate()
    .then((response) => {
      console.log('Logged out successfully:', response.message);
      return response;
    })
    .catch((error) => {
      console.error('Failed to log out:', error);
      throw error;
    });
}
