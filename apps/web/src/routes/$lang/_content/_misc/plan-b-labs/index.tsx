import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_content/_misc/plan-b-labs/')({
  loader: () => {
    return redirect({
      throw: false,
      to: '/plan-b-labs/lightning',
    });
  },
});
