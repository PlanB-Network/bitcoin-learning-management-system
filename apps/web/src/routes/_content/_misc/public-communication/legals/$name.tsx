import { createFileRoute, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { trpc } from '#src/utils/trpc.js';

import { LegalMarkdownComponent } from '../../-components/PublicCommunication/legal-markdown.tsx';

export const Route = createFileRoute(
  '/_content/_misc/public-communication/legals/$name',
)({
  component: LegalInformationTab,
});

function LegalInformationTab() {
  const { i18n } = useTranslation();

  const { name } = useParams({
    from: '/public-communication/legals/$name',
  });

  const { data: legal, isFetched } = trpc.content.getLegal.useQuery({
    name,
    language: i18n.language,
  });

  if (isFetched && !legal) {
    return <div className="text-black">Legal information not found!</div>;
  }

  return <LegalMarkdownComponent content={legal?.rawContent} />;
}
