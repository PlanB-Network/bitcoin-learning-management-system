import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { LocalStorageKey } from '@sovereign-academy/types';

import { removeItem, setItem } from '../../utils/local-storage';

interface UserState {
  isLoggedIn: boolean;
  username?: string;
}

const initialState: UserState = {
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ username: string; accessToken: string }>
    ) => {
      state.isLoggedIn = true;
      state.username = action.payload.accessToken;
      setItem(LocalStorageKey.AccessToken, action.payload.accessToken);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      removeItem(LocalStorageKey.AccessToken);
    },
  },
});
