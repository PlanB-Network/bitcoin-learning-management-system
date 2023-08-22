import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { LocalStorageKey } from '@sovereign-academy/types';

import { removeItem, setItem } from '../../utils/local-storage';

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
    login: (
      state,
      action: PayloadAction<{ uid: string; accessToken: string }>
    ) => {
      state.isLoggedIn = true;
      state.uid = action.payload.uid;
      setItem(LocalStorageKey.AccessToken, action.payload.accessToken);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      removeItem(LocalStorageKey.AccessToken);
    },
  },
});
