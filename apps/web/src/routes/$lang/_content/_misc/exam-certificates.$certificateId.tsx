import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { CertificateDisplay } from './-components/certificate-display.tsx';

export const Route = createFileRoute(
  '/$lang/_content/_misc/exam-certificates/$certificateId',
)({
  component: Certificate,
  params: {
    parse: (params) => ({
      certificateId: z.string().parse(params.certificateId),
      lang: z.string().parse(params.lang),
    }),
    stringify: ({ lang, certificateId }) => ({
      certificateId: `${certificateId}`,
      lang: lang,
    }),
  },
});

function Certificate() {
  const params = Route.useParams();

  return <CertificateDisplay certificateId={params.certificateId as string} />;
}
