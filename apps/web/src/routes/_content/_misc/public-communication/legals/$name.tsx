import { createFileRoute, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { trpc } from '#src/utils/trpc.js';

import Layout from '../-layout.tsx';
import { LegalMarkdownComponent } from '../../-components/PublicCommunication/legal-markdown.tsx';

import { legalTabs } from './-utils.tsx';
import { LegalInformation } from './index.tsx';

export const Route = createFileRoute(
  '/_content/_misc/public-communication/legals/$name',
)({
  component: LegalInformationTab,
});

export function LegalInformationTab() {
  const { t, i18n } = useTranslation();
  const { name } = useParams({
    from: '/public-communication/legals/$name',
  });

  const [activeSubTab, setActiveSubTab] = useState('contact');

  const { data: legal } = trpc.content.getLegal.useQuery({
    name,
    language: i18n.language,
  });

  useEffect(() => {
    const tab = legalTabs.find(
      (tab) => tab.href === `/public-communication/legals/${name}`,
    );
    if (tab) {
      setActiveSubTab(tab.id);
    }
  }, [name]);

  if (!legal) {
    return <div>Legal information not found!</div>;
  }

  return (
    <Layout t={t}>
      <LegalInformation
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />
      <div className="max-w-[1140px] flex flex-col lg:justify-start text-start">
        <LegalMarkdownComponent content={legal.rawContent} />
      </div>
    </Layout>
  );
}
