import { createFileRoute } from '@tanstack/react-router';

import { z } from 'zod';
import { CertificateDisplay } from './-components/certificate-display.tsx';

export const Route = createFileRoute(
  '/$lang/_content/_misc/course-diplomas/$certificateId',
)({
  params: {
    parse: (params) => ({
      lang: z.string().parse(params.lang),
      certificateId: z.string().parse(params.certificateId),
    }),
    stringify: ({ lang, certificateId }) => ({
      lang: lang,
      certificateId: `${certificateId}`,
    }),
  },
  component: Certificate,
});

function Certificate() {
  const params = Route.useParams();

  return (
    <CertificateDisplay
      certificateId={params.certificateId as string}
      isCourseWithSingleTrialExam
    />
  );
}
