import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '#src/components/main-layout.tsx';
import { isUUID } from '#src/utils/index.ts';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute(
  '/$lang/_content/_misc/change-email-preferences/$unsubscribeId',
)({
  component: ChangeEmailPreferences,
});

function ChangeEmailPreferences() {
  const params = Route.useParams();

  const { data: emailPreferences, isFetched } =
    trpc.user.getEmailSettings.useQuery(
      {
        unsubscribeId: params.unsubscribeId,
      },
      {
        enabled: isUUID(params.unsubscribeId),
      },
    );

  console.log(emailPreferences);

  return (
    <MainLayout variant="light">
      <p className="text-newBlack-1">Test</p>
    </MainLayout>
  );
}
