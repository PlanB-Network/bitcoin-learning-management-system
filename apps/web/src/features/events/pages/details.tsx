import { MainLayout } from '../../../components/MainLayout/index.tsx';
import { trpc } from '../../../utils/trpc.ts';

export const EventDetails = () => {
  const { data: event } = trpc.content.getEvent.useQuery({ id: 'giaco_saif' });

  return (
    <MainLayout>
      <div className="flex flex-col">
        <div className="self-center mx-8 mt-24 flex flex-col items-start gap-2">
          <h1 className="text-xl text-orange-500 font-medium">
            {event?.title}
          </h1>
          <p className="text-3xl font-medium">{event?.description}</p>

          <div className="flex flex-col md:flex-row gap-2 md:gap-6">
            <iframe
              src="https://streaming.planb.network/embed/video?initiallyMuted=true"
              title="Owncast"
              height="480px"
              width="750px"
              referrerPolicy="origin"
              allowFullScreen
            ></iframe>

            <iframe
              src="https://streaming.planb.network/embed/chat/readwrite"
              title="Owncast"
              height="480px"
              width="450px"
              referrerPolicy="origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
