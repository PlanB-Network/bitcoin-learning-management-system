import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_content/_misc/plan-b-labs/')({
  loader: () => {
    return redirect({
      to: '/plan-b-labs/lightning',
      throw: false,
    });
  },
});
