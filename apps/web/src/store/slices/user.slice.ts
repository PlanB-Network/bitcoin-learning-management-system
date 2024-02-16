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
      state.isLoggedIn = true;
      state.uid = action.payload.uid;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.uid = undefined;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      trpcClient.auth.logout.mutate();
    },
  },
});
