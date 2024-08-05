// routes/public-communication/legal-information/contact-information.tsx

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Layout from '../-layout.tsx';
import { LegalMarkdownComponent } from '../../-components/PublicCommunication/legal-markdown.tsx';

import { LegalInformation } from './index.tsx';

export const Route = createFileRoute(
  '/_content/_misc/public-communication/legal-information/contact-information',
)({
  component: ContactInformationTab,
});

function ContactInfo() {
  const contactString = `# Contact
  
  ## Organization name:

  PlanB Network SARL is a swiss incorpated company

  ## Taxnumber:

  12312451512

  ## Email:

  Contact@planb.network

  ## Address:

  Random address generated
  `;

  return (
    <div className="max-w-[1140px] flex flex-col lg:justify-start text-start">
      <LegalMarkdownComponent content={contactString} />
    </div>
  );
}

export function ContactInformationTab() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('contact');

  return (
    <Layout t={t}>
      <LegalInformation
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />
      <div>{ContactInfo()}</div>
    </Layout>
  );
}
