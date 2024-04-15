export const getDomain = () => {
  return window.location.hostname;
};

export const isDevelopmentEnvironment = () =>
  window.location.hostname.startsWith('localhost');

export const hexToBase64 = (hexstring: string) => {
  return Buffer.from(hexstring, 'hex').toString('base64');
};
