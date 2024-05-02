import { useParams } from '@tanstack/react-router';

import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { trpc } from '../../../utils/trpc.ts';

export const EventDetails = () => {
  const { eventId } = useParams({
    from: '/events/$eventId',
  });

  const { data: event } = trpc.content.getEvent.useQuery({
    id: eventId,
  });

  let videoUrl: string = '';
  if (event?.replayUrl) {
    videoUrl = event?.replayUrl;
  } else if (event?.liveUrl) {
    videoUrl = event?.liveUrl + '?autoplay=1&muted=1&peertubeLink=0';
  }

  return (
    <MainLayout>
      <div className="flex flex-col px-5">
        <div className="w-full max-w-3xl self-center mx-8 mt-24 flex flex-col items-start gap-2">
          <h1 className="text-lg md:text-2xl text-orange-500 font-medium">
            {event?.name}
          </h1>
          <p className="text-sm md:text-lg font-medium">{event?.description}</p>

          <div className="w-full flex flex-col md:flex-row gap-2 md:gap-6">
            {videoUrl && (
              <div className="flex flex-col gap-6 w-full items-center">
                <iframe
                  title={`Live ${event?.name}`}
                  className="w-full aspect-video"
                  src={videoUrl}
                  allowFullScreen={true}
                  sandbox="allow-same-origin allow-scripts allow-popups"
                ></iframe>
                <iframe
                  src="https://peertube.planb.network/plugins/livechat/router/webchat/room/76c0fa8b-ee1e-4ab3-a1b3-f40318cf44eb"
                  title="Chat"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  className="w-full"
                  height="315"
                ></iframe>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
