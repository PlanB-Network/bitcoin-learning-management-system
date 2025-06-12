import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { trpc } from '#src/utils/trpc.js';

import { useQuery } from '@tanstack/react-query';
import { LegalMarkdownComponent } from '../../-components/public-communication/legal-markdown.tsx';

export const Route = createFileRoute(
  '/$lang/_content/_misc/public-communication/legals/',
)({
  component: LegalContactInformation,
});

function LegalContactInformation() {
  const { i18n } = useTranslation();

  const name = 'contact';

  const { data: legal, isFetched } = useQuery(
    trpc.content.getLegal.queryOptions({
      name,
      language: i18n.language,
    }),
  );

  if (isFetched && !legal) {
    return <div className="text-black">Legal information not found!</div>;
  }

  return <LegalMarkdownComponent content={legal?.rawContent} />;
}
