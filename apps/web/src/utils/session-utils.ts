import { trpcClient } from './trpc.ts';

export function logout() {
  return trpcClient.auth.logout
    .mutate()
    .then((response) => {
      console.log('Logged out successfully:', response.message);

      // Broadcast logout to other tabs
      const channel = new BroadcastChannel('auth');
      channel.postMessage({ type: 'LOGOUT' });
      channel.close();

      return response;
    })
    .catch((error) => {
      console.error('Failed to log out:', error);
      throw error;
    });
}
