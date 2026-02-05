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

export const fixEmbedUrl = (src: string) => {
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
    case src.includes('peertube.planb.network'): {
      return src.replace(
        'peertube.planb.network/videos/',
        'peertube.planb.network/videos/embed/',
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
    src.startsWith('https://peertube.planb.network') ||
    src.startsWith('https://makertube.net') ||
    src.startsWith('https://live.planb.academy/playback')
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

export const isLiveBigBlueButtonUrl = (src: string) => {
  return src.startsWith('https://live.planb.academy/rooms');
};

export const isPlaybackBigBlueButtonUrl = (src: string) => {
  return src.startsWith('https://live.planb.academy/playback');
};
