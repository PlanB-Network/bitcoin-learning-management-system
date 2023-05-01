import { LocalStorageKey } from '@sovereign-academy/types';

export const setItem = (key: LocalStorageKey, value: unknown) => {
  return localStorage.setItem(
    key,
    typeof value === 'string' ? value : JSON.stringify(value)
  );
};

export const getItem = (key: LocalStorageKey) => {
  return localStorage.getItem(key);
};

export const removeItem = (key: LocalStorageKey) => {
  return localStorage.removeItem(key);
};
