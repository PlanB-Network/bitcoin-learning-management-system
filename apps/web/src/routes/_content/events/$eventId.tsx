import { Link, createFileRoute } from '@tanstack/react-router';
import { t } from 'i18next';
import { z } from 'zod';

import { Button, Loader } from '@blms/ui';

import { AuthModal } from '#src/components/AuthModals/auth-modal.tsx';
import { AuthModalState } from '#src/components/AuthModals/props.ts';
import { MainLayout } from '#src/components/main-layout.js';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { trpc } from '#src/utils/trpc.js';

export const Route = createFileRoute('/_content/events/$eventId')({
  params: {
    parse: (params) => ({
      eventId: z.string().parse(params.eventId),
    }),
    stringify: ({ eventId }) => ({ eventId: `${eventId}` }),
  },
  component: EventDetails,
});

function EventDetails() {
  const params = Route.useParams();

  const {
    open: openAuthModal,
    isOpen: isAuthModalOpen,
    close: closeAuthModal,
  } = useDisclosure();

  const {
    data: event,
    isFetched,
    isError,
    error,
  } = trpc.content.getEvent.useQuery({
    id: params.eventId,
  });

  let videoUrl: string = '';
  if (event?.replayUrl) {
    videoUrl = event?.replayUrl;
  } else if (event?.liveUrl) {
    videoUrl = event?.liveUrl + '?autoplay=1&muted=1&peertubeLink=0';
  }

  return (
    <MainLayout>
      <div className="flex flex-col px-5 flex-1 items-center">
        {!isFetched && (
          <div className="flex flex-col flex-1 justify-center items-center size-full">
            <Loader size={'s'} />
          </div>
        )}

        {isFetched && isError && error.data?.code === 'UNAUTHORIZED' && (
          <div className="flex flex-col flex-1 justify-center items-center size-full">
            <div>{t('events.errors.premiumContentNeedsLogin')}</div>
            <div>
              <Button
                size="l"
                mode="dark"
                variant="primary"
                className="mt-4"
                onClick={openAuthModal}
              >
                {t('auth.signIn')}
              </Button>
            </div>
          </div>
        )}

        {isFetched && isError && error.data?.code === 'FORBIDDEN' && (
          <div className="flex flex-col flex-1 justify-center items-center size-full">
            <div>{t('events.errors.premiumContentNeedsPayment')}</div>
            <div>
              <Link to={'/events'} className="text-newOrange-1 hover:underline">
                {t('events.errors.premiumContentNeedsPaymentAction')}
              </Link>
            </div>
          </div>
        )}

        {isFetched && !isError && event && (
          <div className="w-full max-w-3xl self-center mx-8 mt-24 flex flex-col items-start gap-2">
            <h1 className="text-lg md:text-2xl text-orange-500 font-medium">
              {event?.name}
            </h1>
            <p className="text-sm md:text-lg font-medium">
              {event?.description}
            </p>

            <div className="w-full flex flex-col md:flex-row gap-2 md:gap-6">
              <div className="flex flex-col gap-6 w-full items-center">
                {videoUrl && (
                  <iframe
                    title={`Live ${event?.name}`}
                    className="w-full aspect-video"
                    src={videoUrl}
                    allowFullScreen={true}
                    sandbox="allow-same-origin allow-scripts allow-popups"
                  ></iframe>
                )}
                {event?.chatUrl && (
                  <iframe
                    src="https://peertube.planb.network/plugins/livechat/router/webchat/room/4f4a811a-2d98-40dc-80ea-736088b408e7"
                    title="Chat"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    className="w-full"
                    height="315"
                  ></iframe>
                )}
              </div>
            </div>
          </div>
        )}

        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={closeAuthModal}
            initialState={AuthModalState.SignIn}
          />
        )}
      </div>
    </MainLayout>
  );
}
