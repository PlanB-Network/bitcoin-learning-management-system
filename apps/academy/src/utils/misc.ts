export const getDomain = () => {
  return window.location.hostname;
};

export const isDevelopmentEnvironment = () =>
  window.location.hostname.startsWith('localhost');

export const isTestnetOrDevelopmentEnvironment = () =>
  isDevelopmentEnvironment() ||
  window.location.hostname.startsWith('planbtest');

export const base64ToBlob = (
  base64: string,
  contentType = '',
  sliceSize = 512,
) => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export const PEERTUBE_HOST = 'peertube.planb.academy';
const PEERTUBE_LEGACY_HOSTS = ['peertube.planb.network'];

export const normalizePeertubeHost = (src: string) =>
  PEERTUBE_LEGACY_HOSTS.reduce(
    (acc, legacyHost) => acc.replaceAll(legacyHost, PEERTUBE_HOST),
    src,
  );

const isPeertubeUrl = (src: string) =>
  [PEERTUBE_HOST, ...PEERTUBE_LEGACY_HOSTS].some((host) =>
    src.startsWith(`https://${host}`),
  );

export const fixEmbedUrl = (src: string) => {
  // biome-ignore lint/style/noParameterAssign: legacy PeerTube host is rewritten in place
  src = normalizePeertubeHost(src);

  if (src.includes('embed')) {
    return src;
  }

  if (src.includes('youtu')) {
    // biome-ignore lint/style/noParameterAssign: explanation
    src = src.replace('watch?v=', '');
  }

  switch (true) {
    case src.includes('youtu.be'): {
      return src.replace('youtu.be/', 'youtube.com/embed/');
    }
    case src.includes('youtube.com/live/'): {
      return src.replace('youtube.com/live/', 'youtube.com/embed/');
    }
    case src.includes('youtube.com'): {
      return src.replace('youtube.com/', 'youtube.com/embed/');
    }
    case src.includes(PEERTUBE_HOST): {
      return src.replace(
        `${PEERTUBE_HOST}/videos/`,
        `${PEERTUBE_HOST}/videos/embed/`,
      );
    }
    case src.includes('makertube.net'): {
      return src.replace('makertube.net/w/', 'makertube.net/videos/embed/');
    }
    default: {
      return src;
    }
  }
};

export const isUrlFromValidVideoPlatform = (src: string) => {
  return (
    doesVideoUrlWorkWithReactPlayer(src) ||
    src.startsWith('https://www.rumble.com') ||
    src.startsWith('https://rumble.com') ||
    isPeertubeUrl(src) ||
    src.startsWith('https://makertube.net') ||
    isPlaybackBigBlueButtonUrl(src)
  );
};

export const doesVideoUrlWorkWithReactPlayer = (src: string) => {
  return (
    src.startsWith('https://www.youtube.com') ||
    src.startsWith('https://youtube.com') ||
    src.startsWith('https://www.youtu.be') ||
    src.startsWith('https://youtu.be')
  );
};

export const BBB_LIVE_HOST = 'live.planb.academy';
export const BBB_PLAYBACK_HOST = 'replay.planb.academy';
const BBB_PLAYBACK_LEGACY_HOSTS = [BBB_LIVE_HOST];

export const isLiveBigBlueButtonUrl = (src: string) =>
  src.startsWith(`https://${BBB_LIVE_HOST}/rooms`);

export const isPlaybackBigBlueButtonUrl = (src: string) =>
  [BBB_PLAYBACK_HOST, ...BBB_PLAYBACK_LEGACY_HOSTS].some((host) =>
    src.startsWith(`https://${host}/playback`),
  );
