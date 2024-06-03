export const getDomain = () => {
  return window.location.hostname;
};

export const isDevelopmentEnvironment = () =>
  window.location.hostname.startsWith('localhost');
