import type { ReactPlayerProps } from 'react-player';
import _ReactPlayer from 'react-player';

// Temporary fix? https://github.com/cookpete/react-player/issues/1729
export const ReactPlayer =
  _ReactPlayer as unknown as React.FC<ReactPlayerProps>;
