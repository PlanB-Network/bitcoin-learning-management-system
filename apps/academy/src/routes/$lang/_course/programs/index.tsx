import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_course/programs/')({
  loader: () => {
    return redirect({
      throw: false,
      to: '/',
    });
  },
});
