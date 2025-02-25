import { createFileRoute } from '@tanstack/react-router';
import { router } from '#src/routes/-router.tsx';

export const Route = createFileRoute('/$lang/_content/courses/btc105')({
  params: {},
  component: CourseDetails,
});

function CourseDetails() {
  const newPath = '/courses/d1370810-63f6-4aba-b822-e3a66bf225a5';
  router.navigate({
    to: newPath,
    replace: true,
  });
}
