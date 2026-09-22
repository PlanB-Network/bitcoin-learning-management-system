import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_course/live-classes/')({
  loader: () => {
    return redirect({
      throw: false,
      to: '/',
    });
  },
});
