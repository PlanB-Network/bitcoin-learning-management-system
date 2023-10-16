import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { trpcClient } from '../../utils/trpc';

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
      state.isLoggedIn = true;
      state.uid = action.payload.uid;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.uid = undefined;
      trpcClient.auth.logout.mutate();
    },
  },
});
