import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/_course/programs/')({
  loader: ({ params }) => {
    return redirect({
      throw: false,
      to: '/$lang',
      params: { lang: params.lang },
    });
  },
});
