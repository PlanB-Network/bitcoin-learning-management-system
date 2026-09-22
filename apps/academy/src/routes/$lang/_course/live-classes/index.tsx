import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_course/live-classes/')({
  loader: ({ params }) => {
    return redirect({
      throw: false,
      to: '/$lang',
      params: { lang: params.lang },
    });
  },
});
