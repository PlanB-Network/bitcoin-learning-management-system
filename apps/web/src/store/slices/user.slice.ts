import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { trpcClient } from '../../utils/trpc.ts';

interface UserState {
  isLoggedIn: boolean;
  uid?: string;
}

const initialState: UserState = {
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ uid: string }>) => {
      if (action.payload.uid) {
        state.isLoggedIn = true;
        state.uid = action.payload.uid;
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.uid = undefined;

      trpcClient.auth.logout
        .mutate()
        .then((response) => {
          console.log('Logged out successfully:', response.message);
          return response;
        })
        .catch((error) => {
          console.error('Failed to log out:', error);
          throw error;
        });
    },
  },
});
