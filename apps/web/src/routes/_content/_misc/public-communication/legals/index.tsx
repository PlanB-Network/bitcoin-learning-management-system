import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { trpc } from '#src/utils/trpc.js';

import { LegalMarkdownComponent } from '../../-components/PublicCommunication/legal-markdown.tsx';

export const Route = createFileRoute(
  '/_content/_misc/public-communication/legals/',
)({
  component: LegalContactInformation,
});

export function LegalContactInformation() {
  const { i18n } = useTranslation();

  const name = 'contact';

  const { data: legal } = trpc.content.getLegal.useQuery({
    name,
    language: i18n.language,
  });

  if (!legal) {
    return <div className="text-black">Legal information not found!</div>;
  }

  return <LegalMarkdownComponent content={legal.rawContent} />;
}
