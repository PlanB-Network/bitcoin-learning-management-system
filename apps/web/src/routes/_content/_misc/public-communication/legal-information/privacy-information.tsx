import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Layout from '../-layout.tsx';
import { LegalMarkdownComponent } from '../../-components/PublicCommunication/legal-markdown.tsx';

import { LegalInformation } from './index.tsx';

function PrivacyInfo() {
  const privacyInfoString = `# Privacy information
  ## Information on your rights
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  ## Right of access to personal data
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

  return (
    <div className="max-w-[1140px] flex flex-col lg:justify-start text-start">
      <LegalMarkdownComponent content={privacyInfoString} />
    </div>
  );
}

export const Route = createFileRoute(
  '/_content/_misc/public-communication/legal-information/privacy-information',
)({
  component: PrivacyInformation,
});

export default function PrivacyInformation() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('privacy');

  return (
    <Layout t={t}>
      <LegalInformation
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />
      <div>{PrivacyInfo()}</div>
    </Layout>
  );
}
