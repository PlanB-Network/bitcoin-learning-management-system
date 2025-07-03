import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { trpc } from '#src/utils/trpc.js';
import { LegalMarkdownComponent } from '../../-components/public-communication/legal-markdown.tsx';

export const Route = createFileRoute(
  '/$lang/_content/_misc/public-communication/legals/$name',
)({
  component: LegalInformationTab,
  params: {
    parse: (params) => ({
      name: z.string().parse(params.name),
    }),
    stringify: ({ name }) => ({ name: `${name}` }),
  },
});

function LegalInformationTab() {
  const { i18n } = useTranslation();
  const params = Route.useParams();
  const name = params.name;

  const { data: legal, isFetched } = useQuery(
    trpc.content.getLegal.queryOptions({
      language: i18n.language,
      name,
    }),
  );

  if (isFetched && !legal) {
    return <div className="text-black">Legal information not found!</div>;
  }

  return <LegalMarkdownComponent content={legal?.rawContent} />;
}
