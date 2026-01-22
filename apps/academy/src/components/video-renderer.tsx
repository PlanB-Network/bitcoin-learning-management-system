import ReactPlayer from 'react-player';
import {
  doesVideoUrlWorkWithReactPlayer,
  fixEmbedUrl,
} from '#src/utils/misc.ts';

export const VideoRenderer = ({ src, alt }: { src: string; alt?: string }) => {
  return (
    <>
      {doesVideoUrlWorkWithReactPlayer(src) ? (
        <ReactPlayer
          width={'100%'}
          height={'100%'}
          style={{ left: 0, position: 'absolute', top: 0 }}
          className="mx-auto mb-2 rounded-lg"
          controls={true}
          src={src}
        />
      ) : (
        <iframe
          width="100%"
          height="100%"
          style={{ left: 0, position: 'absolute', top: 0 }}
          className="mx-auto mb-2 rounded-lg"
          src={fixEmbedUrl(src)}
          title={alt}
          allowFullScreen
        />
      )}
    </>
  );
};
