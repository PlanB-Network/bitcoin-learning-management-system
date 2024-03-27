import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { trpc } from '../../../utils/trpc.ts';

export const EventDetails = () => {
  const { data: event } = trpc.content.getEvent.useQuery({
    id: 'adopting_bitcoin_2023-null',
  });

  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="self-center mx-8 mt-24 flex flex-col items-start gap-2">
          <h1 className="text-xl text-orange-500 font-medium">{event?.name}</h1>
          <p className="text-3xl font-medium">{event?.description}</p>

          <div className="flex flex-col md:flex-row gap-2 md:gap-6">
            <iframe
              title={`Live ${event?.name}`}
              width="728"
              height="410"
              src={`${event?.liveUrl}?autoplay=1&muted=1&peertubeLink=0`}
              allowFullScreen={true}
              sandbox="allow-same-origin allow-scripts allow-popups"
            ></iframe>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
