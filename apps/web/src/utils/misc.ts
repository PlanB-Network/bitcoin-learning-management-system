export const getDomain = () => {
  return window.location.hostname;
};

export const isDevelopmentEnvironment = () =>
  window.location.hostname.startsWith('localhost');

export const baseUrl = isDevelopmentEnvironment()
  ? 'http://localhost:3000/api'
  : `https://api.${getDomain()}`;
