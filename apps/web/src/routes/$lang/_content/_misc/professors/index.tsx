import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_content/_misc/professors/')({
  loader: () => {
    return redirect({
      throw: false,
      to: '/professors/all',
    });
  },
});
